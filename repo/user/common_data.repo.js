const { CommonData, sequelize } = require("../../models")
const fs = require("fs");
const { Op, Sequelize, QueryTypes, INTEGER } = require('sequelize');
const { ResMessageError } = require('../../exceptions/customExceptions');
const { reject } = require('bluebird');
const moment = require('moment');


exports.commonData = async () => {
    return CommonData.findAll();
}

