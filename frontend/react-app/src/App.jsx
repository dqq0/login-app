import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './views/Dashboard';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ranking" element={<div className="flex h-full items-center justify-center p-8"><h1 className="neon-text text-4xl text-death-neon font-display">Ranking Global</h1></div>} />
          <Route path="/comunidad" element={<div className="flex h-full items-center justify-center p-8"><h1 className="neon-text text-4xl text-death-neon font-display">Comunidad</h1></div>} />
          <Route path="/tienda" element={<div className="flex h-full items-center justify-center p-8"><h1 className="neon-text text-4xl text-death-neon font-display">Tienda Freemium</h1></div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
