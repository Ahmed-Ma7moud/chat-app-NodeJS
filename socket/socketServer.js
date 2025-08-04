const Conversation = require('../models/Conversation');
const User = require('../models/User');
const onlineUsers = require('../services/onlineUsers');
const socketAuth = require('../middlewares/socketAuth').socketAuth;
const { conversationHandler, messageHandler, statusHandler } = require('./handlers');

const initializeSocket = (io) => {
  // Apply socket authentication middleware
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Initialize socket with user's conversations
    await initializeUserSocket(socket);

    // Event handlers
    conversationHandler(socket, io);
    messageHandler(socket, io);
    statusHandler(socket, io);

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('err', 'An unexpected error occurred');
    });
  });
};

async function initializeUserSocket(socket) {
  try {
    // Store conversation IDs for this user
    socket.conversations = new Set();
    
    // Get all conversations user is part of
    const conversations = await Conversation.find({
      participants: socket.user.id
    }).select('_id');
    
    // Update user status to online
    await User.findByIdAndUpdate(socket.user.id, {
      isOnline: true,
      lastSeen: null
    });
    
    // Add user to online users map
    onlineUsers.set(socket.user.id.toString(), socket.id);
    
    // Add conversations to socket and notify others of online status
    conversations.forEach(conversation => {
      socket.conversations.add(conversation._id.toString());
      // Notify only users who are in conversations with this user
      socket.to(conversation._id.toString()).emit('update status', {
        userID: socket.user.id,
        status: 'online'
      });
    });
    
    console.log(`Initialized ${conversations.length} conversations for user ${socket.user.name}`);
  } catch (error) {
    console.error('Error initializing user socket:', error);
    socket.emit('err', 'Failed to initialize connection');
  }
}

module.exports = { initializeSocket };
