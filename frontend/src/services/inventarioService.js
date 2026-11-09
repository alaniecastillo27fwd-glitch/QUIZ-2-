/**
 * Servicio Mock para gestión de inventarios - Constructora Del Valle S.A.
 * Lógica desacoplada de la UI según lineamientos de frontend-react-structure.
 */

export const mockMateriales = [
  { id: '1', codigo: 'MAT-001', nombre: 'Cemento Gris Tipo 1 (50kg)', categoria: 'Áridos', unidad: 'Sacos', stock: 450, stockMinimo: 100, estado: 'Óptimo' },
  { id: '2', codigo: 'MAT-002', nombre: 'Varilla de Acero 1/2" x 6m', categoria: 'Estructuras', unidad: 'Unidades', stock: 85, stockMinimo: 150, estado: 'Bajo Mínimo' },
  { id: '3', codigo: 'MAT-003', nombre: 'Arena de Río Fina', categoria: 'Áridos', unidad: 'm³', stock: 32, stockMinimo: 15, estado: 'Óptimo' },
  { id: '4', codigo: 'MAT-004', nombre: 'Tubo Sanitario PVC 4"', categoria: 'Instalaciones', unidad: 'Tubos', stock: 120, stockMinimo: 50, estado: 'Óptimo' },
];

export const getMateriales = async () => {
  // Simulación de llamada asíncrona
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockMateriales]), 100);
  });
};

export const getResumenEstadisticas = async () => {
  return {
    totalMateriales: 1248,
    movimientosHoy: 42,
    alertasCriticas: 5,
    tasaAbastecimiento: '98.2%',
  };
};

