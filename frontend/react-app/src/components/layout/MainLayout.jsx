import React, { useState } from 'react';
import Header from './Header';
import LiveChatPanel from '../chat/LiveChatPanel';

export default function MainLayout({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans text-death-text">
      {/* Background that spans the entire app, can be covered by views */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-50"
        style={{ backgroundImage: `url('/assets/hero_bg.png')` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-death-dark via-death-dark/80 to-transparent pointer-events-none" />

      {/* Main UI Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="w-full border-t border-[#00f3ff]/20 bg-death-dark/80 backdrop-blur-md py-4 text-center text-sm text-death-muted">
          <div className="flex justify-center items-center gap-6">
            <span>© 2026 Death Cloud. Shape the storm.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-death-neon transition-colors">Soporte</a>
              <a href="#" className="hover:text-death-neon transition-colors">Términos</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-death-success shadow-[0_0_8px_#22c55e]"></span>
              Servidores en línea
            </div>
          </div>
        </footer>
      </div>

      <LiveChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
