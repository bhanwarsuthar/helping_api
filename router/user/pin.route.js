const express = require('express');
const router = express.Router();
const pinRepo = require('../../repo/user/pin.repo');
const { CommonResponse } = require('../../response/successResponse');
const { Auth } = require('../../middleware/jwt_auth');


router.get('/single/pin', (req, res) => {
    pinRepo.singlePin(req.query)
        .then(pin => {
            res.json(new CommonResponse(code = 200, message = 'Single Pin', data = pin));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message ));
        })
});

router.post('/buy/pin', Auth, (req, res) =>{
    pinRepo.buyPin(req.body.pin_id, req.user.id, res)
        .then(pin =>{
            res.json(new CommonResponse(code = 200, message = 'Pin Purchase sucessfully', data = pin));
        }).catch(err => {
            res.status(400).json(new CommonResponse(code = 400, message= err.message));
        })
})

module.exports = router;