import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  AlertTriangle, 
  History, 
  HardHat,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useAlertas } from '../../hooks/useInventory.js';

export default function Sidebar({ onOpenProfile }) {
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
      badgeColor: 'bg-cayenne text-white',
    },
    { name: 'Historial', path: '/historial', icon: History },
    { name: 'Mi Perfil', path: '/perfil', icon: UserCheck },
  ];

  return (
    <aside className="w-68 bg-evergreen text-softlinen flex flex-col border-r-2 border-darkteal select-none flex-shrink-0 z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center gap-3 border-b-2 border-darkteal bg-evergreen-dark">
        <div className="w-11 h-11 rounded-xl bg-yellowgreen flex items-center justify-center text-evergreen font-black shadow-md shrink-0">
          <HardHat className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-black text-softlinen tracking-wider uppercase leading-tight truncate">
            Constructora Del Valle
          </h1>
          <p className="text-xs text-yellowgreen font-bold tracking-normal">
            Control de Inventarios
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-bold tracking-wider text-softlinen/60 uppercase">
          Módulos del Sistema
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-yellowgreen text-evergreen shadow-sm'
                    : 'text-softlinen/80 hover:text-softlinen hover:bg-darkteal'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Footer (Apartado de Perfil Interactivo) */}
      <div className="p-4 border-t-2 border-darkteal bg-evergreen-dark">
        <div
          onClick={onOpenProfile}
          className="bg-darkteal/70 hover:bg-darkteal rounded-xl p-3 border-2 border-darkteal hover:border-yellowgreen flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer group shadow-xs"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenProfile?.()}
          aria-label="Abrir perfil de Alanie Rodríguez"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-evergreen text-yellowgreen flex items-center justify-center shrink-0 border border-yellowgreen font-bold text-sm shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-xs min-w-0">
              <p className="text-softlinen font-bold truncate text-sm leading-tight group-hover:text-yellowgreen transition-colors">
                Alanie Rodríguez
              </p>
              <p className="text-softlinen/70 text-xs truncate leading-tight font-medium">
                Bodega Central · Encargado
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-softlinen/60 group-hover:text-yellowgreen group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </aside>
  );
}
