const express = require('express');
const router = express.Router();
const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const transactionRoute = require('./transaction.route');
const pinTransactionRoute = require('./pin_transaction.route');
const pinRoute = require('./pin.route');
const helpRoute = require('./help.route');

router.use(userRoute, authRoute, transactionRoute, pinTransactionRoute, helpRoute);
router.use(pinRoute);

module.exports = router;