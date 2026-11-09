/**
 * Servicio de Inventario y Mock API con persistencia en localStorage.
 * Constructora Del Valle S.A. - Opción 2 del Quiz #2.
 * Arquitectura desacoplada según frontend-react-structure.
 */

import {
  INITIAL_MATERIALES,
  INITIAL_ORDENES_COMPRA,
  INITIAL_MOVIMIENTOS,
} from './mockData.js';

import {
  enrichMaterialMetrics,
  detectDuplicatePurchaseOrders,
} from './inventoryCalculations.js';

import { USE_MOCK_DATA, PRECIOS_CONTRATO_OFICIALES, ENDPOINTS } from './apiConfig.js';

const STORAGE_KEYS = {
  MATERIALES: 'cdv_materiales_v1',
  MOVIMIENTOS: 'cdv_movimientos_v1',
  ORDENES: 'cdv_ordenes_compra_v1',
};

// Simulación de latencia de red para API REST asíncrona (100-250ms)
const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Inicializa el almacenamiento en localStorage si no existen las llaves.
 */
function ensureStorageInitialized() {
  if (typeof localStorage === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.MATERIALES)) {
    localStorage.setItem(STORAGE_KEYS.MATERIALES, JSON.stringify(INITIAL_MATERIALES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDENES)) {
    localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_COMPRA));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOVIMIENTOS)) {
    localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(INITIAL_MOVIMIENTOS));
  }
}

/**
 * Obtiene todos los materiales con sus métricas calculadas reactivamente (SS, PR, Estado).
 */
export async function getMateriales() {
  await sleep();
  ensureStorageInitialized();

  const raw = localStorage.getItem(STORAGE_KEYS.MATERIALES);
  const items = raw ? JSON.parse(raw) : INITIAL_MATERIALES;

  return items.map((m) => enrichMaterialMetrics(m));
}

/**
 * Obtiene un material por su ID con métricas enriquecidas.
 */
export async function getMaterialById(id) {
  await sleep();
  ensureStorageInitialized();

  const raw = localStorage.getItem(STORAGE_KEYS.MATERIALES);
  const items = raw ? JSON.parse(raw) : INITIAL_MATERIALES;
  const found = items.find((m) => String(m.id) === String(id));

  if (!found) {
    throw new Error(`Material con ID ${id} no encontrado en inventario`);
  }

  return enrichMaterialMetrics(found);
}

/**
 * Crea un nuevo material en el catálogo calculando automáticamente su PR.
 */
