const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { Match } = require('../models');
const matchRepo = require('../repo/match.repo');
const { CommonResponse } = require('../response/successResponse');


router.get('/matches', (req, res) => {
    matchRepo.matches(req.query.type)
        .then(users => {
            res.json(new CommonResponse(code = 200, message = 'total matches list', data = users));
        }).catch(err => {
            res.json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.post('/match', async (req, res) => {
    console.log(req.body);
    matchRepo.createMatch(req.body)
        .then(match => {
            return res.json(new CommonResponse(code = 200, message = 'match created', data = match, error = {}));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'match does not created',data = {}, error = err));
        });
    
});

router.put('/match', async (req, res) => {
    console.log(req.body);
    matchRepo.updateMatch(req.body)
        .then(team => {
            return res.json(new CommonResponse(200, message = 'match data updated', data = team));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'match data does not update', error = err));
        });
});

router.delete('/match/:id', async (req, res) => {
    matchRepo.deleteMatch(req.params)
        .then(team => {
            return res.json(new CommonResponse(200, message = 'match deleted', data = team));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'match does not deleted', error = err));
        });
});

module.exports = router;