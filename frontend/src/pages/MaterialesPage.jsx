import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Boxes, CheckCircle2, AlertTriangle } from 'lucide-react';

import MaterialTable from '../components/materiales/MaterialTable';
import MaterialFilters from '../components/materiales/MaterialFilters';
import MaterialModalForm from '../components/materiales/MaterialModalForm';
import MaterialDetailModal from '../components/materiales/MaterialDetailModal';
import { useMateriales } from '../hooks/useInventory.js';

export default function MaterialesPage() {
  const navigate = useNavigate();
  const { materiales, loading, error, addMaterial } = useMateriales();

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
      const matchesSearch =
        m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUbicacion =
        ubicacionFilter === 'TODAS' || m.ubicacionPrincipal === ubicacionFilter;

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
    showToast(`Material ${created.codigo} - "${created.nombre}" creado exitosamente.`);
  };

  const handleOpenDetail = (material) => {
    setSelectedMaterial(material);
    setIsDetailOpen(true);
  };

  const handleGoToMovimiento = (material) => {
    navigate(`/movimientos?material=${material.id}`);
  };

  const handleGoToHistorial = (material) => {
    navigate(`/historial?material=${material.id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-yellowgreen text-evergreen font-bold text-sm flex items-center justify-between shadow-md border-2 border-evergreen animate-scale-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-evergreen text-softlinen hover:bg-darkteal"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-cayenne text-white font-bold text-sm flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-darkteal/20 dark:border-darkteal pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
            Constructora Del Valle S.A. · Control de Materiales
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-evergreen dark:text-softlinen tracking-tight">
            Catálogo y Gestión de Insumos
          </h2>
          <p className="text-sm font-semibold text-darkteal dark:text-softlinen/80 mt-1">
            Gestión técnica de parámetros operativos: demanda diaria ($d$), lead time ($L$), Stock de Seguridad ($SS$) y Punto de Reorden ($PR$) reactivo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellowgreen hover:bg-yellowgreen-light active:bg-yellowgreen-dark text-evergreen text-sm font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Material</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Tabla de Materiales */}
      <MaterialTable
        materiales={filteredMateriales}
        loading={loading}
        onSelectDetail={handleOpenDetail}
        onGoToMovimientos={handleGoToMovimiento}
      />

      {/* Modal de Registro */}
      <MaterialModalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateMaterial}
      />

      {/* Modal de Detalle */}
      <MaterialDetailModal
        isOpen={isDetailOpen}
        material={selectedMaterial}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedMaterial(null);
        }}
        onGoToMovimiento={handleGoToMovimiento}
        onGoToHistorial={handleGoToHistorial}
      />
    </div>
  );
}
