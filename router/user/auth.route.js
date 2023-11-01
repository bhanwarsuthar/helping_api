var express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const validator = require("../../middleware/validator");
const schema = require("../../validations/user/auth.validation");

var login = require("../../repo/user/login.repo");
var registration = require("../../repo/user/registration.repo");
const otpService = require("../../services/otp/otp.service");
const { Auth } = require("../../middleware/jwt_auth");

const otp_send_throttle = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 100 requests per windowMs
  statusCode: 400,
  message: {
    message: "too many request",
  },
});
const login_attamp_throttle = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 4, // limit each IP to 100 requests per windowMs
  statusCode: 400,
  message: {
    message: "too many request",
  },
});

router.post("/send_otp_new_user", otp_send_throttle, validator(schema.send_otp_new_user), registration.send_otp_new_user);

router.post("/resend_otp", otp_send_throttle, validator(schema.send_otp), registration.resend_otp);

router.post("/send_otp_forgot_password", otp_send_throttle, validator(schema.send_otp_forgot_password), registration.send_otp_forgot_password);

router.post("/update_forgot_password", otp_send_throttle, validator(schema.update_forgot_password), registration.update_forgot_password);

router.post("/login_with_password", validator(schema.login_with_password), login.login_with_password);

router.post("/has_mobile", validator(schema.has_mobile), login.has_mobile);

router.post("/verify_otp", validator(schema.verify_otp), login.verify_otp);

router.post("/register_with_otp", validator(schema.register_with_otp), registration.register_with_otp);

router.post("/send_otp", otp_send_throttle, validator(schema.send_otp), login.sendOtp);

module.exports = router;
