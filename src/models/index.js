//src/models/index.js
// инициализатор БД

const sequelize = require("../config/database");
const File = require("./File");
const CleanupLog = require("./CleanupLog");

const models = {
  File,
  CleanupLog,
};

File.hasMany(CleanupLog, {
  foreignKey: "fileUuid",
});
CleanupLog.belongsTo(File, {
  foreignKey: "fileUuid",
});

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    // грубо - пробный запрос к БД - если ответила - значит она есть и логины пароли верные
    console.log(`Подключились к БД ${process.env.DB_NAME}`);

    const syncOptions = {
      alter: false, // НЕ изменять существующие таблицы
      force: false, // НЕ пересоздавать таблицы
      logging: false, // не показывать SQL-запросы в консоли
    };

    // await sequelize.sync(syncOptions);
    // Создаёт таблицы в БД на основе моделей
    //коментируем это поле да и syncOptions когда настраиваем миграции
    // Запуск миграции npx sequelize-cli db:migrate
    return true;
    // return true нужен чтобы сообщить вызывающему коду об успехе или неудаче.
  } catch (err) {
    return false;
  }
};

module.exports = {
  models,
  sequelize, // Экспортируем тоже для миграций
  initializeDatabase,
};
