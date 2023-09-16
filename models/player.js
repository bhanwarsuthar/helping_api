'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Media, Team, History}) {
      this.belongsTo(Media, {as: 'media', foreignKey: 'media_id'})
      this.belongsTo(Team, {as: 'team', foreignKey: 'team_id'})
      this.hasMany(History, {as: 'history', foreignKey: 'player_id'});
    }
  }
  Player.init({
    name: DataTypes.STRING,
    team_id: DataTypes.BIGINT.UNSIGNED,
    rate: DataTypes.STRING,
    media_id: DataTypes.BIGINT.UNSIGNED,
    bowler: DataTypes.INTEGER,
    wicket_keeper: DataTypes.INTEGER,
    batsman: DataTypes.INTEGER,
    all_rounder: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Player',
    tableName: 'players',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Player;
};