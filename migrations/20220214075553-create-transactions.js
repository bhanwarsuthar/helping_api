"use strict";

const { AvailableTxNotations } = require("../constants");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ac_ledger_transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: {
            tableName: "users",
          },
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      ac_ledger_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: {
            tableName: "ac_ledgers",
          },
          key: "id",
        },
        allowNull: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
      },
      amount: Sequelize.DECIMAL(10, 2),
      tx_type: Sequelize.ENUM(["debit", "credit", "pending", "reject"]),
      notation: Sequelize.ENUM(AvailableTxNotations),
      meta: Sequelize.JSON,
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ac_ledger_transactions");
  },
};
