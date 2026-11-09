import React from 'react';
import clsx from 'clsx';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight 
} from 'lucide-react';

const VARIANT_MAP = {
  CRÍTICO: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
  },
  CRITICO: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
  },
  ALERTA: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
  },
  ÓPTIMO: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  OPTIMO: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  ENTRADA: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ArrowDownLeft,
  },
  SALIDA: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: ArrowUpRight,
  },
  TRASLADO: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ArrowLeftRight,
  },
  NEUTRAL: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: null,
  },
};

export default function Badge({ variant = 'NEUTRAL', label, size = 'sm', className = '' }) {
  const normKey = String(variant).toUpperCase();
  const config = VARIANT_MAP[normKey] || VARIANT_MAP.NEUTRAL;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded border uppercase tracking-wider select-none',
        config.bg,
        sizeClasses[size] || sizeClasses.sm,
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{label || variant}</span>
    </span>
  );
}

