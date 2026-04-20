import React from 'react';
import { FiX, FiSend } from 'react-icons/fi';

export default function LiveChatPanel({ isOpen, onClose }) {
  return (
    <div 
      className={`fixed top-24 right-4 z-40 w-[350px] bottom-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-[120%]'
      }`}
    >
      <div className="h-full glass-panel flex flex-col overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#00f3ff]/20 bg-death-dark/50 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-death-neon shadow-neon animate-pulse"></div>
            <h3 className="font-display font-bold text-lg text-death-neon tracking-wide">Chat en Vivo</h3>
          </div>
          <button onClick={onClose} className="text-death-muted hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-death-neon text-sm">ShadowFang</span>
              <span className="text-[10px] text-death-muted">10:42</span>
            </div>
            <p className="text-sm bg-death-dark/50 p-3 rounded-r-xl rounded-bl-xl border border-[#00f3ff]/10">
              ¡Alguien para una partida?
            </p>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-[#f472b6] text-sm">LunaMist</span>
              <span className="text-[10px] text-death-muted">10:43</span>
            </div>
            <p className="text-sm bg-death-dark/50 p-3 rounded-r-xl rounded-bl-xl border border-[#f472b6]/10">
              ¡Vamos a por la victoria!
            </p>
          </div>
          
           <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-[#ef4444] text-sm">DarkReaper</span>
              <span className="text-[10px] text-death-muted">10:44</span>
            </div>
            <p className="text-sm bg-death-dark/50 p-3 rounded-r-xl rounded-bl-xl border border-[#ef4444]/10">
              ¿Nuevo evento este fin de semana?
            </p>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-[#4ade80] text-sm">NightStalker</span>
              <span className="text-[10px] text-death-muted">10:45</span>
            </div>
            <p className="text-sm bg-death-dark/50 p-3 rounded-r-xl rounded-bl-xl border border-[#4ade80]/10">
              ¡No puedo esperar para jugar!
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-death-dark/80 border-t border-[#00f3ff]/20 backdrop-blur-xl">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Escribe un mensaje..." 
              className="w-full bg-black/40 border border-[#00f3ff]/30 rounded-full py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-death-neon focus:shadow-neon transition-all placeholder:text-death-muted/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00f3ff]/10 hover:bg-death-neon text-death-neon hover:text-black flex items-center justify-center transition-all duration-300">
              <FiSend size={14} className="ml-[-2px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
