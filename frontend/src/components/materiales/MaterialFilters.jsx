import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export default function MaterialFilters({
  searchTerm,
  onSearchChange,
  ubicacionFilter,
  onUbicacionChange,
  estadoFilter,
  onEstadoChange,
  onResetFilters,
  totalResults = 0,
}) {
  const hasActiveFilters = searchTerm !== '' || ubicacionFilter !== 'TODAS' || estadoFilter !== 'TODOS';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por código (ej. CEM-50KG) o nombre del material..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Ubicación Dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-slate-500 hidden md:block">Ubicación:</label>
          <select
            value={ubicacionFilter}
            onChange={(e) => onUbicacionChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="TODAS">Todas las Bodegas</option>
            <option value="Bodega Central">Bodega Central</option>
            <option value="Obras">Obras</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        {/* Estado Dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-semibold text-slate-500 hidden md:block">Estado:</label>
          <select
            value={estadoFilter}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ÓPTIMO">Óptimo</option>
            <option value="ALERTA">Alerta</option>
            <option value="CRÍTICO">Crítico / Reponer Hoy</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            title="Restablecer filtros"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Limpiar</span>
          </button>
        )}
      </div>

      <div className="text-right text-[11px] text-slate-600 shrink-0 font-medium sm:pl-2">
        {totalResults} {totalResults === 1 ? 'material' : 'materiales'}
      </div>
    </div>
  );
}

