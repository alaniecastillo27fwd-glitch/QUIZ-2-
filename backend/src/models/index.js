'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

const db = {};

// Carga modular dinámica de modelos.
// NOTA IMPORTANTE: Por directriz del proyecto, no se definen modelos ni se sincronizan tablas
// hasta que el Integrante 3 entregue el diagrama de flujo y modelo relacional.
fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js') && !file.includes('.template'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

