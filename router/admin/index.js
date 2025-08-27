const express = require("express");
const router = express.Router();
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const transactionRoute = require("./transaction.route");
const pinTransactionRoute = require("./pin_transaction.route");
const pinRoute = require("./pin.route");
const helpRoute = require("./help.route");
const commonDataRoute = require("./common_data.route");
const levelRoute = require("./level.route");

router.use(authRoute);
router.use(userRoute);
router.use(transactionRoute);
router.use(pinRoute);
router.use(pinTransactionRoute);
router.use(helpRoute);
router.use(commonDataRoute);
router.use(levelRoute);

module.exports = router;
