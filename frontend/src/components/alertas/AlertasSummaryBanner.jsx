import React from 'react';
import { AlertCircle, CopyCheck, DollarSign } from 'lucide-react';
import { formatCRC } from '../../services/inventoryCalculations.js';

export default function AlertasSummaryBanner({
  materialesCriticosCount = 0,
  duplicadosCount = 0,
  fugaEstimadaCRC = 0,
  sobrepreciosCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* 1. Materiales por Reponer Hoy */}
      <div className="bg-white dark:bg-evergreen border-2 border-cayenne rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-cayenne block">
            Materiales por Reponer Hoy
          </span>
          <div className="text-3xl font-black text-evergreen dark:text-softlinen mt-1">
            {materialesCriticosCount} Insumos
          </div>
          <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold mt-0.5 block">
            Stock actual menor o igual al PR
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-cayenne text-white flex items-center justify-center shrink-0">
          <AlertCircle className="w-7 h-7" />
        </div>
      </div>

      {/* 2. OCs Sospechosas de Duplicidad */}
      <div className="bg-white dark:bg-evergreen border-2 border-yellowgreen rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen block">
            Compras Observadas (A3)
          </span>
          <div className="text-2xl font-black text-evergreen dark:text-softlinen mt-1">
            {duplicadosCount} Duplicadas · {sobrepreciosCount} Desvíos
          </div>
          <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold mt-0.5 block">
            Cruce de proveedor, artículo y ventana &lt; 72h
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-yellowgreen text-evergreen flex items-center justify-center shrink-0 font-bold">
          <CopyCheck className="w-7 h-7" />
        </div>
      </div>

      {/* 3. Fuga de Valor Estimada */}
      <div className="bg-evergreen dark:bg-darkteal border-2 border-darkteal dark:border-yellowgreen text-softlinen rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-yellowgreen block">
            Fuga de Valor Estimada (Octubre)
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {formatCRC(fugaEstimadaCRC)}
          </div>
          <span className="text-xs text-softlinen/70 font-semibold mt-0.5 block">
            Impacto potencial en flujo de caja de obra
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-darkteal dark:bg-evergreen text-yellowgreen flex items-center justify-center shrink-0 border-2 border-yellowgreen/40">
          <DollarSign className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}

