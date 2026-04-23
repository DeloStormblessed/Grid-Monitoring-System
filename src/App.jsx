import React from 'react';
import {Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';

import Dashboard from './pages/Dashboard';
import AnalisisZona from './pages/AnalisisZona';
import Zonas from './pages/Zonas';


function App() {
  return (
    <div className="appShell">
      <Navbar />
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zonas/:id" element={<AnalisisZona />} />
          <Route path="/zonas" element={<Zonas />} />
      </Routes>
      </main>

    </div>
  )
}

export default App;