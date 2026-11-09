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
            <ArrowLeftRight className="w-4 h-4 text-amber-500" />
            <span>Constructora Del Valle S.A. · Control de Almacén</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Movimientos y Despachos de Inventario
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Registro de recepciones de compra (OC), salidas a frentes de obra (Vales) y transferencias entre bodegas.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-lg text-xs">
          <Boxes className="w-4 h-4 text-slate-600" />
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Catálogo Activo</span>
            <span className="font-bold text-slate-900">{materiales.length} Insumos Registrados</span>
          </div>
        </div>
      </div>

      {/* Alert Banner if stock fell below PR */}
      {alertBanner && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{alertBanner}</p>
            <p className="text-[11px] text-rose-700 font-normal mt-0.5">
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
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Historial de Transacciones Registradas
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
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
