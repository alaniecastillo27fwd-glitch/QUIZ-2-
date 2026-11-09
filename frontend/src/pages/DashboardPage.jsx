import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowLeftRight, 
  CopyCheck, 
  PlusCircle, 
  Search, 
  FileWarning, 
  History,
  TrendingDown,
  Layers,
  Clock
} from 'lucide-react';

import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { useMateriales, useAlertas, useMovimientos } from '../hooks/useInventory.js';
import { formatFechaLocal, formatCRC } from '../services/inventoryCalculations.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { materiales, loading: loadingMats } = useMateriales();
  const { alertasStock, posiblesDuplicados, loading: loadingAlertas } = useAlertas();
  const { movimientos, loading: loadingMovs } = useMovimientos();

  const loading = loadingMats || loadingAlertas || loadingMovs;

  // Filtrar materiales críticos o en alerta para la sección central
  const materialesCriticosOAlerta = materiales.filter(
    (m) => m.estado === 'CRÍTICO' || m.estado === 'ALERTA'
  );

  // Últimos 4 movimientos de almacén
  const ultimosMovimientos = movimientos.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Control Operativo
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Monitoreo en tiempo real de inventarios, consumo de materiales y prevención de desabastecimiento en frentes de obra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/movimientos')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Entrada / Salida
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Existencias Críticas y Próximas a Reorden
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insumos por debajo o al límite del Punto de Reorden (PR)
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {materialesCriticosOAlerta.length} Materiales
              </span>
            </div>

            {/* List / Table of Critical Materials */}
            <div className="divide-y divide-slate-100">
              {materialesCriticosOAlerta.length > 0 ? (
                materialesCriticosOAlerta.map((mat) => (
                  <div key={mat.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{mat.nombre}</span>
                          <span className="text-xs text-slate-600 font-mono">({mat.codigo})</span>
                          <Badge variant={mat.estado} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Ubicación: <strong className="text-slate-700 font-semibold">{mat.ubicacionPrincipal}</strong> · Lead Time: {mat.tiempoEntregaDias} días
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center">
                        <button
                          onClick={() => navigate(`/historial?material=${mat.id}`)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                          Ver Trazabilidad
                        </button>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <ProgressBar
                        current={mat.stockActual}
                        target={mat.puntoReorden}
                        unit={mat.unidad}
                        label="Comparativa Stock Actual vs Punto de Reorden (PR)"
                      />
                      {mat.deficit > 0 && (
                        <p className="text-[11px] font-semibold text-rose-700 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Déficit de reposición estimado: {mat.deficit.toLocaleString()} {mat.unidad} para alcanzar el nivel de seguridad.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-600 text-xs">
                  No hay insumos en nivel crítico. Los inventarios se encuentran por encima del Punto de Reorden.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Accesos Rápidos & Actividad Reciente (1 col) */}
        <div className="space-y-6">
          {/* Accesos Rápidos */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Accesos Rápidos
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => navigate('/movimientos')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950">
                      Registrar Movimiento
                    </p>
                    <p className="text-[10px] text-slate-500">Entrada, salida o traslado</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/materiales')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950">
                      Consultar Catálogo
                    </p>
                    <p className="text-[10px] text-slate-500">Parámetros de demanda y SS</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/alertas')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <FileWarning className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950 group-hover:text-amber-900">
                      Reporte de Duplicados (A3)
                    </p>
                    <p className="text-[10px] text-amber-700">Auditoría de compras cruzadas</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Últimos Movimientos
                </h3>
              </div>
              <button
                onClick={() => navigate('/movimientos')}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3.5">
              {ultimosMovimientos.length > 0 ? (
                ultimosMovimientos.map((mov) => (
                  <div key={mov.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={mov.tipo} size="xs" />
                      <span className="text-[10px] text-slate-600 font-medium">
                        {formatFechaLocal(mov.fecha, true)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">
                      {mov.materialNombre}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>
                        Cant: <strong className="text-slate-700">{mov.cantidad} {mov.unidad}</strong>
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {mov.documentoReferencia}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
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
