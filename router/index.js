const express = require('express');
const router = express.Router();
const userRoute = require('./user.route');
const uploadRoute = require('./upload.route');
const teamRoute = require('./team.route');
const playerRoute = require('./player.route');
const historyRoute = require('./history.route');
const matchRoute = require('./match.route');

router.use(userRoute, uploadRoute, teamRoute, playerRoute, historyRoute, matchRoute);

module.exports = router;