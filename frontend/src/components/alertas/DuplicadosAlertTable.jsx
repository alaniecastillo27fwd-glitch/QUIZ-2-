import React, { useState } from 'react';
import { 
  CopyCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  Info,
  Calendar,
  Building
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatCRC, formatFechaLocal } from '../../services/inventoryCalculations.js';

export default function DuplicadosAlertTable({
  duplicados = [],
  sobreprecios = [],
  onUpdateOCStatus,
}) {
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (ocId, newStatus, motivo) => {
    try {
      setProcessingId(ocId);
      await onUpdateOCStatus(ocId, newStatus, motivo);
    } catch (err) {
      alert(err.message || 'Error al actualizar el estado de la Orden de Compra.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Technical Rule Explanation Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Motor de Detección de Fugas de Valor (Opción 2 · Ejercicio A3)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Criterio Algorítmico Activo:</strong> Se identifican Órdenes de Compra (OC) que comparten el <span className="text-amber-300 font-semibold">mismo proveedor</span> y <span className="text-amber-300 font-semibold">mismo material</span>, emitidas con una diferencia temporal <span className="text-amber-300 font-semibold">menor a 72 horas</span> y con variación de volumen <span className="text-amber-300 font-semibold">menor o igual al 5%</span>. Asimismo, se coteja el precio unitario frente al precio de contrato pactado por la constructora.
        </p>
      </div>

      {/* 2. Lista de Casos de Duplicidad Detectados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CopyCheck className="w-4 h-4 text-rose-600" />
            Compras Sospechosas de Duplicidad ({duplicados.length} incidencias)
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Prioridad alta: Retención preventiva antes de pago a proveedores
          </span>
        </div>

        {duplicados.length > 0 ? (
          duplicados.map((dup) => (
            <div
              key={dup.id}
              className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs space-y-4 hover:border-rose-300 transition-all"
            >
              {/* Header de Incidencia */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                    {dup.severidad === 'CRÍTICA' ? 'Duplicado Idéntico (100%)' : 'Posible Duplicado (±4%)'}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{dup.material}</span>
                  <span className="text-xs text-slate-500 font-medium">· Proveedor: <strong className="text-slate-800">{dup.proveedor}</strong></span>
                </div>

                <div className="text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  Impacto económico: {formatCRC(dup.impactoEconomicoCRC)}
                </div>
              </div>

              {/* Comparación visual de las dos órdenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* OC 1 */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {dup.ocA.numeroOC}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatFechaLocal(dup.ocA.fecha)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Área: <strong className="text-slate-900">{dup.ocA.destino}</strong></span>
                    <span>Cantidad: <strong className="text-slate-900">{dup.ocA.cantidad} {dup.ocA.unidad}</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Precio Unit.: {formatCRC(dup.ocA.precioUnitario)}</span>
                    <span className="font-bold text-slate-900">Total: {formatCRC(dup.ocA.total)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Estado: <span className="font-semibold text-emerald-700">{dup.ocA.estado}</span>
                  </div>
                </div>

                {/* OC 2 (Sospechosa) */}
                <div className="bg-rose-50/50 p-3.5 rounded-lg border-2 border-rose-300 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                      {dup.ocB.numeroOC} (Duplicada)
                    </span>
                    <span className="text-[11px] text-rose-800 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-600" />
                      {formatFechaLocal(dup.ocB.fecha)} ({dup.diferenciaHoras}h después)
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-950 pt-1">
                    <span>Área: <strong>{dup.ocB.destino}</strong></span>
                    <span>Cantidad: <strong>{dup.ocB.cantidad} {dup.ocB.unidad}</strong></span>
                  </div>
                  <div className="flex justify-between text-rose-950">
                    <span>Precio Unit.: {formatCRC(dup.ocB.precioUnitario)}</span>
                    <span className="font-bold text-rose-900">Total: {formatCRC(dup.ocB.total)}</span>
                  </div>
                  <div className="text-[10px] text-rose-800 font-semibold">
                    Estado Actual: <span className="underline">{dup.ocB.estado}</span>
                  </div>
                </div>
              </div>

              {/* Justificación y Botones de Resolución */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-100">
                <p className="text-slate-600 text-[11px] leading-tight">
                  <strong className="text-slate-800">Diagnóstico:</strong> {dup.motivo}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(dup.ocB.id, 'REVISADA', 'Justificada por responsable de obra tras revisión técnica.')}
                    disabled={processingId === dup.ocB.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Marcar Revisada</span>
                  </button>

                  <button
                    onClick={() => handleAction(dup.ocB.id, 'PAGO_RETENIDO', 'Retención de pago por detección automática de duplicidad.')}
                    disabled={processingId === dup.ocB.id}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Retener Pago / Anular OC</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No se detectaron órdenes de compra duplicadas.
          </div>
        )}
      </div>

      {/* 3. Panel de Compras Fuera de Contrato / Sobreprecios */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Auditoría de Precios Fuera de Contrato (Ejercicio A3)
            </h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Insumos adquiridos a precios superiores a los pactados contractualmente por Constructora Del Valle S.A.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3">Proveedor / Área</th>
                <th className="py-2.5 px-3 text-right">Precio Pagado</th>
                <th className="py-2.5 px-3 text-right">Precio Contrato</th>
                <th className="py-2.5 px-3 text-center">Desvío %</th>
                <th className="py-2.5 px-3 text-right">Sobrecosto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sobreprecios.map((sp) => (
                <tr key={sp.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {sp.numeroOC}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {sp.material}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="font-semibold text-slate-800">{sp.proveedor}</span>
                    <span className="text-[10px] text-slate-400 block">{sp.destino}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                    {formatCRC(sp.precioPagado)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-600 whitespace-nowrap">
                    {formatCRC(sp.precioContrato)}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-800">
                      +{sp.porcentajeDesvio}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-rose-900 whitespace-nowrap">
                    +{formatCRC(sp.sobrecostoTotalCRC)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

