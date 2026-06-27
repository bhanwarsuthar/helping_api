const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { PinTransaction } = require("../../models");
const { CommonResponse } = require("../../response/successResponse");
const pintTransactionRepo = require("../../repo/user/pin_transaction.repo");
const { Auth } = require("../../middleware/jwt_auth");
const { notifyAdminPaymentRequest, notificationContent } = require("../../utils/notification");

router.get("/pin/transactions", Auth, (req, res) => {
  pintTransactionRepo
    .pinTransactions(req.query)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "total Pin Transactions list"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.get("/links", Auth, (req, res) => {
  pintTransactionRepo.links(req.query).then((links) => {
    res.status(200).json(new CommonResponse((code = 200), (message = "links fetched"), (data = links)));
  });
});

router.post("/received/payment", Auth, (req, res) => {
  pintTransactionRepo
    .receviedPayment(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Payment Received"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/submit/payment", Auth, (req, res) => {
  pintTransactionRepo
    .submitPayment(req.body, req.user.id)
    .then((pinTransaction) => {
      const provider = pinTransaction.provide;
      const fullName = provider?.first_name || req.user.first_name || "User";
      const mobile = provider?.mobile || req.user.mobile || "";
      notifyAdminPaymentRequest(
        notificationContent.paymentSubmitted.admin.desc(fullName, mobile),
        notificationContent.paymentSubmitted.admin.title(),
        notificationContent.paymentSubmitted.admin.data(provider?.id || req.user.id),
      );
      res.json(new CommonResponse((code = 200), (message = "Payment submitted"), (data = pinTransaction)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/reject/payment", Auth, (req, res) => {
  pintTransactionRepo
    .rejectSubmittedPayment(req.body, req.user.id)
    .then((pinTransaction) => {
      res.json(new CommonResponse((code = 200), (message = "Payment marked as not received"), (data = pinTransaction)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;
