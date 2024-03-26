const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { PinTransaction } = require("../../models");
const pintTransactionRepo = require("../../repo/admin/pin_transaction.repo");
const { CommonResponse } = require("../../response/successResponse");
const { Auth } = require("../../middleware/jwt_auth");

router.get("/pin/transactions", (req, res) => {
  pintTransactionRepo
    .pinTransactions(req.query)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "total Pin Transactions list"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/link/connect/self", (req, res) => {
  pintTransactionRepo
    .linkConnectSelf(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Link attached"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/link/connect/custom", (req, res) => {
  pintTransactionRepo
    .linkConnectCustom(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Link attached"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/link/connect/auto", (req, res) => {
  pintTransactionRepo
    .linkConnectAuto(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Link attached"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/received/payment", (req, res) => {
  pintTransactionRepo
    .receviedPayment(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Payment Received"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/ph/rh/cancel", (req, res) => {
  pintTransactionRepo
    .phRhCancel(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Successfully cancel"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/user/pending/rh/connect/ph", (req, res) => {
  pintTransactionRepo
    .userPendingRhConnectToPh(req.body)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "Links Connected successfully"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;
