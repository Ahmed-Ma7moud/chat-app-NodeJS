const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  name: { 
      type: String,
      trim:true,
      minlength: 3,
      maxLength: 50,
      required: true 
    },
  phone: { 
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  password: { 
    type: String,
    trim: true,
    required: true,
    minlength:6,
    maxlength:30
  },
  profilePicture: { 
    type: String,
    default: 'user-avatar.png'
  },
  lastSeen :{
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  tokenVersion: {
    type: Number,
    default: 0
  }
}, {timestamps:true}
);

userSchema.methods.generateAccessToken = function() {
  const payload = { id: this._id, phone: this.phone , name: this.name , tokenVersion: this.tokenVersion };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60d' });
}

const User = mongoose.model('User', userSchema);

module.exports = User;