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

  // Find users with direct_help_provided_user_count >= count
  const users = await User.findAll({
    where: { direct_help_provided_user_count: { [Op.gte]: count } },
  });

  const freeFlagPin = await Pin.findOne({ where: { free_flag: 1 } });

  await Promise.all(
    users.map(async (u) => {
      const userCount = u.direct_help_provided_user_count;
      if (userCount < count) return; // skip if less than 10

      // Calculate how many links to generate
      const linksToCreate = Math.floor(userCount / count);

      // Decrement the user's count accordingly
      await User.update(
        {
          direct_help_provided_user_count: userCount - linksToCreate * count,
        },
        { where: { id: u.id } }
      );

      // Create `linksToCreate` Help records
      const helpCreates = [];
      for (let i = 0; i < linksToCreate; i++) {
        helpCreates.push(
          Help.create({
            user_id: u.id,
            pin_id: freeFlagPin.id,
            free_flag: 1,
            status: "pending",
          })
        );
      }
      await Promise.all(helpCreates);
    })
  );
};
