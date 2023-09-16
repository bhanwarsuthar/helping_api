const Joi = require('joi') 
const schemas = { 
  // Basic login validation
  login_with_password: (input) => Joi.object().keys({
    //email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required() 
  }).validate(input), 

  verify_otp: (input) => Joi.object().keys({
    //email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    otp: Joi.string().required() ,
  }).validate(input), 

  has_mobile: (input) => Joi.object().keys({
    //email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'})
  }).validate(input), 

  login_with_otp: (input) => Joi.object().keys({
    //email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    otp: Joi.string().required() ,
    sponsor_code: Joi.string() 
  }).validate(input), 

  // Registration validation
  registration_basic : (input) => Joi.object().keys({
    first_name: Joi.string().required(),
    //email: Joi.string().email({ tlds: { allow: false } }).required(),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required()
  }).validate(input),

  register_with_otp : (input) => Joi.object().keys({
    otp: Joi.string().regex(/^[0-9]{6}$/).required().messages({'string.pattern.base': 'OTP must have 6 digits.'}),
   first_name: Joi.string().required(),
    sponsor: Joi.string().regex(/^[0-9]{10}$/).invalid(Joi.ref('mobile')).required().messages({'string.pattern.base': 'Sponsor must have 10 digits.'}),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required(),
    role: Joi.string().valid('admin','user').required()
  }).validate(input),

  send_otp_new_user : (input) => Joi.object().keys({
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    sponsor: Joi.string().regex(/^[0-9]{10}$/).invalid(Joi.ref('mobile')).required().messages({'string.pattern.base': 'Sponsor must have 10 digits.'}),
  }).validate(input),

  resend_otp: (input) => Joi.object().keys({
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'})
   }).validate(input),

  send_otp_forgot_password: (input) => Joi.object().keys({
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'})
  }).validate(input), 

  update_forgot_password : (input) => Joi.object().keys({
    otp: Joi.string().regex(/^[0-9]{6}$/).required().messages({'string.pattern.base': 'OTP must have 6 digits.'}),
    mobile: Joi.string().regex(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must have 10 digits.'}),
    password: Joi.string().required()
  }).validate(input),
}; 
module.exports = schemas;