'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      player_id: {
        type: Sequelize.BIGINT.UNSIGNED
      },
      match_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      },
      run: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wicket: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      catch: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      stumping: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      run_out: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      direct_hit_run_out: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      maiden_over: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('histories');
  }
};