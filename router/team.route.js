const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { Team } = require('../models');
const teamRepo = require('../repo/team.repo');
const { CommonResponse } = require('../response/successResponse');


router.get('/teams', (req, res) => {
    teamRepo.teams()
        .then(users => {
            res.json(new CommonResponse(code = 200, message = 'total teams list', data = users));
        }).catch(err => {
            res.json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.post('/team', async (req, res) => {
    console.log(req.body);
    teamRepo.createTeam(req.body)
        .then(team => {
            return res.json(new CommonResponse(code = 200, message = 'team created', data = team, error = {}));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'team does not created',data = {}, error = err));
        });
    
});

router.put('/team', async (req, res) => {
    console.log(req.body);
    teamRepo.updateTeam(req.body)
        .then(team => {
            return res.json(new CommonResponse(200, message = 'team data updated', data = team));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'team data does not update', error = err));
        });
});

router.delete('/team/:id', async (req, res) => {
    teamRepo.deleteTeam(req.params)
        .then(team => {
            return res.json(new CommonResponse(200, message = 'team deleted', data = team));
        }).catch(err => {
            return res.json(new CommonResponse(code = 400, message = 'team does not deleted', error = err));
        });
});

module.exports = router;