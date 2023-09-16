const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { History } = require('../models');
const historyRepo = require('../repo/history.repo');
const { CommonResponse } = require('../response/successResponse');


router.get('/histories', (req, res) => {
    historyRepo.histories(req.query)
        .then(users => {
            res.json(new CommonResponse(code = 200, message = 'total histories list', data = users));
        }).catch(err => {
            res.json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.post('/history', async (req, res) => {
    console.log(req.body);
    historyRepo.createHistory(req.body)
        .then(history => {
            return res.json(new CommonResponse(code = 200, message = 'history created', data = history, error = {}));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'history does not created',data = {}, error = err));
        });
    
});

router.put('/history', async (req, res) => {
    console.log(req.body);
    historyRepo.updateHistory(req.body)
        .then(history => {
            return res.json(new CommonResponse(200, message = 'history data updated', data = history));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'history data does not update', error = err));
        });
});

router.delete('/history/:id', async (req, res) => {
    historyRepo.deleteHistory(req.params)
        .then(team => {
            return res.json(new CommonResponse(200, message = 'history deleted', data = team));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'history does not deleted', error = err));
        });
});

module.exports = router;