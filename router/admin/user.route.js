const express = require("express");

const adminRepo = require("../../repo/admin/adminRepo.js");

const UserRepo = require("../../repo/user/user.repo.js");
const { CommonResponse } = require("../../response/successResponse.js");
const { notificationContent, notifyUser, sendNotificationUser } = require("../../utils/notification.js");

const router = express.Router();

router.route("/users").get(adminRepo.users);

router.route("/users/:mobile").get((req, res) => {
  return adminRepo.get_user(req.params.mobile).then((user) => {
    if (!user) {
      return res.json(new CommonResponse((code = 404), (message = "User not found"), (data = user)));
    }
    return res.json(new CommonResponse((code = 200), (message = "User found"), (data = user)));
  });
});

router.put("/users/block", (req, res) => {
  UserRepo.block(req.body.user_id)
    .then((user) => {
      return res.json(new CommonResponse((code = 200), (message = "User has been blocked successfully"), (data = user)));
    })
    .catch((err) => {
      console.log(err);
      return res.json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.put("/users/unblock", (req, res) => {
  UserRepo.unblock(req.body.user_id)
    .then((user) => {
      return res.json(new CommonResponse((code = 200), (message = "User has been unblocked successfully"), (data = user)));
    })
    .catch((err) => {
      console.log(err);
      return res.json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.route("/dashboard").get(adminRepo.adminDashboardData);

router.post("/notity-users", async (req, res) => {
  return sendNotificationUser({
    contents: {
      en: req.body.message,
    },
    headings: {
      en: req.body.heading || "Admin",
    },
    included_segments: ["All"],
  }).then(() => {
    return res.json(new CommonResponse((code = 200), (message = "Notification sent to all users")));
  });
});

module.exports = router;
