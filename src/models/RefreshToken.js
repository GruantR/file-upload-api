//src/models/RefreshToken.js
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["token"],
      },
    ],
  },
);

module.exports = RefreshToken;
