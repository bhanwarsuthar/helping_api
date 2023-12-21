const { Transactions, sequelize, User, AcLedger } = require("../../models");

exports.transactions = (user, query) => {
  let filters = {};
  console.log("ddddddd", query.order);
  const searchParams = new URLSearchParams(query.order);

  const paramsMap = [];

  for (const [key, value] of searchParams.entries()) {
    paramsMap.push([sequelize.literal(`${key} ${value}`)]);
  }

  console.log(paramsMap);
  if (user) {
    filters.user_id = user.id;
  }

  console.log("user_id " + filters);
  return Transactions.paginate(
    parseInt(query?.limit) || 10,
    {
      where: filters,
      include: [
        // {
        //     model: Address,
        //     as: 'address'
        // },
        // {
        //     model: User,
        //     as: 'user'
        // },
        // {
        //     model: DeliveryBoy,
        //     attributes: { exclude: ['password'] }
        // }
      ],
      order: [["created_at", "DESC"]],
    },
    query?.page || 1
  );
};

exports.createTransaction = async (data) => {
  var user = await User.findOne({
    where: { id: data.user.id },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });

  if (!user) {
    throw new ResMessageError("User Not Found");
  }

  var meta = JSON.parse(JSON.stringify({ ref_no: data.body.ref_no }));

  var referralUserTransaction = user.ac_ledgers[0].pending(parseInt(data.body.amount), "self", meta);

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
