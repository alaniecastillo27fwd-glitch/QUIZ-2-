'use strict';
require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'inventario_constructora',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: {
    ...baseConfig,
    logging: false
  }
};

