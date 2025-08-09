const User = require('../../models/User');
const onlineUsers = require('../../services/onlineUsers');

module.exports = async (socket, io) => {
  // Get user status
  socket.on('get status', async ({ userID }) => {
    console.log(userID);
    
    if (onlineUsers.isUserOnline(userID.toString())) {
      console.log(`User ${userID} is online`);
      socket.emit('user status', {
        userID,
        status: 'online'
      });
    } else {
      const { lastSeen } = await User.findById(userID).select('lastSeen').lean();
      console.log(`User ${userID} is offline`);
      socket.emit('user status', {
        userID,
        status: 'offline',
        lastSeen: lastSeen ? lastSeen : null
      });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', async () => {
    const disconnectTime = new Date();
    console.log(`User ${socket.user.name} disconnected at ${disconnectTime.toISOString()}`);
    
    try {
      // Update user status to offline
      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: false,
        lastSeen: disconnectTime
      });
      
      console.log(`User ${socket.user.name} marked as offline, lastSeen set to ${disconnectTime.toISOString()}`);
      
      // Notify other users in conversations
      socket.conversations.forEach(conversationID => {
        socket.to(conversationID.toString()).emit('update status', {
          userID: socket.user.id,
          status: 'offline',
          lastSeen: disconnectTime // Use the same time that was saved to database
        });
        console.log(`Sent offline status to conversation ${conversationID} with lastSeen: ${disconnectTime.toISOString()}`);
      });
      
      // Remove user from online users map
      onlineUsers.delete(socket.user.id);
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    }
  });
};
