const express = require("express");

const adminRepo = require("../../repo/admin/adminRepo.js");

const UserRepo = require("../../repo/user/user.repo.js");
const { CommonResponse } = require("../../response/successResponse.js");

const router = express.Router();

router.route("/users").get(adminRepo.users);

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

module.exports = router;
