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
    var referralUserTransaction = user.ac_ledgers[0].credit(parseInt(data.amount), "admin", metaUser);

    let level_distro = await CommonData.findOne({
      where: {
        key: "level_distro",
      },
    });

    level_distro = JSON.parse(level_distro.data);

    let i = 1;

    while (user.sponsor && i < 3) {
      const nextUser = await User.findOne({
        where: { referral_code: user.sponsor },
        include: {
          model: AcLedger,
          as: "ac_ledgers",
          where: { slug: "cash-wallet" },
        },
      });

      await nextUser.ac_ledgers[0].credit(parseInt((data.amount * level_distro[i]) / 100), "level_distribution", { ref_no: "", level: i });

      user.sponsor = nextUser.sponsor;

      if (!nextUser) {
        break;
      }

      i++;
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
exports.test = async (data) => {
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

  var metaUser = JSON.parse(JSON.stringify({ ref_no: "" }));

  if (data.type === "credit") {
    let level_distro = await CommonData.findOne({
      where: {
        key: "level_distro",
      },
    });

    level_distro = JSON.parse(level_distro.data);

    let i = 1;

    const users = [];

    while (user.sponsor && i < data.level) {
      const nextUser = await User.findOne({
        where: { referral_code: user.sponsor },
        include: {
          model: AcLedger,
          as: "ac_ledgers",
          where: { slug: "cash-wallet" },
        },
      });

      await AcLedger.increment("balance", {
        by: (data.amount * level_distro[i]) / 100,
        where: {
          user_id: nextUser.id,
        },
      });

      user.sponsor = nextUser.sponsor;

      if (!nextUser) {
        break;
      }

      users.push(nextUser);
      i++;
    }

    return users;
  }

  if (data.type === "debit") {
    // var referralUserTransaction = user.ac_ledgers[0].debit(parseInt(data.amount), "admin", metaUser);
  }

  return metaUser;

  // return Promise.all([referralUserTransaction])
  //   .then(([referralUserTransaction]) => {
  //     return new Promise(async (resolve, reject) => {
  //       if (!referralUserTransaction) return reject("Unable to update cash wallet");
  //       resolve(referralUserTransaction);
  //     });
  //   })
  //   .catch((err) => {
  //     throw new Error(err.message);
  //   });
};
