import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, FileText, Search, User } from 'lucide-react';
import Badge from '../common/Badge';
import { formatFechaLocal } from '../../services/inventoryCalculations.js';

export default function MovimientosRecientesTable({
  movimientos = [],
  loading = false,
  limit = null,
  showSearch = true,
}) {
  const [search, setSearch] = useState('');

  const filtered = movimientos.filter((m) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      m.materialNombre?.toLowerCase().includes(term) ||
      m.documentoReferencia?.toLowerCase().includes(term) ||
      m.tipo?.toLowerCase().includes(term) ||
      m.usuario?.toLowerCase().includes(term) ||
      m.origen?.toLowerCase().includes(term) ||
      m.destino?.toLowerCase().includes(term)
    );
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  if (loading) {
    return (
      <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 p-8 text-center text-sm font-semibold text-darkteal dark:text-softlinen">
        <div className="w-8 h-8 border-4 border-yellowgreen border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Cargando transacciones de almacén...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 overflow-hidden flex flex-col shadow-xs transition-colors">
      {/* Top filter bar */}
      {showSearch && (
        <div className="p-4 border-b-2 border-darkteal/15 dark:border-darkteal/40 flex flex-wrap items-center justify-between gap-3 bg-softlinen/40 dark:bg-darkteal/30">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-darkteal dark:text-softlinen/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por material, OC, vale, usuario..."
              className="w-full bg-white dark:bg-darkteal/50 border-2 border-darkteal/25 dark:border-darkteal/60 rounded-xl pl-10 pr-4 py-2 text-sm text-evergreen dark:text-softlinen placeholder-darkteal/50 dark:placeholder-softlinen/40 focus:outline-hidden focus:border-yellowgreen font-medium"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-darkteal dark:text-softlinen/80 bg-white/80 dark:bg-darkteal/80 px-3 py-1.5 rounded-lg border border-darkteal/20">
            {filtered.length} movimientos registrados
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-softlinen/60 dark:bg-darkteal/60 border-b-2 border-darkteal/20 dark:border-darkteal/50 text-evergreen dark:text-softlinen font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="py-3 px-4">Fecha & Hora</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4 text-right">Cantidad</th>
              <th className="py-3 px-4">Ruta (Origen → Destino)</th>
              <th className="py-3 px-4">Documento Soporte</th>
              <th className="py-3 px-4">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-darkteal/10 dark:divide-darkteal/40 text-evergreen dark:text-softlinen font-medium">
            {displayList.length > 0 ? (
              displayList.map((mov) => (
                <tr key={mov.id} className="hover:bg-softlinen/30 dark:hover:bg-darkteal/30 transition-colors">
                  {/* Fecha */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-darkteal dark:text-softlinen/80 font-bold text-xs">
                    {formatFechaLocal(mov.fecha, true)}
                  </td>

                  {/* Tipo */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={mov.tipo} size="sm" />
                  </td>

                  {/* Material */}
                  <td className="py-3.5 px-4 font-bold text-evergreen dark:text-white whitespace-nowrap text-sm">
                    {mov.materialNombre}
                  </td>

                  {/* Cantidad */}
                  <td className="py-3.5 px-4 text-right font-black whitespace-nowrap text-sm">
                    <span className={
                      mov.tipo === 'ENTRADA' ? 'text-yellowgreen' :
                      mov.tipo === 'SALIDA' ? 'text-cayenne' : 'text-darkteal dark:text-softlinen'
                    }>
                      {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : '⇄'}
                      {Number(mov.cantidad).toLocaleString()}
                    </span>{' '}
                    <span className="text-xs text-darkteal/70 dark:text-softlinen/60 font-semibold">{mov.unidad}</span>
                  </td>

                  {/* Ruta */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-evergreen dark:text-softlinen max-w-xs truncate">
                    <span className="font-bold text-evergreen dark:text-softlinen">{mov.origen}</span>
                    <span className="text-cayenne mx-2 font-black">→</span>
                    <span className="text-darkteal dark:text-softlinen/80">{mov.destino}</span>
                  </td>

                  {/* Documento */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-softlinen/70 dark:bg-darkteal/70 px-2.5 py-1 rounded-md text-evergreen dark:text-softlinen border border-darkteal/20 dark:border-darkteal/50">
                      <FileText className="w-3.5 h-3.5 text-cayenne" />
                      {mov.documentoReferencia}
                    </span>
                  </td>

                  {/* Usuario */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-darkteal dark:text-softlinen/80 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-yellowgreen" />
                      {mov.usuario}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-darkteal/70 dark:text-softlinen/60 text-sm font-bold">
                  No se encontraron movimientos registrados con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

