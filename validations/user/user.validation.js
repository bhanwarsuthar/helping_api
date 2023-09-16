const Joi = require('joi') 
const schemas = { 

  // Registration validation
  registration_basic : (input) => Joi.object().keys({
    first_name: Joi.string().required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required()
  }).validate(input),

  new_address : (input) => Joi.object().keys({
    phone_number: Joi.string().required(),
    is_default: Joi.boolean().required(),
    line1: Joi.string().required(),
    line2: Joi.string().required(),
    city: Joi.string().required(),
    pin_code: Joi.string().required().length(6),
    state: Joi.string().required(),
    country: Joi.string().required(),
    geo: Joi.any().required()
  }).validate(input),

  sponsor_code : (input) => Joi.object().keys({
    sponsor_code: Joi.string().required()
  }).validate(input),

  create_user: (input) => Joi.object().keys({
    first_name: Joi.string().required(),
    sponsor_code: Joi.string().required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required(),
    role: Joi.string().valid('admin','user').required()
  }).validate(input),

  update_user: (input) => Joi.object().keys({
    first_name: Joi.string(),
    email: Joi.string()
  }).validate(input)
}; 
module.exports = schemas;