const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { PinTransaction } = require('../../models');
const pintTransactionRepo = require('../../repo/admin/pin_transaction.repo');
const { CommonResponse } = require('../../response/successResponse');


router.get('/pin/transactions', (req, res) => {
    pintTransactionRepo.pinTransactions(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'total Pin Transactions list', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.get('/link/connect/self', (req, res) => {
    pintTransactionRepo.linkConnectSelf(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'Link attached', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.get('/link/connect/custom', (req, res) => {
    pintTransactionRepo.linkConnectCustom(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'Link attached', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.get('/link/connect/auto', (req, res) => {
    pintTransactionRepo.linkConnectAuto(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'Link attached', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});

module.exports = router;