export async function createMaterial(data) {
  await sleep();
  ensureStorageInitialized();

  if (!data.nombre || !data.codigo) {
    throw new Error('El código y el nombre del material son obligatorios.');
  }

  const raw = localStorage.getItem(STORAGE_KEYS.MATERIALES);
  const items = raw ? JSON.parse(raw) : [];

  // Validar código único
  if (items.some((m) => m.codigo.trim().toLowerCase() === data.codigo.trim().toLowerCase())) {
    throw new Error(`Ya existe un material registrado con el código ${data.codigo}.`);
  }

  const newMaterial = {
    id: `mat-${Date.now()}`,
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

  items.unshift(newMaterial);
  localStorage.setItem(STORAGE_KEYS.MATERIALES, JSON.stringify(items));

  return enrichMaterialMetrics(newMaterial);
}

/**
 * Actualiza los datos o parámetros de demanda/lead time de un material.
 */
export async function updateMaterial(id, updates) {
  await sleep();
  ensureStorageInitialized();

  const raw = localStorage.getItem(STORAGE_KEYS.MATERIALES);
  const items = raw ? JSON.parse(raw) : [];
  const index = items.findIndex((m) => String(m.id) === String(id));

  if (index === -1) {
    throw new Error(`Material con ID ${id} no encontrado para actualizar.`);
  }

  const updated = {
    ...items[index],
    ...updates,
    demandaDiariaPromedio: Number(updates.demandaDiariaPromedio ?? items[index].demandaDiariaPromedio),
    demandaDiariaMaxima: Number(updates.demandaDiariaMaxima ?? items[index].demandaDiariaMaxima),
    tiempoEntregaDias: Number(updates.tiempoEntregaDias ?? items[index].tiempoEntregaDias),
    stockActual: Number(updates.stockActual ?? items[index].stockActual),
  };

  items[index] = updated;
  localStorage.setItem(STORAGE_KEYS.MATERIALES, JSON.stringify(items));

  return enrichMaterialMetrics(updated);
}

/**
 * Obtiene la lista completa de movimientos de almacén.
 */
export async function getMovimientos() {
  await sleep();
  ensureStorageInitialized();

  const raw = localStorage.getItem(STORAGE_KEYS.MOVIMIENTOS);
  const items = raw ? JSON.parse(raw) : INITIAL_MOVIMIENTOS;
  // Orden descendente por fecha
  return items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Registra un nuevo movimiento y actualiza de forma transaccional el stock del material.
 * Soporta:
 * - ENTRADA: incrementa stock (+). Requiere documento OC o Factura.
 * - SALIDA: descuenta stock (-). Requiere Vale de Salida. Valida stock suficiente.
 * - TRASLADO: movimiento entre ubicaciones (Bodega Central <-> Obras).
 */
export async function createMovimiento(movimientoData) {
  await sleep();
  ensureStorageInitialized();

  const {
    materialId,
    tipo, // 'ENTRADA' | 'SALIDA' | 'TRASLADO'
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

  // 1. Obtener y validar el material
  const rawMat = localStorage.getItem(STORAGE_KEYS.MATERIALES);
  const materiales = rawMat ? JSON.parse(rawMat) : [];
  const matIndex = materiales.findIndex((m) => String(m.id) === String(materialId));

  if (matIndex === -1) {
    throw new Error('El material seleccionado no existe en el catálogo.');
  }

  const material = materiales[matIndex];

  // 2. Transacción de Stock
  let nuevoStock = Number(material.stockActual) || 0;

  if (tipo === 'ENTRADA') {
    nuevoStock += cant;
  } else if (tipo === 'SALIDA') {
    if (nuevoStock < cant) {
      throw new Error(
        `Stock insuficiente para salida. Stock actual: ${nuevoStock} ${material.unidad}, cantidad solicitada: ${cant} ${material.unidad}.`
      );
    }
    nuevoStock -= cant;
  } else if (tipo === 'TRASLADO') {
    // En un traslado interno entre bodegas el stock global consolidado se mantiene,
    // o bien se transfiere entre frentes. Validamos que haya existencias para trasladar.
    if (nuevoStock < cant) {
      throw new Error(
        `Stock insuficiente para traslado. Disponible: ${nuevoStock} ${material.unidad}.`
      );
    }
  } else {
    throw new Error(`Tipo de movimiento '${tipo}' no soportado.`);
  }

  // 3. Persistir material actualizado
  material.stockActual = nuevoStock;
  materiales[matIndex] = material;
  localStorage.setItem(STORAGE_KEYS.MATERIALES, JSON.stringify(materiales));

  // 4. Crear registro inmutable de movimiento
  const rawMov = localStorage.getItem(STORAGE_KEYS.MOVIMIENTOS);
  const movimientos = rawMov ? JSON.parse(rawMov) : [];

  const nuevoMovimiento = {
    id: `mov-${Date.now()}`,
    materialId: material.id,
    materialNombre: material.nombre,
    tipo,
    cantidad: cant,
    unidad: material.unidad,
    origen: origen || 'Bodega Central',
    destino: destino || 'Obras',
    documentoReferencia: documentoReferencia || (tipo === 'ENTRADA' ? 'OC-S/N' : 'VS-S/N'),
    tipoDocumento: tipoDocumento || (tipo === 'ENTRADA' ? 'ORDEN_COMPRA' : 'VALE_SALIDA'),
    usuario,
    fecha: new Date().toISOString(),
    motivo,
    stockResultante: nuevoStock,
  };

  movimientos.unshift(nuevoMovimiento);
  localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(movimientos));

  return {
    movimiento: nuevoMovimiento,
    materialActualizado: enrichMaterialMetrics(material),
  };
}

/**
 * Obtiene todas las Órdenes de Compra registradas.
 */
export async function getOrdenesCompra() {
  await sleep();
  ensureStorageInitialized();

  const raw = localStorage.getItem(STORAGE_KEYS.ORDENES);
  return raw ? JSON.parse(raw) : INITIAL_ORDENES_COMPRA;
}

/**
 * Retorna materiales con Stock Actual <= Punto de Reorden (PR),
 * ordenados por gravedad del déficit.
 */
export async function getAlertasReorden() {
  const materiales = await getMateriales();
  return materiales
    .filter((m) => m.stockActual <= m.puntoReorden || m.estado === 'CRÍTICO' || m.estado === 'ALERTA')
    .sort((a, b) => {
      // Prioridad a CRÍTICOS y luego a mayor déficit porcentual
      if (a.estado === 'CRÍTICO' && b.estado !== 'CRÍTICO') return -1;
      if (b.estado === 'CRÍTICO' && a.estado !== 'CRÍTICO') return 1;
      return b.deficit - a.deficit;
    });
}

/**
 * Retorna las compras sospechosas de duplicidad aplicando la regla de negocio del Ejercicio A3.
 */
export async function getPosiblesDuplicados() {
  const ordenes = await getOrdenesCompra();
  return detectDuplicatePurchaseOrders(ordenes);
}

/**
 * Auditoría de compras fuera de contrato / sobreprecios unitarios.
 */
export async function getSobrepreciosDetectados() {
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
 * Estados: 'RECIBIDA' | 'OBSERVADA' | 'REVISADA' | 'PAGO_RETENIDO' | 'ANULADA'
 */
export async function updateEstadoOrdenCompra(ocId, nuevoEstado, nota = '') {
  await sleep(100);
  ensureStorageInitialized();

  const raw = localStorage.getItem(STORAGE_KEYS.ORDENES);
  const ordenes = raw ? JSON.parse(raw) : INITIAL_ORDENES_COMPRA;
  const index = ordenes.findIndex((o) => o.id === ocId || o.numeroOC === ocId);

  if (index === -1) {
    throw new Error(`Orden de Compra ${ocId} no encontrada.`);
  }

  ordenes[index].estado = nuevoEstado;
  if (nota) ordenes[index].nota = nota;
  localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(ordenes));

  return ordenes[index];
}

/**
 * Retorna la cadena completa de movimientos y compras vinculadas a un material específico
 * (trazabilidad inmutable de entradas y consumos en obras).
 */
export async function getHistorialTrazabilidad(materialId) {
  const [movimientos, ordenes, material] = await Promise.all([
    getMovimientos(),
    getOrdenesCompra(),
    getMaterialById(materialId),
  ]);

  const movimientosMaterial = movimientos.filter(
    (m) => String(m.materialId) === String(materialId)
  );

  const ordenesMaterial = ordenes.filter(
    (oc) => String(oc.materialId) === String(materialId) ||
            oc.materialNombre.toLowerCase().includes(material.nombre.toLowerCase())
  );

  return {
    material,
    movimientos: movimientosMaterial,
    ordenesCompra: ordenesMaterial,
    resumen: {
      totalEntradas: movimientosMaterial
        .filter((m) => m.tipo === 'ENTRADA')
        .reduce((acc, m) => acc + m.cantidad, 0),
      totalSalidas: movimientosMaterial
        .filter((m) => m.tipo === 'SALIDA')
        .reduce((acc, m) => acc + m.cantidad, 0),
      totalTraslados: movimientosMaterial
        .filter((m) => m.tipo === 'TRASLADO')
        .reduce((acc, m) => acc + m.cantidad, 0),
    },
  };
}

/**
 * Restablece los datos de prueba a los valores semilla originales de Constructora Del Valle S.A.
 */
export async function resetToMockData() {
  await sleep(150);
  localStorage.setItem(STORAGE_KEYS.MATERIALES, JSON.stringify(INITIAL_MATERIALES));
  localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_COMPRA));
  localStorage.setItem(STORAGE_KEYS.MOVIMIENTOS, JSON.stringify(INITIAL_MOVIMIENTOS));
  return getMateriales();
}

