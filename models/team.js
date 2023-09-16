'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Media}) {
      // define association here
        this.belongsTo(Media, {as: 'media', foreignKey: 'media_id'})
    }
  }
  Team.init({
    full_name: DataTypes.STRING,
    short_name: DataTypes.STRING,
    media_id: DataTypes.BIGINT.UNSIGNED
  }, {
    sequelize,
    modelName: 'Team',
    tableName: 'teams',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Team;
};