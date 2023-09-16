const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { PinTransaction } = require('../../models');
const { CommonResponse } = require('../../response/successResponse');
const pintTransactionRepo = require('../../repo/user/pin_transaction.repo');
const { Auth } = require('../../middleware/jwt_auth');

router.get('/pin/transactions', Auth, (req, res) => {
    pintTransactionRepo.pinTransactions(req.query, req.user)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'total Pin Transactions list', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});


module.exports = router;
