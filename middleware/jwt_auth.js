const passport = require("passport");
const _ = require("lodash");

const Auth = (req, res, next) => {
  passport.authenticate("user-jwt", { session: false }, function (err, user, info) {
    if (err || !user || _.isEmpty(user)) {
      if (user?.isBlocked(user.status)) {
        return res.status(401).json({
          message: "User is blocked",
        });
      }
      next(info);
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

const AdminAuth = (req, res, next) => {
  passport.authenticate("admin-jwt", { session: false }, function (err, user, info) {
    if (err || !user || _.isEmpty(user)) {
      next(info);
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

const SellerAuth = (req, res, next) => {
  passport.authenticate("seller-jwt", { session: false }, function (err, user, info) {
    if (err || !user || _.isEmpty(user)) {
      next(info);
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

const DeliveryBoyAuth = (req, res, next) => {
  passport.authenticate("delivery-jwt", { session: false }, function (err, user, info) {
    if (err || !user || _.isEmpty(user)) {
      next(info);
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

module.exports = { Auth, AdminAuth, SellerAuth, DeliveryBoyAuth };
