import React from 'react';
import { Eye, ArrowLeftRight, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

export default function MaterialTable({
  materiales = [],
  onSelectDetail,
  onGoToMovimientos,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal p-10 shadow-sm text-center space-y-3">
        <div className="w-10 h-10 border-4 border-yellowgreen border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-darkteal dark:text-softlinen">
          Cargando catálogo de materiales...
        </p>
      </div>
    );
  }

  if (!materiales || materiales.length === 0) {
    return (
      <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-softlinen dark:bg-evergreen text-darkteal dark:text-yellowgreen flex items-center justify-center mx-auto mb-3 border-2 border-darkteal/30">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h4 className="text-base font-extrabold text-evergreen dark:text-softlinen">
          No se encontraron materiales
        </h4>
        <p className="text-sm text-evergreen/70 dark:text-softlinen/70 mt-1 max-w-sm mx-auto font-medium">
          No hay insumos que coincidan con los filtros aplicados o el inventario se encuentra vacío.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-darkteal/20 dark:border-darkteal bg-white dark:bg-darkteal/60 shadow-sm">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-softlinen dark:bg-evergreen border-b-2 border-darkteal/20 dark:border-darkteal text-evergreen dark:text-softlinen font-black uppercase tracking-wider text-xs">
          <tr>
            <th className="py-4 px-4">Material / Código</th>
            <th className="py-4 px-3">Ubicación</th>
            <th className="py-4 px-3 text-right">Stock Actual</th>
            <th className="py-4 px-3 text-center" title="Demanda Promedio / Demanda Máxima">
              Demanda (d / dMax)
            </th>
            <th className="py-4 px-3 text-center" title="Tiempo de entrega del proveedor">
              Plazo (L)
            </th>
            <th className="py-4 px-3 text-right" title="Stock de Seguridad calculado">
              SS (calc.)
            </th>
            <th className="py-4 px-3 text-right" title="Punto de Reorden calculado dinámicamente">
              PR (calc.)
            </th>
            <th className="py-4 px-3 text-center">Estado Stock</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-darkteal/10 dark:divide-darkteal text-evergreen dark:text-softlinen">
          {materiales.map((m) => {
            const isCritico = m.estado === 'CRÍTICO';

            return (
              <tr
                key={m.id}
                className={`transition-colors duration-150 ${
                  isCritico 
                    ? 'bg-cayenne/10 dark:bg-cayenne/20 hover:bg-cayenne/15' 
                    : 'hover:bg-softlinen/40 dark:hover:bg-darkteal/80'
                }`}
              >
                {/* Material / Código */}
                <td className="py-4 px-4">
                  <div className="font-extrabold text-sm text-evergreen dark:text-softlinen">
                    {m.nombre}
                  </div>
                  <div className="text-xs font-mono font-bold text-darkteal dark:text-yellowgreen mt-0.5">
                    {m.codigo}
                  </div>
                </td>

                {/* Ubicación */}
                <td className="py-4 px-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-softlinen dark:bg-evergreen text-evergreen dark:text-softlinen border border-darkteal/20">
                    {m.ubicacionPrincipal}
                  </span>
                </td>

                {/* Stock Actual */}
                <td className="py-4 px-3 text-right font-black text-sm">
                  <span className={isCritico ? 'text-cayenne font-black' : 'text-evergreen dark:text-softlinen'}>
                    {m.stockActual?.toLocaleString()} {m.unidad}
                  </span>
                </td>

                {/* Demanda d / dMax */}
                <td className="py-4 px-3 text-center font-bold text-xs text-darkteal dark:text-softlinen/80">
                  {m.demandaDiariaPromedio} / {m.demandaDiariaMaxima} {m.unidad}/d
                </td>

                {/* Plazo L */}
                <td className="py-4 px-3 text-center font-bold text-xs text-evergreen dark:text-softlinen">
                  {m.tiempoEntregaDias} d
                </td>

                {/* SS (calc) */}
                <td className="py-4 px-3 text-right font-bold text-xs text-darkteal dark:text-yellowgreen">
                  {m.stockSeguridad?.toLocaleString()} {m.unidad}
                </td>

                {/* PR (calc) */}
                <td className="py-4 px-3 text-right font-black text-sm text-evergreen dark:text-softlinen">
                  {m.puntoReorden?.toLocaleString()} {m.unidad}
                </td>

                {/* Estado */}
                <td className="py-4 px-3 text-center">
                  <Badge variant={m.estado} />
                </td>

                {/* Acciones */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSelectDetail && onSelectDetail(m)}
                      className="p-2 rounded-lg bg-darkteal text-softlinen hover:bg-darkteal-light transition-colors cursor-pointer"
                      title="Ver detalle del cálculo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onGoToMovimientos && onGoToMovimientos(m)}
                      className="p-2 rounded-lg bg-yellowgreen text-evergreen hover:bg-yellowgreen-light transition-colors cursor-pointer"
                      title="Registrar movimiento"
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
