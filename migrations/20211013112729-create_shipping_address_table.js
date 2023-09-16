'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipping_address', { 
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
       is_default: { 
         type: Sequelize.BOOLEAN,
         defaultValue: false
        },
       phone_number: Sequelize.STRING,
       line1: Sequelize.STRING,
       line2: Sequelize.STRING,
       city: Sequelize.STRING(64),
       state: Sequelize.STRING(64),
       pin_code: Sequelize.STRING(6),
       country: Sequelize.STRING(64),
       geo_location: Sequelize.GEOMETRY('POINT', 4326),
       created_at: Sequelize.DATE,
       updated_at: Sequelize.DATE
    },{
      charset: 'utf8mb4', /* i add this two ligne here for generate the table with collation  = 'utf8_general_ci' test it and tell me ? */
      collate: 'utf8mb4_unicode_ci'
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shipping_address');
  }
};
