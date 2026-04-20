import React from 'react';
import {Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';

import Dashboard from './pages/Dashboard';
import AnalisisZona from './pages/AnalisisZona';


function App() {
  return (
    <div>
      <Navbar />
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zonas/:id" element={<AnalisisZona />} />
      </Routes>
      </main>

    </div>
  )
}

export default App;