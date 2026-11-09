'use strict';

/**
 * src/routes/ordenesRoutes.js
 * Enrutador modular para órdenes de compra y detección de duplicados.
 * Aplica regla 13: ruta específica /duplicados antes de rutas dinámicas.
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordenesController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Ruta específica /duplicados ANTES de cualquier segmento dinámico
router.get('/duplicados', ctrl.obtenerDuplicados);
router.get('/posibles-duplicados', ctrl.obtenerDuplicados);

// 2. Ruta general de listado
router.get('/', ctrl.listar);

module.exports = router;
