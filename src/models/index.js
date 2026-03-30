// src/models/index.js
// Database initializer

const sequelize = require("../config/database");
const File = require("./File");
const CleanupLog = require("./CleanupLog");
const User = require("./User");
const RefreshToken = require('./RefreshToken');
const logger = require('../utils/logger');

const models = {
  File,
  CleanupLog,
  User,
  RefreshToken,
};

File.hasMany(CleanupLog, {
  foreignKey: "fileUuid",
});
CleanupLog.belongsTo(File, {
  foreignKey: "fileUuid",
});

User.hasMany(File, {
  foreignKey: "userId",
});
File.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(RefreshToken, {
  foreignKey: "userId",
});
RefreshToken.belongsTo(User, {
  foreignKey: "userId",
});

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`Connected to database: ${process.env.DB_NAME}`);
    return true;
  } catch (err) {
    logger.error("Database connection error:", err.message);
    return false;
  }
};

module.exports = {
  models,
  sequelize,
  initializeDatabase,
};