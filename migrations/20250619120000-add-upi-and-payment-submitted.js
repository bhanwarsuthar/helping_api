"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "upi_address", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "upi_qrcode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("pin_transactions", "payment_submitted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "upi_address");
    await queryInterface.removeColumn("users", "upi_qrcode");
    await queryInterface.removeColumn("pin_transactions", "payment_submitted_at");
  },
};
