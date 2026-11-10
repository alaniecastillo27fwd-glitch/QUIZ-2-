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
  className = '',
}) {
  const borderVariants = {
    neutral: 'border-2 border-darkteal/20 dark:border-darkteal hover:border-darkteal dark:hover:border-yellowgreen',
    warning: 'border-2 border-cayenne/40 dark:border-cayenne/60 hover:border-cayenne',
    danger: 'border-2 border-cayenne hover:border-cayenne-light shadow-xs',
    success: 'border-2 border-yellowgreen hover:border-yellowgreen-light shadow-xs',
  };

  const iconBgVariants = {
    neutral: 'bg-darkteal text-softlinen',
    warning: 'bg-cayenne text-white',
    danger: 'bg-cayenne text-white',
    success: 'bg-yellowgreen text-evergreen',
  };

  const cardContent = (
    <div
      className={clsx(
        'p-6 rounded-2xl bg-white dark:bg-darkteal/60 transition-all duration-200 flex flex-col justify-between h-full group transform hover:-translate-y-1 shadow-sm',
        borderVariants[variant] || borderVariants.neutral,
        linkTo && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs md:text-sm font-black uppercase tracking-wider text-darkteal dark:text-yellowgreen">
            {title}
          </p>
          <div className="text-3xl md:text-4xl font-black tracking-tight text-evergreen dark:text-softlinen">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs',
              iconBgVariants[variant] || iconBgVariants.neutral
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || linkTo) && (
        <div className="mt-5 pt-3.5 border-t border-darkteal/15 dark:border-darkteal flex items-center justify-between text-xs md:text-sm">
          {subtitle && (
            <span className="text-evergreen/80 dark:text-softlinen/80 font-medium truncate">
              {subtitle}
            </span>
          )}
          {linkTo && (
            <span className="inline-flex items-center gap-1 text-darkteal dark:text-yellowgreen font-bold group-hover:text-cayenne dark:group-hover:text-softlinen transition-colors ml-auto shrink-0">
              Ver detalle
              <ArrowUpRight className="w-4 h-4" />
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
