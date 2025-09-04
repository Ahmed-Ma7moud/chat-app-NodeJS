const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const {objectId} = require('../validation/common')
const mongoose = require('mongoose');
exports.getMessages = async (req, res) => {
    const maxLimit = 30;
    const { conversationID } = req.params;
    let { idOfOldestMessage, limit = maxLimit} = req.query;
    let query = {};
    let { error } = objectId.validate(conversationID);

    if (error) {
        return res.status(400).json({ message: "Invalid conversation ID" });
    }

    if (idOfOldestMessage) {
        let { error } = objectId.validate(idOfOldestMessage);
        if (error) {
            return res.status(400).json({ message: "Invalid message ID" });
        }
        query._id = { $lt: idOfOldestMessage };
    }

    if (limit) {
        if (!/^[1-9]\d{0,1}$/.test(limit)) {
            return res.status(400).json({ message: "Limit must be 1-2 digits and not start with 0" });
        }
        // limits between 10 and maxLimit
        limit = Math.max(Math.min(parseInt(limit, 10), maxLimit), 10);
    }

    try {
        const exists = await Conversation.exists({
            _id: conversationID,
            participants: req.user.id
        });

        if (!exists) {
            return res.status(403).json({ message: "Conversation not found or access denied" });
        }

        query.conversationID = conversationID;
        const messages = await Message.find(query)
            .select('-__v') // exclude version key
            .populate('sender', 'name phone')
            .sort({ _id: -1 })
            .limit(limit) // Limit to latest messages
            .lean();

        res.status(200).json({ message: "success", messages });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};