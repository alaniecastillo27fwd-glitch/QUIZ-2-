'use strict';

/**
 * src/middlewares/authMiddleware.js
 * Verifica el encabezado Authorization: Bearer <token>.
 * Implementa expiración deslizante a los 25 minutos de inactividad (renueva con header x-access-token).
 */

const jwt = require('jsonwebtoken');

const EXPIRA = process.env.JWT_EXPIRES_IN || '25m';

const firmarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id_usuario || usuario.id,
      correo: usuario.correo || usuario.email,
      rol: usuario.rol || 'usuario'
    },
    process.env.JWT_SECRET,
    { expiresIn: EXPIRA }
  );
};

const authMiddleware = (req, res, next) => {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Falta el token de autenticación',
      codigo: 'TOKEN_AUSENTE'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: payload.id,
      correo: payload.correo,
      rol: payload.rol
    };

    // Renovación deslizante de sesión: reinicia los 25 min de inactividad
    res.setHeader('x-access-token', firmarToken(payload));
    return next();
  } catch (error) {
    const expirado = error.name === 'TokenExpiredError';
    return res.status(401).json({
      error: expirado
        ? 'La sesión expiró por inactividad (25 min). Inicia sesión de nuevo.'
        : 'Token de autenticación inválido',
      codigo: expirado ? 'TOKEN_EXPIRADO' : 'TOKEN_INVALIDO'
    });
  }
};

module.exports = authMiddleware;
module.exports.firmarToken = firmarToken;

