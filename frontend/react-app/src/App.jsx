import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './views/Dashboard';
import Login from './Login';
import AdminDashboard from './views/AdminDashboard';
import Profile from './views/Profile';
import SupportTickets from './views/SupportTickets';
import Ranking from './views/Ranking';
import Comunidad from './views/Comunidad';
import Tienda from './views/Tienda';
import { useGame } from './context/GameContext';

function App() {
  const { gameInfo } = useGame();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // E-Points balance state per game
  const [credits, setCredits] = useState(2500);
  const [purchasedSkins, setPurchasedSkins] = useState([]);

  // Fetch credits and skins from the backend when active game or session changes
  useEffect(() => {
    if (!user) {
      setCredits(2500);
      setPurchasedSkins([]);
      return;
    }

    const fetchGameUserData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${user.token}` };
        
        // 1. Get credits
        const credRes = await fetch(`http://localhost:3000/api/game/${gameInfo.id}/credits`, { headers });
        const credData = await credRes.json();
        if (credData.success) {
          setCredits(credData.credits);
        }

        // 2. Get skins
        const skinsRes = await fetch(`http://localhost:3000/api/game/${gameInfo.id}/skins`, { headers });
        const skinsData = await skinsRes.json();
        if (skinsData.success) {
          setPurchasedSkins(skinsData.skins);
        }
      } catch (err) {
        console.error("Error fetching game user data from backend:", err);
      }
    };

    fetchGameUserData();
  }, [user, gameInfo.id]);

  const addCredits = async (amount) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:3000/api/game/${gameInfo.id}/credits/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.success) {
        setCredits(data.credits);
      }
    } catch (err) {
      console.error("Error adding credits:", err);
    }
  };

  const buySkin = async (skinId, price) => {
    if (!user) return { success: false, message: "Inicia sesión para realizar la compra." };
    try {
      const res = await fetch(`http://localhost:3000/api/game/${gameInfo.id}/skins/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ skinId, price })
      });
      const data = await res.json();
      if (data.success) {
        setCredits(data.credits);
        setPurchasedSkins(prev => [...prev, skinId]);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Error buying skin:", err);
      return { success: false, message: "Error de red al procesar la compra." };
    }
  };

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('username');
    const savedNickname = localStorage.getItem('nickname') || savedUser;
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role') || 'user';
    
    if (savedUser && token) {
      setUser({ username: savedUser, nickname: savedNickname, token, rol: role });
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('jwt_token', userData.token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('nickname', userData.nickname || userData.username);
    localStorage.setItem('role', userData.rol || 'user');
    setUser(userData);
  };

  const updateUserSession = (updatedFields) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      if (updatedFields.username) localStorage.setItem('username', updatedFields.username);
      if (updatedFields.nickname) localStorage.setItem('nickname', updatedFields.nickname);
      return updated;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('nickname');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('role');
    setUser(null);
  };

  if (loading) return null; // O un spinner

  return (
      <Router>
        <MainLayout 
          user={user} 
          onLogout={handleLogout} 
          credits={credits} 
          addCredits={addCredits}
          onLoginTrigger={() => setShowLoginModal(true)}
        >
          <Routes>
            <Route path="/" element={<Dashboard user={user} credits={credits} purchasedSkins={purchasedSkins} buySkin={buySkin} onLoginTrigger={() => setShowLoginModal(true)} />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/comunidad" element={<Comunidad user={user} onLoginTrigger={() => setShowLoginModal(true)} />} />
            <Route path="/tienda" element={<Tienda user={user} credits={credits} purchasedSkins={purchasedSkins} buySkin={buySkin} onLoginTrigger={() => setShowLoginModal(true)} />} />
            <Route 
              path="/admin" 
              element={
                user?.rol === 'admin' ? (
                  <AdminDashboard user={user} />
                ) : (
                  <Navigate to="/" />
                )
              } 
              />
            <Route path="/perfil" element={<Profile user={user} updateUserSession={updateUserSession} purchasedSkins={purchasedSkins} onLoginTrigger={() => setShowLoginModal(true)} />} />
            <Route path="/soporte" element={<SupportTickets user={user} onLoginTrigger={() => setShowLoginModal(true)} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>

        {showLoginModal && (
          <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-md bg-[#09090b] border border-theme-neon/30 rounded-2xl shadow-neon-strong p-2">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors z-[210]"
              >
                <FiX size={20} />
              </button>
              <Login 
                onLoginSuccess={(userData) => {
                  handleLoginSuccess(userData);
                  setShowLoginModal(false);
                }} 
                isModal={true} 
              />
            </div>
          </div>
        )}
      </Router>
  );
}

export default App;
