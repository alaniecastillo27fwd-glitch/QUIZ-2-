import React from 'react';
import { 
  UserCheck, 
  Mail, 
  MapPin, 
  Shield, 
  Clock, 
  Building2, 
  Phone, 
  Moon, 
  Sun,
  HardHat,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Boxes
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b-2 border-darkteal/20 dark:border-darkteal pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cayenne">
            Módulo de Usuario
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-evergreen dark:text-softlinen tracking-tight">
            Perfil del Operador de Bodega
          </h2>
          <p className="text-sm font-medium text-darkteal dark:text-softlinen/80 mt-1">
            Información operativa, privilegios de auditoría de inventario y preferencias de visualización.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-darkteal dark:bg-yellowgreen text-softlinen dark:text-evergreen font-bold text-sm tracking-wide transition-all transform hover:-translate-y-0.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4" />
              Cambiar a Modo Claro
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              Cambiar a Modo Oscuro
            </>
          )}
        </button>
      </div>

      {/* Main Profile Identity Card */}
      <div className="bg-white dark:bg-darkteal/60 border-2 border-darkteal/30 dark:border-darkteal-light rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 rounded-2xl bg-evergreen dark:bg-softlinen text-yellowgreen dark:text-evergreen flex items-center justify-center text-4xl font-black shrink-0 border-4 border-yellowgreen shadow-md">
          AR
        </div>

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h3 className="text-2xl font-black text-evergreen dark:text-softlinen">
              Alanie Rodríguez
            </h3>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-yellowgreen text-evergreen uppercase tracking-wider">
              <BadgeCheck className="w-4 h-4" />
              Responsable de Bodega
            </span>
          </div>

          <p className="text-base font-bold text-darkteal dark:text-yellowgreen">
            Encargado de Bodega Central & Logística de Suministros
          </p>

          <p className="text-sm font-medium text-evergreen/80 dark:text-softlinen/90 flex items-center justify-center md:justify-start gap-1.5">
            <MapPin className="w-4 h-4 text-cayenne shrink-0" />
            Constructora Del Valle S.A. · Bodega Central (Frente Norte)
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact & Station */}
        <div className="bg-white dark:bg-darkteal/50 border-2 border-darkteal/20 dark:border-darkteal rounded-2xl p-6 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-darkteal dark:text-yellowgreen flex items-center gap-2 border-b border-darkteal/15 pb-3">
            <HardHat className="w-5 h-5 text-cayenne" />
            Asignación y Contacto
          </h4>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-bold text-darkteal/70 dark:text-softlinen/70 uppercase">Correo Electrónico</p>
              <p className="font-semibold text-evergreen dark:text-softlinen">alanie.rodriguez@constructoradelvalle.cr</p>
            </div>
            <div>
              <p className="text-xs font-bold text-darkteal/70 dark:text-softlinen/70 uppercase">Teléfono de Enlace</p>
              <p className="font-semibold text-evergreen dark:text-softlinen">+506 2290-4500 (Extensión 204)</p>
            </div>
            <div>
              <p className="text-xs font-bold text-darkteal/70 dark:text-softlinen/70 uppercase">Jornada Operativa</p>
              <p className="font-semibold text-evergreen dark:text-softlinen">Lunes a Viernes de 06:00 a 16:30 hrs</p>
            </div>
          </div>
        </div>

        {/* Responsibilities & Permissions */}
        <div className="bg-white dark:bg-darkteal/50 border-2 border-darkteal/20 dark:border-darkteal rounded-2xl p-6 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider text-darkteal dark:text-yellowgreen flex items-center gap-2 border-b border-darkteal/15 pb-3">
            <Shield className="w-5 h-5 text-cayenne" />
            Privilegios del Sistema (Opción 2)
          </h4>

          <ul className="space-y-2.5 text-sm text-evergreen dark:text-softlinen font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellowgreen shrink-0" />
              <span>Registro de entradas mediante Orden de Compra (OC).</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellowgreen shrink-0" />
              <span>Emisión y descuento de inventario con Vales de Salida (VS).</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellowgreen shrink-0" />
              <span>Cálculo reactivo de Punto de Reorden ($PR$) y Stock de Seguridad ($SS$).</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellowgreen shrink-0" />
              <span>Auditoría de compras sospechosas de duplicidad y sobreprecios.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

