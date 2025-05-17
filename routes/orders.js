const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/User');
const admin = require('firebase-admin');
const { verifyToken } = require('../middleware/auth');
const Mess = require('../models/messModel');

// Middleware to verify Firebase token
const verifyTokenMiddleware = async (req, res, next) => {
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

// Create a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Order POST body:', JSON.stringify(req.body, null, 2)); // Debug incoming order data
    // Print each required field for clarity
    console.log('messId:', req.body.messId);
    console.log('items:', JSON.stringify(req.body.items, null, 2));
    console.log('totalAmount:', req.body.totalAmount);
    console.log('deliveryAddress:', req.body.deliveryAddress);
    console.log('paymentMethod:', req.body.paymentMethod);
    console.log('specialInstructions:', req.body.specialInstructions);
    
    // If messId is not a valid ObjectId, treat it as a name and search for the Mess by name
    let messObjectId = req.body.messId;
    if (!messObjectId || messObjectId.length !== 24 || !messObjectId.match(/^[a-fA-F0-9]{24}$/)) {
      const messByName = await Mess.findOne({ name: req.body.messId });
      if (!messByName) {
        return res.status(400).json({ error: 'Mess not found by name: ' + req.body.messId });
      }
      messObjectId = messByName._id;
    }

    const order = new Order({
      ...req.body,
      messId: messObjectId,
      userId: req.user.uid,
      status: 'pending'
    });
    const newOrder = await order.save();
    
    // Emit order update via WebSocket
    if (req.app && req.app.get && req.app.get('io')) {
      req.app.get('io').emit('orderUpdate', {
        orderId: newOrder._id,
        status: newOrder.status,
        messId: newOrder.messId
      });
    }
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error); // More detailed error logging
    if (error.errors) {
      // Print detailed validation errors
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
    res.status(400).json({ message: error.message, stack: error.stack, errors: error.errors });
  }
});

// Update order status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.messId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = req.body.status;
    const updatedOrder = await order.save();
    
    // Emit order update via WebSocket
    req.app.get('io').emit('orderUpdate', {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
      userId: updatedOrder.userId
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get orders for a user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.uid })
      .populate('messId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders for a mess owner
router.get('/mess', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ messId: req.user.uid })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get nearby pending orders from messes within 1000m
router.get('/nearby', verifyToken, async (req, res) => {
  try {
    // Expect user's location from query params: ?lat=...&lng=...
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'User latitude and longitude required as query parameters.' });
    }

    const Mess = require('../models/messModel');
    const Order = require('../models/orderModel');

    console.log('--- Nearby Orders Debug ---');
    console.log('User location:', { lat, lng });

    // Find messes within 1000 meters (increased from 500)
    const messesNearby = await Mess.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 1000
        }
      }
    });
    console.log('Nearby messes found:', messesNearby.map(m => ({ id: m._id, name: m.name, coordinates: m.location.coordinates })));
    const messIds = messesNearby.map(mess => mess._id.toString());

    // Find only pending orders from those messes
    const orders = await Order.find({ messId: { $in: messIds }, status: 'pending' }).populate('messId', 'name address location');
    console.log('Orders fetched:', orders.map(o => ({ orderId: o._id, messId: o.messId?._id, messName: o.messId?.name, messCoords: o.messId?.location?.coordinates, userId: o.userId, deliveryAddress: o.deliveryAddress })));
    // Calculate distance for each order and log
    orders.forEach(order => {
      const messCoords = order.messId?.location?.coordinates;
      if (messCoords && lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const [messLng, messLat] = messCoords;
        const R = 6371000; // meters
        const dLat = (messLat - userLat) * Math.PI / 180;
        const dLng = (messLng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(messLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        console.log(`Order ${order._id} | Mess: ${order.messId?.name} | User: ${order.userId} | Distance: ${distance.toFixed(2)}m`);
      }
    });
    // Return order details and mess names
    const result = orders.map(order => ({
      orderId: order._id,
      messName: order.messId.name,
      messLocation: order.messId.address,
      messCoordinates: order.messId.location?.coordinates,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    }));
    res.json(result);
  } catch (error) {
    console.error('Nearby pending orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

// New endpoint: Get all orders (for delivery page debug)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().populate('messId', 'name address location');
    const result = orders.map(order => ({
      orderId: order._id,
      messName: order.messId?.name,
      messLocation: order.messId?.address,
      messCoordinates: order.messId?.location?.coordinates,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      userId: order.userId
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
});

module.exports = router; 