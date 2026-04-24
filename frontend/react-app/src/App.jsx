import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './views/Dashboard';
import Login from './Login';
import { GameProvider } from './context/GameContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('username');
    const token = localStorage.getItem('jwt_token');
    
    if (savedUser && token) {
      setUser({ username: savedUser, token });
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  if (loading) return null; // O un spinner

  return (
    <GameProvider>
      <Router>
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <MainLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/ranking" element={<div className="flex h-full items-center justify-center p-8"><h1 className="neon-text text-4xl text-death-neon font-display">Ranking Global</h1></div>} />
              <Route path="/comunidad" element={<div className="flex h-full items-center justify-center p-8"><h1 className="neon-text text-4xl text-death-neon font-display">Comunidad</h1></div>} />
              <Route path="/tienda" element={<div className="flex h-full items-center justify-center p-8"><h1 className="neon-text text-4xl text-death-neon font-display">Tienda Freemium</h1></div>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </MainLayout>
        )}
      </Router>
    </GameProvider>
  );
}

export default App;
