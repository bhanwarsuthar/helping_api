const { Transactions, sequelize, User, AcLedger } = require("../../models");
const { notifyUser, notificationContent } = require("../../utils/notification");

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

  var referralUserTransaction = user.ac_ledgers[0].pending(parseInt(data.body.amount), data.body.currency || "INR", "deposit", meta);

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


exports.createTransactionTransfer = async (data) => {
  var senderUser = await User.findOne({
    where: { id: data.user.id },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });

  if (!senderUser) {
    throw new ResMessageError("Sender User Not Found");
  }

  if (senderUser.ac_ledgers[0].balance < parseInt(data.body.amount)) {
    throw new ResMessageError("Insufficient Balance");
  }

  var receiverUser = await User.findOne({
    where: { mobile: data.body.receiverMobile },
    include: {
      model: AcLedger,
      as: "ac_ledgers",
      where: { slug: "cash-wallet" },
    },
  });

  if (!receiverUser) {
    throw new ResMessageError("Receiver User Not Found");
  }



  var senderMeta = JSON.parse(JSON.stringify({ receiver_user: senderUser }));

  var receiverMeta = JSON.parse(JSON.stringify({ receiver_user: receiverUser }));

  var receiverUserTransaction = receiverUser.ac_ledgers[0].credit(parseInt(data.body.amount), data.body.currency || "INR", "transfer", senderMeta);
  var senderUserTransaction = senderUser.ac_ledgers[0].debit(parseInt(data.body.amount), data.body.currency || "INR", "transfer", receiverMeta);



  return Promise.all([receiverUserTransaction, senderUserTransaction])
    .then(([receiverUserTransaction, senderUserTransaction]) => {
      return new Promise(async (resolve, reject) => {
        if (!receiverUserTransaction) return reject("Unable to update cash wallet");
        if (!senderUserTransaction) return reject("Unable to update cash wallet");
        notifyUser(
          notificationContent.transfer.user.desc(data.body.amount, data.body.userName, data.body.userPh),
          notificationContent.transfer.user.title(),
          receiverUser.id,
          notificationContent.transfer.user.data(),
        );
        resolve(senderUserTransaction);
      });
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};
