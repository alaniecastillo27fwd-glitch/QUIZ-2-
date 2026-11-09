'use strict';

/**
 * src/controllers/movimientosController.js
 * Controlador HTTP para el registro y consulta de movimientos de almacén.
 */

const movimientosService = require('../services/movimientosService');

exports.listar = async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 50;
    const id_material = req.query.id_material ? Number(req.query.id_material) : undefined;
    const tipo = req.query.tipo ? String(req.query.tipo) : undefined;

    const movimientos = await movimientosService.listarMovimientos({
      limite,
      id_material,
      tipo_movimiento: tipo
    });

    res.status(200).json({
      total: movimientos.length,
      movimientos
    });
  } catch (error) {
    next(error);
  }
};

exports.crear = async (req, res, next) => {
  try {
    // Whitelist defensiva
    const {
      id_material,
      id_usuario,
      tipo_movimiento,
      cantidad,
      fecha_movimiento,
      id_ubicacion_origen,
      id_ubicacion_destino,
      id_detalle_orden,
      documento_referencia,
      observaciones
    } = req.body;

    if (!id_material || !id_usuario || !tipo_movimiento || cantidad === undefined || !documento_referencia) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: id_material, id_usuario, tipo_movimiento, cantidad, documento_referencia'
      });
    }

    const resultado = await movimientosService.registrarMovimiento({
      id_material: Number(id_material),
      id_usuario: Number(id_usuario),
      tipo_movimiento: String(tipo_movimiento),
      cantidad: Number(cantidad),
      fecha_movimiento,
      id_ubicacion_origen: id_ubicacion_origen ? Number(id_ubicacion_origen) : null,
      id_ubicacion_destino: id_ubicacion_destino ? Number(id_ubicacion_destino) : null,
      id_detalle_orden: id_detalle_orden ? Number(id_detalle_orden) : null,
      documento_referencia: String(documento_referencia),
      observaciones
    });

    res.status(201).json({
      mensaje: 'Movimiento registrado exitosamente',
      ...resultado
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

