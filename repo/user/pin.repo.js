const { Pin, PinTransaction, User, AcLedger, Media, Team, History, sequelize } = require("../../models")
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require('sequelize');
const { ResMessageError } = require('../../exceptions/customExceptions');
const { reject } = require('bluebird');

exports.singlePin = () => {
    return Pin.findOne({
        where: {
            'status': 'active'
        },
        order: [["start_time", "DESC"]]
    });
}

exports.buyPin = async (pin_id, user_id, res) => {
    let pin = await Pin.findByPk(Number(pin_id));
    if (!pin) {
        throw new ResMessageError("Pin Not Found")
    }
    var user = await User.findOne({
        where: { id: user_id },
        include: {
            model: AcLedger,
            as: 'ac_ledgers',
            where: { slug: "cash-wallet" },
        }
    });
    console.log("user : ", user);
    if (!user) {
        throw new ResMessageError("User Not Found")
    }
    /**
     * this condition for check pin availablity and user wallet amount
     */
    if (pin.remaining_count <= 0) {
        throw new ResMessageError('All Pin soldout...')
    }
    if (Number(user.ac_ledgers[0].balance) < pin.pin_amount) {
        throw new ResMessageError('Wallet Amount is not enough...')
    }
    var meta = JSON.parse(JSON.stringify({ ref_no: "0" }));
    if (pin.remaining_count > 0) {
        let pinTransactions = PinTransaction.create({
            provide_user_id: user_id,
            pin_id: pin_id,
            status: 'pending'
        });
        var debitUserTransaction = user.ac_ledgers[0].debit(parseInt(pin.pin_amount), "self", meta);
        pin.remaining_count = pin.remaining_count - 1;
        let updatedPin = pin.save();
        return Promise.all([pinTransactions, debitUserTransaction, updatedPin])
            .then(([pinTransactions, debitUserTransaction, updatedPin]) => {
                return new Promise(async (resolve, reject) => {
                    if (!pinTransactions && !debitUserTransaction && !updatedPin)
                        return reject("Pin purchase next time...");
                    let pin = await this.singlePin();
                    resolve(pin);
                })
            })
            .catch(err => {
                throw new ResMessageError(err.message);
            });
    } else {
         throw new ResMessageError('All Pin soldout...')
    }
}