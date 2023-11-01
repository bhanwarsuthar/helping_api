var path = require("path");
const { User, AcLedger } = require("../../models");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const otpService = require("../../services/otp/otp.service");
const userRepo = require("./user.repo");

var private_key = fs.readFileSync(path.resolve(__dirname, "../../private.key"), "utf-8");
// POST /login_basic
exports.login_with_password = async (req, res) => {
  User.findOne({
    where: { mobile: req.body.mobile },
    include: [
      {
        model: AcLedger,
        as: "ac_ledgers",
      },
    ],
  })
    .then((user) => {
      if (!user) res.status(400).json({ message: "Account not found." });
      else {
        if (user.isBlocked(user.status)) {
          return res.status(401).json({
            message: "User is blocked",
          });
        }
        if (req.body.sponsor_code) {
          user.sponsor = req.body.sponsor_code;
        }
        bcrypt.compare(req.body.password, user.password, function (err, match) {
          if (err) {
            res.status(400).json({ message: err });
          } else if (match) {
            var options = {
              subject: user.id.toString(),
              audience: "help-api-v1",
              expiresIn: "180d", // token will expire after 180 days
              algorithm: "RS256",
            };
            var token = jwt.sign({ data: null }, private_key, options);
            return res.json({
              message: "",
              data: {
                access_token: token,
                user: user,
              },
            });
          } else {
            res.status(400).json({ message: "invalid username or password." });
          }
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: error });
    });
};

exports.has_mobile = async (req, res) => {
  User.findOne({ where: { mobile: req.body.mobile } })
    .then(async (user) => {
      if (user?.isBlocked(user.status)) {
        return res.status(401).json({
          message: "User is blocked",
        });
      }
      if (await otpService.verifyOtp(user, { code: req.body.otp || "", send_to: req.body.mobile })) {
        res.status(400).json({ message: "Account not found." });
      } else {
        res.status(200).json({ message: "Mobile number available." });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: error });
    });
};

exports.verify_otp = async (req, res) => {
  const verifyOtpOptions = {
    code: req.body.otp,
    send_to: req.body.mobile,
  };

  try {
    const otp = await otpService.verifyOtp(null, verifyOtpOptions);

    if (!otp) {
      return res.status(400).json({
        message: "Incorrect Otp",
      });
    }

    const deletedOtp = await otpService.deleteOtp(req.body.otp);

    if (!deletedOtp) {
      return res.status(400).json({
        message: "Incorrect Otp",
        data: null,
        error: null,
      });
    }

    res.status(200).json({
      message: "Otp verified successfully",
      data: {
        mobile: req.body.mobile,
      },
      error: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while verifing otp",
      data: null,
      error: error.message || "Something went wrong",
    });
  }
};

// POST /login_with_otp
exports.login_with_otp = async (req, res) => {
  if (await otpService.verifyOtp(user, { code: req.body.otp || "", send_to: req.body.mobile })) {
    var user = await User.findOne({ where: { mobile: req.body.mobile } });
    if (!user) {
      user = await User.build(req.body);
    }

    if (user.mobile_verified_at == null) {
      user.mobile_verified_at = new Date();
      await user.save();
    }
    //update sponsor code is in submitRewardPoint() with promise handler
    if (user.sponsor_code == null && user.referral_code != req.body.sponsor_code && req.body.sponsor_code) {
      user.sponsor_code = req.body.sponsor_code;
      user = await userRepo.submitRewardPoint(req.body.sponsor_code, user.id);
    }

    var options = {
      subject: user.id.toString(),
      audience: "geri-api",
      expiresIn: "180d", // token will expire after 180 days
      algorithm: "RS256",
    };
    var token = jwt.sign({ data: null }, private_key, options);
    return res.json({
      message: "",
      data: {
        access_token: token,
        user: user,
      },
    });
  } else {
    return res.status(400).json({ message: "Invalid otp" });
  }
};

exports.sendOtp = async (req, res) => {
  if (otpService.sendOtp(null, { mobile: req.body.mobile })) {
    return res.json({
      message: "otp sent successfully.",
      data: {
        mobile: req.body.mobile,
      },
    });
  } else {
    return res.status(400).json({ message: "otp sending failed." });
  }
};

exports.logout = async (req, res) => {
  const authHeader = req.headers["authorization"];
  jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
    if (logout) {
      res.send({ message: "You have been Logged Out" });
    } else {
      res.send({ message: "Error" });
    }
  });
};
