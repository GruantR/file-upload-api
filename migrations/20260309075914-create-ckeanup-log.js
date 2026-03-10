"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cleanup_logs", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
      },
      fileUuid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "files",
          key: "uuid",
        },
        onDelete: "CASCADE", // если файл удалён — логи тоже удаляются
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      errorMessage: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM("pending", "resolved", "failed"),
      },
      resolvedAt: {
        type: Sequelize.DATE,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
   await queryInterface.dropTable('cleanup_logs')
  },
};
