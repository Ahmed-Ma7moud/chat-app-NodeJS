const User = require('../../models/User');
const onlineUsers = require('../../services/onlineUsers');

module.exports = (socket, io) => {
  // Get user status
  socket.on('get status', ({ userID }) => {
    console.log(userID);
    
    if (onlineUsers.isUserOnline(userID.toString())) {
      console.log(`User ${userID} is online`);
      socket.emit('user status', {
        userID,
        status: 'online'
      });
    } else {
      console.log(`User ${userID} is offline`);
      socket.emit('user status', {
        userID,
        status: 'offline'
      });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', async () => {
    console.log(`User ${socket.user.name} disconnected`);
    
    try {
      // Update user status to offline
      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: false,
        lastSeen: new Date()
      });
      
      // Notify other users in conversations
      socket.conversations.forEach(conversationID => {
        socket.to(conversationID.toString()).emit('update status', {
          userID: socket.user.id,
          status: 'offline'
        });
      });
      
      // Remove user from online users map
      onlineUsers.delete(socket.user.id);
    } catch (error) {
      console.error(error);
    }
  });
};
