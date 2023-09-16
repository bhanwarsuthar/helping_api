'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  const PROTECTED_ATTRIBUTES = []
  class Otp extends Model {

    toJSON () {
      // hide protected fields
      let attributes = Object.assign({}, this.get())
      for (let a of PROTECTED_ATTRIBUTES) {
        delete attributes[a]
      }
      return attributes
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  
  Otp.init({
    user_id : {type : DataTypes.BIGINT.UNSIGNED },
    code: { type : DataTypes.STRING },
    send_via: { type : DataTypes.STRING },
    send_to: { type: DataTypes.STRING },
    expire_on : {type: DataTypes.DATE}
  }, {
    sequelize,
    modelName: 'Otp',
    tableName: 'otp',
    timestamps: false
  });
  return Otp;
};