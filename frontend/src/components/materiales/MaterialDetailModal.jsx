import React from 'react';
import { X, Boxes, ArrowLeftRight, History } from 'lucide-react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';

export default function MaterialDetailModal({ material, isOpen, onClose, onGoToMovimiento, onGoToHistorial }) {
  if (!isOpen || !material) return null;

  const isCritico = material.estado === 'CRÍTICO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-evergreen/80 animate-fade-in">
      <div
        className="bg-softlinen dark:bg-evergreen rounded-2xl shadow-2xl border-2 border-darkteal dark:border-darkteal-light w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-darkteal text-softlinen flex items-center justify-between border-b-2 border-evergreen dark:border-darkteal-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellowgreen text-evergreen flex items-center justify-center font-bold">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-softlinen">
                  {material.nombre}
                </h3>
                <span className="font-mono text-xs text-yellowgreen font-bold">
                  {material.codigo}
                </span>
              </div>
              <p className="text-xs text-softlinen/80 font-medium">
                Ficha Técnica de Control de Existencias · Constructora Del Valle S.A.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-evergreen hover:bg-cayenne text-softlinen flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${
            isCritico 
              ? 'bg-cayenne/15 border-cayenne text-evergreen dark:text-softlinen' 
              : material.estado === 'ALERTA'
              ? 'bg-darkteal/20 border-darkteal text-evergreen dark:text-softlinen'
              : 'bg-yellowgreen/20 border-yellowgreen text-evergreen dark:text-softlinen'
          }`}>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
                Diagnóstico de Abastecimiento
              </p>
              <p className="text-sm font-extrabold mt-0.5">
                {isCritico
                  ? `Stock insuficiente: Déficit de reposición de ${material.deficit} ${material.unidad}.`
                  : material.estado === 'ALERTA'
                  ? 'Insumo en margen preventivo (próximo al Punto de Reorden).'
                  : 'Nivel óptimo. Existencias por encima del margen de seguridad.'}
              </p>
            </div>
            <Badge variant={material.estado} size="md" />
          </div>

          {/* Progress representation */}
          <div className="p-4 rounded-xl bg-white dark:bg-darkteal/40 border-2 border-darkteal/20 dark:border-darkteal">
            <ProgressBar
              current={material.stockActual}
              target={material.puntoReorden}
              unit={material.unidad}
              label="Balance Stock Actual vs Punto de Reorden (PR)"
            />
          </div>

          {/* Formula calculation breakdown */}
          <div className="p-5 rounded-xl bg-white dark:bg-darkteal/50 border-2 border-darkteal/20 dark:border-darkteal space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen border-b border-darkteal/15 pb-1">
              Desglose Matemático Oficial (Opción 2)
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="p-3 rounded-lg bg-softlinen/50 dark:bg-evergreen border border-darkteal/20">
                <span className="text-xs font-bold text-darkteal dark:text-yellowgreen block">Demanda Diaria (d)</span>
                <span className="font-extrabold text-base text-evergreen dark:text-softlinen">{material.demandaDiariaPromedio} {material.unidad}/día</span>
              </div>
              <div className="p-3 rounded-lg bg-softlinen/50 dark:bg-evergreen border border-darkteal/20">
                <span className="text-xs font-bold text-darkteal dark:text-yellowgreen block">Demanda Máxima</span>
                <span className="font-extrabold text-base text-evergreen dark:text-softlinen">{material.demandaDiariaMaxima} {material.unidad}/día</span>
              </div>
              <div className="p-3 rounded-lg bg-softlinen/50 dark:bg-evergreen border border-darkteal/20">
                <span className="text-xs font-bold text-darkteal dark:text-yellowgreen block">Plazo Proveedor (L)</span>
                <span className="font-extrabold text-base text-evergreen dark:text-softlinen">{material.tiempoEntregaDias} días</span>
              </div>
              <div className="p-3 rounded-lg bg-softlinen/50 dark:bg-evergreen border border-darkteal/20">
                <span className="text-xs font-bold text-darkteal dark:text-yellowgreen block">Ubicación Principal</span>
                <span className="font-extrabold text-base text-evergreen dark:text-softlinen">{material.ubicacionPrincipal}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-darkteal text-softlinen text-xs space-y-1 font-mono">
              <p className="font-bold text-yellowgreen">
                SS = ({material.demandaDiariaMaxima} - {material.demandaDiariaPromedio}) × {material.tiempoEntregaDias} = {material.stockSeguridad} {material.unidad}
              </p>
              <p className="font-bold text-softlinen">
                PR = ({material.demandaDiariaPromedio} × {material.tiempoEntregaDias}) + {material.stockSeguridad} = {material.puntoReorden} {material.unidad}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-darkteal/10 dark:bg-darkteal/40 border-t-2 border-darkteal/20 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onGoToHistorial && onGoToHistorial(material);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-darkteal text-evergreen dark:text-softlinen font-bold text-xs md:text-sm hover:bg-darkteal/20 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Ver Trazabilidad</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToMovimiento && onGoToMovimiento(material);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellowgreen hover:bg-yellowgreen-light text-evergreen font-black text-xs md:text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-xs"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
