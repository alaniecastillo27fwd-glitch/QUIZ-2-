'use strict';

/**
 * src/services/materialesService.js
 * Lógica pura de negocio para materiales, cálculo de stock y punto de reorden (PR).
 * Cumple con el Principio de Acoplamiento Unidireccional (sin req ni res).
 */

const { Material, Movimiento, Usuario, Ubicacion, DetalleOrdenCompra, OrdenCompra, Proveedor } = require('../models');

/**
 * Calcula el stock actual consolidado de un material a partir del historial de movimientos.
 * Entradas: suman existencias.
 * Salidas: restan existencias.
 * Traslados entre bodegas internas: no alteran el stock global (solo reubican).
 * Ajustes: suman si cantidad > 0, restan si cantidad < 0.
 */
async function calcularStockActual(idMaterial, transaction = null) {
  const movimientos = await Movimiento.findAll({
    where: { id_material: idMaterial },
    transaction
  });

  let stockActual = 0;
  for (const mov of movimientos) {
    const cant = Number(mov.cantidad) || 0;
    const tipo = (mov.tipo_movimiento || '').toLowerCase();

    if (tipo === 'entrada') {
      stockActual += cant;
    } else if (tipo === 'salida') {
      stockActual -= cant;
    } else if (tipo === 'ajuste') {
      stockActual += cant; // Puede ser positivo o negativo
    }
    // Traslados entre obras/bodegas mantienen el total global intacto
  }

  return Number(stockActual.toFixed(2));
}

/**
 * Obtiene métricas clave de inventario de un material:
 * - Demanda promedio diaria (d)
 * - Demanda máxima diaria (d_max)
 * - Tiempo de entrega en días (L)
 * - Stock de seguridad: SS = (d_max - d) * L
 * - Punto de reorden: PR = d * L + SS = d_max * L
 * - Estado: ÓPTIMO, ALERTA_REORDEN, CRÍTICO
 */
function calcularMetricasInventario(material, stockActual) {
  const metricas = material.calcularPuntoReorden();
  const puntoReorden = metricas.puntoReorden;
  const stockSeguridad = metricas.stockSeguridad;
  const stockMinimo = Number(material.stock_minimo) || 0;

  let estado = 'ÓPTIMO';
  if (stockActual <= stockMinimo) {
    estado = 'CRÍTICO';
  } else if (stockActual <= puntoReorden) {
    estado = 'ALERTA_REORDEN';
  }

  return {
    stockActual,
    stockSeguridad,
    puntoReorden,
    stockMinimo,
    stockMaximo: Number(material.stock_maximo) || 0,
    estado,
    requiereReposicion: stockActual <= puntoReorden
  };
}

/**
 * Lista todos los materiales y calcula en lote su stock actual y estado de reorden.
 */
async function listarMateriales(filtro = { activo: true }) {
  const materiales = await Material.findAll({
    where: filtro,
    order: [['nombre', 'ASC']]
  });

  const resultados = await Promise.all(
    materiales.map(async (mat) => {
      const stockActual = await calcularStockActual(mat.id_material);
      const metricas = calcularMetricasInventario(mat, stockActual);
      return {
        ...mat.toJSON(),
        inventario: metricas
      };
    })
  );

  return resultados;
}

/**
 * Obtiene el detalle completo de un material por su ID con métricas de stock.
 */
async function obtenerMaterialPorId(idMaterial) {
  const material = await Material.findByPk(idMaterial);
  if (!material) return null;

  const stockActual = await calcularStockActual(idMaterial);
  const metricas = calcularMetricasInventario(material, stockActual);

  return {
    ...material.toJSON(),
    inventario: metricas
  };
}

/**
 * Registra un nuevo material en el catálogo.
 */
async function crearMaterial(datos) {
  const {
    codigo,
    nombre,
    descripcion,
    unidad_medida,
    stock_minimo,
    stock_maximo,
    demanda_promedio,
    demanda_maxima,
    tiempo_entrega
  } = datos;

  return Material.create({
    codigo,
    nombre,
    descripcion,
    unidad_medida: unidad_medida || 'unidad',
    stock_minimo: stock_minimo || 0,
    stock_maximo: stock_maximo || 0,
    demanda_promedio: demanda_promedio || 0,
    demanda_maxima: demanda_maxima || 0,
    tiempo_entrega: tiempo_entrega || 0,
    activo: true
  });
}

/**
 * Consulta de trazabilidad histórica: movimientos, usuario responsable, ubicaciones
 * y orden de compra asociada para cada entrada.
 */
async function obtenerTrazabilidad(idMaterial) {
  const material = await Material.findByPk(idMaterial);
  if (!material) return null;

  const stockActual = await calcularStockActual(idMaterial);
  const metricas = calcularMetricasInventario(material, stockActual);

  const movimientos = await Movimiento.findAll({
    where: { id_material: idMaterial },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'nombre', 'correo', 'rol']
      },
      {
        model: Ubicacion,
        as: 'ubicacionOrigen',
        attributes: ['id_ubicacion', 'nombre', 'tipo']
      },
      {
        model: Ubicacion,
        as: 'ubicacionDestino',
        attributes: ['id_ubicacion', 'nombre', 'tipo']
      },
      {
        model: DetalleOrdenCompra,
        as: 'detalleOrden',
        include: [
          {
            model: OrdenCompra,
            as: 'orden',
            attributes: ['id_orden', 'numero_orden', 'fecha_orden', 'estado'],
            include: [
              {
                model: Proveedor,
                as: 'proveedor',
                attributes: ['id_proveedor', 'nombre']
              }
            ]
          }
        ]
      }
    ],
    order: [['fecha_movimiento', 'DESC'], ['id_movimiento', 'DESC']]
  });

  return {
    material: {
      id_material: material.id_material,
      codigo: material.codigo,
      nombre: material.nombre,
      unidad_medida: material.unidad_medida
    },
    inventarioActual: metricas,
    totalMovimientos: movimientos.length,
    historial: movimientos
  };
}

module.exports = {
  calcularStockActual,
  calcularMetricasInventario,
  listarMateriales,
  obtenerMaterialPorId,
  crearMaterial,
  obtenerTrazabilidad
};

