'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      title: {
        type: Sequelize.STRING
      },
      pin_amount: {
        type: Sequelize.INTEGER
      },
      provide_help_amount: {
        type: Sequelize.INTEGER
      },
      receive_help_amount: {
        type: Sequelize.INTEGER
      },
      total_count: {
        type: Sequelize.INTEGER
      },
      temp_count: {
        type: Sequelize.INTEGER
      },
      start_time: {
        type: Sequelize.DATE
      },
      end_time: {
        type: Sequelize.DATE
      },
      remaining_count: {
        type: Sequelize.INTEGER
      },
      generate_link_count: {
        type: Sequelize.INTEGER
      },
      status: Sequelize.ENUM(["active","deactive"]),
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pins');
  }
};