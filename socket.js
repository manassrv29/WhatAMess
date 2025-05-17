const socketIO = require('socket.io');
const User = require('./models/User');
const Order = require('./models/Order');

const configureSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', async (token) => {
      try {
        const user = await User.findOne({ fcmToken: token });
        if (user) {
          connectedUsers.set(socket.id, user._id);
          console.log('User authenticated:', user._id);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Handle order updates
    socket.on('order-update', async (data) => {
      try {
        const { orderId, status, location } = data;
        const order = await Order.findById(orderId)
          .populate('userId', 'fcmToken')
          .populate('messId', 'ownerId')
          .populate('deliveryPartner', 'fcmToken');

        if (!order) return;

        // Update order status
        order.orderStatus = status;
        if (location) order.deliveryLocation = location;
        await order.save();

        // Emit update to relevant parties
        const updateData = {
          type: 'order_status_update',
          order
        };

        // Notify customer
        if (order.userId) {
          io.emit(`user-${order.userId._id}`, updateData);
        }

        // Notify mess owner
        if (order.messId && order.messId.ownerId) {
          io.emit(`mess-${order.messId.ownerId}`, updateData);
        }

        // Notify delivery partner
        if (order.deliveryPartner) {
          io.emit(`delivery-${order.deliveryPartner._id}`, updateData);
        }
      } catch (error) {
        console.error('Order update error:', error);
      }
    });

    // Handle delivery location updates
    socket.on('location-update', async (data) => {
      try {
        const { orderId, location } = data;
        const order = await Order.findById(orderId)
          .populate('userId', 'fcmToken');

        if (!order) return;

        // Update delivery location
        order.deliveryLocation = location;
        await order.save();

        // Notify customer
        if (order.userId) {
          io.emit(`user-${order.userId._id}`, {
            type: 'delivery_location_update',
            order
          });
        }
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    // Handle delivery partner availability
    socket.on('delivery-availability', async (data) => {
      try {
        const { deliveryPartnerId, isAvailable } = data;
        const user = await User.findById(deliveryPartnerId);

        if (!user) return;

        user.isAvailable = isAvailable;
        await user.save();

        // Notify mess owners
        io.emit('delivery-partners-update', {
          type: 'availability_update',
          deliveryPartner: user
        });
      } catch (error) {
        console.error('Availability update error:', error);
      }
    });

    // Handle chat messages
    socket.on('chat-message', async (data) => {
      try {
        const { orderId, senderId, message } = data;
        const order = await Order.findById(orderId)
          .populate('userId', 'fcmToken')
          .populate('messId', 'ownerId')
          .populate('deliveryPartner', 'fcmToken');

        if (!order) return;

        const chatMessage = {
          senderId,
          message,
          timestamp: new Date()
        };

        // Add message to order's chat history
        order.chatHistory = order.chatHistory || [];
        order.chatHistory.push(chatMessage);
        await order.save();

        // Determine recipients based on sender
        const recipients = [];
        if (senderId.toString() === order.userId._id.toString()) {
          // Customer sent message, notify mess and delivery
          if (order.messId) recipients.push(`mess-${order.messId.ownerId}`);
          if (order.deliveryPartner) recipients.push(`delivery-${order.deliveryPartner._id}`);
        } else if (order.messId && senderId.toString() === order.messId.ownerId.toString()) {
          // Mess sent message, notify customer and delivery
          recipients.push(`user-${order.userId._id}`);
          if (order.deliveryPartner) recipients.push(`delivery-${order.deliveryPartner._id}`);
        } else if (order.deliveryPartner && senderId.toString() === order.deliveryPartner._id.toString()) {
          // Delivery sent message, notify customer and mess
          recipients.push(`user-${order.userId._id}`);
          if (order.messId) recipients.push(`mess-${order.messId.ownerId}`);
        }

        // Emit message to recipients
        recipients.forEach(recipient => {
          io.emit(recipient, {
            type: 'chat_message',
            orderId,
            message: chatMessage
          });
        });
      } catch (error) {
        console.error('Chat message error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedUsers.delete(socket.id);
    });
  });

  return io;
};

module.exports = configureSocket; 