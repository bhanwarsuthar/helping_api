const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { PinTransaction } = require('../../models');
const commonDataRepo = require('../../repo/user/common_data.repo');
const { CommonResponse } = require('../../response/successResponse');


router.get('/common/data', (req, res) => {
    commonDataRepo.commonData()
        .then(data => {
            res.json(new CommonResponse(code = 200, message = 'list', data = data));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});

module.exports = router;
