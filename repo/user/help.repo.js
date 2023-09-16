const { Pin, User, AcLedger, PinTransaction, Media, Team, History, sequelize } = require("../../models")
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require('sequelize');
const { ResMessageError } = require('../../exceptions/customExceptions');
const { reject } = require('bluebird');
const moment = require('moment');


exports.pinTransactions = async (query, user) => {
    return PinTransaction.paginate(parseInt(query?.limit) || 10, {
        order: [['created_at', 'DESC']],
        where: {
            provide_user_id: user.id,
        },
        include: [{
            model: User,
            as: 'provide'
        },
        {
            model: User,
            as: 'receive'
        },
        {
            model: Pin,
            as: 'pin'
        }
        ]
    }, query?.page || 1)
}
