import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import { useGame } from '../../context/GameContext';

export default function Header({ onToggleChat, user, onLogout }) {
  const { gameInfo, switchGame, availableGames } = useGame();
  
  const navItems = [
    { name: 'Juego', path: '/' },
    { name: 'Ranking', path: '/ranking' },
    { name: 'Comunidad', path: '/comunidad' },
    { name: 'Tienda', path: '/tienda' },
  ];

  return (
    <header className="flex items-center justify-between w-full h-20 px-8 bg-theme-dark/80 backdrop-blur-md border-b border-theme-neon/30 sticky top-0 z-50 transition-colors duration-500">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-theme-neon/20 border border-theme-neon shadow-neon flex items-center justify-center transition-colors duration-500">
          <span className="text-theme-neon font-bold text-xl font-display">{gameInfo.symbol}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-2xl tracking-widest uppercase neon-text text-white leading-none">{gameInfo.displayName}</span>
          <span className="text-[0.65rem] text-theme-muted tracking-[0.2em] uppercase mt-1">{gameInfo.subTagline}</span>
        </div>
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
        
        {/* Desacoplamiento Switcher: Para probar los temas */}
        <select 
          className="bg-theme-panel text-theme-neon border border-theme-neon/30 p-1 text-xs rounded-md shadow-neon cursor-pointer focus:outline-none"
          value={gameInfo.id}
          onChange={(e) => switchGame(e.target.value)}
        >
          {availableGames.map(g => (
            <option key={g.id} value={g.id}>{g.displayName}</option>
          ))}
        </select>

        <button className="text-theme-muted hover:text-theme-neon transition-colors">
          <FiSearch size={22} />
        </button>
        <button className="relative text-theme-muted hover:text-theme-neon transition-colors">
          <FiBell size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-theme-neon text-theme-dark text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </button>
        <button 
          onClick={onToggleChat}
          className="text-theme-muted hover:text-theme-neon transition-colors"
        >
          <FiMessageSquare size={22} />
        </button>
        <div className="h-8 w-[1px] bg-theme-neon/20 mx-2"></div>
        <div className="flex items-center gap-3 group relative">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-theme-neon transition-colors bg-theme-panel">
              <div className="w-full h-full flex items-center justify-center text-theme-neon font-bold">
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-theme-success border-2 border-theme-dark transition-colors duration-500"></span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-bold text-sm text-theme-text">{user?.username || 'Invitado'}</span>
            <span className="text-[10px] text-theme-success uppercase tracking-tighter">En línea</span>
          </div>
          
          {/* Logout Button (Appears on Hover or simply visible) */}
          <button 
            onClick={onLogout}
            className="ml-2 p-2 rounded-full hover:bg-red-500/10 text-theme-muted hover:text-red-400 transition-all"
            title="Cerrar Sesión"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
