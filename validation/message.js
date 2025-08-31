const joi = require('joi');
const {objectId, messageContent } = require('./common');
exports.messageSchema = joi.object({
  conversationID: objectId.required(),
  message: messageContent.required(),
  randomId: joi.string().min(1).max(30).messages({
    'string.min': 'randomID must be at least 3 characters long',
    'string.max': 'randomID must be no more than 30 characters long'
  })
});
