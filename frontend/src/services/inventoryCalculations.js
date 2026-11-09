/**
 * Funciones matemáticas puras y reglas de negocio para inventario.
 * Constructora Del Valle S.A. - Opción 2 del Quiz #2.
 */

/**
 * 1. Cálculo del Stock de Seguridad (SS)
 * SS = (demanda diaria máxima - demanda diaria promedio) * L
 * 
 * @param {number} demandaDiariaMaxima 
 * @param {number} demandaDiariaPromedio 
 * @param {number} tiempoEntregaDias 
 * @returns {number} Stock de Seguridad redondeado al entero superior
 */
export function calculateStockSeguridad(demandaDiariaMaxima, demandaDiariaPromedio, tiempoEntregaDias) {
  const dMax = Number(demandaDiariaMaxima) || 0;
  const dProm = Number(demandaDiariaPromedio) || 0;
  const L = Number(tiempoEntregaDias) || 0;

  if (dMax < dProm || L <= 0) return 0;
  return Math.ceil((dMax - dProm) * L);
}

/**
 * 2. Cálculo del Punto de Reorden (PR)
 * PR = (d * L) + SS
 * Regla: El PR nunca se ingresa a mano; es reactivo a la demanda y tiempo de entrega.
 * 
 * @param {number} demandaDiariaPromedio 
 * @param {number} tiempoEntregaDias 
 * @param {number} stockSeguridad 
 * @returns {number} Punto de Reorden
 */
export function calculatePuntoReorden(demandaDiariaPromedio, tiempoEntregaDias, stockSeguridad) {
  const d = Number(demandaDiariaPromedio) || 0;
  const L = Number(tiempoEntregaDias) || 0;
  const ss = Number(stockSeguridad) || 0;

  const consumoDurantePlazo = d * L;
  return Math.ceil(consumoDurantePlazo + ss);
}

/**
 * 3. Determinación de Estado del Material
 * - CRÍTICO: Stock Actual <= PR (Riesgo inminente de quiebre)
 * - ALERTA: Stock Actual <= PR * 1.15 (Próximo al punto de reorden, margen preventivo 15%)
 * - ÓPTIMO: Stock Actual > PR * 1.15
 * 
 * @param {number} stockActual 
 * @param {number} puntoReorden 
 * @returns {'CRÍTICO' | 'ALERTA' | 'ÓPTIMO'}
 */
export function determineMaterialStatus(stockActual, puntoReorden) {
  const stock = Number(stockActual) || 0;
  const pr = Number(puntoReorden) || 0;

  if (stock <= pr) {
    return 'CRÍTICO';
  }
  if (stock <= pr * 1.15) {
    return 'ALERTA';
  }
  return 'ÓPTIMO';
}

/**
 * Enriquece un material con sus métricas calculadas automáticamente.
 * @param {object} material 
 * @returns {object} Material con SS, PR, estado y déficit
 */
export function enrichMaterialMetrics(material) {
  const ss = calculateStockSeguridad(
    material.demandaDiariaMaxima,
    material.demandaDiariaPromedio,
    material.tiempoEntregaDias
  );
  const pr = calculatePuntoReorden(
    material.demandaDiariaPromedio,
    material.tiempoEntregaDias,
    ss
  );
  const estado = determineMaterialStatus(material.stockActual, pr);
  const umbralAlerta = Math.ceil(pr * 1.15);
  const deficit = material.stockActual < pr ? pr - material.stockActual : 0;

  return {
    ...material,
    stockSeguridad: ss,
    puntoReorden: pr,
    umbralAlerta,
    estado,
    deficit,
    necesitaReorden: material.stockActual <= pr,
  };
}

/**
 * 4. Regla de Detección de Compras Duplicadas (Ejercicio A3)
 * Detectar órdenes con:
 * - Mismo proveedor
 * - Mismo artículo (materialId o materialNombre)
 * - Cantidad idéntica o con diferencia menor o igual al 5%
 * - Fecha emitida con diferencia menor a 72 horas (3 días)
 * 
 * @param {Array<object>} ordenesCompra 
 * @returns {Array<object>} Lista de pares o grupos de OCs sospechosas con explicación técnica
 */
export function detectDuplicatePurchaseOrders(ordenesCompra = []) {
  const sospechosas = [];
  const processedPairs = new Set();

  for (let i = 0; i < ordenesCompra.length; i++) {
    for (let j = i + 1; j < ordenesCompra.length; j++) {
      const oc1 = ordenesCompra[i];
      const oc2 = ordenesCompra[j];

      // Mismo proveedor
      const mismoProveedor = oc1.proveedor.trim().toLowerCase() === oc2.proveedor.trim().toLowerCase();
      if (!mismoProveedor) continue;

      // Mismo material
      const mismoMaterial = 
        (oc1.materialId && oc2.materialId && oc1.materialId === oc2.materialId) ||
        (oc1.materialNombre.trim().toLowerCase() === oc2.materialNombre.trim().toLowerCase());
      if (!mismoMaterial) continue;

      // Diferencia temporal <= 72 horas
      const fecha1 = new Date(oc1.fecha).getTime();
      const fecha2 = new Date(oc2.fecha).getTime();
      const horasDiferencia = Math.abs(fecha1 - fecha2) / (1000 * 60 * 60);
      if (horasDiferencia > 72) continue;

      // Diferencia de cantidad <= 5%
      const c1 = Number(oc1.cantidad) || 0;
      const c2 = Number(oc2.cantidad) || 0;
      const maxCant = Math.max(c1, c2);
      const diffCant = Math.abs(c1 - c2);
      const porcentajeDiferencia = maxCant > 0 ? (diffCant / maxCant) * 100 : 0;

      if (porcentajeDiferencia <= 5) {
        const pairKey = [oc1.id, oc2.id].sort().join('___');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          sospechosas.push({
            id: `dup-${oc1.numeroOC}-${oc2.numeroOC}`,
            ocA: oc1,
            ocB: oc2,
            material: oc1.materialNombre,
            proveedor: oc1.proveedor,
            diferenciaHoras: Math.round(horasDiferencia),
            diferenciaPorcentual: Number(porcentajeDiferencia.toFixed(1)),
            impactoEconomicoCRC: oc2.total,
            motivo: `Posible duplicidad entre ${oc1.numeroOC} y ${oc2.numeroOC}: mismo proveedor (${oc1.proveedor}), mismo material, diferencia de cantidad del ${porcentajeDiferencia.toFixed(1)}% emitida con ${Math.round(horasDiferencia)}h de diferencia.`,
            severidad: porcentajeDiferencia === 0 ? 'CRÍTICA' : 'ALERTA',
          });
        }
      }
    }
  }

  return sospechosas;
}

/**
 * Formateo consistente de moneda costarricense (CRC ₡).
 * @param {number} amount 
 * @returns {string} Ej: ₡1 290 000
 */
export function formatCRC(amount) {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('es-CR', {
    maximumFractionDigits: 0,
  }).replace(/,/g, ' ');
  return `₡${formatted}`;
}

/**
 * Formateo de fechas a nivel local (DD/MM/YYYY o con hora).
 * @param {string | Date} dateInput 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export function formatFechaLocal(dateInput, includeTime = false) {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

