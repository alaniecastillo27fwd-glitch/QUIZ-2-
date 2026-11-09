'use strict';

/**
 * src/routes/authRoutes.js
 * Rutas de autenticación (públicas para registro y login, protegida para renovar).
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requerir } = require('../middlewares/validaciones');

router.post('/registro', requerir(['nombre', 'correo', 'password']), ctrl.registro);
router.post('/login', requerir(['correo', 'password']), ctrl.login);
router.get('/renovar', authMiddleware, ctrl.renovar);

module.exports = router;
