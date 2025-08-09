const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');
const {getIo} = require('../config/socket');
const onlineUsers = require('../services/onlineUsers');
exports.createConversation = async (req, res) => {
    let { type , phone , participants , groupName, messageContent } = req.body;
    type = type?.trim();
    phone = phone?.trim();
    groupName = groupName ? groupName.trim() : '';
    messageContent = messageContent ? messageContent.trim() : '';
    if(!type)
        return res.status(400).json({message : "invalid type"})
    try{
        if(type == "private"){
            if(!phone || !messageContent)
                return res.status(400).json({message : "phone and message content are required for private conversation"});
            if(req.user.phone === phone)
                return res.status(400).json({message : "You cannot chat with yourself"});

            const user = await User.findOne({ phone });
            if(!user)
                return res.status(404).json({message : "User not found"});
            // $all for order independence
            const existingConversation = await Conversation.findOne({
                participants: { $all: [req.user.id, user._id] },
                type: 'private'
            });
            if(existingConversation)
                return res.status(400).json({message : "Conversation already exists", conversation: existingConversation});
            
            // Create new conversation
            let newConversation = new Conversation({
                participants: [req.user.id, user._id],
                'lastMessage.content': messageContent,
                'lastMessage.sender': req.user.id,
            });
            await newConversation.save();

            // Create first message if provided
            const firstMessage = new Message({
                conversationID: newConversation._id,
                sender: req.user.id,
                content: messageContent
            });
            await firstMessage.save();
            

            // Populate the conversation before returning
            await newConversation.populate('participants', 'name phone isOnline lastSeen');
            
            // Notify the user if they are online and add conversation to both users' socket conversations
            const io = getIo();
            
            // Add conversation to creator's socket if they're online
            if (onlineUsers.isUserOnline(req.user.id.toString())) {
                const creatorSocketId = onlineUsers.getSocketId(req.user.id.toString());
                const creatorSocket = io.sockets.sockets.get(creatorSocketId);
                if (creatorSocket && creatorSocket.conversations) {
                    creatorSocket.conversations.add(newConversation._id.toString());
                    console.log(`Added conversation ${newConversation._id} to creator ${req.user.name}'s socket conversations`);
                }
            }
            
            // Add conversation to other user's socket if they're online
            if (onlineUsers.isUserOnline(user._id.toString())) {
                const socketId = onlineUsers.getSocketId(user._id.toString());
                const userSocket = io.sockets.sockets.get(socketId);
                if (userSocket && userSocket.conversations) {
                    userSocket.conversations.add(newConversation._id.toString());
                    console.log(`Added conversation ${newConversation._id} to user ${user.name}'s socket conversations`);
                }
                
                // Emit the new conversation event
                io.to(socketId).emit('new conversation', newConversation);
            }
            return res.status(201).json({
                message: "Conversation created successfully",
                conversation: newConversation
            });
        }else if(type == "group"){
            if(!participants || participants.length < 1)
                return res.status(400).json({message : "At least one participant must be added"});
            if(!groupName)
                return res.status(400).json({message : "Group name is required"});
            const newConversation = new Conversation({
                participants: [req.user.id, ...participants],
                type: 'group',
                groupName
            });
            await newConversation.save();
            return res.status(201).json(newConversation);
        }else{
            return res.status(400).json({message : "Invalid conversation type"});
        }

    }catch(err){
        console.error(err);
        res.status(500).json({message : "Internal server error"});
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        }).populate('participants', 'name phone isOnline lastSeen')
        .populate('lastMessage', 'content createdAt sender')
        .select('-__v')
        .sort({ updatedAt: -1 })
        .lean();

        res.status(200).json({ 
            message: "success", 
            conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
