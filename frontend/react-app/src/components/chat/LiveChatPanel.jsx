import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiUser, FiUserCheck, FiUserPlus, FiUserMinus, FiVolumeX, FiPlus, FiMessageSquare, FiShield, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { io } from 'socket.io-client';

// Detecta dinámicamente si estamos en Web (localhost/dominio) o Android (file://)
const getSocketUrl = () => {
  if (window.location.protocol !== 'file:') {
    return undefined; // Permite que Socket.io use la URL relativa de origen automáticamente
  }
  // En Android WebView, extrae el host a partir del VITE_API_URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace('/api', '');
};

const SOCKET_URL = getSocketUrl();

export default function LiveChatPanel({ isOpen, onClose, user, onLoginTrigger }) {
  const [activeSubTab, setActiveSubTab] = useState('chat'); // 'chat' | 'friends'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mutedUsers, setMutedUsers] = useState(() => {
    const saved = localStorage.getItem('muted_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Friends states
  const [friendsList, setFriendsList] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);

  // Add friend states
  const [addFriendName, setAddFriendName] = useState('');
  const [addFriendSuccess, setAddFriendSuccess] = useState(null);
  const [addFriendError, setAddFriendError] = useState(null);

  // Context Menu states
  const [contextMenu, setContextMenu] = useState(null); // { x, y, username }

  // Public Profile Modal states
  const [publicProfileUser, setPublicProfileUser] = useState(null);
  const [publicProfileLoading, setPublicProfileLoading] = useState(false);
  const [publicProfileError, setPublicProfileError] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Dynamic API builder
  const getApiUrl = (route) => {
    if (window.location.protocol !== 'file:') {
      return `/api/${route}`;
    }
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return `${base}/${route}`;
  };

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeSubTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeSubTab]);

  // Socket IO initialization
  useEffect(() => {
    if (!user) return;

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

  // Load friends and requests when switching to friends tab
  useEffect(() => {
    if (user && activeSubTab === 'friends') {
      fetchFriendsAndRequests();
    }
  }, [user, activeSubTab]);

  // Close context menu on outside click
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);

  // Mute logic persist
  useEffect(() => {
    localStorage.setItem('muted_users', JSON.stringify(mutedUsers));
  }, [mutedUsers]);

  const fetchFriendsAndRequests = async () => {
    setFriendsLoading(true);
    setFriendsError(null);
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl('friends'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener amistades.');
      }
      setFriendsList(data.friends || []);
      setIncomingRequests(data.requests?.incoming || []);
      setOutgoingRequests(data.requests?.outgoing || []);
    } catch (err) {
      setFriendsError(err.message);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage = {
      usuario: user.nickname || user.username,
      texto: input,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socketRef.current.emit('enviar_mensaje', newMessage);
    setInput('');
  };

  // Right Click message handler
  const handleContextMenu = (e, msgUsername) => {
    e.preventDefault();
    // Do not open menu on self
    if (msgUsername === (user?.nickname || user?.username)) return;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      username: msgUsername
    });
  };

  const handleSendRequest = async (targetUser) => {
    setAddFriendError(null);
    setAddFriendSuccess(null);
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl('friends/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friendUsername: targetUser })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al enviar solicitud.');
      }
      setAddFriendSuccess(data.message);
      setAddFriendName('');
      if (activeSubTab === 'friends') {
        fetchFriendsAndRequests();
      }
      // Clear success alert after 3 seconds
      setTimeout(() => setAddFriendSuccess(null), 4000);
    } catch (err) {
      setAddFriendError(err.message);
      setTimeout(() => setAddFriendError(null), 4000);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl('friends/respond'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al responder solicitud.');
      }
      fetchFriendsAndRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFriend = async (friendshipId, friendName) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a '${friendName}' de tus amigos?`)) return;
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl(`friends/remove/${friendshipId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar amigo.');
      }
      fetchFriendsAndRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewPublicProfile = async (targetUser) => {
    setPublicProfileUser(null);
    setPublicProfileError(null);
    setPublicProfileLoading(true);
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl(`profile/public/${encodeURIComponent(targetUser)}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener perfil público.');
      }
      setPublicProfileUser(data.user);
    } catch (err) {
      setPublicProfileError(err.message);
    } finally {
      setPublicProfileLoading(false);
    }
  };

  const toggleMuteUser = (targetUser) => {
    setMutedUsers(prev => 
      prev.includes(targetUser)
        ? prev.filter(u => u !== targetUser)
        : [...prev, targetUser]
    );
  };

  // Filter messages based on muted users
  const visibleMessages = messages.filter(msg => !mutedUsers.includes(msg.usuario));

  return (
    <>
      <div 
        className={`fixed top-20 right-4 z-40 w-[350px] bottom-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-[120%]'
        }`}
      >
        <div className="h-full glass-panel flex flex-col overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)] bg-theme-dark/95 backdrop-blur-2xl border border-theme-neon/30 rounded-2xl">
          
          {/* Header & Tabs */}
          <div className="border-b border-theme-neon/20 bg-theme-dark/50 flex flex-col">
            <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-theme-neon shadow-neon animate-pulse"></div>
                <h3 className="font-display font-black text-lg text-theme-neon tracking-wider">Centro Social</h3>
              </div>
              <button onClick={onClose} className="text-theme-muted hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5">
                <FiX size={18} />
              </button>
            </div>

            {/* Custom Sub-Tabs Navigation */}
            {user && (
              <div className="flex p-1 bg-black/30 m-2 rounded-xl border border-white/5">
                <button 
                  onClick={() => setActiveSubTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSubTab === 'chat'
                      ? 'bg-theme-neon text-theme-dark shadow-neon-sm font-black'
                      : 'text-theme-muted hover:text-white'
                  }`}
                >
                  <FiMessageSquare size={13} />
                  CHAT GLOBAL
                </button>
                <button 
                  onClick={() => setActiveSubTab('friends')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSubTab === 'friends'
                      ? 'bg-theme-neon text-theme-dark shadow-neon-sm font-black'
                      : 'text-theme-muted hover:text-white'
                  }`}
                >
                  <FiUser size={13} />
                  AMIGOS
                  {(incomingRequests.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  )}
                </button>
              </div>
            )}
          </div>

          {!user && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 animate-fade-in">
              <FiShield className="text-theme-neon animate-pulse" size={48} />
              <h4 className="font-display font-black text-lg text-white uppercase tracking-wider">Centro Social Desconectado</h4>
              <p className="text-xs text-theme-muted leading-relaxed">
                Para chatear con la comunidad en vivo, agregar amigos, ver sus perfiles y enviar solicitudes, debes iniciar sesión con tu cuenta de DeathCloud.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onLoginTrigger) onLoginTrigger();
                }}
                className="mt-2 w-full max-w-[200px] bg-theme-neon hover:bg-[#00d2ff] text-black font-black py-2.5 rounded-xl transition-all shadow-[0_0_15px_var(--theme-neon-glow)] hover:shadow-[0_0_25px_var(--theme-neon)] font-display uppercase tracking-wider text-xs"
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          {/* TAB CONTENT: LIVE CHAT */}
          {user && activeSubTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-theme-neon/20">
                {visibleMessages.length === 0 ? (
                  <div className="text-center py-10 opacity-30 italic text-xs text-theme-muted">
                    No hay transmisiones de chat disponibles.
                  </div>
                ) : (
                  visibleMessages.map((msg, idx) => {
                    const isMe = msg.usuario === (user?.nickname || user?.username);
                    return (
                      <div 
                        key={idx} 
                        className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className="flex items-baseline gap-2 cursor-pointer group"
                          onContextMenu={(e) => handleContextMenu(e, msg.usuario)}
                          title={!isMe ? "Clic derecho para opciones de jugador" : ""}
                        >
                          <span className={`font-black text-xs transition-colors ${
                            isMe ? 'text-theme-neon' : 'text-[#f472b6] group-hover:text-[#00d2ff]'
                          }`}>
                            {msg.usuario}
                          </span>
                          <span className="text-[9px] text-theme-muted/50 font-mono">{msg.hora}</span>
                        </div>
                        <p 
                          className={`text-xs py-2 px-3.5 rounded-2xl border leading-relaxed break-all ${
                            isMe 
                              ? 'bg-theme-neon/15 border-theme-neon/30 text-white rounded-tr-none' 
                              : 'bg-white/5 border-white/10 text-theme-text rounded-tl-none'
                          }`}
                          onContextMenu={(e) => handleContextMenu(e, msg.usuario)}
                        >
                          {msg.texto}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-theme-dark/80 border-t border-theme-neon/10">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribir mensaje en red..." 
                    className="w-full bg-black/40 border border-theme-neon/30 rounded-xl py-2.5 pl-4 pr-11 text-xs text-white focus:outline-none focus:border-theme-neon focus:shadow-neon-sm transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-theme-neon/10 hover:bg-theme-neon text-theme-neon hover:text-black flex items-center justify-center transition-all duration-300"
                  >
                    <FiSend size={13} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB CONTENT: FRIENDS & REQUESTS */}
          {user && activeSubTab === 'friends' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              
              {/* Add Friend Input Widget */}
              <div className="mb-4">
                <label className="text-[9px] uppercase tracking-widest font-black text-theme-muted block mb-1.5">Agregar Piloto</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={addFriendName}
                    onChange={(e) => setAddFriendName(e.target.value)}
                    placeholder="Escribe el nombre de tu amigo..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all font-semibold"
                  />
                  <button 
                    onClick={() => handleSendRequest(addFriendName)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-theme-neon/10 hover:bg-theme-neon text-theme-neon hover:text-theme-dark flex items-center justify-center transition-all"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                {/* Alerts */}
                {addFriendError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg font-bold flex items-center gap-1">
                    <FiAlertTriangle size={12} /> <span>{addFriendError}</span>
                  </div>
                )}
                {addFriendSuccess && (
                  <div className="mt-2 p-2 bg-theme-success/10 border border-theme-success/20 text-theme-success text-[10px] rounded-lg font-bold flex items-center gap-1">
                    <FiCheck size={12} /> <span>{addFriendSuccess}</span>
                  </div>
                )}
              </div>

              {/* Lists Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-theme-neon/20">
                {friendsLoading ? (
                  <div className="text-center py-8 text-xs text-theme-muted italic">
                    Actualizando lista de red...
                  </div>
                ) : friendsError ? (
                  <div className="text-center py-6 text-xs text-red-400 font-bold flex flex-col items-center gap-1">
                    <FiAlertTriangle size={24} />
                    <span>Error al cargar amigos</span>
                  </div>
                ) : (
                  <>
                    {/* 1. Solicitudes Entrantes */}
                    {incomingRequests.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted border-b border-white/5 pb-1">
                          Solicitudes Pendientes ({incomingRequests.length})
                        </span>
                        {incomingRequests.map(req => (
                          <div key={req.request_id} className="flex justify-between items-center p-2 bg-theme-neon/5 border border-theme-neon/10 rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-black/40 border border-theme-neon/20 flex items-center justify-center">
                                {req.avatar_url && req.avatar_url !== 'none' ? (
                                  <img src={req.avatar_url} alt="avatar" className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <span className="text-[10px] font-bold text-theme-neon">{(req.nickname || req.nombre_usuario).substring(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <span className="font-bold text-white leading-tight">{req.nickname || req.nombre_usuario}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleRespondRequest(req.request_id, 'aceptado')}
                                className="w-6 h-6 rounded-lg bg-theme-success/20 text-theme-success border border-theme-success/20 flex items-center justify-center hover:bg-theme-success hover:text-white transition-colors"
                                title="Aceptar Solicitud"
                              >
                                <FiCheck size={12} />
                              </button>
                              <button 
                                onClick={() => handleRespondRequest(req.request_id, 'rechazado')}
                                className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                title="Rechazar"
                              >
                                <FiX size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. Solicitudes Enviadas */}
                    {outgoingRequests.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted border-b border-white/5 pb-1">
                          Peticiones Enviadas ({outgoingRequests.length})
                        </span>
                        {outgoingRequests.map(req => (
                          <div key={req.request_id} className="flex justify-between items-center p-2 bg-black/20 border border-white/5 rounded-xl text-xs text-theme-muted">
                            <span className="font-medium text-theme-muted/80">{req.nickname || req.nombre_usuario}</span>
                            <button 
                              onClick={() => handleRespondRequest(req.request_id, 'cancelar')}
                              className="text-[10px] text-red-400 hover:underline hover:text-red-300 font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Amigos Aceptados */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted border-b border-white/5 pb-1">
                        Mis Amigos ({friendsList.length})
                      </span>
                      {friendsList.length === 0 ? (
                        <div className="text-center py-6 text-xs text-theme-muted/50 italic leading-relaxed">
                          No tienes amigos agregados aún.<br/>Agrega pilotos por su nickname.
                        </div>
                      ) : (
                        friendsList.map(friend => (
                          <div key={friend.friendship_id} className="flex justify-between items-center p-2.5 bg-black/20 border border-white/5 hover:border-theme-neon/20 rounded-xl text-xs transition-colors group">
                            <div 
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => handleViewPublicProfile(friend.nombre_usuario)}
                              title="Ver Perfil"
                            >
                              {/* Avatar Icon */}
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-black/40 border border-theme-neon/15 flex items-center justify-center">
                                {friend.avatar_url && friend.avatar_url !== 'none' ? (
                                  <img src={friend.avatar_url} alt="avatar" className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <span className="text-[10px] font-bold text-theme-neon">{(friend.nickname || friend.nombre_usuario).substring(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-theme-neon transition-colors leading-tight">{friend.nickname || friend.nombre_usuario}</span>
                                <span className="text-[9px] text-theme-success leading-none mt-0.5">En línea</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <button 
                              onClick={() => handleRemoveFriend(friend.friendship_id, friend.nickname || friend.nombre_usuario)}
                              className="w-6 h-6 rounded-lg hover:bg-red-500/10 text-theme-muted hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Eliminar amigo"
                            >
                              <FiUserMinus size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT-CLICK FLOATING CONTEXT MENU */}
      {contextMenu && (
        <div 
          className="fixed z-50 w-44 bg-theme-dark/95 backdrop-blur-md border border-theme-neon/30 shadow-neon-strong rounded-xl p-1.5 flex flex-col gap-0.5"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            onClick={() => handleViewPublicProfile(contextMenu.username)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white hover:bg-theme-neon/10 hover:text-theme-neon rounded-lg transition-colors text-left"
          >
            <FiUser size={13} /> Ver Perfil
          </button>
          <button 
            onClick={() => handleSendRequest(contextMenu.username)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white hover:bg-theme-neon/10 hover:text-theme-neon rounded-lg transition-colors text-left"
          >
            <FiUserPlus size={13} /> Añadir amigo
          </button>
          <button 
            onClick={() => toggleMuteUser(contextMenu.username)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${
              mutedUsers.includes(contextMenu.username)
                ? 'text-theme-neon hover:bg-theme-neon/10'
                : 'text-white hover:bg-theme-neon/10 hover:text-theme-neon'
            }`}
          >
            <FiVolumeX size={13} /> 
            {mutedUsers.includes(contextMenu.username) ? 'Desmutear' : 'Silenciar'}
          </button>
        </div>
      )}

      {/* POPUP MODAL: JUGADOR PUBLIC PROFILE */}
      {publicProfileUser && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative text-center">
            <button 
              onClick={() => setPublicProfileUser(null)}
              className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>

            {/* Profile Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-theme-neon/30 bg-black/60 shadow-neon-sm mx-auto my-4 flex items-center justify-center relative">
              {publicProfileUser.avatar_url !== 'none' ? (
                <img src={publicProfileUser.avatar_url} alt="avatar" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-3xl text-theme-neon font-bold font-display">{(publicProfileUser.nickname || publicProfileUser.nombre_usuario).substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            {/* Nickname & DeathCloud ID */}
            <h3 className="font-display font-black text-xl text-white tracking-wide">{publicProfileUser.nickname || publicProfileUser.nombre_usuario}</h3>
            <span className="text-[10px] text-theme-muted font-mono" title="DeathCloud ID">ID: #{publicProfileUser.nombre_usuario}</span>

            {/* Role Badge */}
            <div className="my-3 flex justify-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${
                publicProfileUser.rol === 'admin' 
                  ? 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/30' 
                  : 'bg-theme-neon/15 text-theme-neon border-theme-neon/20 shadow-neon-sm'
              }`}>
                <FiShield className="mr-1" size={10} />
                {publicProfileUser.rol === 'admin' ? 'ADMINISTRADOR' : 'JUGADOR'}
              </span>
            </div>

            {/* Biography */}
            <div className="bg-black/30 border border-white/5 p-4 rounded-xl text-left my-4 min-h-[60px]">
              <span className="text-[8px] uppercase font-black text-theme-muted tracking-wider block mb-1">Biografía</span>
              <p className="text-xs text-white leading-relaxed italic whitespace-pre-line">
                {publicProfileUser.bio || 'Este piloto no ha escrito ninguna biografía.'}
              </p>
            </div>

            <div className="text-[9px] text-theme-muted font-mono">
              REGISTRO: {new Date(publicProfileUser.fecha_creacion).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      
      {/* LOADING POPUP MODAL FOR PUBLIC PROFILE */}
      {publicProfileLoading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-theme-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* ERROR POPUP MODAL FOR PUBLIC PROFILE */}
      {publicProfileError && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs glass-panel border border-red-500/30 p-5 rounded-2xl relative text-center">
            <button onClick={() => setPublicProfileError(null)} className="absolute top-3 right-3 text-theme-muted hover:text-white">
              <FiX size={18} />
            </button>
            <FiAlertTriangle className="text-red-400 mx-auto mb-2 animate-bounce" size={40} />
            <h4 className="font-bold text-white text-sm">Error de Red</h4>
            <p className="text-xs text-theme-muted mt-1 leading-normal">{publicProfileError}</p>
          </div>
        </div>
      )}
    </>
  );
}
