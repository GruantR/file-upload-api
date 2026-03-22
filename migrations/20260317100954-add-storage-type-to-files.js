'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('files', 'storageType', {
      type: Sequelize.ENUM('localStorage', 's3Storage'),
      allowNull: false,
      defaultValue: 'localStorage'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('files', 'storageType')
  }
};
