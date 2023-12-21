const express = require("express");
const router = express.Router();
const transactionRepo = require("../../repo/user/transaction.repo");
const { CommonResponse } = require("../../response/successResponse");
const { Auth } = require("../../middleware/jwt_auth");
const { notifyAdmin, notificationContent } = require("../../utils/notification");

router.get("/transactions", Auth, (req, res) => {
  transactionRepo
    .transactions(req.user, req.query)
    .then((transaction) => {
      res.json(new CommonResponse((code = 200), (message = "total transactions list"), (data = transaction)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/transaction", Auth, (req, res) => {
  console.log(req.body);
  transactionRepo
    .createTransaction(req)
    .then((transaction) => {
      const full_name = `${req.user.first_name}`;
      notifyAdmin(
        notificationContent.transactionReject.admin.desc(full_name, req.user.mobile, "deposit", req.body.amount),
        notificationContent.transactionReject.admin.title("deposit"),
        notificationContent.transactionReject.admin.data(req.user.id)
      );
      return res.json(new CommonResponse((code = 200), (message = "transaction created"), (data = transaction), (error = {})));
    })
    .catch((err) => {
      console.log("error", err);
      return res.status(400).json(new CommonResponse((code = 400), (message = "transaction does not created"), (data = {}), (error = err)));
    });
});

module.exports = router;
