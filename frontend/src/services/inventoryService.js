/**
 * Servicio de Inventario y Conectividad REST API.
 * Constructora Del Valle S.A. - Control de Inventario.
 * Diseñado para la integración directa con el Backend Express/PostgreSQL.
 */

import { enrichMaterialMetrics } from './inventoryCalculations.js';

import {
  API_BASE_URL,
  ENDPOINTS,
  PRECIOS_CONTRATO_OFICIALES,
} from './apiConfig.js';
import { materialFromApi, materialToApi, movimientoFromApi, ordenesFromApi, duplicadosFromApi } from './apiAdapters.js';

// Limpieza proactiva de datos semilla obsoletos en localStorage si existieran
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('cdv_materiales_v1');
    localStorage.removeItem('cdv_movimientos_v1');
    localStorage.removeItem('cdv_ordenes_compra_v1');
  } catch (_) {}
}

/**
 * Cliente HTTP seguro para peticiones GET.
 * Si el backend aún no está levantado por el integrante de backend, responde con lista vacía.
 */
async function fetchGet(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[REST API] HTTP ${res.status} al consultar ${url}`);
      throw new Error(`Error HTTP ${res.status} al consultar ${url}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(`No se pudo consultar la API (${url}): ${err.message}`);
  }
}

/**
 * Cliente HTTP para peticiones POST / PUT.
 */
async function fetchMutation(url, method, payload) {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || errBody.message || `Error del servidor HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`No se pudo conectar con el backend en ${API_BASE_URL}. Asegúrate de que el servidor esté activo.`);
    }
    throw err;
  }
}

/**
 * 1. Catálogo de Materiales
 * Obtiene todos los materiales registrados en la base de datos con sus métricas calculadas (SS, PR, Estado).
 */
export async function getMateriales() {
  const result = await fetchGet(ENDPOINTS.MATERIALES);
  return result.materiales.map((m) => enrichMaterialMetrics(materialFromApi(m)));
}

/**
 * Obtiene un material por su ID con métricas enriquecidas.
 */
export async function getMaterialById(id) {
  try {
    const res = await fetch(ENDPOINTS.MATERIAL_BY_ID(id), {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Material #${id} no encontrado en el servidor.`);
    }
    const data = await res.json();
    const item = data.data || data;
    return enrichMaterialMetrics(materialFromApi(item));
  } catch (err) {
    // Si la API no está disponible o falla, consultar del listado
    const todos = await getMateriales();
    const found = todos.find((m) => String(m.id) === String(id));
    if (!found) {
      throw new Error(`Material con ID ${id} no encontrado.`);
    }
    return found;
  }
}

/**
 * Crea un nuevo material en el backend calculando automáticamente su PR.
 */
export async function createMaterial(data) {
  if (!data.nombre || !data.codigo) {
    throw new Error('El código y el nombre del material son obligatorios.');
  }

  const payload = materialToApi(data);

  const response = await fetchMutation(ENDPOINTS.MATERIALES, 'POST', payload);
  const created = response.material;
  return getMaterialById(created.id_material);
}

/**
 * Actualiza los parámetros de un material en el backend.
 */
export async function updateMaterial(id, updates) {
  await fetchMutation(ENDPOINTS.MATERIAL_BY_ID(id), 'PUT', materialToApi(updates));
  return getMaterialById(id);
}

/**
 * 2. Movimientos de Almacén
 * Obtiene el historial de movimientos de inventario desde el backend.
 */
