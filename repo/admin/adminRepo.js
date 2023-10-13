const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const { AcLedger, PinTransaction, User, Pin } = require("../../models");

const pintTransactionRepo = require("../../repo/admin/pin_transaction.repo");

const getAllUsers = async (req, res) => {
  let { limit, page, key, sortBy } = req.query;

  const filter = { role: { [Op.not]: "admin" } };

  if (key) {
    filter[Op.or] = [{ first_name: { [Op.like]: `%${key}%` } }, { mobile: `%${mobile}%` }];
  }

  if (sortBy === "created_at" || sortBy === "-created_at") {
    sortBy = sortBy.startsWith("-") ? (sortBy = ["created_at", "DESC"]) : (sortBy = ["created_at", "ASC"]);
  } else if (sortBy === "balance" || sortBy === "-balance") {
    sortBy = sortBy.startsWith("-") ? [{ model: AcLedger, as: "ac_ledgers" }, "balance", "DESC"] : [{ model: AcLedger, as: "ac_ledgers" }, "balance", "ASC"];
  } else {
    sortBy = ["created_at", "DESC"];
  }

  try {
    let users = await User.findAll({
      where: {
        ...filter,
      },
      include: [
        {
          model: AcLedger,
          as: "ac_ledgers",
        },
      ],
      order: [sortBy],
      limit: +limit || 10,
      offset: (page - 1) * (limit || 10),
    });

    res.status(200).json({
      message: "Users fetched Successfully",
      data: { results: users.length, users },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching users",
      data: null,
      error: error.message,
    });
  }
};

const getPinTransByUserId = async (req, res) => {
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

const adminDashboardData = async (req, res) => {
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

// const getUserById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const user = await User.findByPk(id, {
//       include: [
//         { model: AcLedger, as: "ac_ledgers" },
//         { model: PinTransaction, as: "pin_transaction", where: { status: "pending" } },
//       ],
//     });

//     res.status(200).json({
//       message: "User fetched Successfully",
//       data: user,
//       error: null,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error while fetching users",
//       data: null,
//       error: error.message,
//     });
//   }
// };

module.exports = { getAllUsers, getPinTransByUserId, adminDashboardData };

// exports.list = (query) => {
//   let { limit, page, key, sortBy } = query;

//   const filter = { role: { [Op.not]: "admin" } };

//   if (key) {
//     filter[Op.or] = [{ first_name: key }, { mobile: key }];
//   }

//   if (sortBy === "created_at" || sortBy === "-created_at") {
//     sortBy = sortBy.startsWith("-") ? (sortBy = ["created_at", "DESC"]) : (sortBy = ["created_at", "ASC"]);
//   } else if (sortBy === "balance" || sortBy === "-balance") {
//     sortBy = sortBy.startsWith("-") ? [{ model: AcLedger, as: "ac_ledgers" }, "balance", "DESC"] : [{ model: AcLedger, as: "ac_ledgers" }, "balance", "ASC"];
//   } else {
//     sortBy = ["created_at", "DESC"];
//   }

//   return User.paginate(
//     +limit || 20,
//     {
//       where: {
//         ...filter,
//       },
//       include: [
//         {
//           model: AcLedger,
//           as: "ac_ledgers",
//         },
//       ],
//       order: [sortBy],
//     },
//     +page || 1
//   );
// };
