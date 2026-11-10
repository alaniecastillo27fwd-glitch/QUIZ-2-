import React from 'react';
import { 
  X, 
  UserCheck, 
  Mail, 
  MapPin, 
  Shield, 
  Clock, 
  Building2, 
  Phone, 
  KeyRound, 
  Moon, 
  Sun,
  HardHat,
  BadgeCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function UserProfileModal({ isOpen, onClose }) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-evergreen/80 backdrop-blur-none animate-fade-in">
      <div 
        className="w-full max-w-xl bg-softlinen dark:bg-evergreen border-2 border-darkteal dark:border-darkteal-light rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header con colores sólidos */}
        <div className="p-6 bg-darkteal text-softlinen flex items-center justify-between border-b-2 border-evergreen dark:border-darkteal-light">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellowgreen text-evergreen flex items-center justify-center font-black text-xl shadow-sm">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-softlinen">
                Perfil del Colaborador
              </h2>
              <p className="text-sm font-medium text-yellowgreen">
                Constructora Del Valle S.A.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-evergreen hover:bg-cayenne text-softlinen flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar perfil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Perfil */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Card Principal de Identidad */}
          <div className="p-5 rounded-xl bg-white dark:bg-darkteal/60 border-2 border-darkteal/30 dark:border-darkteal-light flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-evergreen dark:bg-softlinen text-yellowgreen dark:text-evergreen flex items-center justify-center text-3xl font-black shrink-0 border-2 border-yellowgreen">
              AR
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-evergreen dark:text-softlinen">
                  Alanie Rodríguez
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellowgreen text-evergreen uppercase tracking-wide">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Turno Activo
                </span>
              </div>
              <p className="text-sm font-semibold text-darkteal dark:text-yellowgreen">
                Encargado de Bodega Central & Logística de Insumos
              </p>
              <p className="text-xs text-evergreen/80 dark:text-softlinen/80 flex items-center justify-center sm:justify-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-cayenne shrink-0" />
                San José · Bodega Central (Frente Norte)
              </p>
            </div>
          </div>

          {/* Información Detallada en Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-4 rounded-xl bg-white dark:bg-darkteal/40 border border-darkteal/20 dark:border-darkteal">
              <p className="text-xs font-bold uppercase tracking-wider text-darkteal dark:text-yellowgreen flex items-center gap-1.5 mb-1">
                <Mail className="w-4 h-4 text-cayenne" />
                Correo Institucional
              </p>
              <p className="font-semibold text-evergreen dark:text-softlinen break-all">
                alanie.rodriguez@constructoradelvalle.cr
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-darkteal/40 border border-darkteal/20 dark:border-darkteal">
              <p className="text-xs font-bold uppercase tracking-wider text-darkteal dark:text-yellowgreen flex items-center gap-1.5 mb-1">
                <Phone className="w-4 h-4 text-cayenne" />
                Extensión Interna
              </p>
              <p className="font-semibold text-evergreen dark:text-softlinen">
                +506 2290-4500 (Ext. 204)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-darkteal/40 border border-darkteal/20 dark:border-darkteal">
              <p className="text-xs font-bold uppercase tracking-wider text-darkteal dark:text-yellowgreen flex items-center gap-1.5 mb-1">
                <Shield className="w-4 h-4 text-cayenne" />
                Nivel de Permisos
              </p>
              <p className="font-semibold text-evergreen dark:text-softlinen">
                Operador y Auditor de Inventario (Opción 2)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-darkteal/40 border border-darkteal/20 dark:border-darkteal">
              <p className="text-xs font-bold uppercase tracking-wider text-darkteal dark:text-yellowgreen flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-cayenne" />
                Horario de Turno
              </p>
              <p className="font-semibold text-evergreen dark:text-softlinen">
                Lunes a Viernes · 06:00 - 16:30
              </p>
            </div>
          </div>

          {/* Configuración de Preferencias: Modo Claro / Oscuro */}
          <div className="p-4 rounded-xl bg-white dark:bg-darkteal/60 border-2 border-darkteal/30 dark:border-darkteal flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-evergreen dark:text-softlinen">
                Tema de Visualización
              </p>
              <p className="text-xs text-darkteal dark:text-softlinen/80">
                Alterna entre Modo Claro ({theme === 'light' ? 'Activo' : 'Inactivo'}) y Modo Oscuro ({theme === 'dark' ? 'Activo' : 'Inactivo'})
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-darkteal dark:bg-yellowgreen text-softlinen dark:text-evergreen font-bold text-xs uppercase tracking-wide transition-all transform hover:scale-105 cursor-pointer shadow-sm"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Modo Oscuro
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-darkteal/10 dark:bg-darkteal/40 border-t border-darkteal/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-darkteal hover:bg-darkteal-light text-softlinen font-bold text-sm tracking-wide transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}

