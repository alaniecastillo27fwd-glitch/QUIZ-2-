'use strict';

/**
 * src/controllers/alertasController.js
 * Controlador HTTP para consultas de alertas de stock y reorden.
 */

const alertasService = require('../services/alertasService');

exports.obtenerAlertas = async (req, res, next) => {
  try {
    const reporte = await alertasService.generarAlertasReposicion();
    res.status(200).json(reporte);
  } catch (error) {
    next(error);
  }
};

