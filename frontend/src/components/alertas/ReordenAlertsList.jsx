import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
      <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 p-12 text-center shadow-xs">
        <CheckCircle2 className="w-14 h-14 text-yellowgreen mx-auto mb-3" />
        <h4 className="text-base font-black text-evergreen dark:text-softlinen">No hay alertas de desabastecimiento</h4>
        <p className="text-sm text-darkteal dark:text-softlinen/70 mt-1 max-w-sm mx-auto font-medium">
          Todos los materiales del catálogo activo superan holgadamente su Punto de Reorden (PR) y Stock de Seguridad (SS).
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
        const prioridadBadgeStyle = index === 0 ? 'bg-cayenne text-white' : index === 1 ? 'bg-cayenne/20 text-cayenne border border-cayenne' : 'bg-yellowgreen/20 text-yellowgreen border border-yellowgreen';

        // Cantidad sugerida de compra: Déficit + Stock de Seguridad (para restablecer margen óptimo)
        const cantidadSugerida = mat.deficit > 0 ? mat.deficit + mat.stockSeguridad : mat.stockSeguridad * 2;

        return (
          <div
            key={mat.id}
            className={`bg-white dark:bg-evergreen rounded-2xl border-2 p-5 shadow-xs transition-all space-y-4 ${
              isCritico ? 'border-cayenne' : 'border-yellowgreen'
            }`}
          >
            {/* Header del ítem */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-darkteal/15 dark:border-darkteal/40 pb-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${prioridadBadgeStyle}`}>
                  {prioridadLabel}
                </span>
                <h4 className="text-base font-black text-evergreen dark:text-softlinen">
                  {mat.nombre} <span className="font-mono text-xs text-darkteal dark:text-softlinen/70 font-bold">({mat.codigo})</span>
                </h4>
                <Badge variant={mat.estado} size="sm" />
              </div>

              <div className="text-xs text-darkteal dark:text-softlinen/80 font-bold">
                Autonomía estimada: <strong className={isCritico ? 'text-cayenne font-black text-sm' : 'text-evergreen dark:text-softlinen font-bold text-sm'}>
                  {diasCobertura} días de obra
                </strong>
              </div>
            </div>

            {/* Grid de Métricas Operativas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-softlinen/40 dark:bg-darkteal/40 p-4 rounded-xl border-2 border-darkteal/15 dark:border-darkteal/50">
              <div>
                <span className="text-xs uppercase font-extrabold text-darkteal dark:text-softlinen/60 block">Stock Actual</span>
                <span className="text-lg font-black text-evergreen dark:text-softlinen">
                  {mat.stockActual.toLocaleString()} <span className="text-xs font-semibold text-darkteal dark:text-softlinen/70">{mat.unidad}</span>
                </span>
                <span className="text-xs text-darkteal/80 dark:text-softlinen/60 block mt-0.5 font-medium">{mat.ubicacionPrincipal}</span>
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold text-darkteal dark:text-softlinen/60 block">Punto Reorden (PR)</span>
                <span className="text-lg font-black text-evergreen dark:text-softlinen">
                  {mat.puntoReorden.toLocaleString()} <span className="text-xs font-semibold text-darkteal dark:text-softlinen/70">{mat.unidad}</span>
                </span>
                <span className="text-xs text-darkteal/80 dark:text-softlinen/60 block mt-0.5 font-medium">d×L + SS</span>
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold text-darkteal dark:text-softlinen/60 block">Stock Seguridad (SS)</span>
                <span className="text-lg font-black text-evergreen dark:text-softlinen">
                  {mat.stockSeguridad.toLocaleString()} <span className="text-xs font-semibold text-darkteal dark:text-softlinen/70">{mat.unidad}</span>
                </span>
                <span className="text-xs text-darkteal/80 dark:text-softlinen/60 block mt-0.5 font-medium">Colchón operacional</span>
              </div>

              <div className="bg-cayenne/15 p-2.5 rounded-lg border-2 border-cayenne">
                <span className="text-xs uppercase font-extrabold text-cayenne block">Déficit Inmediato</span>
                <span className="text-lg font-black text-cayenne">
                  {mat.deficit > 0 ? `-${mat.deficit.toLocaleString()}` : '0'} <span className="text-xs font-semibold text-cayenne">{mat.unidad}</span>
                </span>
                <span className="text-xs text-cayenne block mt-0.5 font-bold">Bajo umbral PR</span>
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
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm border-t-2 border-darkteal/15 dark:border-darkteal/40">
              <div className="text-evergreen dark:text-softlinen flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 text-yellowgreen shrink-0" />
                <span>
                  Compra sugerida: <strong className="font-black text-evergreen dark:text-softlinen">{cantidadSugerida.toLocaleString()} {mat.unidad}</strong> (lead time: {mat.tiempoEntregaDias}d).
                </span>
              </div>

              <button
                onClick={() => navigate(`/movimientos?material=${mat.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellowgreen hover:bg-yellowgreen/90 text-evergreen font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs self-start sm:self-auto shrink-0 active:scale-95"
              >
                <span>Generar Requisición / Entrada</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

