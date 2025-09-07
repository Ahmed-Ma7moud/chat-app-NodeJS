const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const onlineUsers = require('../../services/onlineUsers');
const {messageSchema} = require('../../validation/message');
const {socketBucketLimiter} = require('../../middlewares/socketAuth');
const xss = require('xss');
module.exports = (socket, io) => {
  // Handle sending messages
  socket.on('message', async (data) => {

    // wait 10 seconds for 1 token
    const limitResult = await socketBucketLimiter(`message:${socket.user.id}`, 5, .1);
    if (limitResult === 0) {
      return socket.emit("err", "Rate limit exceeded");
    }else if (limitResult === -1) {
      return socket.emit("err", "Internal server error");
    }

    let { conversationID, message , randomId} = data;

    if (!conversationID || !message || !randomId) {
      return socket.emit('err', 'Invalid message data');
    }

    const { error } = messageSchema.validate(data);
    if (error) {
      return socket.emit('err', error.details[0].message);
    }

    message = xss(message);

    try {
      // Check if conversation exists in current set
      if (!socket.conversations.has(conversationID.toString())) {
        // If not found, check if user is actually a participant in this conversation
        console.log(`the user is not in this conversation`);
        socket.emit('err', 'You are not part of this conversation');
        return;
      }

      const conversation = await Conversation.findByIdAndUpdate(
        conversationID,
        { $set: { lastMessage: { content: message, sender: socket.user.id, messageType: 'text', timestamp: new Date() } } },
        { new: true }
      );
      
      if (!conversation) {
        return socket.emit('err', 'Conversation not found');
      }

      // Create new message
      const newMessage = new Message({
        conversationID,
        content: message,
        sender: socket.user.id,
      });
      const createdMessage = await newMessage.save();
      if(!createdMessage){
        return socket.emit('err', 'Server can not create new messages now');
      }

      // send acknowledgement to sender that the message has received
      socket.emit("update message status", {
        randomId,
        message: createdMessage
      });
      
      // Send the message to all users in the conversation
      socket.to(conversationID.toString()).emit('message', {
        message: createdMessage
      });

      // Update last message for online users
      conversation.participants.forEach(participant => {
        if (onlineUsers.isUserOnline(participant.toString())) {
          const participantSocketId = onlineUsers.getSocketId(participant.toString());
          io.to(participantSocketId).emit('update last message', {
            message: createdMessage
          });
        }
      });
    } catch (error) {
      console.error(error);
      return socket.emit('err', 'An error occurred while sending the message');
    }
  });
};
