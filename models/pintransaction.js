"use strict";
const { BaseModel } = require("./base_models/BaseModel");
module.exports = (sequelize, DataTypes) => {
  class PinTransaction extends BaseModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Pin }) {
      // define association here
      this.belongsTo(User, { as: "receive", foreignKey: "receive_user_id" });
      this.belongsTo(User, { as: "provide", foreignKey: "provide_user_id" });
      this.belongsTo(Pin, { as: "pin", foreignKey: "pin_id" });
    }
  }
  PinTransaction.init(
    {
      provide_user_id: DataTypes.BIGINT.UNSIGNED,
      receive_user_id: DataTypes.BIGINT.UNSIGNED,
      pin_id: DataTypes.BIGINT.UNSIGNED,
      status: DataTypes.STRING,
      currency: DataTypes.ENUM(['INR', 'USD']),
      include_flag: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "PinTransaction",
      tableName: "pin_transactions",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  PinTransaction.beforeUpdate(async (pt) => {
    if (pt.changed("status") && pt.status === "success") {
      try {
        const phUser = await sequelize.models.User.findOne({
          where: { id: pt.provide_user_id },
          include: {
            model: sequelize.models.AcLedger,
            as: "ac_ledgers",
            where: { slug: "cash-wallet" },
            required: false, // ✅ allow user even if ledger missing
          },
        });

        if (phUser) {
          if (+phUser.is_help_provided === 0) {
            phUser.set({ is_help_provided: 1 });
            await phUser.save();
          }
          await phUser.syncPhAmount();

          if (phUser.sponsor) {
            const sponsor = await sequelize.models.User.findOne({
              where: { mobile: phUser.sponsor },
            });
            if (sponsor) {
              await sponsor.increment("direct_help_provided_user_count");
            }
          }
        }

        const rhUser = await sequelize.models.User.findOne({
          where: { id: pt.receive_user_id },
        });
        if (rhUser) {
          await rhUser.syncRhAmount();
        }
      } catch (err) {
        console.error("beforeUpdate PinTransaction hook failed:", err);
        // decide if you want to throw or just log
      }
    }
  });


  return PinTransaction;
};
