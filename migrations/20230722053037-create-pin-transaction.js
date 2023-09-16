'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pin_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      provide_user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      },
      receive_user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      },
      pin_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      },
      status: Sequelize.ENUM(["success","pending","inprogress","cancel"]),
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pin_transactions');
  }
};