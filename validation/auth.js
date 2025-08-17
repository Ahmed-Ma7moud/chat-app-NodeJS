const joi = require('joi');
const {name , phone , password} = require('./common');

exports.registerSchema = joi.object({
    name: name.required(),
    phone: phone.required(),
    password: password.required()
});

exports.loginSchema = joi.object({
    phone : phone.required(),
    password : password.required()
})

