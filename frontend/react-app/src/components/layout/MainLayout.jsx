import React, { useState } from 'react';
import Header from './Header';
import LiveChatPanel from '../chat/LiveChatPanel';
import { useGame } from '../../context/GameContext';

export default function MainLayout({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { gameInfo } = useGame();

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans text-theme-text transition-colors duration-500">
      {/* Background that spans the entire app, can be covered by views */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-50 transition-all duration-500"
        style={{ backgroundImage: gameInfo.assets.heroBackground !== "none" ? `url('${gameInfo.assets.heroBackground}')` : 'none' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-theme-dark via-theme-dark/80 to-transparent pointer-events-none transition-colors duration-500" />

      {/* Main UI Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="w-full border-t border-theme-neon/20 bg-theme-dark/80 backdrop-blur-md py-4 text-center text-sm text-theme-muted transition-colors duration-500">
          <div className="flex justify-center items-center gap-6">
            <span>© 2026 {gameInfo.displayName}. {gameInfo.subTagline}.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-theme-neon transition-colors">Soporte</a>
              <a href="#" className="hover:text-theme-neon transition-colors">Términos</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-theme-success shadow-[0_0_8px_var(--theme-success, #22c55e)]"></span>
              Servidores en línea
            </div>
          </div>
        </footer>
      </div>

      <LiveChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
