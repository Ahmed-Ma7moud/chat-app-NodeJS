const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function() {
  const payload = { id: this._id, phone: this.phone , name: this.name , tokenVersion: this.tokenVersion };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60d' });
}

const User = mongoose.model('User', userSchema);

module.exports = User;