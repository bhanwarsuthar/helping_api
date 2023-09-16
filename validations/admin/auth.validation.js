const Joi = require('joi') 
const schemas = { 
  // Basic login validation
  login_with_password: (input) => Joi.object().keys({
    //email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required() 
  }).validate(input),
  register_with_password : (input) => Joi.object().keys({
   first_name: Joi.string().required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required(),
    role: Joi.string().valid('guest').required()
  }).validate(input)
}; 
module.exports = schemas;