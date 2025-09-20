const { Op } = require("sequelize");
const { Pin, PinTransaction, CommonData, User, Help } = require("../models");
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

  console.log(
    `${moment().utc(true).toString()} Pin Transactions Expires: `,
    pinTxs.length
  );
};

exports.rewardPHTeam = async () => {
  const rewardPhTeamCount = await CommonData.findOne({
    where: { key: "REWARD_PH_TEAM_COUNT" },
  });
  const count = parseInt(rewardPhTeamCount?.data) || 10;
  if (count <= 0) return;
  const users = await User.findAll({
    where: { direct_help_provided_user_count: { [Op.gte]: count } },
  });
  // Reset direct_help_provided_user_count
  await Promise.all(
    users.map((u) => {
      return User.update(
        {
          direct_help_provided_user_count:
            u.direct_help_provided_user_count - count,
        },
        { where: { id: u.id } }
      );
    })
  );
  const freeFlagPin = await Pin.findOne({ where: { free_flag: 1 } });
  await Promise.all(
    users.map((u) => {
      return Help.create({
        user_id: u.id,
        pin_id: freeFlagPin.id,
        free_flag: 1,
        status: "pending",
      });
    })
  );
};
