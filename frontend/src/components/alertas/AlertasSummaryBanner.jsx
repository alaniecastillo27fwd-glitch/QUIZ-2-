import React from 'react';
import { AlertCircle, CopyCheck, DollarSign, TrendingDown } from 'lucide-react';
import { formatCRC } from '../../services/inventoryCalculations.js';

export default function AlertasSummaryBanner({
  materialesCriticosCount = 0,
  duplicadosCount = 0,
  fugaEstimadaCRC = 0,
  sobrepreciosCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Materiales por Reponer Hoy */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
            Materiales por Reponer Hoy
          </span>
          <div className="text-2xl font-black text-rose-950 mt-0.5">
            {materialesCriticosCount} Insumos
          </div>
          <span className="text-[11px] text-rose-700 font-medium">
            Stock actual menor o igual al PR
          </span>
        </div>
        <div className="w-11 h-11 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* 2. OCs Sospechosas de Duplicidad */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Compras Observadas (A3)
          </span>
          <div className="text-2xl font-black text-amber-950 mt-0.5">
            {duplicadosCount} Duplicadas · {sobrepreciosCount} Desvíos
          </div>
          <span className="text-[11px] text-amber-700 font-medium">
            Cruce de proveedor, artículo y ventana &lt; 72h
          </span>
        </div>
        <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <CopyCheck className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Fuga de Valor Estimada */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
            Fuga de Valor Estimada (Octubre)
          </span>
          <div className="text-2xl font-black text-white mt-0.5">
            {formatCRC(fugaEstimadaCRC)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Impacto potencial en flujo de caja de obra
          </span>
        </div>
        <div className="w-11 h-11 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-700">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

