import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  AlertTriangle, 
  History, 
  HardHat,
  UserCheck
} from 'lucide-react';
import { useAlertas } from '../../hooks/useInventory.js';

export default function Sidebar() {
  const { totalAlertas } = useAlertas();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Materiales', path: '/materiales', icon: Boxes },
    { name: 'Movimientos', path: '/movimientos', icon: ArrowLeftRight },
    { 
      name: 'Alertas', 
      path: '/alertas', 
      icon: AlertTriangle,
      badge: totalAlertas > 0 ? totalAlertas : null,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    { name: 'Historial', path: '/historial', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 select-none flex-shrink-0 z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/10 shrink-0">
          <HardHat className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-white tracking-wide uppercase leading-tight truncate">
            Constructora Del Valle
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight">
            Control de Inventarios
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-amber-400 font-semibold shadow-xs border-l-2 border-amber-500 pl-2.5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
        <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-700">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] min-w-0">
            <p className="text-slate-200 font-semibold truncate leading-tight">Alanie Rodríguez</p>
            <p className="text-slate-400 text-[10px] truncate leading-tight">Bodega Central · Encargado</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

