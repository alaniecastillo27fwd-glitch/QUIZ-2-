import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UserProfileModal from '../profile/UserProfileModal';

export default function MainLayout() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-softlinen dark:bg-evergreen text-evergreen dark:text-softlinen overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar persistente */}
      <Sidebar onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Área principal con Navbar y contenido scrolleable */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-softlinen dark:bg-evergreen transition-colors duration-200">
        <Navbar onOpenProfile={() => setIsProfileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Modal interactivo de Perfil */}
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
