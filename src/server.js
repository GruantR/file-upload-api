//src/server.js
// только запуск сервера
require("dotenv").config();
const { initializeDatabase } = require("./models/index");
const app = require("./app");
const logger = require('./utils/logger');


const fs = require("fs").promises;


const PORT = process.env.PORT;
const UPLOADS_DIR = "./uploads";

async function ensureUploadsFolder() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    logger.info(`Папка ${UPLOADS_DIR} успешно сохдана`);
  } catch (err) {
    if (err.code === "EEXIST") {
      logger.info(`Папка ${UPLOADS_DIR} уже существует`);
    } else {
      logger.error("Ошибка создания папки:", err.message);
      throw err;
    }
  }
}



async function startServer() {
  try {
    const dbConnected = await initializeDatabase();
    if (!dbConnected) {
      throw new Error("Не удалось подключиться к БД");
    }

    app.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`)
      logger.info(`📁 База данных: ${process.env.DB_NAME}`)
    });
  } catch (err) {
    logger.error("❌ Ошибка запуска:", err);
    logger.error("   Проверь:");
    logger.error("   1. Запущен ли PostgreSQL?");
    logger.error("   2. Правильные ли логин/пароль в .env?");
    logger.error("   3. Существует ли БД", process.env.DB_NAME, "?");
    process.exit(1); //  команда для немедленного завершения процесса Node.js с указанием кода выхода (1 — НЕУДАЧА (ошибка, сбой))
  }
}
ensureUploadsFolder();
startServer();
