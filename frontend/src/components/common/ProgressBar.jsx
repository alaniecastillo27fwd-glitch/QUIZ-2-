import React from 'react';
import clsx from 'clsx';

export default function ProgressBar({
  current = 0,
  target = 100,
  max = null,
  unit = 'unid',
  label = 'Nivel de Stock',
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

  let barColor = 'bg-emerald-500';
  if (isCritical) {
    barColor = 'bg-rose-500';
  } else if (isWarning) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className={clsx('w-full space-y-1.5', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
          <span>{label}</span>
          <span className="font-semibold text-slate-900">
            {currentNum.toLocaleString()} / {targetNum.toLocaleString()} {unit}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className="relative w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
        {/* Filled bar */}
        <div
          className={clsx('h-full transition-all duration-300 rounded-full', barColor)}
          style={{ width: `${percentage}%` }}
        />

        {/* PR Target Indicator Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 z-10"
          style={{ left: `${targetPercentage}%` }}
          title={`Punto de Reorden (PR): ${targetNum} ${unit}`}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>0</span>
          <span className="font-medium text-slate-600">PR: {targetNum.toLocaleString()}</span>
          <span>{Math.round(maxScale).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

