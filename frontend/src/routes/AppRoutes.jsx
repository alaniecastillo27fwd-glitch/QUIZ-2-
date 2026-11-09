import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import MaterialesPage from '../pages/MaterialesPage';
import MovimientosPage from '../pages/MovimientosPage';
import AlertasPage from '../pages/AlertasPage';
import HistorialPage from '../pages/HistorialPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="materiales" element={<MaterialesPage />} />
        <Route path="movimientos" element={<MovimientosPage />} />
        <Route path="alertas" element={<AlertasPage />} />
        <Route path="historial" element={<HistorialPage />} />
        {/* Wildcard fallback to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
