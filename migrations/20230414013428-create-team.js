'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      short_name: {
        allowNull: false,
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
    await queryInterface.dropTable('teams');
  }
};