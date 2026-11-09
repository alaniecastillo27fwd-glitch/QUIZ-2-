import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  History, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  ListFilter, 
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
        m.documentoReferencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.destino.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesMaterial && matchesTipoDoc && matchesSearch;
    });
  }, [movimientos, selectedMaterialId, tipoDocFilter, searchTerm]);

  // Resumen métrico del filtro
  const summaryMetrics = useMemo(() => {
    const entradas = filteredMovimientos
      .filter((m) => m.tipo === 'ENTRADA')
      .reduce((acc, m) => acc + m.cantidad, 0);

    const salidas = filteredMovimientos
      .filter((m) => m.tipo === 'SALIDA')
      .reduce((acc, m) => acc + m.cantidad, 0);

    const traslados = filteredMovimientos
      .filter((m) => m.tipo === 'TRASLADO')
      .reduce((acc, m) => acc + m.cantidad, 0);

    return { entradas, salidas, traslados, total: filteredMovimientos.length };
  }, [filteredMovimientos]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-1">
            <History className="w-4 h-4 text-amber-500" />
            <span>Auditoría & Trazabilidad · Constructora Del Valle S.A.</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Historial de Trazabilidad por Insumo
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Reconstrucción cronológica de existencias, vinculación directa a Órdenes de Compra (OC) y Vales de Salida a obra.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('TIMELINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'TIMELINE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Línea de Tiempo
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'TABLE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {selectedMaterial ? `Stock ${selectedMaterial.nombre}` : 'Insumos Evaluados'}
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {selectedMaterial 
              ? `${selectedMaterial.stockActual.toLocaleString()} ${selectedMaterial.unidad}`
              : `${materiales.length} Materiales`}
          </span>
          {selectedMaterial && (
            <span className="text-[11px] text-slate-500 font-medium">
              Ubicación: {selectedMaterial.ubicacionPrincipal}
            </span>
          )}
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Entradas Totales (vía OC)
          </span>
          <span className="text-xl font-black text-emerald-950 mt-1 block">
            +{summaryMetrics.entradas.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">
            Respaldadas con Orden de Compra
          </span>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Salidas a Obra (Vales)
          </span>
          <span className="text-xl font-black text-rose-950 mt-1 block">
            -{summaryMetrics.salidas.toLocaleString()}
          </span>
          <span className="text-[11px] text-rose-700 font-medium">
            Despachos a frentes de trabajo
          </span>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block flex items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Reubicaciones / Traslados
          </span>
          <span className="text-xl font-black text-blue-950 mt-1 block">
            ⇄{summaryMetrics.traslados.toLocaleString()}
          </span>
          <span className="text-[11px] text-blue-700 font-medium">
            Entre Bodega y Obras
          </span>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'TIMELINE' ? (
        <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/80">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Línea de Tiempo Cronológica de Trazabilidad ({filteredMovimientos.length} eventos)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Orden cronológico descendente (más recientes primero)
            </span>
          </div>

          <TimelineTrazabilidad
            movimientos={filteredMovimientos}
            ordenesCompra={ordenesCompra}
            material={selectedMaterial}
          />
        </div>
      ) : (
        <TrazabilidadTable movimientos={filteredMovimientos} />
      )}
    </div>
  );
}
