'use strict';

/**
 * src/services/alertasService.js
 * Generador inteligente de alertas de reposición de inventario.
 * Identifica artículos bajo Punto de Reorden (PR = d * L + SS).
 */

const { Material } = require('../models');
const { calcularStockActual, calcularMetricasInventario } = require('./materialesService');

/**
 * Genera la lista de alertas activas para reposición de materiales.
 */
async function generarAlertasReposicion() {
  const materiales = await Material.findAll({
    where: { activo: true },
    order: [['nombre', 'ASC']]
  });

  const alertas = [];

  for (const mat of materiales) {
    const stockActual = await calcularStockActual(mat.id_material);
    const metricas = calcularMetricasInventario(mat, stockActual);

    if (metricas.requiereReposicion) {
      const stockMaximo = Number(mat.stock_maximo) || 0;
      // Cantidad sugerida a pedir: llevar el stock hasta el nivel máximo permitido
      const cantidadSugerida = Math.max(0, Number((stockMaximo - stockActual).toFixed(2)));

      alertas.push({
        id_material: mat.id_material,
        codigo: mat.codigo,
        nombre: mat.nombre,
        unidad_medida: mat.unidad_medida,
        nivelUrgencia: metricas.estado, // 'CRÍTICO' o 'ALERTA_REORDEN'
        stockActual,
        puntoReorden: metricas.puntoReorden,
        stockSeguridad: metricas.stockSeguridad,
        stockMinimo: metricas.stockMinimo,
        stockMaximo,
        cantidadSugerida,
        mensaje: metricas.estado === 'CRÍTICO'
          ? `¡URGENTE! El stock de "${mat.nombre}" (${stockActual}) está en nivel crítico (mínimo: ${metricas.stockMinimo}).`
          : `Alerta de reposición: "${mat.nombre}" alcanzó su punto de reorden (${metricas.puntoReorden}). Pedir ${cantidadSugerida} ${mat.unidad_medida}.`
      });
    }
  }

  // Ordenar: primero los CRÍTICOS, luego por menor stock actual
  alertas.sort((a, b) => {
    if (a.nivelUrgencia === 'CRÍTICO' && b.nivelUrgencia !== 'CRÍTICO') return -1;
    if (a.nivelUrgencia !== 'CRÍTICO' && b.nivelUrgencia === 'CRÍTICO') return 1;
    return a.stockActual - b.stockActual;
  });

  return {
    totalAlertas: alertas.length,
    criticos: alertas.filter((a) => a.nivelUrgencia === 'CRÍTICO').length,
    enReorden: alertas.filter((a) => a.nivelUrgencia === 'ALERTA_REORDEN').length,
    alertas
  };
}

module.exports = {
  generarAlertasReposicion
};
