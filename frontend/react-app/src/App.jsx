import { useState, useEffect } from 'react'
import Login from './Login'
import Chat from './Chat'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Al cargar, verificar si ya hay un token (para mantener sesión viva)
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Condicional: Si NO está autenticado, muestra Login. Si ESTÁ autenticado muestra Chat */}
      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <Chat onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
