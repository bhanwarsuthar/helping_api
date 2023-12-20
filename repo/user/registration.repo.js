var path = require("path");
const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const otpService = require("../../services/otp/otp.service");
const login = require("./login.repo");

var private_key = fs.readFileSync(path.resolve(__dirname, "../../private.key"), "utf-8");

exports.send_otp_new_user = async (req, res) => {
  let checkUser = await User.findOne({ where: { mobile: req.body.mobile } });

  if (checkUser?.isBlocked(checkUser.status)) {
    return res.status(401).json({
      message: "User is blocked",
    });
  }

  if (checkUser) {
    return res.status(404).json({
      message: "mobile number has been taken.",
      errors: [
        {
          message: "mobile number has been taken.",
          body: ["mobile"],
        },
      ],
    });
  }
  sponsorUser = await User.findOne({ where: { mobile: req.body.sponsor } });
  if (!sponsorUser) {
    return res.status(404).json({
      message: "sponsor not available.",
      errors: [
        {
          message: "sponsor not available.",
          body: ["sponsor"],
        },
      ],
    });
  }
  //send otp
  return await login.sendOtp(req, res);
};

exports.resend_otp = async (req, res) => {
  return await login.sendOtp(req, res);
};

exports.send_otp_forgot_password = async (req, res) => {
  let checkUser = await User.findOne({ where: { mobile: req.body.mobile } });

  if (checkUser?.isBlocked(checkUser.status)) {
    return res.status(401).json({
      message: "User is blocked",
    });
  }

  if (checkUser) {
    req.user = checkUser;
    return await login.sendOtp(req, res);
  } else {
    return res.status(400).json({ message: "mobile number not found." });
  }
};

exports.registration = async (req, res) => {
  let checkUser = await User.findOne({ where: { mobile: req.body.mobile } });
  if (checkUser) {
    return res.status(400).json({ message: "mobile number has been taken." });
  }
  var user = await User.build(req.body);

  const salt = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  return res.json({
    message: "",
    data: user,
  });
};

exports.update_forgot_password = async (req, res) => {
  if (await otpService.verifyOtp(user, { code: req.body.otp, send_to: req.body.mobile })) {
    var user = await User.findOne({ where: { mobile: req.body.mobile } });
    if (user?.isBlocked(user.status)) {
      return res.status(401).json({
        message: "User is blocked",
      });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    var options = {
      subject: user.id.toString(),
      audience: "geri-api",
      expiresIn: "180d", // token will expire after 180 days
      algorithm: "RS256",
    };
    var token = jwt.sign({ data: null }, private_key, options);
    return res.status(200).json({
      message: "Password updated successfully",
      data: {
        access_token: token,
        user: user,
      },
    });
  } else {
    return res.status(400).json({
      message: "Invalid otp",
      errors: [
        {
          message: "Invalid otp",
          body: ["otp"],
        },
      ],
    });
  }
};

exports.register_with_otp = async (req, res) => {
  if (await otpService.verifyOtp(user, { code: req.body.otp || "", send_to: req.body.mobile })) {
    var user = await User.findOne({ where: { mobile: req.body.mobile } });
    if (!user) {
      user = await User.build(req.body);
      const salt = await bcrypt.genSalt(10);
      // now we set user password to hashed password
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (user.mobile_verified_at == null) {
      user.mobile_verified_at = new Date();
      await user.save();
    }
    //update sponsor code is in submitRewardPoint() with promise handler
    if (user.sponsor == null && user.referral_code != req.body.sponsor && req.body.sponsor) {
      user.sponsor = req.body.sponsor;
      user = await userRepo.submitRewardPoint(req.body.sponsor, user.id);
    }

    await User.increment("direct_user_count", {
      by: 1,
      where: {
        mobile: user.sponsor,
      },
    });

    var options = {
      subject: user.id.toString(),
      audience: "geri-api",
      expiresIn: "180d", // token will expire after 180 days
      algorithm: "RS256",
    };
    var token = jwt.sign({ data: null }, private_key, options);
    return res.status(200).json({
      message: "user created successfully",
      data: {
        access_token: token,
        user: user,
      },
    });
  } else {
    return res.status(400).json({
      message: "Invalid otp",
      errors: [
        {
          message: "Invalid otp",
          body: ["otp"],
        },
      ],
    });
  }
};
