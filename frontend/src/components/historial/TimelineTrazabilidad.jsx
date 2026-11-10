import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  FileText, 
  Calendar, 
  User, 
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatFechaLocal, formatCRC } from '../../services/inventoryCalculations.js';

export default function TimelineTrazabilidad({
  movimientos = [],
  ordenesCompra = [],
}) {
  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 p-12 text-center shadow-xs">
        <PackageCheck className="w-12 h-12 text-darkteal/40 dark:text-softlinen/40 mx-auto mb-2" />
        <h4 className="text-base font-black text-evergreen dark:text-softlinen">Sin historial de movimientos</h4>
        <p className="text-sm text-darkteal dark:text-softlinen/70 mt-1 max-w-sm mx-auto font-medium">
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
    <div className="relative pl-7 sm:pl-9 space-y-6 before:content-[''] before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-1 before:bg-darkteal/20 dark:before:bg-darkteal/60">
      {movimientos.map((mov, idx) => {
        const isEntrada = mov.tipo === 'ENTRADA';
        const isSalida = mov.tipo === 'SALIDA';

        // Intentar cruzar con Orden de Compra
        const linkedOC = ocMap.get(mov.documentoReferencia?.trim().toUpperCase());

        return (
          <div key={mov.id || idx} className="relative group">
            {/* Timeline Bullet Icon */}
            <div
              className={`absolute -left-7 sm:-left-9 top-1.5 w-7 h-7 rounded-full border-2 border-white dark:border-evergreen shadow-xs flex items-center justify-center font-bold ${
                isEntrada
                  ? 'bg-yellowgreen text-evergreen'
                  : isSalida
                  ? 'bg-cayenne text-white'
                  : 'bg-darkteal text-softlinen'
              }`}
            >
              {isEntrada ? (
                <ArrowDownLeft className="w-4 h-4" />
              ) : isSalida ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowLeftRight className="w-4 h-4" />
              )}
            </div>

            {/* Event Card */}
            <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 p-5 shadow-xs hover:border-yellowgreen transition-all text-sm space-y-4">
              {/* Card Header: Timestamp & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-darkteal/15 dark:border-darkteal/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <Badge variant={mov.tipo} size="sm" />
                  <span className="font-black text-evergreen dark:text-softlinen text-base">
                    {mov.materialNombre}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-darkteal dark:text-softlinen/70 font-bold">
                  <Calendar className="w-4 h-4 text-yellowgreen" />
                  <span>{formatFechaLocal(mov.fecha, true)}</span>
                </div>
              </div>

              {/* Quantities & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-softlinen/40 dark:bg-darkteal/40 p-3.5 rounded-xl border-2 border-darkteal/15 dark:border-darkteal/50">
                <div>
                  <span className="text-xs font-black uppercase text-darkteal dark:text-softlinen/60 block">
                    Volumen Transaccionado
                  </span>
                  <span className={`text-lg font-black ${
                    isEntrada ? 'text-yellowgreen' : isSalida ? 'text-cayenne' : 'text-darkteal dark:text-softlinen'
                  }`}>
                    {isEntrada ? '+' : isSalida ? '-' : '⇄'}{Number(mov.cantidad).toLocaleString()} {mov.unidad}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-xs font-black uppercase text-darkteal dark:text-softlinen/60 block">
                    Flujo de Almacén
                  </span>
                  <div className="text-evergreen dark:text-softlinen font-bold mt-1 flex items-center gap-2 flex-wrap text-xs">
                    <span className="bg-white dark:bg-evergreen px-2.5 py-1 rounded-md border border-darkteal/20 text-evergreen dark:text-softlinen">
                      {mov.origen}
                    </span>
                    <span className="text-cayenne font-black">→</span>
                    <span className="bg-white dark:bg-evergreen px-2.5 py-1 rounded-md border border-darkteal/20 font-black text-evergreen dark:text-softlinen">
                      {mov.destino}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documento y Trazabilidad de Origen (OC / Vale) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-darkteal dark:text-softlinen/60 block">
                    Comprobante / Documento Soporte
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-evergreen dark:text-softlinen bg-softlinen/70 dark:bg-darkteal/70 px-2.5 py-1 rounded-md border border-darkteal/20 dark:border-darkteal/50 inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cayenne" />
                      {mov.documentoReferencia}
                    </span>
                    <span className="text-xs text-darkteal dark:text-softlinen/70 font-semibold">
                      ({mov.tipoDocumento})
                    </span>
                  </div>

                  {/* Detalle si está vinculado a una OC con precio y proveedor */}
                  {linkedOC && (
                    <div className="mt-2 p-3 rounded-xl bg-yellowgreen/15 border-2 border-yellowgreen text-xs text-evergreen dark:text-softlinen space-y-1">
                      <p className="font-black flex items-center gap-1.5 text-evergreen dark:text-softlinen">
                        <ShieldCheck className="w-4 h-4 text-yellowgreen" />
                        Trazabilidad Compra: {linkedOC.proveedor}
                      </p>
                      <p className="text-darkteal dark:text-softlinen/80 font-medium">
                        Precio pactado: <strong className="text-evergreen dark:text-softlinen font-bold">{formatCRC(linkedOC.precioUnitario)}</strong> / {linkedOC.unidad} · Total: <strong className="text-evergreen dark:text-softlinen font-bold">{formatCRC(linkedOC.total)}</strong>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-darkteal dark:text-softlinen/60 block">
                    Responsable & Motivo
                  </span>
                  <p className="text-evergreen dark:text-softlinen font-bold flex items-center gap-1.5 text-xs">
                    <User className="w-4 h-4 text-yellowgreen" />
                    {mov.usuario}
                  </p>
                  {mov.motivo && (
                    <p className="text-xs text-darkteal dark:text-softlinen/70 italic font-medium">
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

