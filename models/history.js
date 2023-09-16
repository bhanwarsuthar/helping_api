'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Player}) {
      this.belongsTo(Player, {as: 'player', foreignKey: 'player_id'});
      // Player.hasMany(this, {as: 'player', foreignKey: 'player_id'});
    }

  }
  History.init({
    player_id: DataTypes.BIGINT.UNSIGNED,
    match_id: DataTypes.BIGINT.UNSIGNED,
    run: DataTypes.INTEGER, // 1
    wicket: DataTypes.INTEGER, // 25
    catch: DataTypes.INTEGER, // 8
    stumping: DataTypes.INTEGER,  // 12
    run_out: DataTypes.INTEGER,  // 6
    direct_hit_run_out: DataTypes.INTEGER, // 12
    maiden_over: DataTypes.INTEGER,  // 12
    score: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'History',
    tableName: 'histories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return History;
};