import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  FileText, 
  Calendar, 
  Building, 
  User, 
  DollarSign, 
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatFechaLocal, formatCRC } from '../../services/inventoryCalculations.js';

export default function TimelineTrazabilidad({
  movimientos = [],
  ordenesCompra = [],
  material = null,
}) {
  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">Sin historial de movimientos</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No hay transacciones registradas para este filtro o el insumo no ha tenido flujo aún.
        </p>
      </div>
    );
  }

  // Mapa de órdenes de compra indexadas por numeroOC para cruce de datos
  const ocMap = new Map();
  ordenesCompra.forEach((oc) => {
    ocMap.set(oc.numeroOC.trim().toUpperCase(), oc);
  });

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {movimientos.map((mov, idx) => {
        const isEntrada = mov.tipo === 'ENTRADA';
        const isSalida = mov.tipo === 'SALIDA';
        const isTraslado = mov.tipo === 'TRASLADO';

        // Intentar cruzar con Orden de Compra
        const linkedOC = ocMap.get(mov.documentoReferencia?.trim().toUpperCase());

        return (
          <div key={mov.id || idx} className="relative group">
            {/* Timeline Bullet Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                isEntrada
                  ? 'bg-emerald-600 text-white'
                  : isSalida
                  ? 'bg-rose-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isEntrada ? (
                <ArrowDownLeft className="w-3 h-3" />
              ) : isSalida ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowLeftRight className="w-3 h-3" />
              )}
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all text-xs space-y-3">
              {/* Card Header: Timestamp & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant={mov.tipo} size="xs" />
                  <span className="font-bold text-slate-900 text-sm">
                    {mov.materialNombre}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatFechaLocal(mov.fecha, true)}</span>
                </div>
              </div>

              {/* Quantities & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Volumen Transaccionado
                  </span>
                  <span className={`text-base font-black ${
                    isEntrada ? 'text-emerald-700' : isSalida ? 'text-rose-700' : 'text-blue-700'
                  }`}>
                    {isEntrada ? '+' : isSalida ? '-' : '⇄'}{mov.cantidad} {mov.unidad}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Flujo de Almacén
                  </span>
                  <div className="text-slate-800 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {mov.origen}
                    </span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-900">
                      {mov.destino}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documento y Trazabilidad de Origen (OC / Vale) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Comprobante / Documento Soporte
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80 inline-flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-700" />
                      {mov.documentoReferencia}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({mov.tipoDocumento})
                    </span>
                  </div>

                  {/* Detalle si está vinculado a una OC con precio y proveedor */}
                  {linkedOC && (
                    <div className="mt-1.5 p-2 rounded bg-amber-50/50 border border-amber-200/60 text-[11px] text-amber-950 space-y-0.5">
                      <p className="font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Trazabilidad Compra: {linkedOC.proveedor}
                      </p>
                      <p className="text-slate-600">
                        Precio pactado: <strong className="text-slate-800">{formatCRC(linkedOC.precioUnitario)}</strong> / {linkedOC.unidad} · Total Facturado: <strong className="text-slate-800">{formatCRC(linkedOC.total)}</strong>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Responsable & Motivo
                  </span>
                  <p className="text-slate-700 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {mov.usuario}
                  </p>
                  {mov.motivo && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{mov.motivo}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

