'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.createTable('otp', { 
       id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT.UNSIGNED
       },
       user_id : {
          type: Sequelize.BIGINT.UNSIGNED,
          references: {
            model: {
              tableName: 'users',
            },
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
       },
       send_via: Sequelize.STRING, // email, sms
       send_to: Sequelize.STRING,
       code: Sequelize.STRING,
       expire_on: Sequelize.DATE
      },{
        charset: 'utf8mb4', /* i add this two ligne here for generate the table with collation  = 'utf8_general_ci' test it and tell me ? */
        collate: 'utf8mb4_unicode_ci'
        });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('otp');
  }
};
