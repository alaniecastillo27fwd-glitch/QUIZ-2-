'use strict';

/**
 * src/routes/materialesRoutes.js
 * Enrutador modular para materiales y trazabilidad de inventario.
 * Cumple con la Regla 13 de orden estricto de rutas.
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/materialesController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requerir } = require('../middlewares/validaciones');

// 1. Rutas fijas generales
router.get('/', ctrl.listar);
router.post('/', requerir(['codigo', 'nombre']), ctrl.crear);

// 2. Sub-rutas específicas parametrizadas
router.get('/:id/stock', ctrl.obtenerStock);
router.get('/:id/historial', ctrl.obtenerHistorial);

// 3. Ruta genérica por ID al final
router.get('/:id', ctrl.obtenerPorId);

module.exports = router;
