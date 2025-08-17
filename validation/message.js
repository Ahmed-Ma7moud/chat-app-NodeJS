const joi = require('joi');
const {objectId, messageContent } = require('./common');
exports.messageSchema = joi.object({
  conversationID: objectId.required(),
  message: messageContent.required()
});
