const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { PinTransaction } = require("../../models");
const { CommonResponse } = require("../../response/successResponse");
const pintTransactionRepo = require("../../repo/user/pin_transaction.repo");
const { Auth } = require("../../middleware/jwt_auth");

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

module.exports = router;
