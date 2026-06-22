"use strict";

const commonData = require("../data/common-data.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const upiKeys = ["UPI", "UPI_QRCODE", "USD", "USD_QRCODE"];

    for (const key of upiKeys) {
      const row = commonData.find((item) => item.key === key);
      if (!row) continue;

      await queryInterface.bulkUpdate(
        "common_data",
        {
          data: row.data,
          updated_at: row.updated_at,
        },
        { key }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      "common_data",
      { data: "50009894989", updated_at: "2023-10-27 04:57:01" },
      { key: "UPI" }
    );
    await queryInterface.bulkUpdate(
      "common_data",
      { data: "50009894989", updated_at: "2023-10-27 04:57:01" },
      { key: "UPI_QRCODE" }
    );
    await queryInterface.bulkUpdate(
      "common_data",
      { data: "50009894989", updated_at: "2023-10-27 04:57:01" },
      { key: "USD" }
    );
    await queryInterface.bulkUpdate(
      "common_data",
      { data: "50009894989", updated_at: "2023-10-27 04:57:01" },
      { key: "USD_QRCODE" }
    );
  },
};
