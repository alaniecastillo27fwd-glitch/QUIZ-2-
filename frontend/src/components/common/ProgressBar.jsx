import React from 'react';
import clsx from 'clsx';

export default function ProgressBar({
  current = 0,
  target = 100,
  max = null,
  unit = 'unid',
  label = 'Nivel de Stock Actual',
  showLabels = true,
  className = '',
}) {
  const currentNum = Math.max(0, Number(current) || 0);
  const targetNum = Math.max(1, Number(target) || 1);
  const maxScale = max ? Number(max) : Math.max(currentNum, targetNum * 1.5);

  const percentage = Math.min(100, Math.round((currentNum / maxScale) * 100));
  const targetPercentage = Math.min(100, Math.round((targetNum / maxScale) * 100));

  const isCritical = currentNum <= targetNum;
  const isWarning = currentNum > targetNum && currentNum <= targetNum * 1.15;

  let barColor = 'bg-yellowgreen';
  if (isCritical) {
    barColor = 'bg-cayenne';
  } else if (isWarning) {
    barColor = 'bg-darkteal dark:bg-yellowgreen';
  }

  return (
    <div className={clsx('w-full space-y-2', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs md:text-sm font-semibold text-evergreen dark:text-softlinen">
          <span className="font-bold text-darkteal dark:text-yellowgreen">{label}</span>
          <span className="font-extrabold text-evergreen dark:text-softlinen">
            {currentNum.toLocaleString()} / {targetNum.toLocaleString()} {unit}
          </span>
        </div>
      )}

      {/* Progress Track con colores sólidos */}
      <div className="relative w-full h-3.5 bg-darkteal/15 dark:bg-evergreen-dark rounded-full overflow-hidden border border-darkteal/30 dark:border-darkteal">
        {/* Filled bar */}
        <div
          className={clsx('h-full transition-all duration-300 rounded-full', barColor)}
          style={{ width: `${percentage}%` }}
        />

        {/* PR Target Indicator Marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-evergreen dark:bg-softlinen z-10"
          style={{ left: `${targetPercentage}%` }}
          title={`Punto de Reorden (PR): ${targetNum} ${unit}`}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between text-xs font-bold text-darkteal dark:text-softlinen/70">
          <span>0</span>
          <span className="font-extrabold text-cayenne dark:text-yellowgreen">
            PR: {targetNum.toLocaleString()} {unit}
          </span>
          <span>{Math.round(maxScale).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
