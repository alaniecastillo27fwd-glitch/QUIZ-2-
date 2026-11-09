import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';

export default function ReordenAlertsList({ alertas = [] }) {
  const navigate = useNavigate();

  // Ordenar por prioridad crítica: días de cobertura restante = stockActual / d
  const sortedAlertas = [...alertas].sort((a, b) => {
    const diasA = a.demandaDiariaPromedio > 0 ? a.stockActual / a.demandaDiariaPromedio : 999;
    const diasB = b.demandaDiariaPromedio > 0 ? b.stockActual / b.demandaDiariaPromedio : 999;
    return diasA - diasB;
  });

  if (!sortedAlertas.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800">No hay alertas de desabastecimiento</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Todos los materiales del catálogo activo superan holgadamente su Punto de Reorden ($PR$) y Stock de Seguridad ($SS$).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedAlertas.map((mat, index) => {
        const diasCobertura = mat.demandaDiariaPromedio > 0 
          ? (mat.stockActual / mat.demandaDiariaPromedio).toFixed(1)
          : 'N/A';

        const isCritico = mat.estado === 'CRÍTICO';
        const prioridadLabel = index === 0 ? '#1 Prioridad Crítica' : index === 1 ? '#2 Prioridad Alta' : `#${index + 1} Prioridad Media`;
        const prioridadBadgeColor = index === 0 ? 'bg-rose-600 text-white' : index === 1 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';

        // Cantidad sugerida de compra: Déficit + Stock de Seguridad (para restablecer margen óptimo)
        const cantidadSugerida = mat.deficit > 0 ? mat.deficit + mat.stockSeguridad : mat.stockSeguridad * 2;

        return (
          <div
            key={mat.id}
            className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-4 ${
              isCritico ? 'border-rose-200 hover:border-rose-300' : 'border-amber-200 hover:border-amber-300'
            }`}
          >
            {/* Header del ítem */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${prioridadBadgeColor}`}>
                  {prioridadLabel}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {mat.nombre} <span className="font-mono text-xs text-slate-600 font-semibold">({mat.codigo})</span>
                </h4>
                <Badge variant={mat.estado} size="xs" />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Autonomía estimada: <strong className={isCritico ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                  {diasCobertura} días de obra
                </strong>
              </div>
            </div>

            {/* Grid de Métricas Operativas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Stock Actual</span>
                <span className="text-base font-black text-slate-900">
                  {mat.stockActual.toLocaleString()} <span className="text-xs font-normal text-slate-500">{mat.unidad}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{mat.ubicacionPrincipal}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Punto Reorden (PR)</span>
                <span className="text-base font-bold text-slate-800">
                  {mat.puntoReorden.toLocaleString()} <span className="text-xs font-normal text-slate-500">{mat.unidad}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">d×L + SS</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Stock Seguridad (SS)</span>
                <span className="text-base font-bold text-slate-700">
                  {mat.stockSeguridad.toLocaleString()} <span className="text-xs font-normal text-slate-500">{mat.unidad}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Colchón operacional</span>
              </div>

              <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Déficit Inmediato</span>
                <span className="text-base font-black text-rose-700">
                  {mat.deficit > 0 ? `-${mat.deficit.toLocaleString()}` : '0'} <span className="text-xs font-normal text-rose-800">{mat.unidad}</span>
                </span>
                <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">Bajo umbral PR</span>
              </div>
            </div>

            {/* Barra de nivel */}
            <ProgressBar
              current={mat.stockActual}
              target={mat.puntoReorden}
              unit={mat.unidad}
              label="Cobertura de Inventario respecto al Punto de Reorden"
            />

            {/* Footer con sugerencia y acción */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-100">
              <div className="text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Compra sugerida para reabastecimiento: <strong className="text-slate-900 font-bold">{cantidadSugerida.toLocaleString()} {mat.unidad}</strong> (lead time: {mat.tiempoEntregaDias}d).
                </span>
              </div>

              <button
                onClick={() => navigate(`/movimientos?material=${mat.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-xs self-start sm:self-auto shrink-0"
              >
                <span>Generar Requisición / Registrar Entrada</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

