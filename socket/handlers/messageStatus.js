const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const {objectId} = require('../../validation/common')
const onlineUsers = require("../../services/onlineUsers");
const mongoose = require('mongoose');
module.exports = async (socket, io) => {
    socket.on("update messages status", async(data) => {
        try{
            const {conversationId} = data;
            const { error } = objectId.validate(conversationId);

            if (error) {
            return socket.emit("err", "Invalid conversation ID");
            }

            const conversation = await Conversation.findById(conversationId);
            if(!conversation){
                return socket.emit("err", "Conversation not found");
            }
            
            const senderId = conversation.participants.find(participant => participant.toString() !== socket.user.id.toString());
            
            if(!socket.conversations.has(conversationId.toString())){
                return socket.emit("err", "User is not in the conversation");
            }

            await Message.updateMany(
                {
                    conversationID: conversationId,
                    status: "sent",
                    sender: { $ne: new mongoose.Types.ObjectId(socket.user.id) }
                },
                {
                    $set: { status: "read" }       
                });

            // check if the sender is online
            const senderSocketId = onlineUsers.getSocketId(senderId.toString());
            if (senderSocketId) {
                console.log("user is online and update messages is sent")
                io.to(senderSocketId).emit("update messages status", conversationId);
            }
        }catch(err){
            console.error(err);
            socket.emit("err", "Failed to update messages status");
        }
    })
    socket.on('message read' , async ({messageId})=>{
        try{
            console.log(messageId);
            const { error } = objectId.validate(messageId);

            if (error) {
                return socket.emit("err", "Invalid message ID");
            }

            let message = await Message.findById(messageId);
            if (!message) {
                return socket.emit("err", "Message not found");
            }

            const conversation = await Conversation.findById(message.conversationID).lean();
            if (!conversation) {
                return socket.emit("err", "Conversation not found");
            }

            const recipientId = conversation.participants.find(participant => participant.toString() !== socket.user.id.toString());
            if (!recipientId) {
                return socket.emit("err", "User is not part of the conversation");
            }

            if(recipientId.toString() !== message.sender.toString()){
                return socket.emit("err", "You cannot mark your own messages as read");
            }
            message.status = "read";
            await message.save();

            // notify the sender
            const senderSocketId = onlineUsers.getSocketId(message.sender.toString());
            if (senderSocketId) {
                console.log('Notifying sender about read message:', messageId);
                io.to(senderSocketId).emit("message read", messageId);
            }
            console.log('done');
        }catch(err){
            console.error(err);
            socket.emit("err", "Failed to update messages status");
        }
    })
};
