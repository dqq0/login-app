import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageSquare, FiLogOut, FiX, FiCheck, FiInbox, FiCpu, FiPlus, FiChevronDown } from 'react-icons/fi';
import { useGame } from '../../context/GameContext';

export default function Header({ onToggleChat, user, onLogout, credits, addCredits, onLoginTrigger }) {
  const { gameInfo, switchGame, availableGames } = useGame();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // E-Points buy states
  const [showBuyPoints, setShowBuyPoints] = useState(false);
  const [purchasingPack, setPurchasingPack] = useState(null);
  const [purchasingState, setPurchasingState] = useState('idle'); // 'idle' | 'processing' | 'success'
  
  // Interactive notifications state with lazy loading & persistence
  const [notifications, setNotifications] = useState([]);

  // Close game selector on outside click
  useEffect(() => {
    const handleOutsideClick = () => setShowGameSelector(false);
    if (showGameSelector) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showGameSelector]);

  // Cerrar modales con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
        if (purchasingState !== 'processing') {
          setShowBuyPoints(false);
          setPurchasingPack(null);
          setPurchasingState('idle');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [purchasingState]);

  const handleOpenBuyPoints = () => {
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    setShowBuyPoints(true);
  };

  const handleBuyPack = (pack) => {
    setPurchasingPack(pack);
    setPurchasingState('processing');
    
    // Simulate transaction delay
    setTimeout(() => {
      setPurchasingState('success');
      const totalEP = pack.amount + pack.bonus;
      if (addCredits) {
        addCredits(totalEP);
      }
    }, 1500);
  };

  // Sync notifications with localStorage
  useEffect(() => {
    const key = `notifications_${user?.id || user?.username || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing user notifications", e);
      }
    } else {
      const defaultNotifs = [
        { id: 1, text: "Actualización 1.2.0 de Death Cloud disponible. ¡Descarga el launcher para jugar!", date: "Hace 5m", unread: true },
        { id: 2, text: "Bono inicial de 2,500 E-Points acreditado en tu cuenta.", date: "Hace 1h", unread: true },
        { id: 3, text: "El canal de soporte técnico está activo y en línea.", date: "Hace 1d", unread: true },
      ];
      setNotifications(defaultNotifs);
      localStorage.setItem(key, JSON.stringify(defaultNotifs));
    }
  }, [user?.id, user?.username]);

  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    const key = `notifications_${user?.id || user?.username || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(newNotifications));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  // Mock forum debates to search in the main search bar
  const forumPosts = [
    { id: 1, title: "¿Cuál es la mejor táctica para la Montura Tiburón?", desc: "He estado probando giros cerrados a alta velocidad y noto que el rastro de luz ayuda a cegar...", author: "ShadowFang", type: "Debate Foro", url: "/comunidad" },
    { id: 2, title: "Problemas al conectar con FortiClient", desc: "Para los que tengan cortes de sesión continuos en el puerto 5432, recuerden ajustar la MTU...", author: "CypherCore", type: "Debate Foro", url: "/comunidad" },
    { id: 3, title: "Armas legendarias filtradas", desc: "Se filtraron diseños en el servidor de pruebas y el hacha premium tiene stats de daño crítico...", author: "LunaMist", type: "Debate Foro", url: "/comunidad" },
  ];

  // System navigation/settings matches
  const systemActions = [
    { title: "Perfil de Jugador", desc: "Configura tu biografía, cambia tu avatar y edita tu Riot ID.", type: "Navegación", url: "/perfil" },
    { title: "Cambiar Contraseña", desc: "Actualizar la clave de seguridad de tu cuenta de DeathCloud.", type: "Seguridad", url: "/perfil" },
    { title: "Adquirir E-Points (EP)", desc: "Comprar monedas premium para adquirir items en la tienda.", type: "Tienda / E-Points", url: "/tienda", action: () => handleOpenBuyPoints() },
    { title: "Ranking Global", desc: "Clasificación de los mejores jugadores de Death Cloud.", type: "Navegación", url: "/ranking" },
    { title: "Foro de Comunidad", desc: "Debates, guías de conexión y noticias oficiales del parche.", type: "Navegación", url: "/comunidad" },
    { title: "Centro de Soporte Técnico", desc: "Crear tickets de soporte para asistencia técnica.", type: "Navegación", url: "/soporte" },
  ];

  // Mock search results over game store items, news, leaderboard, forum posts and navigation actions
  const searchResults = searchQuery.trim() === '' ? [] : [
    ...gameInfo.store.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({ ...item, type: 'Item de Tienda', url: '/tienda' })),

    ...gameInfo.news.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(n => ({ ...n, type: 'Noticia', url: '/comunidad' })),

    ...gameInfo.leaderboard.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(player => ({ ...player, title: `${player.name} (Rank #${player.rank})`, type: 'Clasificación', url: '/ranking' })),

    ...forumPosts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.author.toLowerCase().includes(searchQuery.toLowerCase())
    ),

    ...systemActions.filter(act => 
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      act.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ];

  const navItems = [
    { name: 'Juego', path: '/' },
    { name: 'Ranking', path: '/ranking' },
    { name: 'Comunidad', path: '/comunidad' },
    { name: 'Tienda', path: '/tienda' },
    { name: 'Soporte', path: '/soporte' },
  ];
  
  if (user?.rol === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <>
      <header className="flex items-center justify-between w-full h-20 px-8 bg-theme-dark/80 backdrop-blur-md border-b border-theme-neon/30 sticky top-0 z-50 transition-colors duration-500">
      {/* Logo / Dropdown Selector */}
      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowGameSelector(!showGameSelector);
          }}
          className="flex items-center gap-3 group text-left focus:outline-none"
          title="Seleccionar juego de la red"
        >
          <div className="w-10 h-10 rounded-full bg-theme-neon/20 border border-theme-neon shadow-neon flex items-center justify-center transition-all duration-500 group-hover:scale-105">
            <span className="text-theme-neon font-bold text-lg font-display">{gameInfo.symbol}</span>
          </div>
          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-xl tracking-widest uppercase neon-text text-white leading-none">DEATHCLOUD</span>
              <FiChevronDown size={14} className="text-theme-neon transition-transform duration-300 group-hover:translate-y-0.5" />
            </div>
            <span className="text-[9px] text-theme-muted tracking-[0.1em] uppercase mt-1 leading-none font-semibold">
              {gameInfo.subTagline}
            </span>
          </div>
        </button>

        {/* Dropdown Menu (Riot Games style) */}
        {showGameSelector && (
          <div className="absolute left-0 mt-3 w-64 glass-panel border border-theme-neon/30 bg-theme-dark/95 backdrop-blur-2xl rounded-2xl shadow-neon-strong p-2 z-50 flex flex-col gap-1 animate-fade-in">
            <div className="px-3 py-1.5 border-b border-white/5 mb-1">
              <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted font-mono">SELECCIONAR VERSIÓN</span>
            </div>
            {availableGames.map(game => {
              const isActive = game.id === gameInfo.id;
              return (
                <button
                  key={game.id}
                  onClick={() => {
                    switchGame(game.id);
                    setShowGameSelector(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-3 border ${
                    isActive 
                      ? 'bg-theme-neon/10 border-theme-neon/30 text-theme-neon' 
                      : 'bg-black/20 border-white/5 hover:border-theme-neon/40 text-theme-text hover:bg-theme-panel'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isActive ? 'bg-theme-neon text-theme-dark' : 'bg-white/5 text-theme-muted border border-white/10'
                  }`}>
                    {game.symbol}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black leading-tight text-white">{game.displayName}</span>
                    <span className="text-[9px] text-theme-muted leading-tight mt-0.5">{game.tagline}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `relative px-2 py-6 font-display font-semibold transition-colors duration-300 ${
                isActive ? 'text-theme-neon' : 'text-theme-text hover:text-theme-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-theme-neon shadow-neon rounded-t-md" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggler & User Area */}
      <div className="flex items-center gap-6">
        
        {/* Credits Balance Widget */}
        {user && (
          <div className="hidden lg:flex items-center gap-3 border border-theme-neon/30 bg-theme-neon/5 pl-3 pr-2 py-1 rounded-xl shadow-neon-sm">
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-widest font-bold text-theme-muted leading-none mb-0.5">E-POINTS</span>
              <span className="text-sm font-black text-theme-neon font-mono leading-none">{credits !== undefined ? credits.toLocaleString() : '2,500'} EP</span>
            </div>
            <button 
              onClick={handleOpenBuyPoints}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-theme-neon text-theme-dark font-black hover:scale-105 transition-transform"
              title="Comprar E-Points"
            >
              <FiPlus size={16} />
            </button>
          </div>
        )}

        {/* Search Trigger */}
        <button 
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 flex items-center justify-center text-theme-muted hover:text-theme-neon hover:bg-white/5 rounded-full transition-colors"
          title="Buscar en la red"
        >
          <FiSearch size={20} />
        </button>

        {/* Notifications Trigger */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
            }}
            className="relative w-10 h-10 flex items-center justify-center text-theme-muted hover:text-theme-neon hover:bg-white/5 rounded-full transition-colors"
            title="Transmisiones de alerta"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-theme-neon text-theme-dark text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
 
           {/* Notifications Dropdown */}
           {showNotifications && (
             <div className="absolute right-0 mt-3 w-80 glass-panel border border-theme-neon/30 bg-theme-dark/95 backdrop-blur-2xl rounded-2xl shadow-neon-strong p-4 z-50 flex flex-col gap-3">
               <div className="flex justify-between items-center pb-2 border-b border-theme-neon/20">
                 <span className="font-display font-bold text-xs uppercase tracking-widest text-white">Transmisiones</span>
                 {unreadCount > 0 && (
                   <button 
                     onClick={markAllAsRead} 
                     className="text-[10px] text-theme-neon hover:underline font-bold"
                   >
                     Marcar leídas
                   </button>
                 )}
               </div>
               <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                 {notifications.length === 0 ? (
                   <div className="text-center py-6 text-xs text-theme-muted italic">
                     Sin transmisiones activas
                   </div>
                 ) : (
                   notifications.map(n => (
                     <div 
                       key={n.id} 
                       onClick={() => markAsRead(n.id)}
                       className={`p-2.5 rounded-lg border text-xs transition-all relative group cursor-pointer ${
                         n.unread 
                           ? 'bg-theme-neon/10 border-theme-neon/20 text-white' 
                           : 'bg-black/30 border-white/5 text-theme-muted hover:bg-black/50'
                       }`}
                     >
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteNotification(n.id);
                         }}
                         className="absolute top-1.5 right-1.5 text-theme-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <FiX size={10} />
                       </button>
                       <div className="pr-4 leading-relaxed">{n.text}</div>
                       <span className="text-[9px] text-theme-muted/65 font-mono block mt-1">{n.date}</span>
                     </div>
                   ))
                 )}
               </div>
             </div>
           )}
         </div>
 
         {/* Chat Trigger */}
         <button 
           onClick={onToggleChat}
           className="w-10 h-10 flex items-center justify-center text-theme-muted hover:text-theme-neon hover:bg-white/5 rounded-full transition-colors"
           title="Chat global y amigos"
         >
           <FiMessageSquare size={20} />
         </button>
 
        {!user ? (
          <button 
            onClick={() => onLoginTrigger && onLoginTrigger()}
            className="neon-button border border-theme-neon/40 rounded-xl px-5 py-2.5 bg-theme-neon/15 text-theme-neon hover:bg-theme-neon hover:text-theme-dark text-xs font-black tracking-wider transition-all shadow-neon-sm"
          >
            INICIAR SESIÓN
          </button>
        ) : (
          <>
            <div className="h-8 w-[1px] bg-theme-neon/20 mx-2"></div>
            
            <Link to="/perfil" className="flex items-center gap-3 group relative">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-theme-neon transition-colors bg-theme-panel">
                  <div className="w-full h-full flex items-center justify-center text-theme-neon font-bold">
                    {(user?.nickname || user?.username || 'In').substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-theme-success border-2 border-theme-dark transition-colors duration-500"></span>
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="font-bold text-sm text-theme-text group-hover:text-theme-neon transition-colors">{user?.nickname || user?.username || 'Invitado'}</span>
                <span className="text-[10px] text-theme-success uppercase tracking-tighter">En línea</span>
              </div>
            </Link>
              
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <FiLogOut size={18} />
            </button>
          </>
        )}
       </div>
      </header>

      {/* Global Search Modal Overlay */}
       {showSearch && (
         <div 
           onClick={() => {
             setShowSearch(false);
             setSearchQuery('');
           }}
           className="fixed inset-0 z-[100] bg-theme-dark/90 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in cursor-pointer"
         >
           <div 
             onClick={(e) => e.stopPropagation()}
             className="w-full max-w-2xl glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative cursor-default"
           >
             <button 
               onClick={() => {
                 setShowSearch(false);
                 setSearchQuery('');
               }}
               className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
             >
               <FiX size={24} />
             </button>
             <h3 className="font-display font-bold text-xl text-white tracking-widest uppercase mb-4 flex items-center gap-2">
               <FiCpu className="text-theme-neon" /> BÚSQUEDA DE RED DEATHCLOUD
             </h3>
             
             <div className="relative">
               <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-neon" size={18} />
               <input 
                 type="text"
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && searchResults.length > 0) {
                     const firstResult = searchResults[0];
                     setShowSearch(false);
                     setSearchQuery('');
                     if (firstResult.action) {
                       firstResult.action();
                     } else if (firstResult.url) {
                       navigate(firstResult.url);
                     }
                   }
                 }}
                 placeholder="Escribe para buscar (ej. Tiburón, Evento, Shadow, foro, e-points)..."
                 className="w-full bg-black/60 border border-theme-neon/40 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-theme-neon focus:shadow-neon transition-all"
               />
             </div>
 
             <div className="mt-6 max-h-80 overflow-y-auto scrollbar-thin flex flex-col gap-2">
               {searchQuery.trim() === '' ? (
                 <div className="text-center py-8 text-xs text-theme-muted italic">
                   Ingresa palabras clave para escanear la base de datos local
                 </div>
               ) : searchResults.length === 0 ? (
                 <div className="text-center py-8 text-xs text-red-400 italic">
                   No se encontraron coincidencias en la red.
                 </div>
               ) : (
                 searchResults.map((result, idx) => {
                   const content = (
                     <div className="flex flex-col">
                       <span className="font-bold text-white group-hover:text-theme-neon transition-colors">{result.title}</span>
                       <span className="text-[10px] text-theme-muted mt-1">{result.desc || result.description || 'Consulta de datos en tabla'}</span>
                     </div>
                   );
                   const badge = (
                     <span className="text-[10px] uppercase font-bold px-2 py-0.5 border border-theme-neon/20 rounded bg-theme-neon/5 text-theme-neon font-mono">
                       {result.type}
                     </span>
                   );
                   const itemClass = "p-3 rounded-lg border border-white/5 bg-black/35 hover:border-theme-neon/40 hover:bg-theme-neon/5 transition-all flex items-center justify-between group text-left w-full";

                   if (result.action) {
                     return (
                       <button
                         key={idx}
                         onClick={() => {
                           setShowSearch(false);
                           setSearchQuery('');
                           result.action();
                         }}
                         className={itemClass}
                       >
                         {content}
                         {badge}
                       </button>
                     );
                   }

                   return (
                     <Link 
                       key={idx}
                       to={result.url}
                       onClick={() => {
                         setShowSearch(false);
                         setSearchQuery('');
                       }}
                       className={itemClass}
                     >
                       {content}
                       {badge}
                     </Link>
                   );
                 })
               )}
             </div>
          </div>
        </div>
      )}

      {/* Global Buy E-Points Modal Overlay */}
      {showBuyPoints && (
        <div 
          onClick={() => {
            if (purchasingState !== 'processing') {
              setShowBuyPoints(false);
              setPurchasingPack(null);
              setPurchasingState('idle');
            }
          }}
          className="fixed inset-0 z-[100] bg-theme-dark/95 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto pt-10 pb-10 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative my-auto cursor-default"
          >
            <button 
              onClick={() => {
                setShowBuyPoints(false);
                setPurchasingPack(null);
                setPurchasingState('idle');
              }}
              className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
              disabled={purchasingState === 'processing'}
            >
              <FiX size={24} />
            </button>
            
            {purchasingState === 'processing' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 border-4 border-theme-neon border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="font-display font-black text-xl text-white tracking-widest uppercase mb-1">PROCESANDO TRANSACCIÓN</h3>
                <p className="text-xs text-theme-muted">Estableciendo enlace seguro con tu banco...</p>
              </div>
            )}

            {purchasingState === 'success' && purchasingPack && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-theme-success/20 text-theme-success flex items-center justify-center animate-bounce border border-theme-success/30 shadow-neon-sm">
                  <FiCheck size={36} />
                </div>
                <h3 className="font-display font-black text-2xl text-white tracking-widest uppercase">¡COMPRA EXITOSA!</h3>
                <p className="text-xs text-theme-muted leading-relaxed max-w-sm">
                  Has adquirido correctamente el paquete de <strong className="text-theme-neon">{purchasingPack.amount.toLocaleString()} EP</strong> 
                  {purchasingPack.bonus > 0 && <span> (+{purchasingPack.bonus} EP de bono gratis)</span>}.
                </p>
                <div className="text-2xl font-black text-theme-neon font-mono mt-2 animate-pulse">
                  +{(purchasingPack.amount + purchasingPack.bonus).toLocaleString()} EP
                </div>
                <button 
                  onClick={() => {
                    setShowBuyPoints(false);
                    setPurchasingPack(null);
                    setPurchasingState('idle');
                  }}
                  className="mt-6 neon-button border border-theme-neon rounded-xl px-10 py-2.5 bg-theme-neon text-theme-dark font-black hover:shadow-neon transition-all"
                >
                  ENTENDIDO
                </button>
              </div>
            )}

            {purchasingState === 'idle' && (
              <>
                <h3 className="font-display font-black text-xl text-white tracking-widest uppercase mb-2 text-center" style={{ textShadow: '0 0 10px var(--theme-neon-glow)' }}>
                  TIENDA DE E-POINTS
                </h3>
                <p className="text-xs text-theme-muted text-center mb-6 uppercase tracking-wider">Adquiere paquetes de monedas para desbloquear contenido premium en DeathCloud</p>
                
                <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto px-2">
                  {[
                    { id: 'ep-pack-1', amount: 500, bonus: 0, price: '$4.99 USD' },
                    { id: 'ep-pack-2', amount: 1100, bonus: 100, price: '$9.99 USD' },
                    { id: 'ep-pack-3', amount: 2500, bonus: 300, price: '$19.99 USD', popular: true },
                    { id: 'ep-pack-4', amount: 6000, bonus: 1000, price: '$44.99 USD' },
                    { id: 'ep-pack-5', amount: 13500, bonus: 3000, price: '$99.99 USD' },
                  ].map((pack) => (
                    <div 
                      key={pack.id} 
                      onClick={() => handleBuyPack(pack)}
                      className={`relative cursor-pointer bg-black/40 border p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-center text-center sm:text-left transition-all hover:bg-black/60 group ${
                        pack.popular 
                          ? 'border-theme-neon shadow-neon' 
                          : 'border-white/5 hover:border-theme-neon/40'
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute top-2 right-2 sm:top-1/2 sm:-translate-y-1/2 sm:right-32 bg-theme-neon text-theme-dark text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-neon">
                          POPULAR
                        </span>
                      )}
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-theme-neon/10 border border-theme-neon/20 flex items-center justify-center font-mono font-black text-theme-neon text-xs group-hover:bg-theme-neon group-hover:text-theme-dark transition-all duration-300">
                          EP
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">{pack.amount.toLocaleString()} E-Points</span>
                          {pack.bonus > 0 ? (
                            <span className="text-[9px] text-theme-success font-bold mt-0.5">+{pack.bonus.toLocaleString()} EP DE BONO GRATIS</span>
                          ) : (
                            <span className="text-[9px] text-theme-muted font-medium mt-0.5">PAQUETE BÁSICO</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3.5 sm:mt-0 px-4 py-1.5 border border-theme-neon/30 rounded-lg font-mono text-xs font-black text-theme-neon bg-theme-neon/5 group-hover:bg-theme-neon group-hover:text-theme-dark transition-all shadow-neon-sm">
                        {pack.price}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center text-[10px] text-theme-muted/50 mt-6 leading-relaxed">
                  Las compras de E-Points se acreditan inmediatamente a tu saldo de sesión local y se guardan de forma permanente.<br/>
                  Métodos de pago ficticios habilitados para fines académicos de prueba.
                </div>
              </>
            )}
          </div>
         </div>
       )}
     </>
  );
}
