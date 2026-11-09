'use strict';

/**
 * src/controllers/authController.js
 * Controlador de autenticación: registro, login y renovación de token de sesión.
 */

const { Usuario } = require('../models');
const { firmarToken } = require('../middlewares/authMiddleware');

const manejarError = (res, error) => {
  switch (error.name) {
    case 'SequelizeValidationError':
      return res.status(400).json({ error: error.errors.map((e) => e.message) });
    case 'SequelizeUniqueConstraintError':
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    default:
      console.error('[Error de Autenticación]:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.registro = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body; // Whitelist estricta contra mass assignment
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const usuario = await Usuario.create({
      nombre,
      correo,
      password,
      rol: rol || 'bodega',
      activo: true
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: usuario.toJSON()
    });
  } catch (error) {
    manejarError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Usar scope conPassword para verificar el hash de forma aislada
    const usuario = await Usuario.scope('conPassword').findOne({ where: { correo } });
    const valido = usuario && (await usuario.verificarPassword(password));

    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = firmarToken(usuario);
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: usuario.toJSON()
    });
  } catch (error) {
    manejarError(res, error);
  }
};

exports.renovar = (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Sesión renovada activamente',
    usuario: req.usuario
  });
};

