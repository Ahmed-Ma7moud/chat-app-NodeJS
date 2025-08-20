const {objectId} = require('../../validation/common');
module.exports = (socket, io) => {
  // When user clicks on a chat
  socket.on('enter conversation', async ({ conversationID }) => {

    if (!conversationID) {
      socket.emit('err', 'Invalid conversation ID');
      return;
    }

    const {error} = objectId.validate(conversationID);
    if (error) {
      return socket.emit('err', error.details[0].message);
    }

    if (!socket.conversations.has(conversationID.toString())) {
     socket.emit('err', 'You are not part of this conversation');
      return;
    }
    socket.join(conversationID.toString());
    // console.log(`User ${socket.user.name} entered conversation ${conversationID}`);
  });

  // Leave conversation
  socket.on('leave conversation', async ({ conversationID }) => {
    
    if (!conversationID) {
      return socket.emit('err', 'Invalid conversation ID');
    }

    const {error} = objectId.validate(conversationID);
    if (error) {
      return socket.emit('err', error.details[0].message);
    }

    if (socket.rooms.has(conversationID.toString())) {
      socket.leave(conversationID.toString());
      console.log(`User ${socket.user.name} left conversation ${conversationID}`);
    } else {
      console.log('Socket is not in this room');
    }
  });
};
