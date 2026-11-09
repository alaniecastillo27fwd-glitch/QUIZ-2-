import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  AlertTriangle, 
  History, 
  HardHat,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Catálogo Materiales', path: '/materiales', icon: Boxes },
  { name: 'Movimientos', path: '/movimientos', icon: ArrowLeftRight },
  { name: 'Alertas de Stock', path: '/alertas', icon: AlertTriangle },
  { name: 'Historial y Auditoría', path: '/historial', icon: History },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20">
          <HardHat className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase leading-tight">
            Del Valle S.A.
          </h1>
          <p className="text-[11px] text-zinc-400 font-medium tracking-tight">
            Control de Inventario
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
          Módulos Principales
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm border-l-2 border-amber-500'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="bg-zinc-900 rounded-lg p-2.5 border border-zinc-800 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-[11px]">
            <p className="text-zinc-200 font-semibold">Sistema Seguro</p>
            <p className="text-zinc-400">Constructora Del Valle</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

