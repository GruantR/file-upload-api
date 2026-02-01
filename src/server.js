//src/server.js
// только запуск сервера
require("dotenv").config();
const {initializeDatabase} = require('./models/index');
const app = require("./app");
const PORT = process.env.PORT;

async function startServer() {
  try{
    const dbConnected = await initializeDatabase();
       if (!dbConnected) {
      throw new Error('Не удалось подключиться к БД');
    }
    app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`📁 База данных: ${process.env.DB_NAME}`);
});

  }
  catch(err){
  console.error('❌ Ошибка запуска:', err);
  console.error('   Проверь:');
  console.error('   1. Запущен ли PostgreSQL?');
  console.error('   2. Правильные ли логин/пароль в .env?');
  console.error('   3. Существует ли БД', process.env.DB_NAME, '?');
  process.exit(1)//  команда для немедленного завершения процесса Node.js с указанием кода выхода (1 — НЕУДАЧА (ошибка, сбой))
  }
};

startServer();

