import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  AlertCircle, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import Badge from '../common/Badge';

export default function MovimientoForm({
  materiales = [],
  onSubmit,
  isSubmitting = false,
  initialMaterialId = '',
}) {
  const [tipo, setTipo] = useState('ENTRADA');
  const [materialId, setMaterialId] = useState(initialMaterialId || (materiales[0]?.id || ''));
  const [cantidad, setCantidad] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('Bodega Central');
  const [documentoReferencia, setDocumentoReferencia] = useState('');
  const [usuario] = useState('Alanie Rodríguez (Bodega Central)');
  const [motivo, setMotivo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialMaterialId) {
      setMaterialId(initialMaterialId);
    } else if (!materialId && materiales.length > 0) {
      setMaterialId(materiales[0].id);
    }
  }, [initialMaterialId, materiales]);

  useEffect(() => {
    if (tipo === 'ENTRADA') {
      setOrigen('Proveedor / Compra');
      setDestino('Bodega Central');
      if (!documentoReferencia.startsWith('OC-')) {
        setDocumentoReferencia('OC-');
      }
    } else if (tipo === 'SALIDA') {
      setOrigen('Bodega Central');
      setDestino('Frente Torre Valle Norte');
      if (!documentoReferencia.startsWith('VALE-') && !documentoReferencia.startsWith('VS-')) {
        setDocumentoReferencia('VALE-');
      }
    } else if (tipo === 'TRASLADO') {
      setOrigen('Bodega Central');
      setDestino('Obras (Sub-bodega)');
      if (!documentoReferencia.startsWith('TR-')) {
        setDocumentoReferencia('TR-');
      }
    }
    setErrorMsg('');
  }, [tipo]);

  const selectedMaterial = useMemo(() => {
    return materiales.find((m) => String(m.id) === String(materialId));
  }, [materiales, materialId]);

  const numCantidad = Number(cantidad) || 0;
  const stockActual = selectedMaterial ? Number(selectedMaterial.stockActual) || 0 : 0;

  const stockResultante = useMemo(() => {
    if (!selectedMaterial) return 0;
    if (tipo === 'ENTRADA') return stockActual + numCantidad;
    if (tipo === 'SALIDA') return stockActual - numCantidad;
    return stockActual;
  }, [selectedMaterial, tipo, stockActual, numCantidad]);

  const isSaldoNegativo = tipo === 'SALIDA' && numCantidad > stockActual;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId) {
      setErrorMsg('Selecciona un material del catálogo.');
      return;
    }
    if (!numCantidad || numCantidad <= 0) {
      setErrorMsg('Ingresa una cantidad mayor a cero.');
      return;
    }
    if (isSaldoNegativo) {
      setErrorMsg(
        `Saldo insuficiente: No puedes despachar ${numCantidad} ${selectedMaterial?.unidad}. Stock actual disponible: ${stockActual} ${selectedMaterial?.unidad}.`
      );
      return;
    }
    if (!documentoReferencia.trim()) {
      setErrorMsg('El documento de soporte (OC o Vale) es obligatorio para trazabilidad.');
      return;
    }

    try {
      setErrorMsg('');
      await onSubmit({
        materialId,
        tipo,
        cantidad: numCantidad,
        origen,
        destino,
        documentoReferencia: documentoReferencia.trim(),
        tipoDocumento: tipo === 'ENTRADA' ? 'ORDEN_COMPRA' : tipo === 'SALIDA' ? 'VALE_SALIDA' : 'GUIA_TRASLADO',
        usuario,
        motivo,
      });

      setCantidad('');
      setMotivo('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el movimiento.');
    }
  };

  return (
    <div className="bg-white dark:bg-darkteal/60 rounded-2xl border-2 border-darkteal/20 dark:border-darkteal p-6 sm:p-7 shadow-sm">
      <div className="border-b-2 border-darkteal/15 pb-4 mb-6">
        <h3 className="text-lg font-black text-evergreen dark:text-softlinen uppercase tracking-wider">
          Registrar Transacción de Almacén
        </h3>
        <p className="text-xs md:text-sm font-semibold text-darkteal dark:text-yellowgreen mt-0.5">
          Captura entradas por compra (OC), salidas a frentes de obra (Vales) y traslados internos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-cayenne text-white text-sm font-bold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Selector de Tipo de Movimiento */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
            Tipo de Flujo de Inventario
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTipo('ENTRADA')}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs md:text-sm font-black uppercase tracking-wide transition-all cursor-pointer ${
                tipo === 'ENTRADA'
                  ? 'bg-yellowgreen text-evergreen border-yellowgreen shadow-xs'
                  : 'bg-softlinen/40 dark:bg-evergreen border-darkteal/20 text-evergreen dark:text-softlinen hover:border-yellowgreen'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 shrink-0" />
              <span>Entrada (OC)</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('SALIDA')}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs md:text-sm font-black uppercase tracking-wide transition-all cursor-pointer ${
                tipo === 'SALIDA'
                  ? 'bg-cayenne text-white border-cayenne shadow-xs'
                  : 'bg-softlinen/40 dark:bg-evergreen border-darkteal/20 text-evergreen dark:text-softlinen hover:border-cayenne'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>Salida (Vale)</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('TRASLADO')}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs md:text-sm font-black uppercase tracking-wide transition-all cursor-pointer ${
                tipo === 'TRASLADO'
                  ? 'bg-darkteal text-softlinen border-darkteal shadow-xs'
                  : 'bg-softlinen/40 dark:bg-evergreen border-darkteal/20 text-evergreen dark:text-softlinen hover:border-darkteal'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 shrink-0" />
              <span>Traslado</span>
            </button>
          </div>
        </div>

        {/* 2. Selector de Insumo y Cantidad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="sm:col-span-2">
            <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
              Material / Insumo *
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen cursor-pointer"
            >
              {materiales.length === 0 && (
                <option value="">No hay materiales disponibles</option>
              )}
              {materiales.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.codigo}) · Stock: {m.stockActual} {m.unidad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
              Cantidad {selectedMaterial ? `(${selectedMaterial.unidad})` : ''} *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 50"
              className={`w-full bg-softlinen/40 dark:bg-evergreen border-2 rounded-xl px-3.5 py-2.5 text-sm font-black text-evergreen dark:text-softlinen focus:outline-hidden ${
                isSaldoNegativo ? 'border-cayenne bg-cayenne/10' : 'border-darkteal/20 dark:border-darkteal focus:border-yellowgreen'
              }`}
            />
          </div>
        </div>

        {/* 3. Indicador Dinámico de Impacto en Stock */}
        {selectedMaterial && (
          <div className="p-4 rounded-xl bg-softlinen/50 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-darkteal dark:text-yellowgreen shrink-0" />
              <span className="font-bold text-evergreen dark:text-softlinen">
                Stock actual: <strong className="text-darkteal dark:text-yellowgreen">{stockActual} {selectedMaterial.unidad}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-evergreen dark:text-softlinen">Stock resultante:</span>
              <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                isSaldoNegativo
                  ? 'bg-cayenne text-white border-cayenne'
                  : 'bg-yellowgreen text-evergreen border-yellowgreen'
              }`}>
                {stockResultante} {selectedMaterial.unidad}
              </span>
            </div>
          </div>
        )}

        {/* 4. Documento de Referencia y Ubicaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
              {tipo === 'ENTRADA' ? 'N° Orden de Compra (OC) *' : 'N° Vale de Salida / Guía *'}
            </label>
            <input
              type="text"
              required
              value={documentoReferencia}
              onChange={(e) => setDocumentoReferencia(e.target.value)}
              placeholder="OC-1041"
              className="w-full bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
            />
          </div>

          <div>
            <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
              Origen
            </label>
            <input
              type="text"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              placeholder="Bodega Central"
              className="w-full bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2.5 text-sm font-semibold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
            />
          </div>

          <div>
            <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
              Destino
            </label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Frente de Obra"
              className="w-full bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2.5 text-sm font-semibold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
            />
          </div>
        </div>

        {/* 5. Observaciones */}
        <div>
          <label className="block text-sm font-bold text-evergreen dark:text-softlinen mb-1.5">
            Observaciones / Justificación
          </label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Despacho prioritario para colado de losa nivel 2"
            className="w-full bg-softlinen/40 dark:bg-evergreen border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2.5 text-sm font-medium text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
          />
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isSubmitting || isSaldoNegativo}
          className="w-full py-3.5 rounded-xl bg-yellowgreen hover:bg-yellowgreen-light text-evergreen font-black text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Procesando Transacción...' : 'Confirmar y Registrar Transacción'}
        </button>
      </form>
    </div>
  );
}
