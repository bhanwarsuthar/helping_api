const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { Transactions } = require("../../models");
const transactionRepo = require("../../repo/admin/transaction.repo");
const { CommonResponse } = require("../../response/successResponse");

router.get("/transactions", (req, res) => {
  transactionRepo
    .transactions(req.query)
    .then((users) => {
      res.json(new CommonResponse((code = 200), (message = "total transactions list"), (data = users)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.post("/transaction", async (req, res) => {
  if (!req.body.type) {
    return res.status(400).json({
      message: "Transaction type not found",
      data: null,
      error: "type must be provided in request body",
    });
  }

  transactionRepo
    .createTransaction(req.body)
    .then((transaction) => {
      return res.json(new CommonResponse((code = 200), (message = `transaction ${req.body.type}`), (data = transaction), (error = {})));
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json(new CommonResponse((code = 400), (message = "transaction does not created"), (data = {}), (error = err)));
    });
});

router.put("/approve/transaction", async (req, res) => {
  console.log(req.body);
  transactionRepo
    .approveTransactions(req.body)
    .then((team) => {
      return res.json(new CommonResponse(200, (message = "transaction data updated"), (data = team.id)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message), (error = err)));
    });
});

router.put("/reject/transaction", async (req, res) => {
  console.log(req.body);
  transactionRepo
    .rejectTransactions(req.body)
    .then((team) => {
      return res.json(new CommonResponse(200, (message = "transaction data updated"), (data = team.id)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message), (error = err)));
    });
});

module.exports = router;
