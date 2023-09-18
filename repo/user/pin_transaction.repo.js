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

exports.receviedPayment = async (body) => {
    const pinTransactionId = Number(body.id);
    const pinTransaction = await PinTransaction.findByPk(pinTransactionId);
    if(!pinTransaction){
        throw new ResMessageError("Transaction not found!")
    }
    if(pinTransaction.status != 'inprogress'){
        throw new ResMessageError("Contact to admin!")
    }
    const pin = await Pin.findByPk(pinTransaction.pin_id);
    let helpList = [];
    for (let index = 0; index < Number(pin.generate_link_count); index++) {
        helpList.push(
            {
                user_id: pinTransaction.provide_user_id,
                pin_id: pin.id,
                status: 'pending'
            }
        )
    }
    await Help.bulkCreate(helpList);
    pinTransaction.status = 'success';
    await pinTransaction.save();
    return pinTransaction;
}
