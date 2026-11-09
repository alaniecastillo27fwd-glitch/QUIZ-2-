'use strict';

/**
 * src/services/movimientosService.js
 * Servicio de negocio para registro y validación de movimientos de inventario.
 * Garantiza integridad atómica mediante transacciones y valida suficiencia de stock en salidas.
 */

const { Movimiento, Material, Usuario, Ubicacion, DetalleOrdenCompra, sequelize } = require('../models');
const { calcularStockActual, calcularMetricasInventario } = require('./materialesService');

/**
 * Registra un movimiento de inventario (entrada, salida, traslado, ajuste).
 * Reglas de negocio:
 * 1. Para salidas o traslados, valida stock disponible previo para evitar saldos negativos.
 * 2. Se procesa dentro de una transacción gestionada por Sequelize.
 * 3. Evalúa si el stock resultante dispara alerta de reposición (Stock <= PR).
 */
async function registrarMovimiento(datos) {
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
  } = datos;

  const tipo = (tipo_movimiento || '').toLowerCase();
  const cantNum = Number(cantidad);

  if (cantNum <= 0) {
    const error = new Error('La cantidad debe ser un número positivo mayor que cero');
    error.status = 400;
    throw error;
  }

  return sequelize.transaction(async (t) => {
    // 1. Validar existencia del material
    const material = await Material.findByPk(id_material, { transaction: t });
    if (!material) {
      const error = new Error(`El material con ID ${id_material} no existe`);
      error.status = 404;
      throw error;
    }

    if (!material.activo) {
      const error = new Error(`El material "${material.nombre}" está inactivo`);
      error.status = 400;
      throw error;
    }

    // 2. Validar existencia del usuario
    const usuario = await Usuario.findByPk(id_usuario, { transaction: t });
    if (!usuario) {
      const error = new Error(`El usuario con ID ${id_usuario} no existe`);
      error.status = 404;
      throw error;
    }

    // 3. Validar existencias si es salida
    const stockActual = await calcularStockActual(id_material, t);

    if (tipo === 'salida' && cantNum > stockActual) {
      const error = new Error(
        `Stock insuficiente para realizar la salida. Stock actual: ${stockActual} ${material.unidad_medida}, Solicitado: ${cantNum} ${material.unidad_medida}`
      );
      error.status = 409;
      throw error;
    }

    // 4. Crear el registro del movimiento
    const nuevoMovimiento = await Movimiento.create(
      {
        id_material,
        id_usuario,
        tipo_movimiento: tipo,
        cantidad: cantNum,
        fecha_movimiento: fecha_movimiento || new Date(),
        id_ubicacion_origen: id_ubicacion_origen || null,
        id_ubicacion_destino: id_ubicacion_destino || null,
        id_detalle_orden: id_detalle_orden || null,
        documento_referencia,
        observaciones: observaciones || null
      },
      { transaction: t }
    );

    // 5. Calcular nuevo stock y evaluar alerta de reorden
    let nuevoStock = stockActual;
    if (tipo === 'entrada') nuevoStock += cantNum;
    else if (tipo === 'salida') nuevoStock -= cantNum;
    else if (tipo === 'ajuste') nuevoStock += cantNum;

    nuevoStock = Number(nuevoStock.toFixed(2));
    const metricas = calcularMetricasInventario(material, nuevoStock);

    return {
      movimiento: nuevoMovimiento,
      stockPrevio: stockActual,
      stockNuevo: nuevoStock,
      alertaDisparada: metricas.requiereReposicion,
      estadoInventario: metricas.estado,
      puntoReorden: metricas.puntoReorden
    };
  });
}

/**
 * Consulta de movimientos recientes con filtros opcionales.
 */
async function listarMovimientos({ limite = 50, id_material, tipo_movimiento } = {}) {
  const where = {};
  if (id_material) where.id_material = Number(id_material);
  if (tipo_movimiento) where.tipo_movimiento = tipo_movimiento.toLowerCase();

  return Movimiento.findAll({
    where,
    include: [
      { model: Material, as: 'material', attributes: ['id_material', 'codigo', 'nombre', 'unidad_medida'] },
      { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nombre', 'rol'] },
      { model: Ubicacion, as: 'ubicacionOrigen', attributes: ['id_ubicacion', 'nombre', 'tipo'] },
      { model: Ubicacion, as: 'ubicacionDestino', attributes: ['id_ubicacion', 'nombre', 'tipo'] }
    ],
    order: [['fecha_movimiento', 'DESC'], ['id_movimiento', 'DESC']],
    limit: Number(limite) || 50
  });
}

module.exports = {
  registrarMovimiento,
  listarMovimientos
};

