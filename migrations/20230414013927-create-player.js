'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      name: {
        type: Sequelize.STRING
      },
      team_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      },
      bowler: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wicket_keeper: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      batsman: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      all_rounder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      rate: {
        type: Sequelize.STRING
      },
      media_id: {
        allowNull: true,
        type: Sequelize.BIGINT.UNSIGNED
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
    await queryInterface.dropTable('players');
  }
};