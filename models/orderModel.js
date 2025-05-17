const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  messId: {
    type: String,
    required: true
  },
  items: [{
    itemId: {
      type: String,
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryUserId: {
    type: String,
    default: null
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    required: true
  },
  specialInstructions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add indexes for common queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ messId: 1, status: 1 });
orderSchema.index({ deliveryUserId: 1, status: 1 });

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Virtual for order tracking URL
orderSchema.virtual('trackingUrl').get(function() {
  return `/orders/track/${this._id}`;
});

// Instance method to update order status
orderSchema.methods.updateStatus = async function(newStatus, deliveryUserId = null) {
  this.status = newStatus;
  if (deliveryUserId) {
    this.deliveryUserId = deliveryUserId;
  }
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
