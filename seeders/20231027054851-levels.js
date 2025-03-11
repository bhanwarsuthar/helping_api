"use strict";
const levels = require("../data/levels.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("levels", levels);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("levels", null, {});
  },
};
