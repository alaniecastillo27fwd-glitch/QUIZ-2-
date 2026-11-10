import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowLeftRight, 
  CopyCheck, 
  PlusCircle, 
  FileWarning, 
  TrendingDown, 
  Clock,
  ArrowRight,
  HardHat
} from 'lucide-react';

import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { useMateriales, useAlertas, useMovimientos } from '../hooks/useInventory.js';
import { formatFechaLocal } from '../services/inventoryCalculations.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { materiales, loading: loadingMats } = useMateriales();
  const { alertasStock, posiblesDuplicados, loading: loadingAlertas } = useAlertas();
  const { movimientos, loading: loadingMovs } = useMovimientos();

  const loading = loadingMats || loadingAlertas || loadingMovs;

  const materialesCriticosOAlerta = materiales.filter(
    (m) => m.estado === 'CRÍTICO' || m.estado === 'ALERTA'
  );

  const ultimosMovimientos = movimientos.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-darkteal/20 dark:border-darkteal pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellowgreen"></span>
            <span className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
              Constructora Del Valle S.A.
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-evergreen dark:text-softlinen tracking-tight">
            Panel de Control Operativo
          </h2>
          <p className="text-sm font-semibold text-darkteal dark:text-softlinen/80 mt-1">
            Monitoreo en tiempo real de inventarios, consumo de materiales y prevención de desabastecimiento en frentes de obra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/movimientos')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellowgreen hover:bg-yellowgreen-light active:bg-yellowgreen-dark text-evergreen text-sm font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Transacción
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Materiales"
          value={loading ? '...' : materiales.length}
          subtitle="En catálogo activo"
          icon={Boxes}
          variant="neutral"
          linkTo="/materiales"
        />
        <StatCard
          title="Alertas de Reposición"
          value={loading ? '...' : alertasStock.length}
          subtitle={`${alertasStock.filter(m => m.estado === 'CRÍTICO').length} en estado crítico`}
          icon={AlertTriangle}
          variant={alertasStock.length > 0 ? 'danger' : 'success'}
          linkTo="/alertas"
        />
        <StatCard
          title="Movimientos del Mes"
          value={loading ? '...' : movimientos.length}
          subtitle="Entradas, salidas y traslados"
          icon={ArrowLeftRight}
          variant="neutral"
          linkTo="/movimientos"
        />
        <StatCard
          title="Compras Sospechosas"
          value={loading ? '...' : posiblesDuplicados.length}
          subtitle="Posibles OCs duplicadas (A3)"
          icon={CopyCheck}
          variant={posiblesDuplicados.length > 0 ? 'warning' : 'neutral'}
          linkTo="/alertas"
        />
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Resumen de Existencias Críticas (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal shadow-sm overflow-hidden">
            <div className="p-6 border-b-2 border-darkteal/15 dark:border-darkteal flex items-center justify-between bg-softlinen/40 dark:bg-darkteal">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cayenne text-white flex items-center justify-center font-bold shadow-xs">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-evergreen dark:text-softlinen tracking-tight">
                    Existencias Críticas y Próximas a Reorden
                  </h3>
                  <p className="text-xs font-bold text-darkteal dark:text-yellowgreen">
                    Insumos por debajo o al límite del Punto de Reorden (PR)
                  </p>
                </div>
              </div>

              <span className="text-xs font-black px-3 py-1 rounded-full bg-evergreen text-yellowgreen dark:bg-yellowgreen dark:text-evergreen uppercase tracking-wide">
                {materialesCriticosOAlerta.length} Materiales
              </span>
            </div>

            {/* List / Table of Critical Materials */}
            <div className="divide-y-2 divide-darkteal/10 dark:divide-darkteal">
              {materialesCriticosOAlerta.length > 0 ? (
                materialesCriticosOAlerta.map((mat) => (
                  <div key={mat.id} className="p-6 hover:bg-softlinen/20 dark:hover:bg-darkteal/80 transition-colors space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-extrabold text-base text-evergreen dark:text-softlinen">
                            {mat.nombre}
                          </span>
                          <span className="text-xs text-darkteal dark:text-yellowgreen font-mono font-bold px-2 py-0.5 rounded bg-softlinen dark:bg-evergreen border border-darkteal/20">
                            {mat.codigo}
                          </span>
                          <Badge variant={mat.estado} />
                        </div>
                        <p className="text-xs md:text-sm text-evergreen/80 dark:text-softlinen/80 mt-1 font-medium">
                          Ubicación: <strong className="text-evergreen dark:text-yellowgreen">{mat.ubicacionPrincipal}</strong> · Lead Time: {mat.tiempoEntregaDias} días
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/historial?material=${mat.id}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-darkteal hover:bg-darkteal-light text-softlinen text-xs md:text-sm font-bold transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
                      >
                        <span>Ver Trazabilidad</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress representation */}
                    <div className="bg-softlinen/30 dark:bg-evergreen p-4 rounded-xl border border-darkteal/20 dark:border-darkteal">
                      <ProgressBar
                        current={mat.stockActual}
                        target={mat.puntoReorden}
                        unit={mat.unidad}
                        label="Comparativa Stock Actual vs Punto de Reorden (PR)"
                      />
                      {mat.deficit > 0 && (
                        <p className="text-xs font-bold text-cayenne mt-2.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          Déficit de reposición estimado: {mat.deficit.toLocaleString()} {mat.unidad} para alcanzar el nivel de seguridad.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-evergreen/70 dark:text-softlinen/70 text-sm font-medium">
                  No hay insumos en nivel crítico. Los inventarios se encuentran por encima del Punto de Reorden.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Accesos Rápidos & Actividad Reciente (1 col) */}
        <div className="space-y-6">
          {/* Accesos Rápidos */}
          <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal p-6 shadow-sm">
            <h3 className="text-xs font-black text-darkteal dark:text-yellowgreen uppercase tracking-wider mb-4">
              Accesos Rápidos
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/movimientos')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-darkteal/20 dark:border-darkteal hover:border-yellowgreen bg-softlinen/30 dark:bg-darkteal text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-yellowgreen text-evergreen flex items-center justify-center shrink-0 font-bold">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-evergreen dark:text-softlinen group-hover:text-yellowgreen transition-colors">
                      Registrar Movimiento
                    </p>
                    <p className="text-xs text-darkteal dark:text-softlinen/70 font-medium">
                      Entrada, salida o traslado
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-darkteal dark:text-yellowgreen group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/materiales')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-darkteal/20 dark:border-darkteal hover:border-yellowgreen bg-softlinen/30 dark:bg-darkteal text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-darkteal text-softlinen flex items-center justify-center shrink-0 font-bold">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-evergreen dark:text-softlinen group-hover:text-yellowgreen transition-colors">
                      Consultar Catálogo
                    </p>
                    <p className="text-xs text-darkteal dark:text-softlinen/70 font-medium">
                      Parámetros de demanda y SS
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-darkteal dark:text-yellowgreen group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/alertas')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-cayenne/40 dark:border-cayenne/60 hover:border-cayenne bg-cayenne/10 dark:bg-darkteal text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cayenne text-white flex items-center justify-center shrink-0 font-bold">
                    <FileWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-evergreen dark:text-softlinen group-hover:text-cayenne transition-colors">
                      Reporte de Duplicados (A3)
                    </p>
                    <p className="text-xs text-darkteal dark:text-softlinen/70 font-medium">
                      Auditoría de compras cruzadas
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-cayenne group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b-2 border-darkteal/15 dark:border-darkteal pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-darkteal dark:text-yellowgreen" />
                <h3 className="text-xs font-black text-evergreen dark:text-softlinen uppercase tracking-wider">
                  Últimos Movimientos
                </h3>
              </div>
              <button
                onClick={() => navigate('/movimientos')}
                className="text-xs font-bold text-darkteal dark:text-yellowgreen hover:text-cayenne transition-colors cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-4">
              {ultimosMovimientos.length > 0 ? (
                ultimosMovimientos.map((mov) => (
                  <div key={mov.id} className="text-sm space-y-1.5 p-3 rounded-xl bg-softlinen/30 dark:bg-darkteal border border-darkteal/20">
                    <div className="flex items-center justify-between">
                      <Badge variant={mov.tipo} size="xs" />
                      <span className="text-xs text-darkteal dark:text-softlinen/70 font-bold">
                        {formatFechaLocal(mov.fecha, true)}
                      </span>
                    </div>
                    <p className="font-extrabold text-evergreen dark:text-softlinen truncate">
                      {mov.materialNombre}
                    </p>
                    <p className="text-xs text-evergreen/80 dark:text-softlinen/80 flex items-center justify-between font-medium">
                      <span>
                        Cant: <strong className="text-evergreen dark:text-yellowgreen">{mov.cantidad} {mov.unidad}</strong>
                      </span>
                      <span className="font-mono text-xs bg-white dark:bg-evergreen px-2 py-0.5 rounded border border-darkteal/20 text-darkteal dark:text-softlinen font-bold">
                        {mov.documentoReferencia}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-evergreen/60 dark:text-softlinen/60 text-xs md:text-sm font-medium">
                  No hay movimientos registrados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
