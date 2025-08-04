const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
  groupName: {
    type: String,
    trim: true,
    maxlength: 30,
  },
  lastMessage: {
    content: {
      type: String,
      maxlength: 1000
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
}, {
  timestamps: true 
});

conversationSchema.index({ participants: 1 });
module.exports = mongoose.model('Conversation', conversationSchema);