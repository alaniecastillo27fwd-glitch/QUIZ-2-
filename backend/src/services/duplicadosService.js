'use strict';

/**
 * src/services/duplicadosService.js
 * Motor de detección de posibles compras duplicadas (Quiz 2 - Ejercicio A3 y Opción 2).
 *
 * REGLA DE DETECCIÓN DEFINIDA Y DOCUMENTADA:
 * Dos órdenes de compra se catalogan como "Posible Duplicado" si cumplen simultáneamente:
 * 1. Mismo Proveedor: orden1.id_proveedor == orden2.id_proveedor
 * 2. Mismo Artículo / Material: detalle1.id_material == detalle2.id_material
 * 3. Fechas Cercanas: diferencia entre fecha_orden <= ventanaDias (por defecto 7 días hábiles/calendario)
 * 4. Cantidad Idéntica o Similar: |cant1 - cant2| / max(cant1, cant2) <= margenCantidad (por defecto 10%)
 * 5. Estados no cancelados (ambas órdenes están activas o recibidas)
 */

const { OrdenCompra, DetalleOrdenCompra, Proveedor, Material, Usuario, Sequelize } = require('../models');

async function detectarComprasDuplicadas({ ventanaDias = 7, margenCantidad = 0.10 } = {}) {
  // Obtener todas las órdenes de compra con sus líneas de detalle
  const ordenes = await OrdenCompra.findAll({
    where: {
      estado: {
        [Sequelize.Op.ne]: 'cancelada'
      }
    },
    include: [
      {
        model: DetalleOrdenCompra,
        as: 'detalles',
        include: [{ model: Material, as: 'material', attributes: ['id_material', 'codigo', 'nombre'] }]
      },
      { model: Proveedor, as: 'proveedor', attributes: ['id_proveedor', 'nombre'] },
      { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nombre', 'rol'] }
    ],
    order: [['fecha_orden', 'ASC']]
  });

  const posiblesDuplicados = [];
  const items = [];

  // Aplanar a nivel de línea de compra para comparación cruzada
  for (const orden of ordenes) {
    for (const det of orden.detalles || []) {
      items.push({
        id_orden: orden.id_orden,
        numero_orden: orden.numero_orden,
        fecha_orden: new Date(orden.fecha_orden),
        id_proveedor: orden.id_proveedor,
        nombre_proveedor: orden.proveedor ? orden.proveedor.nombre : 'Desconocido',
        id_usuario: orden.id_usuario,
        nombre_usuario: orden.usuario ? orden.usuario.nombre : 'Desconocido',
        id_detalle: det.id_detalle,
        id_material: det.id_material,
        nombre_material: det.material ? det.material.nombre : 'Desconocido',
        codigo_material: det.material ? det.material.codigo : 'N/A',
        cantidad: Number(det.cantidad),
        precio_unitario: Number(det.precio_unitario),
        total_linea: Number((Number(det.cantidad) * Number(det.precio_unitario)).toFixed(2))
      });
    }
  }

  // Comparación por pares
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemA = items[i];
      const itemB = items[j];

      // No comparar la misma orden
      if (itemA.id_orden === itemB.id_orden) continue;

      // 1. Mismo proveedor
      const mismoProveedor = itemA.id_proveedor === itemB.id_proveedor;

      // 2. Mismo material
      const mismoMaterial = itemA.id_material === itemB.id_material;

      if (!mismoProveedor || !mismoMaterial) continue;

      // 3. Diferencia de días
      const diffMs = Math.abs(itemB.fecha_orden - itemA.fecha_orden);
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDias > ventanaDias) continue;

      // 4. Cantidad idéntica o similar (dentro del margen)
      const cantMax = Math.max(itemA.cantidad, itemB.cantidad);
      const diffCant = Math.abs(itemA.cantidad - itemB.cantidad);
      const difPorcentual = cantMax > 0 ? diffCant / cantMax : 0;

      if (difPorcentual <= margenCantidad) {
        posiblesDuplicados.push({
          alerta: 'POSIBLE_COMPRA_DUPLICADA',
          reglaAplicada: `Mismo proveedor (${itemA.nombre_proveedor}), mismo insumo (${itemA.nombre_material}), cantidad similar (dif: ${(difPorcentual * 100).toFixed(1)}%) y fechas emitidas con ${diffDias} días de separación (umbral: ${ventanaDias} días).`,
          diferenciaDias: diffDias,
          diferenciaCantidad: diffCant,
          montoRiesgoFuga: Math.min(itemA.total_linea, itemB.total_linea),
          ordenPrincipal: {
            id_orden: itemA.id_orden,
            numero_orden: itemA.numero_orden,
            fecha: itemA.fecha_orden.toISOString().split('T')[0],
            solicitante: itemA.nombre_usuario,
            cantidad: itemA.cantidad,
            precio_unitario: itemA.precio_unitario,
            total: itemA.total_linea
          },
          ordenSospechosa: {
            id_orden: itemB.id_orden,
            numero_orden: itemB.numero_orden,
            fecha: itemB.fecha_orden.toISOString().split('T')[0],
            solicitante: itemB.nombre_usuario,
            cantidad: itemB.cantidad,
            precio_unitario: itemB.precio_unitario,
            total: itemB.total_linea
          }
        });
      }
    }
  }

  const montoTotalFuga = posiblesDuplicados.reduce((acc, curr) => acc + curr.montoRiesgoFuga, 0);

  return {
    criteriosEvaluados: {
      ventanaDias,
      margenCantidadPermitido: `${margenCantidad * 100}%`
    },
    totalSospechas: posiblesDuplicados.length,
    montoEstimadoFugaValor: Number(montoTotalFuga.toFixed(2)),
    posiblesDuplicados
  };
}

module.exports = {
  detectarComprasDuplicadas
};

