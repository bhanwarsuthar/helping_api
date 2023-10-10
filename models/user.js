"use strict";
const { BaseModel } = require("./base_models/BaseModel");
const { can } = require("../middleware/roleAuth");

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
      mobile_verified_at: { type: DataTypes.DATE },
      email_verified_at: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  User.beforeCreate(async (user, options) => {
    if (user.referral_code == null) {
      //user.referral_code = (new Date()).getTime().toString(36).toUpperCase();
      user.referral_code = user.mobile;
    }
  });

  User.afterCreate(async (user, options) => {
    const AcLedger = sequelize.models.AcLedger;
    await AcLedger.create({
      user_id: user.id,
      ledger_name: "Cash Wallet",
      slug: AcLedger.CASH_WALLET,
      balance: 0,
    });
    // await AcLedger.create({
    //   user_id: user.id,
    //   ledger_name: "Promo Wallet",
    //   slug: AcLedger.PROMO_WALLET,
    //   balance: 0
    // })
  });

  return User;
};
