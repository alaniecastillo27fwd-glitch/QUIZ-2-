import React from 'react';
import { Filter, Boxes, FileText, Search } from 'lucide-react';

export default function TrazabilidadFilter({
  materiales = [],
  selectedMaterialId,
  onMaterialChange,
  tipoDocFilter,
  onTipoDocChange,
  searchTerm,
  onSearchChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      {/* Selector de Material Específico */}
      <div className="flex-1">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
          <Boxes className="w-3.5 h-3.5 text-amber-500" />
          Insumo a Auditar (Trazabilidad Específica)
        </label>
        <select
          value={selectedMaterialId}
          onChange={(e) => onMaterialChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="TODOS">Todos los Materiales (Auditoría Global)</option>
          {materiales.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} ({m.codigo}) — Stock: {m.stockActual} {m.unidad}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de Documento */}
      <div className="sm:w-56">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Tipo de Comprobante
        </label>
        <select
          value={tipoDocFilter}
          onChange={(e) => onTipoDocChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="TODOS">Todos los comprobantes</option>
          <option value="ORDEN_COMPRA">Órdenes de Compra (OC)</option>
          <option value="VALE_SALIDA">Vales de Salida (VS)</option>
          <option value="GUIA_TRASLADO">Guías de Traslado (TR)</option>
        </select>
      </div>

      {/* Búsqueda rápida */}
      <div className="sm:w-64">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          Búsqueda de Código / Vale
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ej. OC-1041, VS-0842..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
        />
      </div>
    </div>
  );
}

