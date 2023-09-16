'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Team}) {
        this.belongsTo(Team, {as: 'team1', foreignKey: 'team_id1'})
        this.belongsTo(Team, {as: 'team2', foreignKey: 'team_id2'})
    }
  }
  Match.init({
    team_id1: DataTypes.BIGINT.UNSIGNED,
    team_id2: DataTypes.BIGINT.UNSIGNED,
    team1_run: DataTypes.BIGINT.UNSIGNED,
    team1_wicket: DataTypes.BIGINT.UNSIGNED,
    team2_run: DataTypes.BIGINT.UNSIGNED,
    team2_wicket: DataTypes.BIGINT.UNSIGNED,
    result: DataTypes.STRING,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Match',
    tableName: 'matches',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Match;
};