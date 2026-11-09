import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, CheckCircle, Database } from 'lucide-react';

const ROUTE_LABELS = {
  '/': 'Dashboard de Inventario',
  '/materiales': 'Catálogo de Materiales',
  '/movimientos': 'Movimientos de Almacén',
  '/alertas': 'Alertas y Duplicados',
  '/historial': 'Historial y Trazabilidad',
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const currentTitle = ROUTE_LABELS[currentPath] || 'Módulo de Operación';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link 
          to="/" 
          className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          Constructora Del Valle
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 tracking-tight">
          {currentTitle}
        </span>
      </div>

      {/* Sync Status & Quick Action Button */}
      <div className="flex items-center gap-4">
        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Datos actualizados</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/movimientos')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-semibold transition-all shadow-xs hover:shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Movimiento</span>
        </button>
      </div>
    </header>
  );
}

