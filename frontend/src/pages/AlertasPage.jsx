import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CopyCheck, 
  CheckCircle2, 
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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-evergreen text-softlinen px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-yellowgreen flex items-center gap-3 animate-scale-in text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 text-yellowgreen shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-darkteal dark:text-softlinen/70 font-bold text-xs tracking-wider uppercase mb-1">
            <AlertTriangle className="w-4 h-4 text-cayenne" />
            <span>Centro de Monitoreo & Auditoría · Constructora Del Valle S.A.</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-evergreen dark:text-softlinen tracking-tight">
            Control de Alertas de Reorden y Fugas de Valor
          </h2>
          <p className="text-sm text-darkteal dark:text-softlinen/70 mt-1 font-medium">
            Supervisión continua de niveles mínimos de inventario (Stock ≤ PR) y detección algorítmica de compras duplicadas o sobreprecios.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleSimularReglas}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellowgreen hover:bg-yellowgreen/90 text-evergreen font-black text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Evaluando...' : 'Simular Auditoría'}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-darkteal/15 dark:border-darkteal/40 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('REORDEN')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
              activeTab === 'REORDEN'
                ? 'bg-evergreen dark:bg-yellowgreen text-softlinen dark:text-evergreen border-evergreen dark:border-yellowgreen shadow-xs'
                : 'bg-white dark:bg-darkteal/50 text-darkteal dark:text-softlinen border-darkteal/20 dark:border-darkteal/50 hover:bg-softlinen/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-cayenne" />
            <span>Reposición de Inventario (Stock ≤ PR)</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-yellowgreen text-evergreen font-black ml-1">
              {filteredAlertasStock.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DUPLICADOS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
              activeTab === 'DUPLICADOS'
                ? 'bg-evergreen dark:bg-yellowgreen text-softlinen dark:text-evergreen border-evergreen dark:border-yellowgreen shadow-xs'
                : 'bg-white dark:bg-darkteal/50 text-darkteal dark:text-softlinen border-darkteal/20 dark:border-darkteal/50 hover:bg-softlinen/40'
            }`}
          >
            <CopyCheck className="w-4 h-4 text-yellowgreen" />
            <span>Auditoría de OCs (Duplicados y Sobreprecios)</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-cayenne text-white font-black ml-1">
              {filteredDuplicados.length + filteredSobreprecios.length}
            </span>
          </button>
        </div>

        {/* Filter by Area */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-extrabold text-darkteal dark:text-softlinen/80 flex items-center gap-1.5 uppercase tracking-wider">
            <Building className="w-4 h-4 text-yellowgreen" />
            Filtrar Área:
          </label>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-white dark:bg-darkteal/50 border-2 border-darkteal/25 dark:border-darkteal/60 rounded-xl px-3 py-1.5 text-xs text-evergreen dark:text-softlinen font-bold focus:outline-hidden focus:border-yellowgreen"
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
