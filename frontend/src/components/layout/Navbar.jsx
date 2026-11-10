import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Sun, Moon, UserCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ROUTE_LABELS = {
  '/': 'Dashboard de Inventario',
  '/materiales': 'Catálogo de Materiales',
  '/movimientos': 'Movimientos de Almacén',
  '/alertas': 'Alertas y Duplicados',
  '/historial': 'Historial y Trazabilidad',
  '/perfil': 'Perfil del Colaborador',
};

export default function Navbar({ onOpenProfile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const currentPath = location.pathname;
  const currentTitle = ROUTE_LABELS[currentPath] || 'Módulo de Operación';

  return (
    <header className="h-18 bg-white dark:bg-evergreen border-b-2 border-darkteal/20 dark:border-darkteal px-6 flex items-center justify-between shadow-xs sticky top-0 z-20 transition-colors duration-200">
      {/* Breadcrumbs de tamaño legible */}
      <div className="flex items-center gap-2.5 text-sm">
        <Link 
          to="/" 
          className="text-darkteal dark:text-softlinen/70 hover:text-cayenne dark:hover:text-yellowgreen font-bold transition-colors"
        >
          Constructora Del Valle
        </Link>
        <ChevronRight className="w-4 h-4 text-darkteal/40 dark:text-softlinen/40 shrink-0" />
        <span className="font-extrabold text-evergreen dark:text-softlinen text-sm md:text-base tracking-tight">
          {currentTitle}
        </span>
      </div>

      {/* Acciones del Navbar */}
      <div className="flex items-center gap-3">
        {/* Indicador de Estado del Sistema */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-softlinen dark:bg-darkteal/50 border border-darkteal/30 dark:border-darkteal text-evergreen dark:text-yellowgreen text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-yellowgreen animate-pulse" />
          <span>Sistema Activo</span>
        </div>

        {/* Botón de Modo Claro / Oscuro */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-softlinen dark:bg-darkteal border-2 border-darkteal/20 dark:border-darkteal text-evergreen dark:text-yellowgreen flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
          title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          aria-label="Alternar tema de color"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellowgreen" />
          ) : (
            <Moon className="w-5 h-5 text-darkteal" />
          )}
        </button>

        {/* Acceso Rápido al Perfil */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-softlinen dark:bg-darkteal/80 border-2 border-darkteal/20 dark:border-darkteal hover:border-yellowgreen text-evergreen dark:text-softlinen transition-all cursor-pointer group"
          title="Ver perfil de usuario"
        >
          <div className="w-7 h-7 rounded-lg bg-evergreen text-yellowgreen flex items-center justify-center font-bold text-xs shrink-0">
            AR
          </div>
          <span className="text-xs font-bold hidden sm:inline group-hover:text-cayenne dark:group-hover:text-yellowgreen">
            Perfil
          </span>
        </button>

        {/* Botón de Acción Principal */}
        <button
          onClick={() => navigate('/movimientos')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellowgreen hover:bg-yellowgreen-light active:bg-yellowgreen-dark text-evergreen text-xs md:text-sm font-extrabold uppercase tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimiento</span>
        </button>
      </div>
    </header>
  );
}
