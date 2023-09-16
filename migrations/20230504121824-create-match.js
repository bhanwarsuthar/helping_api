'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      team_id1: {
        type: Sequelize.BIGINT.UNSIGNED
      },
      team_id2: {
        type: Sequelize.BIGINT.UNSIGNED
      },
      team1_run: {
        defaultValue: 0,
        type: Sequelize.BIGINT.UNSIGNED
      },
      team1_wicket: {
        defaultValue: 0,
        type: Sequelize.BIGINT.UNSIGNED
      },
      team2_run: {
        defaultValue: 0,
        type: Sequelize.BIGINT.UNSIGNED
      },
      team2_wicket: {
        defaultValue: 0,
        type: Sequelize.BIGINT.UNSIGNED
      },
      result:{
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('matches');
  }
};