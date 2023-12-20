"use strict";
const { QueryTypes } = require("sequelize");
const { BaseModel } = require("./base_models/BaseModel");
const { distributeAmtByLevel } = require("../utils/leveldistribution");
const userRepo = require("../repo/user/user.repo");
const { notifyUser, notificationContent } = require("../utils/notification");

module.exports = (sequelize, DataTypes) => {
  class AcLedger extends BaseModel {
    static CASH_WALLET = "cash-wallet";
    static PROMO_WALLET = "promo-wallet";
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Transactions }) {
      this.belongsTo(User, { as: "user" });
      this.hasMany(Transactions);
    }

    async reCalculateBalance() {
      return this.balance;
    }

    async credit(amount, notation = null, meta = null) {
      const Transactions = sequelize.models.Transactions;
      const tx = await Transactions.create({
        user_id: this.user_id,
        ac_ledger_id: this.id,
        amount,
        notation,
        tx_type: "credit",
        meta,
      });
      var qry = await sequelize.query(
        `
             select subqry.cr - subqry.dr as balance 
             from (SELECT sum(if(tx_type="debit",amount,0)) as dr, sum(if(tx_type="credit",amount,0)) as cr FROM ac_ledger_transactions where ac_ledger_id=${this.id} ) as subqry`,
        { type: QueryTypes.SELECT, plain: true }
      );
      this.balance = qry.balance;
      this.save();
      return tx;
    }

    async approve(id) {
      const Transactions = sequelize.models.Transactions;
      const tx = await Transactions.findByPk(id);
      if (tx.tx_type != "pending") {
        throw new Error("tx type is differnet");
      }
      tx.tx_type = "credit";
      await tx.save();
      var qry = await sequelize.query(
        `
             select subqry.cr - subqry.dr as balance 
             from (SELECT sum(if(tx_type="debit",amount,0)) as dr, sum(if(tx_type="credit",amount,0)) as cr FROM ac_ledger_transactions where ac_ledger_id=${this.id} ) as subqry`,
        { type: QueryTypes.SELECT, plain: true }
      );
      this.balance = qry.balance;
      this.save();
      // notifyUser(
      //   notificationContent.transactionApproved.user.desc(tx.notation, tx.amount),
      //   notificationContent.transactionApproved.user.title(tx.notation),
      //   tx.user_id,
      //   notificationContent.transactionApproved.user.data()
      // );
      // const user = await userRepo.profile({ id: tx.user_id });
      // await distributeAmtByLevel(user.sponsor, tx.amount);
      return tx;
    }

    async reject(id) {
      const Transactions = sequelize.models.Transactions;
      const tx = await Transactions.findByPk(id);
      if (tx.tx_type != "pending") {
        throw new Error("tx type is differnet");
      }
      tx.tx_type = "reject";
      await tx.save();
      var qry = await sequelize.query(
        `
             select subqry.cr - subqry.dr as balance 
             from (SELECT sum(if(tx_type="debit",amount,0)) as dr, sum(if(tx_type="credit",amount,0)) as cr FROM ac_ledger_transactions where ac_ledger_id=${this.id} ) as subqry`,
        { type: QueryTypes.SELECT, plain: true }
      );
      this.balance = qry.balance;
      this.save();
      notifyUser(
        notificationContent.transactionReject.user.desc(tx.notation, tx.amount),
        notificationContent.transactionReject.user.title(tx.notation),
        tx.user_id,
        notificationContent.transactionReject.user.data()
      );
      return tx;
    }

    async debit(amount, notation = null, meta = null) {
      const Transactions = sequelize.models.Transactions;
      const tx = await Transactions.create({
        user_id: this.user_id,
        ac_ledger_id: this.id,
        amount: amount,
        notation,
        tx_type: "debit",
        meta,
      });
      var qry = await sequelize.query(
        `
             select subqry.cr - subqry.dr as balance 
             from (SELECT sum(if(tx_type="debit",amount,0)) as dr, sum(if(tx_type="credit",amount,0)) as cr FROM ac_ledger_transactions where ac_ledger_id=${this.id} ) as subqry`,
        { type: QueryTypes.SELECT, plain: true }
      );
      this.balance = qry.balance;
      this.save();
      return tx;
    }

    //var metaSponsor = JSON.parse(JSON.stringify(sponsorUser));

    async pending(amount, notation = null, meta = null) {
      const Transactions = sequelize.models.Transactions;
      const tx = await Transactions.create({
        user_id: this.user_id,
        ac_ledger_id: this.id,
        amount,
        notation,
        tx_type: "pending",
        meta,
      });
      var qry = await sequelize.query(
        `
             select subqry.cr - subqry.dr as balance 
             from (SELECT sum(if(tx_type="debit",amount,0)) as dr, sum(if(tx_type="credit",amount,0)) as cr FROM ac_ledger_transactions where ac_ledger_id=${this.id} ) as subqry`,
        { type: QueryTypes.SELECT, plain: true }
      );
      this.balance = qry.balance;
      this.save();
      return tx;
    }

    async transactions(options = {}, page = 1, limit = 10) {
      const Transactions = sequelize.models.Transactions;
      options.where = {
        ac_ledger_id: this.id,
      };
      return await Transactions.paginate(limit, options, page);
    }
  }
  AcLedger.init(
    {
      user_id: DataTypes.BIGINT,
      ledger_name: DataTypes.STRING,
      slug: DataTypes.STRING,
      balance: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "AcLedger",
      tableName: "ac_ledgers",
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );
  return AcLedger;
};
