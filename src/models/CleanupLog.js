//src/models/CleanupLog.js

const sequelize = require('../config/database');
const { DataTypes } = require("sequelize");

const CleanupLog = sequelize.define(
  "CleanupLog",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
    },
    fileUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'files',
        key: 'uuid'
      },
      onDelete: 'CASCADE' // если файл удалён — логи тоже удаляются

    },
    storedName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved", "failed"),
    },
    resolvedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "cleanup_logs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["fileUuid"],
      },
    ],
  },
);
module.exports = CleanupLog;