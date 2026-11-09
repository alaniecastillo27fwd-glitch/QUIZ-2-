import React from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  linkTo = null,
  trend = null,
  className = '',
}) {
  const borderVariants = {
    neutral: 'border-slate-200 bg-white hover:border-slate-300',
    warning: 'border-amber-300/80 bg-amber-50/30 hover:border-amber-400',
    danger: 'border-rose-300/80 bg-rose-50/30 hover:border-rose-400',
    success: 'border-emerald-300/80 bg-emerald-50/30 hover:border-emerald-400',
  };

  const iconBgVariants = {
    neutral: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
    success: 'bg-emerald-100 text-emerald-800',
  };

  const cardContent = (
    <div
      className={clsx(
        'p-5 rounded-xl border transition-all duration-150 flex flex-col justify-between h-full group',
        borderVariants[variant] || borderVariants.neutral,
        linkTo && 'cursor-pointer hover:shadow-xs',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
              iconBgVariants[variant] || iconBgVariants.neutral
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || linkTo) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-600 font-medium truncate">{subtitle}</span>
          )}
          {linkTo && (
            <span className="inline-flex items-center gap-0.5 text-slate-700 font-semibold group-hover:text-amber-600 transition-colors">
              Ver detalle
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block h-full">{cardContent}</Link>;
  }

  return cardContent;
}

