'use strict';
const { BaseModel } = require('./base_models/BaseModel');
module.exports = (sequelize, DataTypes) => {
  class Pin extends BaseModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pin.init({
    title: DataTypes.STRING,
    pin_amount: DataTypes.INTEGER,
    provide_help_amount: DataTypes.INTEGER,
    receive_help_amount: DataTypes.INTEGER,
    total_count: DataTypes.INTEGER,
    temp_count: DataTypes.INTEGER,
    remaining_count: DataTypes.INTEGER,
    generate_link_count: DataTypes.INTEGER,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Pin',
    tableName: 'pins',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Pin;
};