"use strict";
const { Model } = require("sequelize");
const { BaseModel } = require("./base_models/BaseModel");
module.exports = (sequelize, DataTypes) => {
  class CommonData extends BaseModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CommonData.init(
    {
      key: DataTypes.STRING,
      data: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CommonData",
      tableName: "common_data",
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );
  return CommonData;
};
