import React, { useState, useMemo } from 'react';
import { X, Calculator, AlertTriangle, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { calculateStockSeguridad, calculatePuntoReorden, determineMaterialStatus } from '../../services/inventoryCalculations.js';

export default function MaterialModalForm({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Aglomerantes',
    unidad: 'sacos',
    ubicacionPrincipal: 'Bodega Central',
    stockActual: 100,
    demandaDiariaPromedio: 20,
    demandaDiariaMaxima: 30,
    tiempoEntregaDias: 3,
    precioUnitarioPromedio: 5000,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CÁLCULO REACTIVO EN TIEMPO REAL (REGLA DE NEGOCIO OBLIGATORIA)
  const { ssCalculado, prCalculado, estadoCalculado, errorCalculo } = useMemo(() => {
    const dProm = Number(formData.demandaDiariaPromedio) || 0;
    const dMax = Number(formData.demandaDiariaMaxima) || 0;
    const L = Number(formData.tiempoEntregaDias) || 0;

    let error = null;
    if (dMax < dProm) {
      error = 'La demanda máxima no puede ser menor que la demanda diaria promedio.';
    }

    const ss = calculateStockSeguridad(dMax, dProm, L);
    const pr = calculatePuntoReorden(dProm, L, ss);
    const estado = determineMaterialStatus(formData.stockActual, pr);

    return {
      ssCalculado: ss,
      prCalculado: pr,
      estadoCalculado: estado,
      errorCalculo: error,
    };
  }, [
    formData.demandaDiariaPromedio,
    formData.demandaDiariaMaxima,
    formData.tiempoEntregaDias,
    formData.stockActual,
  ]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    setErrorMsg('');
  };

  const handleGenerateCode = () => {
    const prefix = formData.nombre ? formData.nombre.slice(0, 3).toUpperCase() : 'MAT';
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, codigo: `${prefix}-${rand}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      setErrorMsg('El código y el nombre del material son obligatorios.');
      return;
    }

    if (errorCalculo) {
      setErrorMsg(errorCalculo);
      return;
    }

    if (Number(formData.demandaDiariaPromedio) <= 0 || Number(formData.tiempoEntregaDias) <= 0) {
      setErrorMsg('La demanda diaria y el tiempo de entrega deben ser mayores a cero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        demandaDiariaPromedio: Number(formData.demandaDiariaPromedio),
        demandaDiariaMaxima: Number(formData.demandaDiariaMaxima),
        tiempoEntregaDias: Number(formData.tiempoEntregaDias),
        stockActual: Number(formData.stockActual),
        precioUnitarioPromedio: Number(formData.precioUnitarioPromedio),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Registrar Nuevo Material / Insumo
              </h3>
              <p className="text-[11px] text-slate-300">
                Constructora Del Valle S.A. · Parámetros de inventario y punto de reorden
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sección 1: Datos Generales */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              1. Ficha de Identificación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Código Interno *</label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[10px] text-amber-600 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  name="codigo"
                  required
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej. CEM-50KG"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Material *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Cemento gris de uso general (50kg)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="Aglomerantes">Aglomerantes (Cementos/Cales)</option>
                  <option value="Aceros Estructurales">Aceros Estructurales</option>
                  <option value="Mampostería">Mampostería (Blocks/Ladrillos)</option>
                  <option value="Áridos">Áridos (Arena/Piedra)</option>
                  <option value="Instalaciones">Instalaciones (PVC/Sanitaria)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                <select
                  name="unidad"
                  value={formData.unidad}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="sacos">sacos</option>
                  <option value="unid">unid (unidades)</option>
                  <option value="m³">m³ (metros cúbicos)</option>
                  <option value="tubos">tubos</option>
                  <option value="kg">kg (kilogramos)</option>
                  <option value="galones">galones</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Inicial</label>
                <select
                  name="ubicacionPrincipal"
                  value={formData.ubicacionPrincipal}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="Bodega Central">Bodega Central</option>
                  <option value="Obras">Obras (Frente Activo)</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 2: Parámetros Operativos de Demanda y Plazo */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              2. Parámetros de Consumo y Proveedor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stock Actual Inicial</label>
                <input
                  type="number"
                  name="stockActual"
                  min="0"
                  required
                  value={formData.stockActual}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1" title="Demanda diaria promedio">
                  Demanda Prom. (d) *
                </label>
                <input
                  type="number"
                  name="demandaDiariaPromedio"
                  min="1"
                  required
                  value={formData.demandaDiariaPromedio}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1" title="Demanda diaria máxima esperada">
                  Demanda Máx. *
                </label>
                <input
                  type="number"
                  name="demandaDiariaMaxima"
                  min="1"
                  required
                  value={formData.demandaDiariaMaxima}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 ${
                    errorCalculo ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1" title="Lead Time: tiempo de entrega del proveedor">
                  Plazo Entrega (L) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="tiempoEntregaDias"
                    min="1"
                    required
                    value={formData.tiempoEntregaDias}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                    días
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: REGLA DE NEGOCIO OBLIGATORIA (CÁLCULOS READ-ONLY) */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Cálculo Reactivo Oficial (Opción 2 - Quiz #2)</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                Campos protegidos no editables
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* SS READONLY */}
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase text-slate-500">
                  Stock de Seguridad (SS)
                </span>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {ssCalculado} <span className="text-xs font-normal text-slate-500">{formData.unidad}</span>
                </div>
                <input
                  type="text"
                  name="stockSeguridad"
                  readOnly
                  disabled
                  value={`${ssCalculado} ${formData.unidad}`}
                  className="sr-only"
                  aria-label="Stock de Seguridad calculado"
                />
                <span className="text-[9px] text-slate-400 font-mono block mt-1">
                  (dMax - d) × L = ({formData.demandaDiariaMaxima || 0} - {formData.demandaDiariaPromedio || 0}) × {formData.tiempoEntregaDias || 0}
                </span>
              </div>

              {/* PR READONLY */}
              <div className="bg-white p-3 rounded-lg border-2 border-amber-500 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase text-amber-800">
                  Punto de Reorden (PR)
                </span>
                <div className="text-lg font-black text-amber-950 mt-0.5">
                  {prCalculado} <span className="text-xs font-normal text-amber-700">{formData.unidad}</span>
                </div>
                <input
                  type="text"
                  name="puntoReorden"
                  readOnly
                  disabled
                  value={`${prCalculado} ${formData.unidad}`}
                  className="sr-only"
                  aria-label="Punto de Reorden calculado"
                />
                <span className="text-[9px] text-slate-400 font-mono block mt-1">
                  (d × L) + SS = ({formData.demandaDiariaPromedio || 0} × {formData.tiempoEntregaDias || 0}) + {ssCalculado}
                </span>
              </div>

              {/* ESTADO ESTIMADO */}
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase text-slate-500">
                  Estado Proyectado
                </span>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-black ${
                    estadoCalculado === 'CRÍTICO' 
                      ? 'bg-rose-100 text-rose-800' 
                      : estadoCalculado === 'ALERTA'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {estadoCalculado}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">
                  {formData.stockActual <= prCalculado ? 'Stock bajo o igual al PR' : 'Stock por encima de seguridad'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-amber-800 leading-tight">
              * <em>Restricción institucional:</em> El Punto de Reorden ($PR$) y el Stock de Seguridad ($SS$) son calculados automáticamente por el sistema conforme a la pauta técnica. No pueden modificarse manualmente.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(errorCalculo)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Confirmar y Guardar Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

