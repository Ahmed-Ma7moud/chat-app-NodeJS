const {auth , 
    conversation , 
    message
} = require('../validation/index');

exports.loginValidator = (req, res, next) => {
    const { error } = auth.loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Invalid Email or password" });
    }
    next();
}

exports.registerValidator = (req, res, next) => {
    const { error } = auth.registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

exports.messageValidator = (req, res, next) => {
    const { error } = message.messageSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}
exports.createConversationValidator = (req, res, next) => {
    const { error } = conversation.conversationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

