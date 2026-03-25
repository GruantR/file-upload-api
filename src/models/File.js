// src/models/File.js
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const File = sequelize.define(
  "File",
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
      validate: {
        notNull: {
          msg: "User ID is required",
        },
      },
    },
    // additional unique identifier
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // unique file name on disk
    fileName: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    // original name from user
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // size in bytes
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    // e.g., "image/png"
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // file extension (e.g., ".png", ".jpg")
    extension: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isLowercase: true },
    },
    storageType: {
      type: DataTypes.ENUM('localStorage', 's3Storage'),
      allowNull: false,
      defaultValue: 'localStorage'
    }
  },
  {
    tableName: "files",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["uuid"],
      },
    ],
  },
);

module.exports = File;