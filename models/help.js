"use strict";
const { BaseModel } = require("./base_models/BaseModel");
module.exports = (sequelize, DataTypes) => {
  class Help extends BaseModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Pin, User }) {
      // define association here
      this.belongsTo(User, { as: "user", foreignKey: "user_id" });
      this.belongsTo(Pin, { as: "pin", foreignKey: "pin_id" });
    }
  }
  Help.init(
    {
      user_id: DataTypes.BIGINT.UNSIGNED,
      pin_id: DataTypes.BIGINT.UNSIGNED,
      status: DataTypes.STRING,
      currency: DataTypes.STRING,
      free_flag: { type: DataTypes.INTEGER, defaultValue: 0 }, //cron job every day 4:00pm to create pin transaction with include_flag 1 when user direct provide help count is greater than 10 (now update the user direct_help_provided_user_count field -10)
    },
    {
      sequelize,
      modelName: "Help",
      tableName: "helpes",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Help;
};
