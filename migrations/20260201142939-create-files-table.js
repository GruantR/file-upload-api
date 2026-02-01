// npx sequelize-cli migration:generate --name create-files-table
// этой командой создаем файл миграции

// queryInterface - Это объект для работы с БД напрямую (без моделей) (createTable, dropTable, addColumn, removeColumn)

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Здесь создаём таблицу// ... все поля из модели File

    await queryInterface.createTable("files", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
      },
      //(дополнительный уникальный идентификатор)
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
      },
      //уникальное имя файла на диске)
      fileName: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      //(оригинальное имя от пользователя)
      originalName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      //(в байтах)
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      //(например, "image/png")
      mimetype: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      //(путь к файлу на сервере)
      path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      //(".png", ".jpg" и т.д.)
      extension: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isLowercase: true },
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    // Здесь удаляем таблицу (для отката)
    await queryInterface.dropTable('files');
  },
};
