'use strict';

/**
 * src/controllers/ordenesController.js
 * Controlador HTTP para órdenes de compra y detección de compras duplicadas.
 */

const { OrdenCompra, DetalleOrdenCompra, Proveedor, Material, Usuario } = require('../models');
const duplicadosService = require('../services/duplicadosService');

exports.listar = async (req, res, next) => {
  try {
    const ordenes = await OrdenCompra.findAll({
      include: [
        { model: Proveedor, as: 'proveedor', attributes: ['id_proveedor', 'nombre', 'correo'] },
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nombre', 'rol'] },
        {
          model: DetalleOrdenCompra,
          as: 'detalles',
          include: [{ model: Material, as: 'material', attributes: ['id_material', 'codigo', 'nombre', 'unidad_medida'] }]
        }
      ],
      order: [['fecha_orden', 'DESC']]
    });

    res.status(200).json({
      total: ordenes.length,
      ordenes
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerDuplicados = async (req, res, next) => {
  try {
    const ventanaDias = req.query.dias ? Number(req.query.dias) : 7;
    const margen = req.query.margen ? Number(req.query.margen) : 0.10;

    const reporte = await duplicadosService.detectarComprasDuplicadas({
      ventanaDias,
      margenCantidad: margen
    });

    res.status(200).json(reporte);
  } catch (error) {
    next(error);
  }
};
