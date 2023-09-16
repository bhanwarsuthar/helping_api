const express = require('express');
const router = express.Router();
const authRoute = require('./auth.route');
const transactionRoute = require('./transaction.route');
const pinTransactionRoute = require('./pin_transaction.route');
const pinRoute = require('./pin.route');
const helpRoute = require('./help.route');

router.use(authRoute);
router.use(transactionRoute);
router.use(pinRoute);
router.use(pinTransactionRoute);
router.use(helpRoute);

module.exports = router;