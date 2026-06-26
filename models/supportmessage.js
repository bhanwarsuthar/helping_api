"use strict";

const { BaseModel } = require("./base_models/BaseModel");

module.exports = (sequelize, DataTypes) => {
  class SupportMessage extends BaseModel {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: "user_id", as: "user" });
    }
  }

  SupportMessage.init(
    {
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      sender_role: { type: DataTypes.ENUM("user", "admin"), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      is_read_by_admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_read_by_user: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: "SupportMessage",
      tableName: "support_messages",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return SupportMessage;
};
