'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('files', 'path')
  },

  async down (queryInterface, Sequelize) {
   // Добавление столбца обратно (на случай отката миграции)
   await queryInterface.addColumn('files', 'path',{
         type: Sequelize.STRING,
         allowNull: false,
       },)
  }
};
