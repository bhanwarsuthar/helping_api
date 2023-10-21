const express = require("express");

const adminRepo = require("../../repo/admin/adminRepo.js");

const router = express.Router();

router.route("/users").get(adminRepo.getAllUsers);

router.route("/users/:id").put(adminRepo.updateUser);

router.route("/transactions/:id").get(adminRepo.getPinTransByUserId);

router.route("/dashboard").get(adminRepo.adminDashboardData);

// router.route("/users").get((req, res) => {
//   req.query = { ...req.query, include: [{ model: AcLedger, as: "ac_ledgers" }] };
//   adminRepo
//     .list(req.query, req.query?.limit)
//     .then((users) => {
//       res.status(200).json(new CommonResponse((code = 200), (message = "Users fetched Successfully"), (data = users)));
//     })
//     .catch((error) => {
//       res.status(200).json(new CommonResponse((code = 500), (message = "Error while fetching users"), (error = error.message)));
//     });
// });

module.exports = router;
