'use strict';

/**
 * src/routes/alertasRoutes.js
 * Enrutador modular para alertas de reorden de inventario.
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', ctrl.obtenerAlertas);
router.get('/reorden', ctrl.obtenerAlertas);

module.exports = router;
