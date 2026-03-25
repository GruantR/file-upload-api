//src/config/database.js
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
);

if (!process.env.DB_NAME || !process.env.DB_USER) {
  console.error("❌ Missing database environment variables");
  process.exit(1);
}

module.exports = sequelize;
