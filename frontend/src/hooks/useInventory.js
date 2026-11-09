import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getMateriales,
  getMaterialById,
  createMaterial,
  updateMaterial,
  getMovimientos,
  createMovimiento,
  getAlertasReorden,
  getPosiblesDuplicados,
  getSobrepreciosDetectados,
  updateEstadoOrdenCompra,
  getHistorialTrazabilidad,
  resetToMockData,
} from '../services/inventoryService.js';

/**
 * Hook para la gestión del catálogo de materiales y sus métricas calculadas (SS, PR, Estado).
 */
export function useMateriales() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMateriales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMateriales();
      setMateriales(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los materiales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMateriales();
  }, [fetchMateriales]);

  const addMaterial = async (materialData) => {
    try {
      const created = await createMaterial(materialData);
      setMateriales((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      throw new Error(err.message || 'Error al crear el material.');
    }
  };

  const editMaterial = async (id, updates) => {
    try {
      const updated = await updateMaterial(id, updates);
      setMateriales((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar el material.');
    }
  };

  const resetSeeds = async () => {
    setLoading(true);
    try {
      const data = await resetToMockData();
      setMateriales(data);
    } catch (err) {
      setError(err.message || 'Error al restablecer datos semilla.');
    } finally {
      setLoading(false);
    }
  };

  return {
    materiales,
    loading,
    error,
    fetchMateriales,
    addMaterial,
    editMaterial,
    resetSeeds,
  };
}

/**
 * Hook reactivo para alertas de reabastecimiento crítico y compras duplicadas.
 */
export function useAlertas() {
  const [alertasStock, setAlertasStock] = useState([]);
  const [posiblesDuplicados, setPosiblesDuplicados] = useState([]);
  const [sobreprecios, setSobreprecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAlertas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reorden, duplicados, sobrepreciosData] = await Promise.all([
        getAlertasReorden(),
        getPosiblesDuplicados(),
        getSobrepreciosDetectados(),
      ]);
      setAlertasStock(reorden);
      setPosiblesDuplicados(duplicados);
      setSobreprecios(sobrepreciosData);
    } catch (err) {
      setError(err.message || 'Error al cargar las alertas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAlertas();
  }, [refreshAlertas]);

  const updateOCStatus = async (ocId, nuevoEstado, nota) => {
    try {
      const updated = await updateEstadoOrdenCompra(ocId, nuevoEstado, nota);
      await refreshAlertas();
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar Orden de Compra.');
    }
  };

  // Cálculo de fuga de valor estimada en octubre (duplicados + sobrecostos)
  const fugaEstimadaCRC = useMemo(() => {
    const fugaDuplicados = posiblesDuplicados.reduce((acc, d) => acc + (d.impactoEconomicoCRC || 0), 0);
    const fugaSobreprecios = sobreprecios.reduce((acc, sp) => acc + (sp.sobrecostoTotalCRC || 0), 0);
    return fugaDuplicados + fugaSobreprecios;
  }, [posiblesDuplicados, sobreprecios]);

  return {
    alertasStock,
    posiblesDuplicados,
    sobreprecios,
    fugaEstimadaCRC,
    totalAlertas: alertasStock.length + posiblesDuplicados.length + sobreprecios.length,
    loading,
    error,
    refreshAlertas,
    updateOCStatus,
  };
}

/**
 * Hook para consulta y registro transaccional de movimientos de almacén.
 */
export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovimientos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMovimientos();
      setMovimientos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los movimientos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  const registerMovimiento = async (movimientoData) => {
    try {
      const result = await createMovimiento(movimientoData);
      setMovimientos((prev) => [result.movimiento, ...prev]);
      return result;
    } catch (err) {
      throw new Error(err.message || 'Error al registrar el movimiento.');
    }
  };

  return {
    movimientos,
    loading,
    error,
    fetchMovimientos,
    registerMovimiento,
  };
}

/**
 * Hook para la trazabilidad y auditoría completa de un insumo específico.
 */
export function useTrazabilidad(materialId) {
  const [trazabilidad, setTrazabilidad] = useState(null);
  const [loading, setLoading] = useState(Boolean(materialId));
  const [error, setError] = useState(null);

  const fetchTrazabilidad = useCallback(async () => {
    if (!materialId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getHistorialTrazabilidad(materialId);
      setTrazabilidad(data);
    } catch (err) {
      setError(err.message || 'Error al cargar trazabilidad.');
    } finally {
      setLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    fetchTrazabilidad();
  }, [fetchTrazabilidad]);

  return {
    trazabilidad,
    loading,
    error,
    refresh: fetchTrazabilidad,
  };
}

