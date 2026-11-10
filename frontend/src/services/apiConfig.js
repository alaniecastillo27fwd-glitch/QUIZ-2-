/**
 * Configuración de API y conectividad para Backend Real y Mock Local.
 * Constructora Del Valle S.A. - Control de Inventario.
 */

export const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  || 'http://localhost:3000/api';

// Flag de conmutación: false por defecto para operar directamente contra el backend real
export const USE_MOCK_DATA = 
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true'
    ? true
    : false;

// Precios de contrato oficiales vigentes para auditoría de sobreprecios (Ejercicio A3)
export const PRECIOS_CONTRATO_OFICIALES = {
  'mat-001': {
    nombre: 'Cemento gris 50 kg',
    proveedorContratado: 'Proveedor A',
    precioContratoCRC: 6300,
  },
  'mat-002': {
    nombre: 'Varilla #3 grado 40',
    proveedorContratado: 'Proveedor C',
    precioContratoCRC: 2050,
  },
  'mat-003': {
    nombre: 'Block 12x20x40',
    proveedorContratado: 'Proveedor Concretera Valle',
    precioContratoCRC: 550,
  },
  'mat-004': {
    nombre: 'Arena (m³)',
    proveedorContratado: 'Tajo El Río',
    precioContratoCRC: 17500,
  },
};

// Mapeo exhaustivo de endpoints de la API REST real para el Integrante de Backend
export const ENDPOINTS = {
  MATERIALES: `${API_BASE_URL}/materiales`,
  MATERIAL_BY_ID: (id) => `${API_BASE_URL}/materiales/${id}`,
  MATERIAL_STOCK: (id) => `${API_BASE_URL}/materiales/${id}/stock`,
  MATERIAL_TRAZABILIDAD: (id) => `${API_BASE_URL}/materiales/${id}/historial`,
  MOVIMIENTOS: `${API_BASE_URL}/movimientos`,
  ORDENES: `${API_BASE_URL}/ordenes`,
  ORDEN_ESTADO: (id) => `${API_BASE_URL}/ordenes/${id}/estado`,
  ALERTAS_REORDEN: `${API_BASE_URL}/alertas/reorden`,
  DUPLICADOS: `${API_BASE_URL}/ordenes/posibles-duplicados`,
  SOBREPRECIOS: `${API_BASE_URL}/ordenes/sobreprecios`,
};
