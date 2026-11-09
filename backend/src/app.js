'use strict';

/**
 * src/app.js - Configuración de Express para el Integrante 2 (Backend).
 * Aplica arquitectura modular por capas conforme a las reglas de backend-postgres-guardian.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  exposedHeaders: ['x-access-token']
}));
app.use(express.json());

// 2. Rutas base y healthcheck
app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: 'API de Gestión de Inventarios - Quiz 2 (Constructora)',
    rol: 'Integrante 2 - Backend',
    estado: 'Servidor Express activo',
    baseDatos: process.env.DB_NAME || 'inventario_constructora'
  });
});

app.get('/api/health', async (req, res, next) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'OK',
      baseDatos: 'Conectada exitosamente a PostgreSQL (inventario_constructora)',
      modelosCargados: Object.keys(sequelize.models),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// 3. Montaje de rutas modulares
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// 4. Manejador 404: Ruta no encontrada (debe ir después de las rutas)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    metodo: req.method,
    url: req.originalUrl
  });
});

// 5. Manejador centralizado de errores (4 parámetros obligatorios: err, req, res, next)
app.use((err, req, res, next) => {
  console.error('[Error no controlado]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
