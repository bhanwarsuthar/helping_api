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
    },
    {
      sequelize,
      modelName: "PinTransaction",
      tableName: "pin_transactions",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return PinTransaction;
};
