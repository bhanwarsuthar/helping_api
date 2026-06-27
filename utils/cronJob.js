const { Op } = require("sequelize");
const { Pin, PinTransaction, CommonData, User, Help, sequelize } = require("../models");
const moment = require("moment");

const pinTransactionRepo = require("../repo/admin/pin_transaction.repo");

async function getRewardPhTeamCount() {
  const rewardPhTeamCount = await CommonData.findOne({
    where: { key: "REWARD_PH_TEAM_COUNT" },
  });
  return parseInt(rewardPhTeamCount?.data, 10) || 10;
}

async function syncSponsorHelpCounts() {
  const sponsors = await sequelize.query(
    `
    SELECT DISTINCT u.id
    FROM users u
    INNER JOIN users r ON r.sponsor = u.mobile
    WHERE u.role = 'user'
      AND u.status = 'active'
    `,
    { type: sequelize.QueryTypes.SELECT },
  );

  for (const { id } of sponsors) {
    const sponsor = await User.findByPk(id);
    if (sponsor) {
      await sponsor.syncDirectHelpProvidedCount();
    }
  }
}

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
  const count = await getRewardPhTeamCount();
  if (count <= 0) {
    console.warn("rewardPHTeam skipped: REWARD_PH_TEAM_COUNT is not configured");
    return;
  }

  const freeFlagPin = await Pin.findOne({ where: { free_flag: 1 } });
  if (!freeFlagPin) {
    console.error(
      "rewardPHTeam failed: no pin with free_flag=1 found. Create a free reward pin in admin panel.",
    );
    return;
  }

  await syncSponsorHelpCounts();

  const users = await User.findAll({
    where: {
      role: "user",
      status: "active",
      direct_help_provided_user_count: { [Op.gte]: count },
    },
  });

  if (!users.length) {
    console.log(`rewardPHTeam: no eligible users (threshold=${count})`);
    return;
  }

  let totalLinksCreated = 0;

  for (const user of users) {
    const userCount = user.direct_help_provided_user_count;
    if (userCount < count) continue;

    const pendingFreeCount = await Help.count({
      where: {
        user_id: user.id,
        free_flag: 1,
        status: "pending",
      },
    });

    const earnedSlots = Math.floor(userCount / count);
    const linksToCreate = earnedSlots - pendingFreeCount;
    if (linksToCreate <= 0) continue;

    for (let i = 0; i < linksToCreate; i++) {
      await Help.create({
        user_id: user.id,
        pin_id: freeFlagPin.id,
        free_flag: 1,
        status: "pending",
      });
      totalLinksCreated += 1;
    }
  }

  console.log(
    `rewardPHTeam completed: threshold=${count}, eligibleUsers=${users.length}, linksCreated=${totalLinksCreated}`,
  );
};
