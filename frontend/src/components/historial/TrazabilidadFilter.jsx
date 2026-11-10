import React from 'react';
import { Boxes, FileText, Search } from 'lucide-react';

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
    <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 p-5 shadow-xs space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 transition-colors">
      {/* Selector de Material Específico */}
      <div className="flex-1">
        <label className="block text-xs font-black uppercase text-darkteal dark:text-softlinen/80 mb-1.5 flex items-center gap-1.5 tracking-wider">
          <Boxes className="w-4 h-4 text-yellowgreen" />
          Insumo a Auditar (Trazabilidad Específica)
        </label>
        <select
          value={selectedMaterialId}
          onChange={(e) => onMaterialChange(e.target.value)}
          className="w-full bg-softlinen/40 dark:bg-darkteal/50 border-2 border-darkteal/25 dark:border-darkteal/60 rounded-xl px-3.5 py-2.5 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
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
      <div className="sm:w-60">
        <label className="block text-xs font-black uppercase text-darkteal dark:text-softlinen/80 mb-1.5 flex items-center gap-1.5 tracking-wider">
          <FileText className="w-4 h-4 text-cayenne" />
          Tipo de Comprobante
        </label>
        <select
          value={tipoDocFilter}
          onChange={(e) => onTipoDocChange(e.target.value)}
          className="w-full bg-softlinen/40 dark:bg-darkteal/50 border-2 border-darkteal/25 dark:border-darkteal/60 rounded-xl px-3.5 py-2.5 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
        >
          <option value="TODOS">Todos los comprobantes</option>
          <option value="ORDEN_COMPRA">Órdenes de Compra (OC)</option>
          <option value="VALE_SALIDA">Vales de Salida (VS)</option>
          <option value="GUIA_TRASLADO">Guías de Traslado (TR)</option>
        </select>
      </div>

      {/* Búsqueda rápida */}
      <div className="sm:w-64">
        <label className="block text-xs font-black uppercase text-darkteal dark:text-softlinen/80 mb-1.5 flex items-center gap-1.5 tracking-wider">
          <Search className="w-4 h-4 text-yellowgreen" />
          Búsqueda de Código / Vale
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ej. OC-1041, VALE-201..."
          className="w-full bg-softlinen/40 dark:bg-darkteal/50 border-2 border-darkteal/25 dark:border-darkteal/60 rounded-xl px-3.5 py-2.5 text-sm text-evergreen dark:text-softlinen placeholder-darkteal/50 dark:placeholder-softlinen/40 font-medium focus:outline-hidden focus:border-yellowgreen"
        />
      </div>
    </div>
  );
}

