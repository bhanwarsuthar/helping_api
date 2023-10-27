"use strict";
const commonData = require("../data/common-data.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("common_data", commonData);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("common_data", null, {});
  },
};
