const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  role: {
    type: String,
    enum: ['user', 'mess_owner', 'delivery_partner'],
    default: 'user'
  },
  fcmToken: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema); 