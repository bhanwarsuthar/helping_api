const { Op } = require("sequelize");
const { PinTransaction } = require("../models");
const moment = require("moment");

const pinTransactionRepo = require("../repo/admin/pin_transaction.repo");

exports.expirePinTxs = async () => {
  let pinTxs = await PinTransaction.findAll({
    where: {
      status: "inprogress",
      updated_at: {
        [Op.gte]: moment().subtract(8, "hours").utc(),
      },
    },
  });

  pinTxs = pinTxs.map((tx) => tx.id);

  await pinTransactionRepo.phRhExpire(pinTxs);

  console.log(`${moment().utc(true).toString()} Pin Transactions Expires: `, pinTxs.length);
};
