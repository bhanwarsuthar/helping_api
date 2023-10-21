const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const { AcLedger, PinTransaction, User, Pin } = require("../../models");

const pintTransactionRepo = require("../../repo/admin/pin_transaction.repo");
const userRepo = require("../../repo/user/user.repo.js");

exports.getAllUsers = async (req, res) => {
  userRepo
    .list(req.query, req.query.limit)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ message: "Something went wrong." });
    });
};

exports.updateUser = async (req, res) => {
  userRepo
    .update_user(req.params, req.body)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ message: "Something went wrong." });
    });
};

exports.getPinTransByUserId = async (req, res) => {
  const { id } = req.params;

  let { limit = 20, page = 1, status } = req.query;

  const filter = { provide_user_id: +id, status };

  !status && delete filter.status;

  try {
    const pinTransactions = await PinTransaction.findAll({ where: filter, order: [["created_at", "DESC"]], limit: +limit, offset: (page - 1) * limit });

    res.status(200).json({
      message: "User's pin transactions fetched Successfully",
      data: { results: pinTransactions.length, pinTransactions },
      error: null,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Error while fetching user's pin transactions",
      data: null,
      error: error.message,
    });
  }
};

// --- //

const getEligibility = async (filter) => {
  const { count } = await AcLedger.findOne({
    where: {
      balance: filter,
    },
    attributes: [[Sequelize.fn("COUNT", Sequelize.col("user_id")), "count"]],
    raw: true,
  });
  return count;
};

const getPinTransaction = async (status) => {
  const { count } = await PinTransaction.findOne({ where: { status }, attributes: [[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]], raw: true });

  return count;
};

// --- //

exports.adminDashboardData = async (req, res) => {
  const totalBalance = await AcLedger.findOne({ attributes: [[Sequelize.fn("SUM", Sequelize.col("balance")), "sum"]], raw: true });

  const { pin_amount } = await Pin.findOne({
    where: {
      status: "active",
    },
    order: [["start_time", "DESC"]],
  });

  res.status(200).json({
    message: "Admin dashboard data fetched successfully",
    data: {
      total_wallet: +totalBalance.sum,
      pin_amount,
      pin_eligible: await getEligibility({ [Op.gte]: pin_amount }),
      pin_not_eligible: await getEligibility({ [Op.lte]: pin_amount }),
      transactions_status: {
        success: await getPinTransaction("success"),
        inprogress: await getPinTransaction("inprogress"),
        pending: await getPinTransaction("pending"),
      },
    },
  });
};
