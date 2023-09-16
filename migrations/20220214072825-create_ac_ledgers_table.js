'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ac_ledgers', {
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
             tableName: 'users'
           },
           key: 'id'
         },
         allowNull: false,
         onDelete: 'CASCADE',
         onUpdate: 'CASCADE',
       },
       ledger_name: Sequelize.STRING(128),
       slug: {
         type: Sequelize.STRING(128),
         allowNull: false,
       },
       balance: Sequelize.DECIMAL(10,2),
       created_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ac_ledgers');
  }
};
