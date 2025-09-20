const express = require("express");
const router = express.Router();
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const transactionRoute = require("./transaction.route");
const pinTransactionRoute = require("./pin_transaction.route");
const pinRoute = require("./pin.route");
const helpRoute = require("./help.route");
const commonDataRoute = require("./common_data.route");
const uploadRoute = require("./../upload.route");

router.use(userRoute, authRoute, transactionRoute, pinTransactionRoute, helpRoute, uploadRoute);
router.use(pinRoute, commonDataRoute);

module.exports = router;
