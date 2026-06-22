"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("pin_transactions", "payment_ref_no", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("pin_transactions", "payment_screenshot", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("pin_transactions", "payment_ref_no");
    await queryInterface.removeColumn("pin_transactions", "payment_screenshot");
  },
};
