const joi = require('joi')
const mongoose = require('mongoose');

const name = joi.string().trim().min(3).max(30).messages({
  'string.min': 'Name must be at least 3 characters long',
  'string.max': 'Name must be no more than 30 characters long'
});
const email = joi.string()
.trim()
.lowercase()
.email().messages({
  'string.email': 'Email must be a valid email address'
});
const password = joi.string()
.trim()
.min(6)
.max(50)
.pattern(/[a-z]/, 'lowercase') // Pattern with name "lowercase"
.pattern(/[A-Z]/, 'uppercase') // Pattern with name "uppercase"
.pattern(/[0-9]/, 'digit') // Pattern with name "digit"
.pattern(/[!@#$%^&*]/, 'special character') // Pattern with name "special character"
.messages({
'string.pattern.name': 'Password must contain at least one {{#name}}',
'string.min': 'Password must be at least 6 characters long',
'string.max': 'Password must be no more than 50 characters long'
});
const phone = joi.string().trim()
.pattern(/^(010|011|012|015)[0-9]{8}$/).messages({
  'string.pattern.base': 'Phone number must be a valid 11-digit number'
});
const messageContent = joi.string().trim().min(1).max(500).messages({
  'string.empty': 'Message content cannot be empty',
  'string.min': 'Message content must be at least 1 character long',
  'string.max': 'Message content must be no more than 500 characters long'
});
const participants = joi.array().items(phone).min(1).messages({
  'array.min': 'At least one participant must be added',
});
const type = joi.string().valid('private','group').messages({
  'any.only': 'Type must be either private or group'
})
const objectId = joi.string().trim().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'Invalid ObjectId format'
});
// const participants = joi.array().items(
//   joi.alternatives().try(
//     phone,  // Phone validation
//     email   // Email validation
//   ).required()
// ).min(1).required().messages({
//   'array.min': 'At least one participant must be added',
// });
module.exports = {
  name,
  email,
  password,
  phone,
  messageContent,
  participants,
  type,
  objectId
};