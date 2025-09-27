const { Pin, User, AcLedger, PinTransaction, Media, Team, History, Help, sequelize } = require("../../models");
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require("sequelize");
const { ResMessageError } = require("../../exceptions/customExceptions");
const { reject } = require("bluebird");
const moment = require("moment");

exports.pinTransactions = async (params) => {
  console.log(params);
  if (params.order) {
    params.order = JSON.parse(params?.order);
  }
  const order = params.order;
  var whereCondition = order;

  return PinTransaction.paginate(
    parseInt(params?.limit) || 10,
    {
      where: whereCondition,
      include: [
        {
          model: User,
          as: "provide",
        },
        {
          model: User,
          as: "receive",
        },
        {
          model: Pin,
          as: "pin",
        },
      ],
      // order: [["created_at", "DESC"]],
    },
    parseInt(params?.page) || 1
  );
};

exports.getPinTxById = async (id) => {
  const pinTx = await PinTransaction.findByPk(id);

  if (!pinTx) {
    throw new ResMessageError("Pin transaction Not Found");
  }

  return pinTx;
};

exports.linkConnectCustom = async (body) => {
  const mobile = body.mobile;
  const pinTransactionId = Number(body.id);

  var user = await User.findOne({
    where: { mobile: mobile },
  });
  if (!user) {
    throw new ResMessageError("User Not Found");
  }
  const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
  if (pinTransaction.status != "pending") {
    throw new ResMessageError("Receiver Already attached!");
  }
  pinTransaction.receive_user_id = Number(user.id);
  pinTransaction.status = "inprogress";
  await pinTransaction.save();
  return pinTransaction;
};

exports.linkConnectSelf = async (body) => {
  const pinTransactionId = Number(body.id);
  const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
  if (pinTransaction.status != "pending") {
    throw new ResMessageError("Receiver Already attached!");
  }
  const userId = Number(pinTransaction.provide_user_id);
  const help = await Help.findOne({
    where: {
      user_id: userId,
      status: "pending",
    },
  });
  if (!help) {
    throw new ResMessageError("Self Link not available");
  }
  pinTransaction.receive_user_id = Number(help.user_id);
  pinTransaction.status = "inprogress";
  await pinTransaction.save();
  help.status = "success";
  await help.save();
  return pinTransaction;
};

exports.linkConnectAuto = async (body) => {
  const pinTransactionId = Number(body.id);
  const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
  if (pinTransaction.status != "pending") {
    throw new ResMessageError("Receiver Already attached!");
  }
  const userId = Number(pinTransaction.provide_user_id);
  const help = await Help.findOne({
    where: {
      status: "pending",
    },
  });
  if (!help) {
    throw new ResMessageError("Link not available");
  }
  pinTransaction.receive_user_id = Number(help.user_id);
  pinTransaction.status = "inprogress";
  await pinTransaction.save();
  help.status = "success";
  await help.save();
  return pinTransaction;
};

exports.userPendingRhConnectToPh = async (body) => {
  const pinTransaction = await PinTransaction.findOne({
    where: {
      status: "pending",
    },
  });
  if (!pinTransaction) {
    throw new ResMessageError("Provider User Not Found");
  }
  const help = await Help.findByPk(Number(body.help_id));
  if (!help) {
    throw new ResMessageError("Link not available");
  }
  pinTransaction.receive_user_id = Number(help.user_id);
  pinTransaction.include_flag = help.free_flag;
  pinTransaction.status = "inprogress";
  await pinTransaction.save();
  help.status = "success";
  await help.save();
  return help;
};

exports.links = async (options) => {
  return Help.findAll({ where: options, include: ["user", "pin"] });
};

exports.receviedPayment = async (body) => {
  const pinTransactionId = Number(body.id);
  const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
  if (!pinTransaction) {
    throw new ResMessageError("Transaction not found!");
  }
  if (pinTransaction.status != "inprogress") {
    throw new ResMessageError("Contact to admin!");
  }
  const pin = await Pin.findByPk(pinTransaction.pin_id);
  let helpList = [];
  for (let index = 0; index < Number(pin.generate_link_count); index++) {
    helpList.push({
      user_id: pinTransaction.provide_user_id,
      pin_id: pin.id,
      currency: pinTransaction.currency,
      status: "pending",
    });
  }
  await Help.bulkCreate(helpList);
  pinTransaction.status = "success";
  await pinTransaction.save();
  return pinTransaction;
};

exports.phRhCancel = async (body) => {
  const pinTransactionId = Number(body.id);
  const [pinTx] = await this.reverseRhLink([pinTransactionId], "cancel");
  return pinTx;
};

exports.phRhExpire = async (pinTxIdsArray) => {
  await this.reverseRhLink(pinTxIdsArray, "expired");
};

exports.reverseRhLink = async (pinTxIdsArray, status) => {
  return await Promise.all(
    pinTxIdsArray.map(async (pinTxId) => {
      const pinTransaction = await PinTransaction.findByPk(pinTxId);
      if (!pinTransaction) {
        throw new ResMessageError("Transaction not found!");
      }
      if (pinTransaction.status != "inprogress") {
        throw new ResMessageError("Contact to admin!");
      }
      const pinTx = await Help.findOne({
        where: {
          user_id: pinTransaction.receive_user_id,
        },
        order: [["created_at", "DESC"]],
      });
      if (pinTx) {
        pinTx.status = "pending";
        await pinTx.save();
      }
      pinTransaction.status = status;
      await pinTransaction.save();
      return pinTransaction;
    })
  );
};
