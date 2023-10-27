const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const { AcLedger, PinTransaction, User, Pin } = require("../../models");

const pintTransactionRepo = require("../../repo/admin/pin_transaction.repo");
const userRepo = require("../../repo/user/user.repo.js");
const { CommonResponse } = require("../../response/successResponse");

exports.users = async (req, res) => {
  userRepo
    .list(req.query, req.query.limit)
    .then((users) => {
      res.status(200).json(new CommonResponse((code = 200), (message = "total users list"), (data = users)));
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ message: "Something went wrong." });
    });
};

exports.block_user = (req, res) => {
  userRepo.block(req.body.user_id).then((user) => {
    res.status(200).json(new CommonResponse((code = 200), (message = "user blocked"), (data = user)));
  });
};

exports.getPinTransByUserId = async (req, res) => {
  const { id } = req.params;

  let { limit = 10, page = 1, status } = req.query;

  const filter = { provide_user_id: +id, status };

  !status && delete filter.status;

  try {
    const pinTransactions = await PinTransaction.findAll({ where: filter, order: [["created_at", "DESC"]], limit: +limit, offset: (page - 1) * limit });
    res.status(200).json(new CommonResponse((code = 200), (message = "User's pin transactions fetched Successfully"), (data = pinTransactions)));
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

  const pin = await Pin.findOne({
    where: {
      status: "active",
    },
    order: [["start_time", "DESC"]],
  });

  res.status(200).json(
    new CommonResponse(
      (code = 200),
      (message = "Admin dasbboard data"),
      (data = {
        total_wallet: +totalBalance.sum,
        pin_amount: pin?.pin_amount || 0,
        pin_eligible: await getEligibility({ [Op.gte]: pin?.pin_amoun || 0 }),
        pin_not_eligible: await getEligibility({ [Op.lte]: pin?.pin_amoun || 0 }),
        transactions_status: {
          success: await getPinTransaction("success"),
          inprogress: await getPinTransaction("inprogress"),
          pending: await getPinTransaction("pending"),
        },
      })
    )
  );
};
