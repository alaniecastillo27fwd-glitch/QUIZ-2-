'use strict';
// src/app.js — Configuración de Express.
// Registra middlewares globales, routers modulares, 404 y manejador centralizado de errores (4 parámetros).
// Desacoplado de app.listen() para permitir pruebas de integración (Supertest) sin abrir puertos.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const entidadRoutes = require('./routes/entidadRoutes'); // Ejemplo de módulo

const app = express();

// 1. Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL,
  exposedHeaders: ['x-access-token'], // Permite al frontend leer tokens de sesión renovados
}));
app.use(express.json()); // Analizador de cuerpos de peticiones en JSON

// 2. Montaje de rutas y routers modulares
app.use('/auth', authRoutes);          // Rutas de autenticación
app.use('/entidades', entidadRoutes);  // Rutas de entidad (protegidas con authMiddleware)

// 3. Manejador 404: Ruta no encontrada (debe ir después de todas las rutas)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 4. Manejador centralizado de errores (4 parámetros obligatorios: err, req, res, next)
app.use((err, req, res, next) => {
  console.error('[Error no controlado]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
});

module.exports = app;
