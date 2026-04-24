import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export default function LiveChatPanel({ isOpen, onClose, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Inicializar Socket
    socketRef.current = io(SOCKET_URL);

    // Escuchar Historial
    socketRef.current.on('historial_mensajes', (historial) => {
      setMessages(historial);
    });

    // Escuchar Nuevos Mensajes
    socketRef.current.on('recibir_mensaje', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage = {
      usuario: user.username,
      texto: input,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Enviar al servidor
    socketRef.current.emit('enviar_mensaje', newMessage);
    setInput('');
  };

  return (
    <div 
      className={`fixed top-24 right-4 z-40 w-[350px] bottom-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-[120%]'
      }`}
    >
      <div className="h-full glass-panel flex flex-col overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)] bg-theme-dark/90 backdrop-blur-2xl border border-theme-neon/30 rounded-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-theme-neon/20 bg-theme-dark/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-theme-neon shadow-neon animate-pulse"></div>
            <h3 className="font-display font-bold text-lg text-theme-neon tracking-wide">Chat en Vivo</h3>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-theme-neon/20">
          {messages.length === 0 && (
            <div className="text-center py-10 opacity-30 italic text-xs text-theme-muted">
              Cargando comunicaciones...
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col gap-1 ${msg.usuario === user.username ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2">
                <span className={`font-bold text-xs ${msg.usuario === user.username ? 'text-theme-neon' : 'text-[#f472b6]'}`}>
                  {msg.usuario}
                </span>
                <span className="text-[9px] text-theme-muted font-mono">{msg.hora}</span>
              </div>
              <p className={`text-sm py-2 px-3 rounded-xl border ${
                msg.usuario === user.username 
                  ? 'bg-theme-neon/10 border-theme-neon/20 rounded-tr-none' 
                  : 'bg-white/5 border-white/10 rounded-tl-none'
              }`}>
                {msg.texto}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-theme-dark/80 border-t border-theme-neon/20">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribir transmisión..." 
              className="w-full bg-black/40 border border-theme-neon/30 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-theme-neon focus:shadow-neon-sm transition-all placeholder:text-theme-muted/30"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-theme-neon/10 hover:bg-theme-neon text-theme-neon hover:text-black flex items-center justify-center transition-all duration-300"
            >
              <FiSend size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
