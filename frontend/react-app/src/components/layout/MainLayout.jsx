import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import Header from './Header';
import LiveChatPanel from '../chat/LiveChatPanel';
import { useGame } from '../../context/GameContext';

export default function MainLayout({ children, user, onLogout, credits, addCredits, onLoginTrigger }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { gameInfo } = useGame();
  const [showTerms, setShowTerms] = useState(false);
  const [showServerStatus, setShowServerStatus] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans text-theme-text transition-colors duration-500">
      {/* Background that spans the entire app, can be covered by views */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-[0.12] transition-all duration-500"
        style={{ backgroundImage: gameInfo.assets.heroBackground !== "none" ? `url('${gameInfo.assets.heroBackground}')` : 'none' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-theme-dark via-theme-dark/85 to-theme-dark/30 pointer-events-none transition-colors duration-500" />

      {/* Main UI Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          user={user} 
          onLogout={onLogout} 
          onToggleChat={() => setIsChatOpen(!isChatOpen)} 
          credits={credits}
          addCredits={addCredits}
          onLoginTrigger={onLoginTrigger}
        />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="w-full border-t border-theme-neon/20 bg-theme-dark/80 backdrop-blur-md py-6 text-center text-sm text-theme-muted transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex flex-col md:items-start text-center md:text-left gap-1">
              <span>© 2026 {gameInfo.displayName}. {gameInfo.subTagline}.</span>
              <span className="text-[10px] text-theme-muted/50 uppercase tracking-widest font-mono">Un proyecto académico para redes corporativas</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/soporte" className="hover:text-theme-neon transition-colors font-medium">Soporte</Link>
              <button 
                onClick={() => setShowTerms(true)}
                className="hover:text-theme-neon transition-colors font-medium"
              >
                Términos
              </button>
              <button 
                onClick={() => setShowServerStatus(true)}
                className="flex items-center gap-2 hover:text-theme-neon transition-colors font-medium"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-theme-success shadow-[0_0_8px_var(--theme-success, #22c55e)] animate-pulse"></span>
                Servidores en línea
              </button>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-4 text-theme-muted">
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="hover:text-theme-neon hover:scale-110 transition-all" title="Discord Oficial">
                <FaDiscord size={18} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-theme-neon hover:scale-110 transition-all" title="Twitter/X Oficial">
                <FaTwitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-theme-neon hover:scale-110 transition-all" title="Instagram Oficial">
                <FaInstagram size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-theme-neon hover:scale-110 transition-all" title="Canal de YouTube">
                <FaYoutube size={18} />
              </a>
            </div>

          </div>
        </footer>
      </div>

      <LiveChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={user}
        onLoginTrigger={onLoginTrigger}
      />

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative max-h-[80vh] overflow-y-auto scrollbar-thin">
            <button 
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
            <h3 className="font-display font-black text-xl text-white tracking-widest uppercase mb-4 text-center border-b border-theme-neon/20 pb-2">
              Términos de Servicio
            </h3>
            <div className="text-xs text-theme-text/80 leading-relaxed flex flex-col gap-3 pr-2">
              <p>
                Bienvenido a <strong>DeathCloud</strong>. Al acceder a nuestra plataforma o descargar el launcher del juego, aceptas regirte por los siguientes términos y condiciones.
              </p>
              <h4 className="font-bold text-white mt-2">1. Uso del Servicio</h4>
              <p>
                El software y los servicios de DeathCloud se proporcionan exclusivamente para fines recreativos de carácter personal. Queda estrictamente prohibido el uso de herramientas de terceros para alterar la memoria o el comportamiento del juego (hacks, scripts de puntería o bots).
              </p>
              <h4 className="font-bold text-white mt-2">2. Cuentas de Jugador</h4>
              <p>
                Cada jugador es responsable de la confidencialidad de su contraseña y de todas las actividades realizadas en su cuenta. La venta o transferencia de cuentas de DeathCloud está terminantemente prohibida.
              </p>
              <h4 className="font-bold text-white mt-2">3. Moneda Virtual: E-Points (EP)</h4>
              <p>
                Los E-Points (EP) son unidades digitales de licencia limitada para el desbloqueo de artículos estéticos (skins, avatares, monturas). No tienen valor monetario real ni son reembolsables. Las compras se procesan de forma simulada en este entorno educativo de pruebas corporativas.
              </p>
              <p className="text-[10px] text-theme-muted mt-4 text-center">
                Última actualización: 02 de Junio de 2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Server Status Modal */}
      {showServerStatus && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative">
            <button 
              onClick={() => setShowServerStatus(false)}
              className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
            <h3 className="font-display font-black text-xl text-white tracking-widest uppercase mb-4 text-center border-b border-theme-neon/20 pb-2">
              Estado del Servidor
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 bg-black/35 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">LATAM ESTE (São Paulo)</span>
                  <span className="text-[10px] text-theme-muted font-mono">Ping: 38 ms</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-theme-success font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-theme-success shadow-[0_0_8px_var(--theme-success)]"></span> ONLINE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/35 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">EE.UU. ESTE (Virginia)</span>
                  <span className="text-[10px] text-theme-muted font-mono">Ping: 65 ms</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-theme-success font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-theme-success shadow-[0_0_8px_var(--theme-success)]"></span> ONLINE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/35 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">EUROPA OESTE (Frankfurt)</span>
                  <span className="text-[10px] text-theme-muted font-mono">Ping: 142 ms</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-theme-success font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-theme-success shadow-[0_0_8px_var(--theme-success)]"></span> ONLINE
                </span>
              </div>
            </div>
            <p className="text-[10px] text-theme-muted text-center mt-6">
              Todos los clústeres de base de datos y nodos del juego operan normalmente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
