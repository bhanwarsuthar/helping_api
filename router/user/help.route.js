const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { PinTransaction } = require("../../models");
const { CommonResponse } = require("../../response/successResponse");
const helpRepo = require("../../repo/user/help.repo");
const { Auth } = require("../../middleware/jwt_auth");

router.get("/pin/transactions", Auth, (req, res) => {
  helpRepo
    .pinTransactions(req.query, req.user)
    .then((pinTransactions) => {
      res.json(new CommonResponse((code = 200), (message = "total Pin Transactions list"), (data = pinTransactions)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

router.get("/receive-links", Auth, (req, res) => {
  helpRepo
    .receiveLinks(req.query, req.user)
    .then((links) => {
      res.json(new CommonResponse((code = 200), (message = "total receive links list"), (data = links)));
    })
    .catch((err) => {
      res.status(400).json(new CommonResponse((code = 400), (message = err.message)));
    });
});

module.exports = router;
