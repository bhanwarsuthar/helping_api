"use strict";
const { AvailableTxNotations } = require("../constants");
const { BaseModel } = require("./base_models/BaseModel");

module.exports = (sequelize, DataTypes) => {
  class Transactions extends BaseModel {
    static DEBIT = "debit";
    static CREDIT = "credit";
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, AcLedger }) {
      this.belongsTo(User, { as: "user" });
      this.belongsTo(AcLedger);
    }
  }
  Transactions.init(
    {
      user_id: DataTypes.BIGINT,
      ac_ledger_id: DataTypes.BIGINT,
      amount: DataTypes.DECIMAL,
      tx_type: DataTypes.STRING,
      notation: DataTypes.ENUM(AvailableTxNotations),
      meta: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Transactions",
      tableName: "ac_ledger_transactions",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Transactions;
};
