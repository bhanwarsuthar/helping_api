const Sequelize = require("sequelize");
const { AcLedger, PinTransaction, User, Pin, sequelize } = require("../../models");

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

exports.get_user = (mobile) => {
  return User.findOne({ where: { mobile }, include: ["ac_ledgers"] });
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

  const user = await userRepo.profile({ role: "admin" });

  const [totalUsersBal, eligibleUserCount, nonEligibleUserCount] = await Promise.all([
    sequelize.query(`SELECT SUM(balance) as n FROM helping_plan.ac_ledgers WHERE id != :adminId`, { type: Sequelize.QueryTypes.SELECT, plain: true, replacements: { adminId: user.id } }),
    sequelize.query(
      `SELECT COUNT(*) as n FROM helping_plan.users LEFT JOIN helping_plan.ac_ledgers ON users.id = ac_ledgers.user_id WHERE users.status = 'active' AND role = 'user' AND balance >= :pinAmount;`,
      { type: Sequelize.QueryTypes.SELECT, plain: true, replacements: { pinAmount: pin?.pin_amount } }
    ),
    sequelize.query(
      `SELECT COUNT(*) as n FROM helping_plan.users LEFT JOIN helping_plan.ac_ledgers ON users.id = ac_ledgers.user_id WHERE users.status = 'active' AND role = 'user' AND balance < :pinAmount;`,
      { type: Sequelize.QueryTypes.SELECT, plain: true, replacements: { pinAmount: pin?.pin_amount } }
    ),
  ]);

  res.status(200).json(
    new CommonResponse(
      (code = 200),
      (message = "Admin dasbboard data"),
      (data = {
        total_wallet: +totalUsersBal.n,
        pin_amount: +pin?.pin_amount || 0,
        pin_eligible: +eligibleUserCount.n,
        pin_not_eligible: +nonEligibleUserCount.n,
        transactions_status: {
          success: await getPinTransaction("success"),
          inprogress: await getPinTransaction("inprogress"),
          pending: await getPinTransaction("pending"),
        },
      })
    )
  );
};
