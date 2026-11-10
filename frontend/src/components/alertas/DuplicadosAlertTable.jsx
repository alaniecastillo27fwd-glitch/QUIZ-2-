import React, { useState } from 'react';
import { 
  CopyCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar
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
      <div className="bg-evergreen dark:bg-darkteal border-2 border-yellowgreen text-softlinen p-5 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-yellowgreen font-black text-xs uppercase tracking-wider">
          <ShieldAlert className="w-5 h-5 text-yellowgreen" />
          <span>Motor de Detección de Fugas de Valor (Opción 2 · Ejercicio A3)</span>
        </div>
        <p className="text-sm text-softlinen leading-relaxed font-medium">
          <strong className="text-white">Criterio Algorítmico Activo:</strong> Se identifican Órdenes de Compra (OC) que comparten el <span className="text-yellowgreen font-bold">mismo proveedor</span> y <span className="text-yellowgreen font-bold">mismo material</span>, emitidas con una diferencia temporal <span className="text-yellowgreen font-bold">menor a 72 horas</span> y con variación de volumen <span className="text-yellowgreen font-bold">menor o igual al 5%</span>. Asimismo, se coteja el precio unitario frente al precio de contrato pactado por la constructora.
        </p>
      </div>

      {/* 2. Lista de Casos de Duplicidad Detectados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-evergreen dark:text-softlinen uppercase tracking-wider flex items-center gap-2">
            <CopyCheck className="w-5 h-5 text-cayenne" />
            Compras Sospechosas de Duplicidad ({duplicados.length} incidencias)
          </h3>
          <span className="text-xs text-darkteal dark:text-softlinen/70 font-bold">
            Prioridad alta: Retención preventiva antes de pago a proveedores
          </span>
        </div>

        {duplicados.length > 0 ? (
          duplicados.map((dup) => (
            <div
              key={dup.id}
              className="bg-white dark:bg-evergreen rounded-2xl border-2 border-cayenne p-5 shadow-xs space-y-4 transition-all"
            >
              {/* Header de Incidencia */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-darkteal/15 dark:border-darkteal/40 pb-3.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-cayenne text-white">
                    {dup.severidad === 'CRÍTICA' ? 'Duplicado Idéntico (100%)' : 'Posible Duplicado (±4%)'}
                  </span>
                  <span className="font-black text-base text-evergreen dark:text-softlinen">{dup.material}</span>
                  <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold">· Proveedor: <strong className="text-evergreen dark:text-softlinen">{dup.proveedor}</strong></span>
                </div>

                <div className="text-xs text-cayenne font-black bg-cayenne/15 px-3 py-1.5 rounded-lg border-2 border-cayenne">
                  Impacto económico: {formatCRC(dup.impactoEconomicoCRC)}
                </div>
              </div>

              {/* Comparación visual de las dos órdenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OC 1 */}
                <div className="bg-softlinen/40 dark:bg-darkteal/40 p-4 rounded-xl border-2 border-darkteal/20 dark:border-darkteal/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-evergreen dark:text-softlinen bg-white dark:bg-evergreen px-2.5 py-1 rounded-md border border-darkteal/20">
                      {dup.ocA.numeroOC}
                    </span>
                    <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-yellowgreen" />
                      {formatFechaLocal(dup.ocA.fecha)}
                    </span>
                  </div>
                  <div className="flex justify-between text-darkteal dark:text-softlinen/80 pt-1 text-xs">
                    <span>Área: <strong className="text-evergreen dark:text-softlinen">{dup.ocA.destino}</strong></span>
                    <span>Cantidad: <strong className="text-evergreen dark:text-softlinen">{dup.ocA.cantidad} {dup.ocA.unidad}</strong></span>
                  </div>
                  <div className="flex justify-between text-darkteal dark:text-softlinen/80 text-xs">
                    <span>Precio Unit.: {formatCRC(dup.ocA.precioUnitario)}</span>
                    <span className="font-black text-evergreen dark:text-softlinen">Total: {formatCRC(dup.ocA.total)}</span>
                  </div>
                  <div className="text-xs text-darkteal dark:text-softlinen/70 font-semibold">
                    Estado: <span className="font-black text-yellowgreen">{dup.ocA.estado}</span>
                  </div>
                </div>

                {/* OC 2 (Sospechosa) */}
                <div className="bg-cayenne/10 p-4 rounded-xl border-2 border-cayenne space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-white bg-cayenne px-2.5 py-1 rounded-md">
                      {dup.ocB.numeroOC} (Duplicada)
                    </span>
                    <span className="text-xs text-cayenne font-black flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cayenne" />
                      {formatFechaLocal(dup.ocB.fecha)} ({dup.diferenciaHoras}h después)
                    </span>
                  </div>
                  <div className="flex justify-between text-evergreen dark:text-softlinen pt-1 text-xs">
                    <span>Área: <strong>{dup.ocB.destino}</strong></span>
                    <span>Cantidad: <strong>{dup.ocB.cantidad} {dup.ocB.unidad}</strong></span>
                  </div>
                  <div className="flex justify-between text-evergreen dark:text-softlinen text-xs">
                    <span>Precio Unit.: {formatCRC(dup.ocB.precioUnitario)}</span>
                    <span className="font-black text-cayenne">Total: {formatCRC(dup.ocB.total)}</span>
                  </div>
                  <div className="text-xs text-cayenne font-bold">
                    Estado Actual: <span className="underline">{dup.ocB.estado}</span>
                  </div>
                </div>
              </div>

              {/* Justificación y Botones de Resolución */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t-2 border-darkteal/15 dark:border-darkteal/40">
                <p className="text-darkteal dark:text-softlinen/80 text-xs font-semibold leading-relaxed">
                  <strong className="text-evergreen dark:text-softlinen">Diagnóstico:</strong> {dup.motivo}
                </p>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleAction(dup.ocB.id, 'REVISADA', 'Justificada por responsable de obra tras revisión técnica.')}
                    disabled={processingId === dup.ocB.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-darkteal/30 hover:bg-softlinen/40 text-evergreen dark:text-softlinen font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 text-yellowgreen" />
                    <span>Marcar Revisada</span>
                  </button>

                  <button
                    onClick={() => handleAction(dup.ocB.id, 'PAGO_RETENIDO', 'Retención de pago por detección automática de duplicidad.')}
                    disabled={processingId === dup.ocB.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cayenne hover:bg-cayenne/90 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-xs active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Retener Pago / Anular OC</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-evergreen p-8 rounded-2xl border-2 border-darkteal/20 text-center text-sm font-bold text-darkteal dark:text-softlinen/70">
            No se detectaron órdenes de compra duplicadas.
          </div>
        )}
      </div>

      {/* 3. Panel de Compras Fuera de Contrato / Sobreprecios */}
      <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-yellowgreen shadow-xs overflow-hidden">
        <div className="p-4 border-b-2 border-darkteal/15 dark:border-darkteal/40 bg-softlinen/50 dark:bg-darkteal/50 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-evergreen dark:text-softlinen uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellowgreen" />
              Auditoría de Precios Fuera de Contrato (Ejercicio A3)
            </h4>
            <p className="text-xs text-darkteal dark:text-softlinen/70 mt-0.5 font-medium">
              Insumos adquiridos a precios superiores a los pactados contractualmente por Constructora Del Valle S.A.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-softlinen/60 dark:bg-darkteal/60 border-b-2 border-darkteal/20 dark:border-darkteal/50 text-evergreen dark:text-softlinen font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Proveedor / Área</th>
                <th className="py-3 px-4 text-right">Precio Pagado</th>
                <th className="py-3 px-4 text-right">Precio Contrato</th>
                <th className="py-3 px-4 text-center">Desvío %</th>
                <th className="py-3 px-4 text-right">Sobrecosto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-darkteal/10 dark:divide-darkteal/40 text-evergreen dark:text-softlinen font-medium">
              {sobreprecios.map((sp) => (
                <tr key={sp.id} className="hover:bg-softlinen/30 dark:hover:bg-darkteal/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-evergreen dark:text-softlinen whitespace-nowrap">
                    {sp.numeroOC}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-evergreen dark:text-white whitespace-nowrap text-sm">
                    {sp.material}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold">
                    <span className="font-bold text-evergreen dark:text-softlinen">{sp.proveedor}</span>
                    <span className="text-xs text-darkteal dark:text-softlinen/60 block">{sp.destino}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-cayenne whitespace-nowrap text-sm">
                    {formatCRC(sp.precioPagado)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-darkteal dark:text-softlinen/80 whitespace-nowrap text-sm">
                    {formatCRC(sp.precioContrato)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black bg-cayenne/20 text-cayenne border border-cayenne">
                      +{sp.porcentajeDesvio}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-cayenne whitespace-nowrap text-sm">
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

