"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("levels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      level: { type: Sequelize.INTEGER, unique: true },
      title: { type: Sequelize.STRING },
      percentage: { type: Sequelize.INTEGER },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("levels");
  },
};
