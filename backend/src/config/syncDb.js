'use strict';

/**
 * src/config/syncDb.js - Ejecuta las migraciones oficiales de Sequelize.
 * Aplica las 7 migraciones versionadas en PostgreSQL (inventario_constructora).
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🔄 Ejecutando migraciones oficiales en PostgreSQL...');
console.log(`📦 Base de datos: ${process.env.DB_NAME || 'inventario_constructora'}`);
console.log(`🌐 Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 5432}`);
console.log('====================================================');

try {
  const root = path.resolve(__dirname, '..', '..');
  execSync('npx sequelize-cli db:migrate', { cwd: root, stdio: 'inherit' });
  console.log('====================================================');
  console.log('🎉 Todas las migraciones fueron ejecutadas con éxito.');
  console.log('====================================================');
} catch (error) {
  console.error('❌ Error ejecutando db:migrate:', error.message);
  process.exit(1);
}
