'use strict';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const admin = await queryInterface.rawSelect('users',{where: {role: 'admin'}},['id']);
    if (!admin) {
      await queryInterface.bulkInsert('users', [{
    uuid: require('uuid').v4(),
    email: ADMIN_EMAIL,
    password: await require('bcrypt').hash(ADMIN_PASSWORD, 10),
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
      }],{})
    }
  },

  async down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('users', { role: 'admin' }, {});
  }
};
