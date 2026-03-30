require('dotenv').config();

const common = {
  dialect: 'postgres',
  logging: false,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
};

module.exports = {
  development: { ...common },
  test: { ...common },
  production: { ...common },
};