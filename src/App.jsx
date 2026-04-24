import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import AnalisisZona from './pages/AnalisisZona';
import Zonas from './pages/Zonas';
import Login from './pages/Login'; // Importa tu nueva página de Login

function App() {
  // El hook useLocation nos permite saber en qué página estamos
  const location = useLocation();
  
  // Comprobamos si la ruta actual es el login
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  // Si es la página de login, la renderizamos sola (sin Navbar ni container)
  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Añadimos una ruta de escape por si intentan entrar al dashboard sin loguear 
            (aunque aquí solo estamos manejando la visualización) */}
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    );
  }

  // Si NO es la página de login, renderizamos la estructura normal con Navbar y Container
  return (
    <div className="appShell">
      <Navbar />
      
      <main className="container">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/zonas/:id" element={<AnalisisZona />} />
          <Route path="/zonas" element={<Zonas />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;