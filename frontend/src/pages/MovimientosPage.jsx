import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, AlertTriangle, Boxes, Clock } from 'lucide-react';

import MovimientoForm from '../components/movimientos/MovimientoForm';
import MovimientosRecientesTable from '../components/movimientos/MovimientosRecientesTable';
import { useMateriales, useMovimientos } from '../hooks/useInventory.js';

export default function MovimientosPage() {
  const [searchParams] = useSearchParams();
  const initialMaterialId = searchParams.get('material') || '';

  const { materiales, fetchMateriales } = useMateriales();
  const { movimientos, loading: loadingMovs, registerMovimiento } = useMovimientos();

  const [toastMessage, setToastMessage] = useState(null);
  const [alertBanner, setAlertBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterMovimiento = async (movimientoData) => {
    setIsSubmitting(true);
    setAlertBanner(null);
    try {
      const result = await registerMovimiento(movimientoData);
      await fetchMateriales(); // Refrescar catálogo con nuevo stock

      const mat = result.materialActualizado;
      const isCritical = mat.stockActual <= mat.puntoReorden;

      setToastMessage(
        `Movimiento registrado: ${movimientoData.tipo} de ${movimientoData.cantidad} ${mat.unidad} (${mat.nombre}). Stock actual: ${mat.stockActual} ${mat.unidad}.`
      );

      if (isCritical) {
        setAlertBanner(
          `⚠️ Alerta Crítica: El material ${mat.nombre} ha quedado con ${mat.stockActual} ${mat.unidad}, por debajo del Punto de Reorden (${mat.puntoReorden} ${mat.unidad}). Se activó la alerta automática de reabastecimiento.`
        );
      }

      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
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
            <ArrowLeftRight className="w-4 h-4 text-cayenne" />
            <span>Constructora Del Valle S.A. · Control de Almacén</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-evergreen dark:text-softlinen tracking-tight">
            Movimientos y Despachos de Inventario
          </h2>
          <p className="text-sm text-darkteal dark:text-softlinen/70 mt-1 font-medium">
            Registro de recepciones de compra (OC), salidas a frentes de obra (Vales) y transferencias entre bodegas.
          </p>
        </div>

        <div className="flex items-center gap-3.5 bg-softlinen/50 dark:bg-darkteal/50 border-2 border-darkteal/20 dark:border-darkteal/60 px-4 py-2.5 rounded-xl text-sm">
          <Boxes className="w-5 h-5 text-yellowgreen" />
          <div>
            <span className="text-darkteal dark:text-softlinen/60 block text-xs font-bold uppercase tracking-wider">Catálogo Activo</span>
            <span className="font-extrabold text-evergreen dark:text-softlinen">{materiales.length} Insumos Registrados</span>
          </div>
        </div>
      </div>

      {/* Alert Banner if stock fell below PR */}
      {alertBanner && (
        <div className="p-4 rounded-2xl bg-cayenne/15 border-2 border-cayenne text-evergreen dark:text-softlinen text-sm font-bold flex items-start gap-3 shadow-xs animate-scale-in">
          <AlertTriangle className="w-5 h-5 text-cayenne shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-evergreen dark:text-softlinen">{alertBanner}</p>
            <p className="text-xs text-darkteal dark:text-softlinen/70 font-semibold mt-1">
              Consulte el módulo de Alertas para generar la orden de compra o coordinar con compras.
            </p>
          </div>
        </div>
      )}

      {/* Two columns layout: Form on left, recent table on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario (5 columnas) */}
        <div className="lg:col-span-5">
          <MovimientoForm
            materiales={materiales}
            onSubmit={handleRegisterMovimiento}
            isSubmitting={isSubmitting}
            initialMaterialId={initialMaterialId}
          />
        </div>

        {/* Tabla de movimientos (7 columnas) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-darkteal dark:text-softlinen/80 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cayenne" />
              Historial de Transacciones Registradas
            </h3>
            <span className="text-xs text-darkteal dark:text-softlinen/60 font-bold">
              Últimos registros en tiempo real
            </span>
          </div>

          <MovimientosRecientesTable
            movimientos={movimientos}
            loading={loadingMovs}
            showSearch={true}
          />
        </div>
      </div>
    </div>
  );
}
