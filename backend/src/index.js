'use strict';

/**
 * src/index.js - Punto de entrada del servidor Backend (Integrante 2).
 * Conecta y autentica con la base de datos PostgreSQL 'inventario_constructora'
 * sin ejecutar sincronización destructiva ni crear tablas (a la espera del diagrama del Integrante 3).
 */

require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PUERTO = process.env.PORT || process.env.PUERTO || 3000;

// Autenticación de conexión a PostgreSQL antes de arrancar el servidor
sequelize.authenticate()
  .then(() => {
    console.log('----------------------------------------------------');
    console.log('✅ Conexión establecida exitosamente con PostgreSQL');
    console.log(`📦 Base de datos conectada: ${process.env.DB_NAME || 'inventario_constructora'}`);
    console.log('🔒 Modo protegido: No se crean ni sincronizan tablas');
    console.log('----------------------------------------------------');

    app.listen(PUERTO, () => {
      console.log(`🚀 Servidor backend escuchando en: http://localhost:${PUERTO}`);
      console.log(`📡 Endpoint de verificación: http://localhost:${PUERTO}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al autenticar conexión con PostgreSQL:', err.message);
    console.error('Verifica las credenciales en backend/.env (DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).');
    process.exit(1);
  });

