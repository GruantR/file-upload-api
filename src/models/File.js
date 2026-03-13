//src/models/File.js
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
          msg: "User ID обязателен",
        },
      },
    },
    //(дополнительный уникальный идентификатор)
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    //уникальное имя файла на диске)
    fileName: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    //(оригинальное имя от пользователя)
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //(в байтах)
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    //(например, "image/png")
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //(".png", ".jpg" и т.д.)
    extension: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isLowercase: true },
    },
  },
  {
    tableName: "files",
    timestamps: true,
    paranoid: true, // мягкое удаление
    indexes: [
      {
        unique: true,
        fields: ["uuid"],
      },
    ],
  },
);

module.exports = File;
