const { CommonData, sequelize } = require("../../models")
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require('sequelize');
const { ResMessageError } = require('../../exceptions/customExceptions');
const { reject } = require('bluebird');
const moment = require('moment');


exports.commonData = async () => {
    return CommonData.findAll();
}

exports.newOrUpdateKeyValue = async (body) => {
    const key = body.key;
    const commonData = await CommonData.findOne({ where: { key: key } });
    if (!commonData) {
        return await CommonData.create({
            key: key,
            data: body.data
        });
    } else {
        await CommonData.update({
            data: body.data
        },{
            where: {
                key: key
            }
        });
        return await CommonData.findOne({ where: { key: key } });
    }
}

