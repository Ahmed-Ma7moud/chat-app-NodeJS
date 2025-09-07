const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.init();
    await Conversation.init();
    await Message.init();
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit the process with failure
  }
}