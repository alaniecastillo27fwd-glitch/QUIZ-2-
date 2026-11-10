import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Table as TableIcon,
  Clock,
  ShieldCheck
} from 'lucide-react';

import TrazabilidadFilter from '../components/historial/TrazabilidadFilter';
import TimelineTrazabilidad from '../components/historial/TimelineTrazabilidad';
import TrazabilidadTable from '../components/historial/TrazabilidadTable';
import { useMateriales, useMovimientos } from '../hooks/useInventory.js';
import { getOrdenesCompra } from '../services/inventoryService.js';

export default function HistorialPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const materialParam = searchParams.get('material') || 'TODOS';

  const { materiales } = useMateriales();
  const { movimientos, loading: loadingMovs } = useMovimientos();
  const [ordenesCompra, setOrdenesCompra] = useState([]);

  // Estados de filtros
  const [selectedMaterialId, setSelectedMaterialId] = useState(materialParam);
  const [tipoDocFilter, setTipoDocFilter] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('TIMELINE'); // 'TIMELINE' | 'TABLE'

  useEffect(() => {
    getOrdenesCompra().then((data) => setOrdenesCompra(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (materialParam) {
      setSelectedMaterialId(materialParam);
    }
  }, [materialParam]);

  const handleMaterialChange = (newId) => {
    setSelectedMaterialId(newId);
    if (newId === 'TODOS') {
      searchParams.delete('material');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ material: newId });
    }
  };

  const selectedMaterial = useMemo(() => {
    if (selectedMaterialId === 'TODOS') return null;
    return materiales.find((m) => String(m.id) === String(selectedMaterialId)) || null;
  }, [materiales, selectedMaterialId]);

  // Filtrado de movimientos
  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((m) => {
      // Filtro de material
      const matchesMaterial =
        selectedMaterialId === 'TODOS' || String(m.materialId) === String(selectedMaterialId);

      // Filtro de tipo de documento
      const matchesTipoDoc =
        tipoDocFilter === 'TODOS' || m.tipoDocumento === tipoDocFilter;

      // Filtro de búsqueda textual
      const matchesSearch =
        !searchTerm ||
        m.documentoReferencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.destino?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesMaterial && matchesTipoDoc && matchesSearch;
    });
  }, [movimientos, selectedMaterialId, tipoDocFilter, searchTerm]);

  // Resumen métrico del filtro
  const summaryMetrics = useMemo(() => {
    const entradas = filteredMovimientos
      .filter((m) => m.tipo === 'ENTRADA')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    const salidas = filteredMovimientos
      .filter((m) => m.tipo === 'SALIDA')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    const traslados = filteredMovimientos
      .filter((m) => m.tipo === 'TRASLADO')
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    return { entradas, salidas, traslados, total: filteredMovimientos.length };
  }, [filteredMovimientos]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="bg-white dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-darkteal dark:text-softlinen/70 font-bold text-xs tracking-wider uppercase mb-1">
            <History className="w-4 h-4 text-cayenne" />
            <span>Auditoría & Trazabilidad · Constructora Del Valle S.A.</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-evergreen dark:text-softlinen tracking-tight">
            Historial de Trazabilidad por Insumo
          </h2>
          <p className="text-sm text-darkteal dark:text-softlinen/70 mt-1 font-medium">
            Reconstrucción cronológica de existencias, vinculación directa a Órdenes de Compra (OC) y Vales de Salida a obra.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-softlinen/60 dark:bg-darkteal/60 p-1.5 rounded-xl border-2 border-darkteal/20 dark:border-darkteal/50 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('TIMELINE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === 'TIMELINE'
                ? 'bg-evergreen dark:bg-yellowgreen text-softlinen dark:text-evergreen shadow-xs'
                : 'text-darkteal dark:text-softlinen hover:text-evergreen'
            }`}
          >
            <Clock className="w-4 h-4 text-yellowgreen" />
            Línea de Tiempo
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === 'TABLE'
                ? 'bg-evergreen dark:bg-yellowgreen text-softlinen dark:text-evergreen shadow-xs'
                : 'text-darkteal dark:text-softlinen hover:text-evergreen'
            }`}
          >
            <TableIcon className="w-4 h-4 text-cayenne" />
            Vista Tabular
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <TrazabilidadFilter
        materiales={materiales}
        selectedMaterialId={selectedMaterialId}
        onMaterialChange={handleMaterialChange}
        tipoDocFilter={tipoDocFilter}
        onTipoDocChange={setTipoDocFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Summary KPI Ribbon for Selected Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-evergreen p-5 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 shadow-xs transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-softlinen/60 block">
            {selectedMaterial ? `Stock ${selectedMaterial.nombre}` : 'Insumos Evaluados'}
          </span>
          <span className="text-2xl font-black text-evergreen dark:text-softlinen mt-1 block">
            {selectedMaterial 
              ? `${Number(selectedMaterial.stockActual).toLocaleString()} ${selectedMaterial.unidad}`
              : `${materiales.length} Materiales`}
          </span>
          {selectedMaterial && (
            <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold block mt-1">
              Ubicación: {selectedMaterial.ubicacionPrincipal}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-evergreen p-5 rounded-2xl border-2 border-yellowgreen shadow-xs transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-yellowgreen block flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4" />
            Entradas Totales (OC)
          </span>
          <span className="text-2xl font-black text-evergreen dark:text-softlinen mt-1 block">
            +{summaryMetrics.entradas.toLocaleString()}
          </span>
          <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold block mt-1">
            Respaldadas con Orden de Compra
          </span>
        </div>

        <div className="bg-white dark:bg-evergreen p-5 rounded-2xl border-2 border-cayenne shadow-xs transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-cayenne block flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" />
            Salidas a Obra (Vales)
          </span>
          <span className="text-2xl font-black text-cayenne mt-1 block">
            -{summaryMetrics.salidas.toLocaleString()}
          </span>
          <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold block mt-1">
            Despachos a frentes de trabajo
          </span>
        </div>

        <div className="bg-white dark:bg-evergreen p-5 rounded-2xl border-2 border-darkteal/40 dark:border-darkteal/70 shadow-xs transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-softlinen/80 block flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-yellowgreen" />
            Reubicaciones / Traslados
          </span>
          <span className="text-2xl font-black text-evergreen dark:text-softlinen mt-1 block">
            ⇄{summaryMetrics.traslados.toLocaleString()}
          </span>
          <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold block mt-1">
            Entre Bodega y Obras
          </span>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'TIMELINE' ? (
        <div className="bg-softlinen/30 dark:bg-darkteal/20 p-6 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xs font-black text-evergreen dark:text-softlinen uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-yellowgreen" />
              Línea de Tiempo Cronológica de Trazabilidad ({filteredMovimientos.length} eventos)
            </h3>
            <span className="text-xs text-darkteal dark:text-softlinen/70 font-bold">
              Orden cronológico descendente
            </span>
          </div>

          <TimelineTrazabilidad
            movimientos={filteredMovimientos}
            ordenesCompra={ordenesCompra}
          />
        </div>
      ) : (
        <TrazabilidadTable movimientos={filteredMovimientos} />
      )}
    </div>
  );
}
