'use strict';

/**
 * src/routes/movimientosRoutes.js
 * Enrutador modular para registro y consulta de movimientos.
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/movimientosController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requerir } = require('../middlewares/validaciones');

router.get('/', ctrl.listar);
router.post(
  '/',
  requerir(['id_material', 'id_usuario', 'tipo_movimiento', 'cantidad', 'documento_referencia']),
  ctrl.crear
);

module.exports = router;
