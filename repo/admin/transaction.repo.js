const { Transactions, User, AcLedger, Media, Team, History, sequelize } = require("../../models");
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require("sequelize");
const { ResMessageError } = require("../../exceptions/customExceptions");
const { CommonData } = require("../../models");

exports.transactions = (params) => {
  console.log("ssssssssssss", params);
  let userSearch = {};
  if (params?.search) {
    userSearch = {
      [Op.or]: [
        {
          first_name: {
            [Op.like]: `%${params?.search || ""}%`,
          },
        },
        {
          mobile: {
            [Op.like]: `%${params?.search || ""}%`,
          },
        },
      ],
    };
  }
  return Transactions.paginate(
    parseInt(params?.limit) || 10,
    {
      include: [
        {
          model: User,
          as: "user",
          where: userSearch,
        },
      ],
      order: [["created_at", "DESC"]],
    },
    params?.page || 1
  );
};

exports.approveTransactions = async (data) => {
  var user = await User.findOne({
    where: { mobile: data.mobile },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });
  if (!user) {
    return new ResMessageError("User Not Found");
  }
  var approveUserTransaction = user.ac_ledgers[0].approve(data.id);
  return Promise.all([approveUserTransaction])
    .then(([approveUserTransaction]) => {
      return new Promise(async (resolve, reject) => {
        if (!approveUserTransaction) return reject("Unable to update cash wallet");
        resolve(approveUserTransaction);
      });
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.rejectTransactions = async (data) => {
  var user = await User.findOne({
    where: { mobile: data.mobile },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });
  if (!user) {
    return new ResMessageError("User Not Found");
  }
  var rejectUserTransaction = user.ac_ledgers[0].reject(data.id);
  return Promise.all([rejectUserTransaction])
    .then(([rejectUserTransaction]) => {
      return new Promise(async (resolve, reject) => {
        if (!rejectUserTransaction) return reject("Unable to update cash wallet");
        resolve(rejectUserTransaction);
      });
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

exports.createTransaction = async (data) => {
  var user = await User.findOne({
    where: { mobile: data.mobile },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });

  if (!user) {
    throw new ResMessageError("User Not Found");
  }

  var metaUser = JSON.parse(JSON.stringify({ ref_no: "" }));

  if (data.type === "credit") {
    var referralUserTransaction = await user.ac_ledgers[0].credit(parseInt(data.amount), "admin", metaUser);

    let level_distro = await CommonData.findOne({
      where: {
        key: "level_distro",
      },
    });

    level_distro = JSON.parse(level_distro.data);

    var levelDistributionKeyList = Object.keys(level_distro);
    levelDistributionKeyList.sort((a, b) => a - b);

    for (let index = 0; index < levelDistributionKeyList.length; index++) {
      const levelDistroKey = levelDistributionKeyList[index];
      const nextUser = await User.findOne({
        where: { referral_code: user.sponsor },
        include: {
          model: AcLedger,
          as: "ac_ledgers",
          where: { slug: "cash-wallet" },
        },
      });

      if (!nextUser || !nextUser?.ac_ledgers || nextUser?.ac_ledgers.length == 0) {
        break;
      }

      await nextUser.ac_ledgers[0].credit(parseFloat((data.amount * level_distro[levelDistroKey]) / 100), "level_distribution", { ref_no: "", level: levelDistroKey });

      user.sponsor = nextUser.sponsor;
    }
  }

  if (data.type === "debit" && user.ac_ledgers[0].balance >= data.amount) {
    var referralUserTransaction = user.ac_ledgers[0].debit(parseInt(data.amount), "admin", metaUser);
  }

  return Promise.all([referralUserTransaction])
    .then(([referralUserTransaction]) => {
      return new Promise(async (resolve, reject) => {
        if (!referralUserTransaction) return reject("Unable to update cash wallet");
        resolve(referralUserTransaction);
      });
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};
