const { Pin, User, AcLedger, PinTransaction, Team, History, sequelize, Help } = require("../../models");
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require("sequelize");
const { ResMessageError } = require("../../exceptions/customExceptions");
const { reject } = require("bluebird");
const moment = require("moment");

exports.pinTransactions = async (query) => {
  const page = +query.page || 1;
  const limit = +query.limit || 10;

  delete query.page;
  delete query.limit;

  if (query.order) {
    var where = JSON.parse(query?.order);
  }

  return PinTransaction.paginate(
    limit,
    {
      order: [["created_at", "DESC"]],
      where: where,
      include: [
        {
          model: User,
          as: "provide",
          required: false,
        },
        {
          model: User,
          as: "receive",
          required: false,
        },
        {
          model: Pin,
          as: "pin",
          required: false,
        },
      ],
    },
    page
  );
};

exports.getPinTransactionById = async (id) => {
  return PinTransaction.findByPk(id, {
    include: [
      {
        model: User,
        as: "provide",
        required: false,
      },
      {
        model: User,
        as: "receive",
        required: false,
      },
      {
        model: Pin,
        as: "pin",
        required: false,
      },
    ],
  });
};

exports.links = async (options) => {
  return Help.findAll({ where: options, include: ["user", "pin"] });
};

exports.receviedPayment = async (body) => {
  const pinTransactionId = +body.id;
  const pinTransaction = await this.getPinTransactionById(pinTransactionId);
  if (!pinTransaction) {
    throw new ResMessageError("Transaction not found!");
  }
  if (pinTransaction.status != "inprogress") {
    throw new ResMessageError("Contact to admin!");
  }
  if (!pinTransaction.payment_submitted_at) {
    throw new ResMessageError("Payment has not been submitted yet!");
  }
  const pin = await Pin.findByPk(pinTransaction.pin_id);
  let helpList = [];
  for (let index = 0; index < Number(pin.generate_link_count); index++) {
    helpList.push({
      user_id: pinTransaction.provide_user_id,
      currency: pinTransaction.currency,
      pin_id: pin.id,
      status: "pending",
    });
  }
  await Help.bulkCreate(helpList);
  pinTransaction.status = "success";
  await pinTransaction.save();
  return pinTransaction;
};

exports.submitPayment = async (body, userId) => {
  const pinTransactionId = +body.id;
  const paymentRefNo = (body.payment_ref_no || body.ref_no || "").trim();
  const paymentScreenshot = (body.payment_screenshot || "").trim();

  if (!paymentRefNo) {
    throw new ResMessageError("Payment transaction ID is required!");
  }
  if (!paymentScreenshot) {
    throw new ResMessageError("Payment screenshot is required!");
  }

  const pinTransaction = await this.getPinTransactionById(pinTransactionId);
  if (!pinTransaction) {
    throw new ResMessageError("Transaction not found!");
  }
  if (+pinTransaction.provide_user_id !== +userId) {
    throw new ResMessageError("You are not allowed to submit this payment!");
  }
  if (pinTransaction.status != "inprogress") {
    throw new ResMessageError("Contact to admin!");
  }
  if (pinTransaction.payment_submitted_at) {
    throw new ResMessageError("Payment already submitted!");
  }

  pinTransaction.payment_ref_no = paymentRefNo;
  pinTransaction.payment_screenshot = paymentScreenshot;
  pinTransaction.payment_submitted_at = new Date();
  await pinTransaction.save();
  return pinTransaction;
};

exports.rejectSubmittedPayment = async (body, userId) => {
  const pinTransactionId = +body.id;
  const pinTransaction = await this.getPinTransactionById(pinTransactionId);
  if (!pinTransaction) {
    throw new ResMessageError("Transaction not found!");
  }
  if (+pinTransaction.receive_user_id !== +userId) {
    throw new ResMessageError("You are not allowed to reject this payment!");
  }
  if (pinTransaction.status != "inprogress") {
    throw new ResMessageError("Contact to admin!");
  }
  if (!pinTransaction.payment_submitted_at) {
    throw new ResMessageError("No payment submission to reject!");
  }

  pinTransaction.payment_submitted_at = null;
  pinTransaction.payment_ref_no = null;
  pinTransaction.payment_screenshot = null;
  await pinTransaction.save();
  return pinTransaction;
};
