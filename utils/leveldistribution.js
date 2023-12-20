const userRepo = require("../repo/user/user.repo.js");
const leveldistributionRepo = require("../repo/admin/leveldistribution.repo.js");
const commondata = require("../repo/user/common_data.repo.js");

exports.distributeAmtByLevel = async (phoneNumber, amount) => {
  const levels = await leveldistributionRepo.getAllLevels();
  const hasLevelDistributionToDirectUser = await commondata.commonDataByKey("HAS_LEVEL_DIST_TO_DIRECT_USER");

  console.log(levels);
  console.log(hasLevelDistributionToDirectUser);

  for (const { level, percentage } of levels) {
    const user = await userRepo.profile({ mobile: phoneNumber });

    if (hasLevelDistributionToDirectUser?.data === "true" || false) {
      if (user.direct_user_count >= level) {
        await sendLevelDistribution(user, (amount / 100) * percentage, level);

        if (user.sponsor) phoneNumber = user.sponsor;
        else break;
      } else if (user.direct_user_count >= level) {
        // send notification
        // notifyUser(
        //   notificationContent.commissionMissedLessUser.user.desc((amount / 100) * percentage, level),
        //   notificationContent.commissionMissedLessUser.user.title(),
        //   user.id,
        //   notificationContent.commissionMissedLessUser.user.data()
        // );
        continue;
      } else if (user.package_status) {
        // send notification
        // notifyUser(
        //   notificationContent.commissionMissedNoPkg.user.desc((amount / 100) * percentage, level),
        //   notificationContent.commissionMissedNoPkg.user.title(),
        //   user.id,
        //   notificationContent.commissionMissedNoPkg.user.data()
        // );
        continue;
      }
    } else {
      await sendLevelDistribution(user, (amount / 100) * percentage);
      if (user.sponsor) phoneNumber = user.sponsor;
      else break;
    }
  }
};

const sendLevelDistribution = async (user, amount, level) => {
  const meta = JSON.parse(JSON.stringify({ level }));

  await user.ac_ledgers[0].credit(amount, "level distribution", meta);
};
