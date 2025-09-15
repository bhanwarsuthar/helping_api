"use strict";
const { Model } = require("sequelize");

class BaseModel extends Model {
  static async paginate(limit, conditions = {}, page = 1) {
    // Ensure limit is valid
    limit = Math.min(Number(limit) || 10, 50);

    // Calculate offset properly
    const offset = (page - 1) * limit;

    // Merge conditions safely (no mutation)
    const options = Object.assign({}, conditions, { offset, limit });

    let result;
    try {
      result = await this.findAndCountAll(options);
    } catch (err) {
      console.error("Pagination error:", err);
      return {
        meta: {
          page_size: limit,
          total: 0,
          current_page: page,
          last_page: 1,
          total_pages: 1,
        },
        rows: [],
      };
    }
    const last_page = Math.max(1, Math.ceil(result.count / limit));

    return {
      meta: {
        page_size: limit,
        total: result.count,
        current_page: parseInt(page),
        last_page,
        total_pages: last_page,
      },
      rows: result.rows,
    };
  }

  static async getOrCreate(values, where) {
    this.findOne({ where: where }).then((row) => {
      if (row) {
        return row;
      } else {
        return this.create(values);
      }
    });
  }
}

module.exports = { BaseModel };
