//src/models/index.js
// инициализатор БД

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
    // грубо - пробный запрос к БД - если ответила - значит она есть и логины пароли верные
    logger.info(`Подключились к БД ${process.env.DB_NAME}`);

    return true;
    // return true нужен чтобы сообщить вызывающему коду об успехе или неудаче.
  } catch (err) {
    logger.error("Ошибка подключения к БД:", err.message);
    return false;
  }
};

module.exports = {
  models,
  sequelize, // Экспортируем тоже для миграций
  initializeDatabase,
};
