/**
 * Servicio de Inventario y Conectividad REST API.
 * Constructora Del Valle S.A. - Control de Inventario.
 * Diseñado para la integración directa con el Backend Express/PostgreSQL.
 */

import {
  enrichMaterialMetrics,
  detectDuplicatePurchaseOrders,
} from './inventoryCalculations.js';

import {
  API_BASE_URL,
  ENDPOINTS,
  PRECIOS_CONTRATO_OFICIALES,
} from './apiConfig.js';

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
async function fetchGet(url, fallback = []) {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[REST API] HTTP ${res.status} al consultar ${url}`);
      return fallback;
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || fallback);
  } catch (err) {
    // Backend offline / en desarrollo: retornar estructura limpia vacía
    console.info(`[REST API] Conexión pendiente con backend (${url}): ${err.message}. Retornando lista vacía.`);
    return fallback;
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
      throw new Error(errBody.message || `Error del servidor HTTP ${res.status}`);
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
  const rawList = await fetchGet(ENDPOINTS.MATERIALES, []);
  return rawList.map((m) => enrichMaterialMetrics(m));
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
    return enrichMaterialMetrics(item);
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

  const payload = {
    codigo: data.codigo.trim().toUpperCase(),
    nombre: data.nombre.trim(),
    categoria: data.categoria || 'General',
    unidad: data.unidad || 'unid',
    demandaDiariaPromedio: Number(data.demandaDiariaPromedio) || 0,
    demandaDiariaMaxima: Number(data.demandaDiariaMaxima) || Number(data.demandaDiariaPromedio) || 0,
    tiempoEntregaDias: Number(data.tiempoEntregaDias) || 1,
    stockActual: Number(data.stockActual) || 0,
    ubicacionPrincipal: data.ubicacionPrincipal || 'Bodega Central',
    precioUnitarioPromedio: Number(data.precioUnitarioPromedio) || 0,
  };

  const response = await fetchMutation(ENDPOINTS.MATERIALES, 'POST', payload);
  const created = response.data || response;
  return enrichMaterialMetrics(created);
}

/**
 * Actualiza los parámetros de un material en el backend.
 */
export async function updateMaterial(id, updates) {
  const response = await fetchMutation(ENDPOINTS.MATERIAL_BY_ID(id), 'PUT', updates);
  const updated = response.data || response;
  return enrichMaterialMetrics(updated);
}

/**
 * 2. Movimientos de Almacén
 * Obtiene el historial de movimientos de inventario desde el backend.
 */
export async function getMovimientos() {
  const rawMovs = await fetchGet(ENDPOINTS.MOVIMIENTOS, []);
  return rawMovs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
    tipoDocumento,
    usuario = 'Alanie Rodríguez (Bodega)',
    motivo = '',
  } = movimientoData;

  const cant = Number(cantidad);
  if (!materialId || !tipo || !cant || cant <= 0) {
    throw new Error('El material, tipo de movimiento y una cantidad positiva son obligatorios.');
  }

  const payload = {
    materialId,
    tipo,
    cantidad: cant,
    origen: origen || 'Bodega Central',
    destino: destino || 'Obras',
    documentoReferencia: documentoReferencia || (tipo === 'ENTRADA' ? 'OC-S/N' : 'VS-S/N'),
    tipoDocumento: tipoDocumento || (tipo === 'ENTRADA' ? 'ORDEN_COMPRA' : 'VALE_SALIDA'),
    usuario,
    motivo,
  };

  const response = await fetchMutation(ENDPOINTS.MOVIMIENTOS, 'POST', payload);
  return response.data || response;
}

/**
 * 3. Órdenes de Compra
 * Obtiene todas las Órdenes de Compra registradas en el backend.
 */
export async function getOrdenesCompra() {
  return await fetchGet(ENDPOINTS.ORDENES, []);
}

/**
 * Retorna materiales con Stock Actual <= Punto de Reorden (PR).
 */
export async function getAlertasReorden() {
  // Intentar endpoint especializado del backend primero
  const backendAlerts = await fetchGet(ENDPOINTS.ALERTAS_REORDEN, null);
  if (backendAlerts && Array.isArray(backendAlerts) && backendAlerts.length > 0) {
    return backendAlerts.map((m) => enrichMaterialMetrics(m));
  }

  // Si el backend no tiene endpoint especializado, calcular reactivamente sobre materiales
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
  const backendDuplicados = await fetchGet(ENDPOINTS.DUPLICADOS, null);
  if (backendDuplicados && Array.isArray(backendDuplicados)) {
    return backendDuplicados;
  }

  const ordenes = await getOrdenesCompra();
  return detectDuplicatePurchaseOrders(ordenes);
}

/**
 * Auditoría de compras fuera de contrato / sobreprecios unitarios.
 */
export async function getSobrepreciosDetectados() {
  const backendSobreprecios = await fetchGet(ENDPOINTS.SOBREPRECIOS, null);
  if (backendSobreprecios && Array.isArray(backendSobreprecios)) {
    return backendSobreprecios;
  }

  const ordenes = await getOrdenesCompra();
  const sobreprecios = [];

  ordenes.forEach((oc) => {
    const contrato = PRECIOS_CONTRATO_OFICIALES[oc.materialId];
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
  return response.data || response;
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
      return data.data || data;
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
