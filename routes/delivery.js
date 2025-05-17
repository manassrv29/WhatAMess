const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const admin = require('firebase-admin');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Register as delivery partner
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber, isAvailable, location } = req.body;
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'delivery_partner';
    user.vehicleType = vehicleType;
    user.vehicleNumber = vehicleNumber;
    user.isAvailable = isAvailable;
    user.location = location;

    await user.save();
    res.status(201).json({ message: 'Delivery partner registered successfully', user });
  } catch (error) {
    console.error('Delivery partner registration error:', error);
    res.status(500).json({ message: 'Error registering delivery partner' });
  }
});

// Update delivery partner status
router.put('/status', verifyToken, async (req, res) => {
  try {
    const { isAvailable, location } = req.body;
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user || user.role !== 'delivery_partner') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    user.isAvailable = isAvailable;
    if (location) user.location = location;

    await user.save();
    res.json({ message: 'Status updated successfully', user });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Get assigned orders
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user || user.role !== 'delivery_partner') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const orders = await Order.find({ deliveryPartner: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone')
      .populate('messId', 'name address');

    res.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status
router.put('/orders/:orderId/status', verifyToken, async (req, res) => {
  try {
    const { status, location } = req.body;
    const { orderId } = req.params;
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user || user.role !== 'delivery_partner') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.deliveryPartner.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.orderStatus = status;
    if (location) order.deliveryLocation = location;

    await order.save();

    // Emit order update through Socket.IO
    req.app.get('io').emit('order-update', {
      type: 'delivery_status_update',
      order
    });

    // Send push notification to customer
    const customer = await User.findById(order.userId);
    if (customer && customer.fcmToken) {
      const message = {
        notification: {
          title: 'Delivery Status Updated',
          body: `Your order is now ${status}`
        },
        token: customer.fcmToken
      };

      await admin.messaging().send(message);
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get available orders
router.get('/available-orders', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user || user.role !== 'delivery_partner') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const orders = await Order.find({
      orderStatus: 'ready_for_delivery',
      deliveryPartner: { $exists: false }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name phone')
    .populate('messId', 'name address');

    res.json(orders);
  } catch (error) {
    console.error('Available orders fetch error:', error);
    res.status(500).json({ message: 'Error fetching available orders' });
  }
});

// Accept order
router.post('/orders/:orderId/accept', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user || user.role !== 'delivery_partner') {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({ message: 'Order already assigned' });
    }

    order.deliveryPartner = user._id;
    order.orderStatus = 'assigned';
    await order.save();

    // Emit order update through Socket.IO
    req.app.get('io').emit('order-update', {
      type: 'order_assigned',
      order
    });

    // Send push notification to customer
    const customer = await User.findById(order.userId);
    if (customer && customer.fcmToken) {
      const message = {
        notification: {
          title: 'Delivery Partner Assigned',
          body: 'Your order has been assigned to a delivery partner'
        },
        token: customer.fcmToken
      };

      await admin.messaging().send(message);
    }

    res.json({ message: 'Order accepted successfully', order });
  } catch (error) {
    console.error('Order acceptance error:', error);
    res.status(500).json({ message: 'Error accepting order' });
  }
});

module.exports = router; 