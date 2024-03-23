const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { PinTransaction } = require('../../models');
const helpRepo = require('../../repo/admin/help.repo');
const { CommonResponse } = require('../../response/successResponse');


router.get('/pin/transactions', (req, res) => {
    helpRepo.pinTransactions(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'total Pin Transactions list', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message = err.message));
        })
});

router.get('/link/connect/self', (req, res) => {
    helpRepo.linkConnectSelf(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'Link attached', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message = err.message));
        })
});

router.get('/link/connect/custom', (req, res) => {
    helpRepo.linkConnectCustom(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'Link attached', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message = err.message));
        })
});

router.get('/link/connect/auto', (req, res) => {
    helpRepo.linkConnectAuto(req.query)
        .then(pinTransactions => {
            res.json(new CommonResponse(code = 200, message = 'Link attached', data = pinTransactions));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message = err.message));
        })
});

router.get('/link/pending/rh', (req, res) => {
    helpRepo.pendingRhLink(req.query)
        .then(pendingRhLinks => {
            res.json(new CommonResponse(code = 200, message = 'total pending RH link list', data = pendingRhLinks));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message = err.message));
        })
});


module.exports = router;
