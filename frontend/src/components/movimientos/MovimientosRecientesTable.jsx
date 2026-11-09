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
      m.materialNombre.toLowerCase().includes(term) ||
      m.documentoReferencia.toLowerCase().includes(term) ||
      m.tipo.toLowerCase().includes(term) ||
      m.usuario.toLowerCase().includes(term) ||
      m.origen.toLowerCase().includes(term) ||
      m.destino.toLowerCase().includes(term)
    );
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Cargando transacciones de almacén...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Top filter bar */}
      {showSearch && (
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por material, OC, vale, usuario..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {filtered.length} movimientos registrados
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Fecha & Hora</th>
              <th className="py-2.5 px-3">Tipo</th>
              <th className="py-2.5 px-3">Material</th>
              <th className="py-2.5 px-3 text-right">Cantidad</th>
              <th className="py-2.5 px-3">Ruta (Origen → Destino)</th>
              <th className="py-2.5 px-3">Documento Soporte</th>
              <th className="py-2.5 px-3">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {displayList.length > 0 ? (
              displayList.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Fecha */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                    {formatFechaLocal(mov.fecha, true)}
                  </td>

                  {/* Tipo */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <Badge variant={mov.tipo} size="xs" />
                  </td>

                  {/* Material */}
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {mov.materialNombre}
                  </td>

                  {/* Cantidad */}
                  <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                    <span className={
                      mov.tipo === 'ENTRADA' ? 'text-emerald-700' :
                      mov.tipo === 'SALIDA' ? 'text-rose-700' : 'text-blue-700'
                    }>
                      {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : '⇄'}
                      {mov.cantidad.toLocaleString()}
                    </span>{' '}
                    <span className="text-[10px] text-slate-500 font-normal">{mov.unidad}</span>
                  </td>

                  {/* Ruta */}
                  <td className="py-3 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                    <span className="font-semibold text-slate-800">{mov.origen}</span>
                    <span className="text-slate-400 mx-1.5">→</span>
                    <span className="text-slate-700">{mov.destino}</span>
                  </td>

                  {/* Documento */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                      <FileText className="w-3 h-3 text-slate-500" />
                      {mov.documentoReferencia}
                    </span>
                  </td>

                  {/* Usuario */}
                  <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {mov.usuario}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 text-xs font-medium">
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

