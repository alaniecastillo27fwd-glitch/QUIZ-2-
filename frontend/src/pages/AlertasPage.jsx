import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CopyCheck, 
  RotateCcw, 
  CheckCircle2, 
  Play, 
  Layers, 
  Building,
  RefreshCw 
} from 'lucide-react';

import AlertasSummaryBanner from '../components/alertas/AlertasSummaryBanner';
import ReordenAlertsList from '../components/alertas/ReordenAlertsList';
import DuplicadosAlertTable from '../components/alertas/DuplicadosAlertTable';
import { useAlertas, useMateriales } from '../hooks/useInventory.js';

export default function AlertasPage() {
  const { 
    alertasStock, 
    posiblesDuplicados, 
    sobreprecios, 
    fugaEstimadaCRC, 
    loading: loadingAlertas, 
    refreshAlertas, 
    updateOCStatus 
  } = useAlertas();

  const { fetchMateriales } = useMateriales();

  // Estados de navegación interna por tabs
  const [activeTab, setActiveTab] = useState('REORDEN'); // 'REORDEN' | 'DUPLICADOS'
  const [areaFilter, setAreaFilter] = useState('TODAS');
  const [toastMessage, setToastMessage] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtrado de alertas de reorden por ubicación si aplica
  const filteredAlertasStock = alertasStock.filter((mat) => {
    if (areaFilter === 'TODAS') return true;
    return mat.ubicacionPrincipal === areaFilter;
  });

  // Filtrado de duplicados por área
  const filteredDuplicados = posiblesDuplicados.filter((dup) => {
    if (areaFilter === 'TODAS') return true;
    return dup.ocA.destino === areaFilter || dup.ocB.destino === areaFilter;
  });

  // Filtrado de sobreprecios por área
  const filteredSobreprecios = sobreprecios.filter((sp) => {
    if (areaFilter === 'TODAS') return true;
    return sp.destino === areaFilter;
  });

  const handleSimularReglas = async () => {
    setIsSimulating(true);
    await refreshAlertas();
    await fetchMateriales();
    setIsSimulating(false);
    showToast(
      `Motor de auditoría ejecutado: ${alertasStock.length} alertas de reorden y ${posiblesDuplicados.length} compras observadas validadas.`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Centro de Monitoreo & Auditoría · Constructora Del Valle S.A.</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Control de Alertas de Reorden y Fugas de Valor
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Supervisión continua de niveles mínimos de inventario ($Stock \le PR$) y detección algorítmica de compras duplicadas o sobreprecios.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleSimularReglas}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Evaluando...' : 'Simular Ejecución de Reglas'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <AlertasSummaryBanner
        materialesCriticosCount={alertasStock.filter(m => m.estado === 'CRÍTICO').length}
        duplicadosCount={posiblesDuplicados.length}
        fugaEstimadaCRC={fugaEstimadaCRC}
        sobrepreciosCount={sobreprecios.length}
      />

      {/* Tabs Navigation & Area Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('REORDEN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'REORDEN'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Reposición de Inventario (Stock ≤ PR)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 ml-1">
              {filteredAlertasStock.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DUPLICADOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'DUPLICADOS'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CopyCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Auditoría de OCs (Duplicados y Sobreprecios)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-rose-300 ml-1">
              {filteredDuplicados.length + filteredSobreprecios.length}
            </span>
          </button>
        </div>

        {/* Filter by Area */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            Filtrar por Área:
          </label>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          >
            <option value="TODAS">Todas las áreas</option>
            <option value="Obras">Obras</option>
            <option value="Bodega Central">Bodega Central</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'REORDEN' ? (
        <ReordenAlertsList alertas={filteredAlertasStock} />
      ) : (
        <DuplicadosAlertTable
          duplicados={filteredDuplicados}
          sobreprecios={filteredSobreprecios}
          onUpdateOCStatus={updateOCStatus}
        />
      )}
    </div>
  );
}
