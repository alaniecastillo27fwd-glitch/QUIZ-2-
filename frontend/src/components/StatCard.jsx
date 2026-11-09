import React from 'react';
import clsx from 'clsx';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'neutral' 
}) {
  const variantStyles = {
    neutral: 'bg-white border-zinc-200 text-zinc-900',
    warning: 'bg-amber-50/50 border-amber-200 text-amber-950',
    success: 'bg-emerald-50/50 border-emerald-200 text-emerald-950',
    danger: 'bg-rose-50/50 border-rose-200 text-rose-950',
  };

  const iconBgStyles = {
    neutral: 'bg-zinc-100 text-zinc-700',
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className={clsx(
      'p-5 rounded-xl border shadow-xs transition-all hover:shadow-sm',
      variantStyles[variant] || variantStyles.neutral
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight mt-1 text-zinc-900">{value}</h3>
          {subtitle && (
            <p className="text-xs mt-1 text-zinc-600 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
            iconBgStyles[variant] || iconBgStyles.neutral
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

