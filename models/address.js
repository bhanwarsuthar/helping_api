'use strict';
const {
  BaseModel
} = require('./base_models/BaseModel');

module.exports = (sequelize, DataTypes) => {
  class Address extends BaseModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Order, User}) {
       this.belongsTo(User);
    
    }
  };

  Address.init({
    user_id: DataTypes.BIGINT.UNSIGNED,
    is_default: DataTypes.BOOLEAN,
    phone_number: DataTypes.STRING,
    line1: DataTypes.STRING,
    line2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pin_code: DataTypes.STRING,
    geo_location: DataTypes.GEOGRAPHY('POINT', 4326),
    country: DataTypes.STRING,
  }, {
    sequelize,
    tableName: 'shipping_address',
    underscored: true,
    timestamps: false
  });
  return Address;
};