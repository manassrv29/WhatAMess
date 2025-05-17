const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  messId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages']
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 3,
    default: 1
  },
  allergens: [{
    type: String
  }],
  preparationTime: {
    type: Number,
    default: 15, // in minutes
    min: 0
  }
}, {
  timestamps: true
});

// Add indexes for common queries
menuItemSchema.index({ messId: 1, category: 1 });
menuItemSchema.index({ messId: 1, isAvailable: 1 });

// Instance method to toggle availability
menuItemSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
