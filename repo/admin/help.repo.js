const { Pin, User, AcLedger, PinTransaction, Media, Team, History, Help, sequelize } = require("../../models")
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER, where } = require('sequelize');
const { ResMessageError } = require('../../exceptions/customExceptions');
const { reject } = require('bluebird');
const moment = require('moment');


exports.pinTransactions = async (params) => {
    return PinTransaction.paginate(parseInt(params?.limit) || 10, {
        order: [['created_at', 'DESC']],
        where: {},
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
    }, params?.page || 1)
}


exports.pendingRhLink = async (params) => {
    if (params.order) {
        params.order = JSON.parse(params?.order);
    }
    const order = params.order;
    var whereCondition = order;
    console.log(whereCondition);
    return Help.paginate(parseInt(params?.limit) || 10, {
        order: [['created_at', 'ASC']],
        where: whereCondition,
        include: [
            {
                model: User,
                as: 'user'
            },
            {
                model: Pin,
                as: 'pin'
            }
        ]
    }, params?.page || 1)
}



exports.linkConnectCustom = async (body) => {
    const mobile = body.mobile;
    const pinTransactionId = Number(body.id);
    var user = await User.findOne({
        where: { mobile: mobile }
    });
    if (!user) {
        throw new ResMessageError("User Not Found")
    }
    const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
    pinTransaction.receive_user_id = Number(user.id);
    pinTransaction.save();
    return pinTransaction;
}

exports.linkConnectSelf = async (body) => {
    const pinTransactionId = Number(body.id);
    const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
    // const  = await PinTransaction.findOne({
    //     where : {
    //         provide_user_id: pinTransactionId,
    //         receive_user_id: pinTransactionId
    //     }
    // });
    pinTransaction.receive_user_id = Number(user.id);
    pinTransaction.save();
    return pinTransaction;
}

exports.linkConnectAuto = async (body) => {

}
