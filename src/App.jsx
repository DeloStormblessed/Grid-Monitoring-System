import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import AnalisisZona from './pages/AnalisisZona';
import Zonas from './pages/Zonas';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

/**
 * Componente Layout para las páginas que SI llevan Navbar y márgenes.
 */
const MainLayout = ({ children }) => (
  <div className="appShell">
    <Navbar />
    <main className="container">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Routes>
      {/* 1. RUTAS DE PANTALLA COMPLETA (Sin Navbar ni Container) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      {/* 2. RUTAS CON INTERFAZ (Dashboard, Análisis, etc.)
        Las envolvemos en el MainLayout para que hereden la Navbar y el padding.
      */}
      <Route path="/dashboard" element={
        <MainLayout><Dashboard /></MainLayout>
      } />
      
      <Route path="/zonas" element={
        <MainLayout><Zonas /></MainLayout>
      } />
      
      <Route path="/zonas/:id" element={
        <MainLayout><AnalisisZona /></MainLayout>
      } />

      {/* 3. RUTA 404 (Sin Navbar ni Container)
        Al estar fuera de MainLayout, ocupará el 100% de la pantalla.
      */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;