"use strict";
const acledgers = require("../data/acledger.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("ac_ledgers", acledgers);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("ac_ledgers", null, {});
  },
};
