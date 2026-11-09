import React from 'react';
import { Bell, Building, User, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
      {/* Worksite & Status indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-700 bg-zinc-100/80 px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-medium">
          <Building className="w-3.5 h-3.5 text-zinc-500" />
          <span>Obra Activa: <strong className="text-zinc-900 font-semibold">Torre Valle Norte #04</strong></span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span className="font-medium text-[11px]">Inventario en tiempo real</span>
        </div>
      </div>

      {/* User & Notifications */}
      <div className="flex items-center gap-3">
        <button 
          title="Notificaciones de stock"
          className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200"></div>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-zinc-900 leading-tight">Alanie Rodríguez</p>
            <p className="text-[10px] text-zinc-500 font-medium">Jefe de Bodega & Obra</p>
          </div>
        </div>
      </div>
    </header>
  );
}

