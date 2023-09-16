'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('media', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      uuid: { 
        type: Sequelize.UUID,
        allowNull: false,
        unique: true
      },

      model_id: Sequelize.BIGINT.UNSIGNED,
      model_type: Sequelize.STRING(64),
      collection: Sequelize.STRING(128),

      size: Sequelize.INTEGER.UNSIGNED,
      name: Sequelize.STRING,
      mime: Sequelize.STRING(64),
      type: Sequelize.ENUM(["video","image","pdf","audio"]),
      path: { 
        type: Sequelize.STRING(600),
        allowNull: false
      },
      pic_thumbnail: Sequelize.STRING(600), // 150 x 150
      pic_medium: Sequelize.STRING(600), // 500 x 500
      pic_large: Sequelize.STRING(600), // 1024 x 1024

      disk: Sequelize.STRING(20), // local, s3
      sort_order: Sequelize.INTEGER.UNSIGNED,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    },{
      charset: 'utf8mb4', /* i add this two ligne here for generate the table with collation  = 'utf8_general_ci' test it and tell me ? */
      collate: 'utf8mb4_unicode_ci'
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('media');
  }
};
