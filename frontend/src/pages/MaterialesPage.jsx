import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Boxes, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

import MaterialTable from '../components/materiales/MaterialTable';
import MaterialFilters from '../components/materiales/MaterialFilters';
import MaterialModalForm from '../components/materiales/MaterialModalForm';
import MaterialDetailModal from '../components/materiales/MaterialDetailModal';
import { useMateriales } from '../hooks/useInventory.js';

export default function MaterialesPage() {
  const navigate = useNavigate();
  const { materiales, loading, error, addMaterial, resetSeeds } = useMateriales();

  // Estados locales para modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [ubicacionFilter, setUbicacionFilter] = useState('TODAS');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');

  // Estado para toast/banner de notificación
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtrado reactivo en memoria
  const filteredMateriales = useMemo(() => {
    return materiales.filter((m) => {
      // Búsqueda por texto (nombre o código)
      const matchesSearch =
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por ubicación
      const matchesUbicacion =
        ubicacionFilter === 'TODAS' || m.ubicacionPrincipal === ubicacionFilter;

      // Filtro por estado
      const matchesEstado =
        estadoFilter === 'TODOS' || m.estado === estadoFilter;

      return matchesSearch && matchesUbicacion && matchesEstado;
    });
  }, [materiales, searchTerm, ubicacionFilter, estadoFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setUbicacionFilter('TODAS');
    setEstadoFilter('TODOS');
  };

  const handleCreateMaterial = async (formData) => {
    const created = await addMaterial(formData);
    showToast(`Material ${created.codigo} (${created.nombre}) registrado con éxito.`);
  };

  const handleOpenDetail = (material) => {
    setSelectedMaterial(material);
    setIsDetailOpen(true);
  };

  const handleGoToMovimientos = (material) => {
    navigate(`/movimientos?material=${material.id}`);
  };

  const handleGoToHistorial = (material) => {
    navigate(`/historial?material=${material.id}`);
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
            <Boxes className="w-4 h-4 text-amber-500" />
            <span>Constructora Del Valle S.A. · Control de Materiales</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Catálogo y Gestión de Insumos
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Gestión técnica de parámetros operativos: demanda diaria ($d$), lead time ($L$), Stock de Seguridad ($SS$) y Punto de Reorden ($PR$) reactivo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Registrar Material
          </button>
        </div>
      </div>

      {/* Global Error Banner if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <MaterialFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        ubicacionFilter={ubicacionFilter}
        onUbicacionChange={setUbicacionFilter}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
        onResetFilters={handleResetFilters}
        totalResults={filteredMateriales.length}
      />

      {/* Material Table */}
      <MaterialTable
        materiales={filteredMateriales}
        loading={loading}
        onSelectDetail={handleOpenDetail}
        onGoToMovimientos={handleGoToMovimientos}
      />

      {/* Modal de Registro de Material */}
      <MaterialModalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateMaterial}
      />

      {/* Modal de Ficha Técnica Detallada */}
      <MaterialDetailModal
        material={selectedMaterial}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onGoToMovimiento={handleGoToMovimientos}
        onGoToHistorial={handleGoToHistorial}
      />
    </div>
  );
}
