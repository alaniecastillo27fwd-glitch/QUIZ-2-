import React from 'react';
import { X, Boxes, ShieldAlert, ArrowLeftRight, Clock, Building, Tag, DollarSign, History } from 'lucide-react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { formatCRC } from '../../services/inventoryCalculations.js';

export default function MaterialDetailModal({ material, isOpen, onClose, onGoToMovimiento, onGoToHistorial }) {
  if (!isOpen || !material) return null;

  const isCritico = material.estado === 'CRÍTICO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">
                  {material.nombre}
                </h3>
                <span className="font-mono text-xs text-amber-400 font-semibold">
                  {material.codigo}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ficha Técnica de Control de Existencias · Constructora Del Valle S.A.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isCritico 
              ? 'bg-rose-50 border-rose-200 text-rose-950' 
              : material.estado === 'ALERTA'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Diagnóstico de Abastecimiento
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={material.estado} size="md" />
                <span className="font-semibold text-xs">
                  {isCritico 
                    ? `Déficit de ${material.deficit} ${material.unidad} bajo el Punto de Reorden` 
                    : material.estado === 'ALERTA'
                    ? 'Próximo a punto de quiebre (umbral preventivo 15%)'
                    : 'Nivel de inventario seguro para frentes de obra'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Stock Actual</span>
              <span className="text-xl font-black text-slate-900">
                {material.stockActual.toLocaleString()} <span className="text-xs font-normal text-slate-600">{material.unidad}</span>
              </span>
            </div>
          </div>

          {/* Visual progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <ProgressBar
              current={material.stockActual}
              target={material.puntoReorden}
              unit={material.unidad}
              label="Relación Stock Actual vs Punto de Reorden (PR)"
            />
          </div>

          {/* Grid de parámetros matemáticos oficiales */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Parámetros de Cálculo Matemático (Quiz #2)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Demanda Diaria (d)</span>
                <span className="text-sm font-bold text-slate-900">{material.demandaDiariaPromedio} {material.unidad}/d</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Demanda Máxima</span>
                <span className="text-sm font-bold text-slate-900">{material.demandaDiariaMaxima} {material.unidad}/d</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Tiempo Entrega (L)</span>
                <span className="text-sm font-bold text-slate-900">{material.tiempoEntregaDias} días</span>
              </div>
              <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-800 font-medium block">Stock Seguridad (SS)</span>
                <span className="text-sm font-black text-amber-950">{material.stockSeguridad} {material.unidad}</span>
              </div>
            </div>
          </div>

          {/* Datos Generales y Costos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Información Logística
              </h4>
              <div className="space-y-1.5 text-slate-700">
                <p className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ubicación: <strong className="text-slate-900">{material.ubicacionPrincipal}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Categoría: <strong className="text-slate-900">{material.categoria}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>Precio ref.: <strong className="text-slate-900">{formatCRC(material.precioUnitarioPromedio || 0)}</strong> / {material.unidad}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Fórmula Aplicada
              </h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[10px] space-y-1 text-slate-600">
                <p>SS = (dMax - d) × L = {material.stockSeguridad} {material.unidad}</p>
                <p>PR = (d × L) + SS = {material.puntoReorden} {material.unidad}</p>
                <p className="text-slate-400 font-sans text-[9px] mt-1">
                  * Fórmulas fijas de la Opción 2 del Quiz #2.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                if (onGoToHistorial) onGoToHistorial(material);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              Ver Historial de Movimientos
            </button>

            <button
              onClick={() => {
                onClose();
                if (onGoToMovimiento) onGoToMovimiento(material);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors shadow-xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Registrar Movimiento para este Material
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

