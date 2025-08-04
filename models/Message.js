const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  conversationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
});
messageSchema.index({ conversationID: 1, createdAt: 1 });
module.exports = mongoose.model('Message', messageSchema);
