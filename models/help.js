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
