import React, { useState, useMemo } from 'react';
import { X, Calculator, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
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

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave({
        ...formData,
        stockSeguridad: ssCalculado,
        puntoReorden: prCalculado,
        estado: estadoCalculado,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-evergreen/80 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-softlinen dark:bg-evergreen border-2 border-darkteal dark:border-darkteal-light rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header con colores sólidos */}
        <div className="p-6 bg-darkteal text-softlinen flex items-center justify-between border-b-2 border-evergreen dark:border-darkteal-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellowgreen text-evergreen flex items-center justify-center font-black">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-softlinen">
                Registrar Material en Catálogo
              </h2>
              <p className="text-xs font-bold text-yellowgreen">
                El Punto de Reorden (PR) se calcula dinámicamente y no se digita
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-evergreen hover:bg-cayenne text-softlinen flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-cayenne text-white text-sm font-bold flex items-center gap-2 shadow-xs">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sección 1: Datos Básicos */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen border-b-2 border-darkteal/15 pb-1">
              1. Identificación y Unidad de Medida
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                  Código de Insumo *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="codigo"
                    required
                    value={formData.codigo}
                    onChange={handleChange}
                    placeholder="Ej. CEM-50KG"
                    className="flex-1 bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3 py-2 rounded-xl bg-darkteal hover:bg-darkteal-light text-softlinen text-xs font-bold transition-all cursor-pointer"
                    title="Generar código sugerido"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                  Nombre del Material *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Cemento gris 50 kg"
                  className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2 text-sm font-semibold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
                />
              </div>

              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3.5 py-2 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen cursor-pointer"
                >
                  <option value="Aglomerantes">Aglomerantes (Cementos/Cales)</option>
                  <option value="Aceros Estructurales">Aceros Estructurales</option>
                  <option value="Mampostería">Mampostería (Blocks/Ladrillos)</option>
                  <option value="Áridos">Áridos (Arena/Piedra)</option>
                  <option value="Tuberías">Tuberías y PVC</option>
                  <option value="Acabados">Acabados y Pinturas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                    Unidad
                  </label>
                  <input
                    type="text"
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleChange}
                    placeholder="sacos, unid, m³"
                    className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3 py-2 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
                  />
                </div>
                <div>
                  <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                    Ubicación
                  </label>
                  <select
                    name="ubicacionPrincipal"
                    value={formData.ubicacionPrincipal}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-2 py-2 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen cursor-pointer"
                  >
                    <option value="Bodega Central">Bodega Central</option>
                    <option value="Obras">Obras</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Parámetros de Demanda y Plazo */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen border-b-2 border-darkteal/15 pb-1">
              2. Parámetros de Consumo y Proveedor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  name="stockActual"
                  min="0"
                  required
                  value={formData.stockActual}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3 py-2 text-sm font-black text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
                />
              </div>

              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                  Demanda Prom. (d) *
                </label>
                <input
                  type="number"
                  name="demandaDiariaPromedio"
                  min="1"
                  required
                  value={formData.demandaDiariaPromedio}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3 py-2 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
                />
              </div>

              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
                  Demanda Máx. *
                </label>
                <input
                  type="number"
                  name="demandaDiariaMaxima"
                  min="1"
                  required
                  value={formData.demandaDiariaMaxima}
                  onChange={handleChange}
                  className={`w-full bg-white dark:bg-darkteal/60 border-2 rounded-xl px-3 py-2 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden ${
                    errorCalculo ? 'border-cayenne bg-cayenne/10' : 'border-darkteal/20 dark:border-darkteal focus:border-yellowgreen'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-evergreen dark:text-softlinen mb-1.5">
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
                    className="w-full bg-white dark:bg-darkteal/60 border-2 border-darkteal/20 dark:border-darkteal rounded-xl px-3 py-2 text-sm font-bold text-evergreen dark:text-softlinen focus:outline-hidden focus:border-yellowgreen"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-darkteal/70 dark:text-softlinen/70 text-xs font-bold">
                    días
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: REGLA DE NEGOCIO OBLIGATORIA (CÁLCULOS READ-ONLY) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-darkteal/40 border-2 border-darkteal dark:border-yellowgreen/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-evergreen dark:text-softlinen font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-yellowgreen" />
                <span>Cálculo Reactivo Oficial (Opción 2)</span>
              </div>
              <span className="text-xs font-bold text-evergreen bg-yellowgreen px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Campos Protegidos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* SS READONLY */}
              <div className="bg-softlinen/50 dark:bg-evergreen p-4 rounded-xl border-2 border-darkteal/30 dark:border-darkteal">
                <span className="block text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
                  Stock de Seguridad (SS)
                </span>
                <div className="text-2xl font-black text-evergreen dark:text-softlinen mt-1">
                  {ssCalculado} <span className="text-sm font-semibold">{formData.unidad}</span>
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
                <span className="text-xs text-darkteal dark:text-softlinen/70 font-mono block mt-1">
                  ({formData.demandaDiariaMaxima || 0} - {formData.demandaDiariaPromedio || 0}) × {formData.tiempoEntregaDias || 0}
                </span>
              </div>

              {/* PR READONLY */}
              <div className="bg-softlinen/50 dark:bg-evergreen p-4 rounded-xl border-2 border-yellowgreen shadow-xs">
                <span className="block text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
                  Punto de Reorden (PR)
                </span>
                <div className="text-2xl font-black text-evergreen dark:text-softlinen mt-1">
                  {prCalculado} <span className="text-sm font-semibold">{formData.unidad}</span>
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
                <span className="text-xs text-darkteal dark:text-softlinen/70 font-mono block mt-1">
                  ({formData.demandaDiariaPromedio || 0} × {formData.tiempoEntregaDias || 0}) + {ssCalculado}
                </span>
              </div>

              {/* ESTADO ESTIMADO */}
              <div className="bg-softlinen/50 dark:bg-evergreen p-4 rounded-xl border-2 border-darkteal/30 dark:border-darkteal flex flex-col justify-between">
                <span className="block text-xs font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
                  Estado Inicial
                </span>
                <div className="my-1">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase ${
                    estadoCalculado === 'CRÍTICO' 
                      ? 'bg-cayenne text-white' 
                      : estadoCalculado === 'ALERTA'
                      ? 'bg-darkteal text-yellowgreen'
                      : 'bg-yellowgreen text-evergreen'
                  }`}>
                    {estadoCalculado}
                  </span>
                </div>
                <span className="text-xs text-darkteal dark:text-softlinen/70 font-medium">
                  Stock: {formData.stockActual} vs PR: {prCalculado}
                </span>
              </div>
            </div>
          </div>

          {/* Footer del Formulario */}
          <div className="pt-2 flex justify-end gap-3 border-t-2 border-darkteal/15">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-darkteal/30 text-evergreen dark:text-softlinen text-sm font-bold hover:bg-darkteal/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(errorCalculo)}
              className="px-6 py-2.5 rounded-xl bg-yellowgreen hover:bg-yellowgreen-light text-evergreen font-black text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
