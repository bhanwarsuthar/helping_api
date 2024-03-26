const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { Transactions } = require("../../models");
const transactionRepo = require("../../repo/admin/transaction.repo");
const userRepo = require("../../repo/user/user.repo");
const { distributeAmtByLevel } = require("../../utils/leveldistribution");
const { CommonResponse } = require("../../response/successResponse");
const { notificationContent, notifyUser } = require("../../utils/notification");

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


router.get("/transactions/total/deposit", (req, res) => {
  transactionRepo
    .totalDeposit(req.query)
    .then((users) => {
      res.json(new CommonResponse((code = 200), (message = "total deposit amount"), (data = users)));
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
    .then(async (approvedTx) => {
      notifyUser(
        notificationContent.transactionApproved.user.desc(approvedTx.notation, approvedTx.amount),
        notificationContent.transactionApproved.user.title(approvedTx.notation),
        approvedTx.user_id,
        notificationContent.transactionApproved.user.data()
      );

      notifyUser(
        notificationContent.transactionApproved.user.desc(approvedTx.notation, approvedTx.amount),
        notificationContent.transactionApproved.user.title(approvedTx.notation),
        approvedTx.user_id,
        notificationContent.transactionApproved.user.data()
      );
      const user = await userRepo.profile({ id: approvedTx.user_id });
      await distributeAmtByLevel(user.sponsor, approvedTx.amount);
      return res.json(new CommonResponse(200, (message = "transaction data updated"), (data = approvedTx.id)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message), (error = err)));
    });
});

router.put("/reject/transaction", async (req, res) => {
  console.log(req.body);
  transactionRepo
    .rejectTransactions(req.body)
    .then((rejectedTx) => {
      notifyUser(
        notificationContent.transactionReject.user.desc(rejectedTx.notation, rejectedTx.amount),
        notificationContent.transactionReject.user.title(rejectedTx.notation),
        rejectedTx.user_id,
        notificationContent.transactionReject.user.data()
      );
      return res.json(new CommonResponse(200, (message = "transaction data updated"), (data = rejectedTx.id)));
    })
    .catch((err) => {
      return res.status(400).json(new CommonResponse((code = 400), (message = err.message), (error = err)));
    });
});

module.exports = router;
