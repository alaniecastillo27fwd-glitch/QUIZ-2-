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
    bg: 'bg-cayenne text-white border-cayenne shadow-xs',
    icon: AlertCircle,
  },
  CRITICO: {
    bg: 'bg-cayenne text-white border-cayenne shadow-xs',
    icon: AlertCircle,
  },
  ALERTA: {
    bg: 'bg-darkteal text-yellowgreen border-darkteal-light dark:bg-darkteal-dark',
    icon: AlertTriangle,
  },
  ÓPTIMO: {
    bg: 'bg-yellowgreen text-evergreen border-yellowgreen shadow-xs',
    icon: CheckCircle2,
  },
  OPTIMO: {
    bg: 'bg-yellowgreen text-evergreen border-yellowgreen shadow-xs',
    icon: CheckCircle2,
  },
  ENTRADA: {
    bg: 'bg-yellowgreen text-evergreen border-yellowgreen',
    icon: ArrowDownLeft,
  },
  SALIDA: {
    bg: 'bg-cayenne text-white border-cayenne',
    icon: ArrowUpRight,
  },
  TRASLADO: {
    bg: 'bg-darkteal text-softlinen border-darkteal',
    icon: ArrowLeftRight,
  },
  NEUTRAL: {
    bg: 'bg-softlinen text-evergreen dark:bg-darkteal/80 dark:text-softlinen border-darkteal/20',
    icon: null,
  },
};

export default function Badge({ variant = 'NEUTRAL', label, size = 'sm', className = '' }) {
  const normKey = String(variant).toUpperCase();
  const config = VARIANT_MAP[normKey] || VARIANT_MAP.NEUTRAL;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1 font-bold',
    sm: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
    md: 'px-3 py-1.5 text-sm gap-2 font-extrabold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg border-2 uppercase tracking-wide select-none transition-all',
        config.bg,
        sizeClasses[size] || sizeClasses.sm,
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label || variant}</span>
    </span>
  );
}
