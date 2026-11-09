import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  AlertCircle, 
  Check, 
  FileText, 
  Building, 
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
  const [tipo, setTipo] = useState('ENTRADA'); // 'ENTRADA' | 'SALIDA' | 'TRASLADO'
  const [materialId, setMaterialId] = useState(initialMaterialId || (materiales[0]?.id || ''));
  const [cantidad, setCantidad] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('Bodega Central');
  const [documentoReferencia, setDocumentoReferencia] = useState('');
  const [usuario, setUsuario] = useState('Alanie Rodríguez (Bodega Central)');
  const [motivo, setMotivo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Si cambia el material inicial desde la URL o props
  useEffect(() => {
    if (initialMaterialId) {
      setMaterialId(initialMaterialId);
    } else if (!materialId && materiales.length > 0) {
      setMaterialId(materiales[0].id);
    }
  }, [initialMaterialId, materiales]);

  // Ajustar orígenes y destinos según el tipo de movimiento
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

  // Previsualización de Impacto en Stock
  const impactAnalysis = useMemo(() => {
    if (!selectedMaterial) return null;
    const currentStock = Number(selectedMaterial.stockActual) || 0;
    const cantNum = Number(cantidad) || 0;
    const pr = selectedMaterial.puntoReorden;

    let resultingStock = currentStock;
    let isValid = true;
    let warning = null;

    if (tipo === 'ENTRADA') {
      resultingStock = currentStock + cantNum;
    } else if (tipo === 'SALIDA') {
      resultingStock = currentStock - cantNum;
      if (cantNum > currentStock) {
        isValid = false;
        warning = `La cantidad a retirar (${cantNum}) excede las existencias disponibles (${currentStock} ${selectedMaterial.unidad}).`;
      }
    } else if (tipo === 'TRASLADO') {
      if (cantNum > currentStock) {
        isValid = false;
        warning = `Stock insuficiente en origen para trasladar (${currentStock} ${selectedMaterial.unidad} disponibles).`;
      }
      if (origen === destino) {
        isValid = false;
        warning = 'El origen y el destino del traslado no pueden ser iguales.';
      }
    }

    const willBeCritical = resultingStock <= pr;
    const willBeAlert = resultingStock <= pr * 1.15 && !willBeCritical;

    return {
      currentStock,
      cantNum,
      resultingStock,
      isValid,
      warning,
      willBeCritical,
      willBeAlert,
      pr,
      unidad: selectedMaterial.unidad,
    };
  }, [selectedMaterial, tipo, cantidad, origen, destino]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMaterial) {
      setErrorMsg('Debe seleccionar un material válido.');
      return;
    }

    const cantNum = Number(cantidad);
    if (!cantNum || cantNum <= 0) {
      setErrorMsg('La cantidad debe ser un número positivo mayor a cero.');
      return;
    }

    if (!documentoReferencia.trim()) {
      setErrorMsg(
        tipo === 'ENTRADA'
          ? 'El número de Orden de Compra (OC) es obligatorio.'
          : tipo === 'SALIDA'
          ? 'El número de Vale de Salida es obligatorio.'
          : 'El número de Guía de Traslado es obligatorio.'
      );
      return;
    }

    if (impactAnalysis && !impactAnalysis.isValid) {
      setErrorMsg(impactAnalysis.warning);
      return;
    }

    const tipoDoc = 
      tipo === 'ENTRADA' ? 'ORDEN_COMPRA' : 
      tipo === 'SALIDA' ? 'VALE_SALIDA' : 'GUIA_TRASLADO';

    try {
      await onSubmit({
        materialId: selectedMaterial.id,
        tipo,
        cantidad: cantNum,
        origen,
        destino,
        documentoReferencia: documentoReferencia.trim(),
        tipoDocumento: tipoDoc,
        usuario,
        motivo: motivo.trim(),
      });

      // Limpiar formulario tras éxito
      setCantidad('');
      setMotivo('');
      if (tipo === 'ENTRADA') setDocumentoReferencia('OC-');
      else if (tipo === 'SALIDA') setDocumentoReferencia('VALE-');
      else setDocumentoReferencia('TR-');
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el movimiento.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Form */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          Registrar Transacción de Almacén
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Captura entradas por compra (OC), salidas a frentes de obra (Vales) y traslados internos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Selector de Tipo de Movimiento (Tabs) */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Tipo de Flujo de Inventario
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTipo('ENTRADA')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                tipo === 'ENTRADA'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Entrada (OC)</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('SALIDA')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                tipo === 'SALIDA'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Salida (Vale)</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('TRASLADO')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                tipo === 'TRASLADO'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Traslado</span>
            </button>
          </div>
        </div>

        {/* 2. Selector de Material */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Material / Insumo *
          </label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            {materiales.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} ({m.codigo}) — Disponible: {m.stockActual} {m.unidad} [PR: {m.puntoReorden}]
              </option>
            ))}
          </select>
        </div>

        {/* 3. Cantidad y Documento de Soporte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {tipo === 'ENTRADA'
                ? 'N° Orden de Compra (OC) *'
                : tipo === 'SALIDA'
                ? 'N° Vale de Salida / Despacho *'
                : 'N° Guía de Traslado *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={documentoReferencia}
                onChange={(e) => setDocumentoReferencia(e.target.value)}
                placeholder={
                  tipo === 'ENTRADA' ? 'OC-1041' : tipo === 'SALIDA' ? 'VALE-8821' : 'TR-0310'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* 4. Origen y Destino según Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tipo === 'ENTRADA' ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origen (Proveedor)</label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Proveedor A / CEMEX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bodega Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="Bodega Central">Bodega Central</option>
                  <option value="Obras">Obras (Descarga Directa)</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </>
          ) : tipo === 'SALIDA' ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bodega Origen</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="Bodega Central">Bodega Central</option>
                  <option value="Obras">Obras (Patio Central)</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frente de Obra Destino</label>
                <input
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Frente Torre Norte (Losa Piso 3)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Origen</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="Bodega Central">Bodega Central</option>
                  <option value="Obras">Obras</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="Obras">Obras</option>
                  <option value="Bodega Central">Bodega Central</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* 5. Observaciones */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Observaciones / Justificación</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Despacho urgente para fundición de zapatas eje B"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
          />
        </div>

        {/* 6. Previsualización de Impacto en Stock */}
        {impactAnalysis && (
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            !impactAnalysis.isValid
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : impactAnalysis.willBeCritical
              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
              : impactAnalysis.willBeAlert
              ? 'bg-amber-50/60 border-amber-200 text-amber-900'
              : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Previsualización de Impacto en Stock:
              </span>
              <span className="font-semibold">
                PR: {impactAnalysis.pr} {impactAnalysis.unidad}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span>Actual: {impactAnalysis.currentStock} {impactAnalysis.unidad}</span>
              <span>{tipo === 'ENTRADA' ? '+' : tipo === 'SALIDA' ? '-' : '⇄'} {impactAnalysis.cantNum || 0}</span>
              <span>Resultante: {impactAnalysis.resultingStock} {impactAnalysis.unidad}</span>
            </div>

            {impactAnalysis.warning ? (
              <p className="text-[11px] font-semibold text-rose-700">
                {impactAnalysis.warning}
              </p>
            ) : impactAnalysis.willBeCritical ? (
              <p className="text-[11px] font-semibold text-rose-700">
                ⚠️ Advertencia: Con esta salida el stock caerá por debajo del Punto de Reorden ($PR={impactAnalysis.pr}$). Se generará alerta inmediata.
              </p>
            ) : null}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (impactAnalysis && !impactAnalysis.isValid)}
          className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? 'Procesando movimiento...' : 'Confirmar y Registrar Transacción'}</span>
        </button>
      </form>
    </div>
  );
}

