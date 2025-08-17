const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const onlineUsers = require('../../services/onlineUsers');
const {messageSchema} = require('../../validation/message');
module.exports = (socket, io) => {
  // Handle sending messages
  socket.on('message', async (data) => {
    const { conversationID, message } = data;
    console.log(`conversationID: ${conversationID}, message: ${message}`);

    if (!conversationID || !message) {
      return socket.emit('err', 'Invalid message data');
    }

    const { error } = messageSchema.validate(data);
    if (error) {
      return socket.emit('err', error.details[0].message);
    }

    try {
      // Check if conversation exists in current set
      console.log(`socket.conversations: ${Array.from(socket.conversations)}`);
      console.log(`conversationID: ${conversationID}`);
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
      await newMessage.save();

      // Update last message for online users
      conversation.participants.forEach(participant => {
        if (onlineUsers.isUserOnline(participant.toString())) {
          console.log(`User ${participant} is online`);
          const participantSocketId = onlineUsers.getSocketId(participant.toString());
          console.log(`participantSocketId: ${participantSocketId}`);
          io.to(participantSocketId).emit('update last message', {
            conversationID,
            message: {
              content: message,
              sender: socket.user.id,
              createdAt: newMessage.createdAt,
            }
          });
        }
      });
      
      // Send the message to all users in the conversation
      socket.to(conversationID.toString()).emit('message', {
        conversationID,
        message: {
          content: message,
          sender: socket.user.id,
          createdAt: newMessage.createdAt,
        }
      });
    } catch (error) {
      console.error(error);
      return socket.emit('err', 'An error occurred while sending the message');
    }
  });
};
