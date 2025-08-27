const { Pin, User, AcLedger, PinTransaction, Media, Team, Help, sequelize } = require("../../models");
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require("sequelize");
const { ResMessageError } = require("../../exceptions/customExceptions");
const { reject } = require("bluebird");
const moment = require("moment");

const pinTransactionsRepo = require("./pin_transaction.repo");

exports.pinTransactions = async (query, user) => {
  return PinTransaction.paginate(
    parseInt(query?.limit) || 10,
    {
      order: [["created_at", "DESC"]],
      where: {
        provide_user_id: user.id,
      },
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
    },
    query?.page || 1
  );
};

exports.receiveLinks = async (query, user) => {
  const filter = { user_id: query.user_id, status: query.status };
  if (!query.user_id) delete filter.user_id;
  if (!query.status) delete filter.status;

  return Help.findAll({
    where: filter,
    include: [
      { model: User, as: "user" },
      { model: Pin, as: "pin" },
    ],
  });
};
