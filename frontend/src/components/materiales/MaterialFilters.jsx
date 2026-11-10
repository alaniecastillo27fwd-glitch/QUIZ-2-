import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

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
    <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal p-5 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-5 h-5 text-darkteal/60 dark:text-softlinen/60 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por código (ej. CEM-50KG) o nombre del material..."
          className="w-full bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold focus:bg-white dark:focus:bg-evergreen focus:outline-hidden focus:border-yellowgreen transition-all text-evergreen dark:text-softlinen placeholder-darkteal/50 dark:placeholder-softlinen/40"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Ubicación Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-darkteal dark:text-yellowgreen uppercase tracking-wide hidden md:block">
            Ubicación:
          </label>
          <select
            value={ubicacionFilter}
            onChange={(e) => onUbicacionChange(e.target.value)}
            className="bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3 py-2 text-sm text-evergreen dark:text-softlinen font-bold focus:outline-hidden focus:border-yellowgreen cursor-pointer"
          >
            <option value="TODAS">Todas las Bodegas</option>
            <option value="Bodega Central">Bodega Central</option>
            <option value="Obras">Obras</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        {/* Estado Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-darkteal dark:text-yellowgreen uppercase tracking-wide hidden md:block">
            Estado:
          </label>
          <select
            value={estadoFilter}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3 py-2 text-sm text-evergreen dark:text-softlinen font-bold focus:outline-hidden focus:border-yellowgreen cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cayenne text-white text-xs font-bold transition-all transform hover:scale-105 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Limpiar</span>
          </button>
        )}
      </div>

      <div className="text-right text-xs md:text-sm text-darkteal dark:text-softlinen/80 shrink-0 font-extrabold sm:pl-2">
        {totalResults} {totalResults === 1 ? 'material' : 'materiales'}
      </div>
    </div>
  );
}
