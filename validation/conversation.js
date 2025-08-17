const joi = require('joi');
const {type , phone, messageContent} = require('./common');

exports.conversationSchema = joi.object({
    type: type.required(),
    phone: phone.required(),
    messageContent: messageContent.required()
});
