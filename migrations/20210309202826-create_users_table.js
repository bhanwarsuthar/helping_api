"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT.UNSIGNED,
        },
        facebook_id: {
          type: Sequelize.STRING,
        },
        google_id: {
          type: Sequelize.STRING,
        },
        referral_code: {
          type: Sequelize.STRING(64),
          allowNull: true,
        },
        sponsor: {
          type: Sequelize.STRING(64),
          allowNull: true,
        },
        first_name: {
          type: Sequelize.STRING,
        },
        last_name: {
          type: Sequelize.STRING,
        },
        country: {
          type: Sequelize.STRING(3),
        },
        email: {
          type: Sequelize.STRING,
        },
        email_verified_at: {
          type: Sequelize.DATE,
        },
        mobile: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        role: {
          type: Sequelize.STRING(64),
          defaultValue: "customer", // customer, admin, seller
        },
        status: { type: Sequelize.STRING, defaultValue: "active" },
        mobile_verified_at: {
          type: Sequelize.DATE,
        },
        password: {
          type: Sequelize.STRING,
        },
        geo_location: {
          type: Sequelize.GEOMETRY("POINT", 4326),
        },
        is_profile_completed: {
          type: Sequelize.TINYINT(1),
          defaultValue: 0,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        charset: "utf8mb4" /* i add this two ligne here for generate the table with collation  = 'utf8_general_ci' test it and tell me ? */,
        collate: "utf8mb4_unicode_ci",
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`SET foreign_key_checks = 0;`);
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query(`SET foreign_key_checks = 1;`);
  },
};
