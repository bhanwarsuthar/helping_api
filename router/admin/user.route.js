const express = require("express");

const adminRepo = require("../../repo/admin/adminRepo.js");

const UserRepo = require("../../repo/user/user.repo.js");
const { CommonResponse } = require("../../response/successResponse.js");
const { notificationContent, notifyUser, sendNotificationUser } = require("../../utils/notification.js");
const validator = require("../../middleware/validator");
const schema = require("../../validations/user/user.validation");

const router = express.Router();

router.route("/users").get(adminRepo.users);

router.get("/users/mobile-numbers", adminRepo.allUserMobileNumbers);

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

router.post("/users/upi", validator(schema.update_user_upi), (req, res) => {
  UserRepo.update_user_upi(req.body.user_id, req.body)
    .then((user) => {
      return res.json(new CommonResponse((code = 200), (message = "User UPI updated"), (data = user)));
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message || "Unable to update UPI")));
    });
});

router.route("/dashboard").get(adminRepo.adminDashboardData);

router.post("/notity-users", async (req, res) => {
  const result = await sendNotificationUser({
    contents: {
      en: req.body.message,
    },
    headings: {
      en: req.body.heading || "Admin",
    },
    included_segments: ["Subscribed Users"],
  });

  if (!result) {
    return res.json(new CommonResponse((code = 400), (message = "Failed to send notification")));
  }

  return res.json(new CommonResponse((code = 200), (message = "Notification sent to all users")));
});

module.exports = router;
