"use strict";
const { BaseModel } = require("../models/base_models/BaseModel");
module.exports = (sequelize, DataTypes) => {
  class Level extends BaseModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  Level.init(
    {
      level: {
        type: DataTypes.INTEGER,
        unique: {
          msg: "Level already exist",
        },
      },
      title: { type: DataTypes.STRING },
      percentage: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "Level",
      tableName: "levels",
      timestamps: false,
    }
  );

  return Level;
};
