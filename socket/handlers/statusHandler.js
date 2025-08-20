const User = require('../../models/User');
const onlineUsers = require('../../services/onlineUsers');
const {objectId} = require('../../validation/common');
module.exports = async (socket, io) => {
  // Get user status
  socket.on('get status', async ({ userID }) => {
    const {error} = objectId.validate(userID);
    if (error) {
      return socket.emit('err', "invalid userID");
    }

    if (onlineUsers.isUserOnline(userID.toString())) {
      socket.emit('user status', {
        userID,
        status: 'online'
      });
    } else {
      const { lastSeen } = await User.findById(userID).select('lastSeen').lean();
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
    try {
      // Update user status to offline
      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: false,
        lastSeen: disconnectTime
      });
            
      // Notify other users in conversations
      socket.conversations.forEach(conversationID => {
        socket.to(conversationID.toString()).emit('update status', {
          userID: socket.user.id,
          status: 'offline',
          lastSeen: disconnectTime // Use the same time that was saved to database
        });
      });
      
      // Remove user from online users map
      onlineUsers.delete(socket.user.id);
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    }
  });
};
