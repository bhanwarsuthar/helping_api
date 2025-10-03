"use strict";
const { BaseModel } = require("./base_models/BaseModel");
const { can } = require("../middleware/roleAuth");
const { Model, DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const PROTECTED_ATTRIBUTES = ["password", "token"];
  class User extends BaseModel {
    toJSON() {
      return { ...this.get(), password: undefined, token: undefined };
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Address, AcLedger, PinTransaction }) {
      this.hasMany(Address);
      // this.hasMany(Transactions, { foreignKey: 'user_id' })
      this.hasMany(AcLedger, { as: "ac_ledgers", foreignKey: "user_id" });

      this.hasMany(PinTransaction, { as: "pin_transaction", foreignKey: "provide_user_id" });
    }

    async hasStore() {
      return await this.getStore();
    }

    async getLedger(ledger) {
      const AcLedger = sequelize.models.AcLedger;
      return await AcLedger.findOne({ where: { slug: ledger, user_id: this.id } });
    }

    async notifyMobile(notification) {
      notification.props.user = this;
      notification.send();
    }

    async syncPinCount() {
      const count = await sequelize.models.AcLedger.PinTransaction.count({
        where: { provide_user_id: this.id, status: "completed" },
      });
      await this.update({ pin_count: count });
    }

    async syncPendingPinCount() {
      const options = {
        replacements: { userId: this.id },
        type: sequelize.QueryTypes.SELECT,
      };
      const [{ pinCount }] = await this.sequelize.query(
        `select count(*) as pinCount
          from pin_transactions
        where provide_user_id = :userId and status = "pending";`,
        options
      );
      await this.update({ pin_count: +pinCount || 0 });
    }

    async syncPhAmount() {
      const options = {
        replacements: { userId: this.id },
        type: Sequelize.QueryTypes.SELECT,
      };

      const [{ phAmount }] = await this.sequelize.query(
        `SELECT COALESCE(SUM(p.provide_help_amount), 0) AS phAmount
       FROM pin_transactions pt
       INNER JOIN pins p ON p.id = pt.pin_id
       WHERE pt.provide_user_id = :userId 
         AND pt.status = "success";`,
        options
      );
      await this.update({ ph_amount: +phAmount || 0 });
    }

    async syncRhAmount() {
      const options = {
        replacements: { userId: this.id },
        type: Sequelize.QueryTypes.SELECT,
      };

      const [{ rhAmount }] = await this.sequelize.query(
        `SELECT COALESCE(SUM(p.receive_help_amount), 0) AS rhAmount
       FROM pin_transactions pt
       INNER JOIN pins p ON p.id = pt.pin_id
       WHERE pt.receive_user_id = :userId 
         AND pt.status = "success";`,
        options
      );

      await this.update({ rh_amount: +rhAmount || 0 });
    }

    async syncPinCount() {
      const options = {
        replacements: { userId: this.id },
        type: Sequelize.QueryTypes.SELECT,
      };

      const [{ pinCount }] = await this.sequelize.query(
        `SELECT COUNT(*) AS pinCount
     FROM pin_transactions pt
     WHERE pt.provide_user_id = :userId 
       AND pt.status = "success";`,
        options
      );

      await this.update({ pin_count: +pinCount || 0 });
    }

    async syncDirectHelpProvidedCount() {
      const options = {
        replacements: { userId: this.id },
        type: Sequelize.QueryTypes.SELECT,
      };

      // Step 1: get current user's mobile
      const user = await this.sequelize.models.User.findByPk(this.id);
      if (!user) return;

      // Step 2: calculate direct help provided count
      const query = `
    SELECT 
      COALESCE(COUNT(DISTINCT pt.provide_user_id), 0) AS directCount,
      COALESCE(SUM(CASE WHEN pt.include_flag = 1 THEN 10 ELSE 0 END), 0) AS reduceCount
    FROM users u
    INNER JOIN pin_transactions pt ON u.id = pt.provide_user_id
    WHERE u.sponsor = :mobile
      AND pt.status = "success"
  `;

      const [{ directCount, reduceCount }] = await this.sequelize.query(query, {
        ...options,
        replacements: { mobile: user.mobile },
      });

      const finalCount = Math.max(0, directCount - reduceCount);

      await this.update({ direct_help_provided_user_count: finalCount });
    }



  }

  User.prototype.can = can;
  User.init(
    {
      first_name: { type: DataTypes.STRING },
      last_name: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      referral_code: { type: DataTypes.STRING },
      sponsor: { type: DataTypes.STRING },
      mobile: {
        type: DataTypes.STRING,
        unique: true,
      },
      role: DataTypes.STRING,
      is_help_provided: { type: DataTypes.INTEGER, defaultValue: 0 },// 0 = no, 1 = yes
      status: { type: DataTypes.STRING, defaultValue: "active" },
      pin_count: { type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 }, //pin purchase count
      ph_amount: { type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 }, // total ph amount
      rh_amount: { type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 }, // total rh amount
      mobile_verified_at: { type: DataTypes.DATE },
      email_verified_at: { type: DataTypes.DATE },
      direct_user_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      direct_help_provided_user_count: { type: DataTypes.INTEGER, defaultValue: 0 },// direct (Level 1) user who provided help
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  User.prototype.isBlocked = function (status) {
    return status === "blocked" ? true : false;
  };

  User.beforeCreate(async (user, options) => {
    if (user.referral_code == null) {
      //user.referral_code = (new Date()).getTime().toString(36).toUpperCase();
      user.referral_code = user.mobile;
    }
  });

  User.afterCreate(async (user, options) => {
    const CommonData = sequelize.models.CommonData;
    const register_bonus = await CommonData.findOne({
      where: {
        key: "REGISTER_BONUS",
      },
    });


    const AcLedger = sequelize.models.AcLedger;
    const ac_ldeger = await AcLedger.create({
      user_id: user.id,
      ledger_name: "Cash Wallet",
      slug: AcLedger.CASH_WALLET,
      balance: register_bonus.data,
    });

    const Ac_Ledger_Transactions = sequelize.models.Transactions;

    await Ac_Ledger_Transactions.create({
      user_id: user.id,
      ac_ledger_id: ac_ldeger.id,
      amount: register_bonus.data,
      currency: "INR",
      tx_type: "credit",
      notation: "register_bonus",
      meta: JSON.parse(JSON.stringify({ ref_no: "" })),
    });


    const sponsor_bonus = await CommonData.findOne({
      where: {
        key: "SPONSOR_BONUS",
      },
    });

    var sponsorUser = await User.findOne({
      where: { mobile: user.sponsor },
      include: {
        model: AcLedger,
        as: "ac_ledgers",
        where: { slug: "cash-wallet" },
      },
    });

    await sponsorUser.ac_ledgers[0].credit(sponsor_bonus.data, "INR", "sponsor_bonus", JSON.parse(JSON.stringify({ ref_no: "" })))

    // await AcLedger.create({
    //   user_id: user.id,
    //   ledger_name: "Promo Wallet",
    //   slug: AcLedger.PROMO_WALLET,
    //   balance: 0
    // })
  });



  return User;
};
