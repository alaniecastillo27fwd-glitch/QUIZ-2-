import React from 'react';
import { Eye, ArrowLeftRight, AlertCircle, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export default function MaterialTable({
  materiales = [],
  onSelectDetail,
  onGoToMovimientos,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Cargando catálogo de materiales...</p>
      </div>
    );
  }

  if (!materiales || materiales.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No se encontraron materiales</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No hay insumos que coincidan con los filtros aplicados o el inventario se encuentra vacío.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Material / Código</th>
            <th className="py-3 px-3">Ubicación</th>
            <th className="py-3 px-3 text-right">Stock Actual</th>
            <th className="py-3 px-3 text-center" title="Demanda Promedio / Demanda Máxima">
              Demanda (d / dMax)
            </th>
            <th className="py-3 px-3 text-center" title="Tiempo de entrega del proveedor">
              Plazo (L)
            </th>
            <th className="py-3 px-3 text-right" title="Stock de Seguridad calculado">
              SS (calc.)
            </th>
            <th className="py-3 px-3 text-right" title="Punto de Reorden calculado dinámicamente">
              PR (calc.)
            </th>
            <th className="py-3 px-3 text-center">Estado Stock</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {materiales.map((m) => {
            const isCritico = m.estado === 'CRÍTICO';
            return (
              <tr 
                key={m.id} 
                className={`transition-colors hover:bg-slate-50/80 ${
                  isCritico ? 'bg-rose-50/20' : ''
                }`}
              >
                {/* Código y Nombre */}
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 leading-tight">
                    {m.nombre}
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 font-semibold mt-0.5">
                    {m.codigo}
                  </div>
                </td>

                {/* Ubicación */}
                <td className="py-3 px-3 font-medium text-slate-600">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    {m.ubicacionPrincipal}
                  </span>
                </td>

                {/* Stock Actual */}
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  <span className={isCritico ? 'text-rose-600 font-black' : ''}>
                    {m.stockActual.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-600 font-normal ml-1">
                    {m.unidad}
                  </span>
                </td>

                {/* Demanda d / dMax */}
                <td className="py-3 px-3 text-center font-medium text-slate-600">
                  <span className="text-slate-900 font-semibold">{m.demandaDiariaPromedio}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-600">{m.demandaDiariaMaxima}</span>
                  <span className="text-[10px] text-slate-600 block">/día</span>
                </td>

                {/* Tiempo de entrega L */}
                <td className="py-3 px-3 text-center font-medium text-slate-700">
                  {m.tiempoEntregaDias}d
                </td>

                {/* Stock de Seguridad (SS) */}
                <td className="py-3 px-3 text-right font-semibold text-slate-700">
                  {m.stockSeguridad.toLocaleString()}
                  <span className="text-[10px] text-slate-600 font-normal ml-1">{m.unidad}</span>
                </td>

                {/* Punto de Reorden (PR) */}
                <td className="py-3 px-3 text-right font-bold text-slate-900 bg-slate-50/50">
                  {m.puntoReorden.toLocaleString()}
                  <span className="text-[10px] text-slate-600 font-normal ml-1">{m.unidad}</span>
                </td>

                {/* Estado */}
                <td className="py-3 px-3 text-center">
                  <Badge 
                    variant={m.estado} 
                    label={isCritico ? 'CRÍTICO / REPONER HOY' : m.estado} 
                    size="xs" 
                  />
                </td>

                {/* Acciones */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSelectDetail(m)}
                      title="Ver ficha técnica completa"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onGoToMovimientos(m)}
                      title="Registrar o consultar movimientos de este material"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