export async function getMovimientos() {
  const result = await fetchGet(ENDPOINTS.MOVIMIENTOS);
  return result.movimientos.map(movimientoFromApi).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Registra un nuevo movimiento en el backend (transaccional).
 */
export async function createMovimiento(movimientoData) {
  const {
    materialId,
    tipo,
    cantidad,
    origen,
    destino,
    documentoReferencia,
    motivo = '',
  } = movimientoData;

  const cant = Number(cantidad);
  if (!materialId || !tipo || !cant || cant <= 0) {
    throw new Error('El material, tipo de movimiento y una cantidad positiva son obligatorios.');
  }

  const payload = {
    id_material: Number(materialId),
    id_usuario: Number(import.meta.env.VITE_USUARIO_ID || 1),
    tipo_movimiento: tipo.toLowerCase(),
    cantidad: cant,
    documento_referencia: documentoReferencia || (tipo === 'ENTRADA' ? 'OC-S/N' : 'VS-S/N'),
    observaciones: [motivo, `Origen: ${origen || 'Bodega Central'}`, `Destino: ${destino || 'Obras'}`].filter(Boolean).join(' | '),
  };

  const response = await fetchMutation(ENDPOINTS.MOVIMIENTOS, 'POST', payload);
  const material = await getMaterialById(materialId);
  return { ...response, movimiento: movimientoFromApi({ ...response.movimiento, material: { nombre: material.nombre, unidad_medida: material.unidad } }) };
}

/**
 * 3. Órdenes de Compra
 * Obtiene todas las Órdenes de Compra registradas en el backend.
 */
export async function getOrdenesCompra() {
  const result = await fetchGet(ENDPOINTS.ORDENES);
  return ordenesFromApi(result.ordenes);
}

/**
 * Retorna materiales con Stock Actual <= Punto de Reorden (PR).
 */
export async function getAlertasReorden() {
  // Intentar endpoint especializado del backend primero
  const materiales = await getMateriales();
  return materiales
    .filter((m) => m.stockActual <= m.puntoReorden || m.estado === 'CRÍTICO' || m.estado === 'ALERTA')
    .sort((a, b) => {
      if (a.estado === 'CRÍTICO' && b.estado !== 'CRÍTICO') return -1;
      if (b.estado === 'CRÍTICO' && a.estado !== 'CRÍTICO') return 1;
      return (b.deficit || 0) - (a.deficit || 0);
    });
}

/**
 * Retorna las compras sospechosas de duplicidad aplicando la regla de negocio del Ejercicio A3.
 */
export async function getPosiblesDuplicados() {
  const [report, ordenes] = await Promise.all([fetchGet(ENDPOINTS.DUPLICADOS), getOrdenesCompra()]);
  return duplicadosFromApi(report, ordenes);
}

/**
 * Auditoría de compras fuera de contrato / sobreprecios unitarios.
 */
export async function getSobrepreciosDetectados() {
  const ordenes = await getOrdenesCompra();
  const sobreprecios = [];

  ordenes.forEach((oc) => {
    const contrato = Object.values(PRECIOS_CONTRATO_OFICIALES).find((c) => c.nombre.toLowerCase() === oc.materialNombre?.toLowerCase());
    if (contrato && oc.precioUnitario > contrato.precioContratoCRC) {
      const sobrecostoUnitario = oc.precioUnitario - contrato.precioContratoCRC;
      const sobrecostoTotal = sobrecostoUnitario * oc.cantidad;
      const porcentajeDesvio = ((sobrecostoUnitario / contrato.precioContratoCRC) * 100).toFixed(1);

      sobreprecios.push({
        id: `sp-${oc.id}`,
        ordenId: oc.id,
        numeroOC: oc.numeroOC,
        material: oc.materialNombre,
        proveedor: oc.proveedor,
        destino: oc.destino,
        fecha: oc.fecha,
        cantidad: oc.cantidad,
        unidad: oc.unidad,
        precioPagado: oc.precioUnitario,
        precioContrato: contrato.precioContratoCRC,
        proveedorContratado: contrato.proveedorContratado,
        sobrecostoTotalCRC: sobrecostoTotal,
        porcentajeDesvio: Number(porcentajeDesvio),
        motivo: `Precio unitario (₡${oc.precioUnitario.toLocaleString()}) supera precio contratado (₡${contrato.precioContratoCRC.toLocaleString()}) en un +${porcentajeDesvio}%.`,
      });
    }
  });

  return sobreprecios;
}

/**
 * Actualiza el estado administrativo de una Orden de Compra observada.
 */
export async function updateEstadoOrdenCompra(ocId, nuevoEstado, nota = '') {
  const payload = { estado: nuevoEstado, nota };
  const response = await fetchMutation(ENDPOINTS.ORDEN_ESTADO(ocId), 'PUT', payload);
  return response.orden || response;
}

/**
 * Retorna la trazabilidad y auditoría completa de un insumo específico.
 */
export async function getHistorialTrazabilidad(materialId) {
  // Intentar endpoint especializado en backend
  try {
    const res = await fetch(ENDPOINTS.MATERIAL_TRAZABILIDAD(materialId), {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { material: materialFromApi({ ...data.material, inventario: data.inventarioActual }), movimientos: data.historial.map(movimientoFromApi), ordenesCompra: [], resumen: {} };
    }
  } catch (_) {}

  // Fallback computado en frontend sobre movimientos y órdenes
  const [movimientos, ordenes, material] = await Promise.all([
    getMovimientos(),
    getOrdenesCompra(),
    getMaterialById(materialId).catch(() => null),
  ]);

  const movimientosMaterial = movimientos.filter(
    (m) => String(m.materialId) === String(materialId)
  );

  const ordenesMaterial = ordenes.filter(
    (oc) => String(oc.materialId) === String(materialId) ||
            (material && oc.materialNombre?.toLowerCase().includes(material.nombre?.toLowerCase()))
  );

  return {
    material,
    movimientos: movimientosMaterial,
    ordenesCompra: ordenesMaterial,
    resumen: {
      totalEntradas: movimientosMaterial
        .filter((m) => m.tipo === 'ENTRADA')
        .reduce((acc, m) => acc + (m.cantidad || 0), 0),
      totalSalidas: movimientosMaterial
        .filter((m) => m.tipo === 'SALIDA')
        .reduce((acc, m) => acc + (m.cantidad || 0), 0),
      totalTraslados: movimientosMaterial
        .filter((m) => m.tipo === 'TRASLADO')
        .reduce((acc, m) => acc + (m.cantidad || 0), 0),
    },
  };
}

/**
 * Restablece o solicita limpieza al backend.
 */
export async function resetToMockData() {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  return [];
}
