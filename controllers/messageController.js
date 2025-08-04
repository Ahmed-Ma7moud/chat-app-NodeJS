const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const mongoose = require('mongoose')

exports.getMessages = async (req, res) => {
    const { conversationID } = req.params;
    
    if (!conversationID || !mongoose.Types.ObjectId.isValid(conversationID)) {
        return res.status(400).json({ msg: "Invalid conversation ID" });
    }

    try {
        const conversation = await Conversation.findById(conversationID)
            .select('participants')
            .lean();

        if (!conversation) {
            return res.status(404).json({ msg: "Conversation not found" });
        }

        const isAllowed = conversation.participants.some(participant => 
            participant.toString() === req.user.id.toString()
        );

        if (!isAllowed) {
            return res.status(403).json({ msg: "Access denied" });
        }

        const messages = await Message.find({ conversationID })
            .populate('sender', 'name phone')
            .sort({ createdAt: 1 }) 
            .lean();

        res.status(200).json({ msg: "success", messages });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ msg: "Internal server error" });
    }
};