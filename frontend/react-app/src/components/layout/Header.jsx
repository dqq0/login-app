import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageSquare } from 'react-icons/fi';

export default function Header({ onToggleChat }) {
  const navItems = [
    { name: 'Juego', path: '/' },
    { name: 'Ranking', path: '/ranking' },
    { name: 'Comunidad', path: '/comunidad' },
    { name: 'Tienda', path: '/tienda' },
  ];

  return (
    <header className="flex items-center justify-between w-full h-20 px-8 bg-death-dark/80 backdrop-blur-md border-b border-[#00f3ff]/30 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-death-neon/20 border border-death-neon shadow-neon flex items-center justify-center">
          <span className="text-death-neon font-bold text-xl font-display">DC</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-2xl tracking-widest uppercase neon-text text-white leading-none">Death Cloud</span>
          <span className="text-[0.65rem] text-death-muted tracking-[0.2em] uppercase mt-1">Shape the Storm</span>
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
                isActive ? 'text-death-neon' : 'text-death-text hover:text-death-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-death-neon shadow-neon rounded-t-md" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Area */}
      <div className="flex items-center gap-6">
        <button className="text-death-muted hover:text-death-neon transition-colors">
          <FiSearch size={22} />
        </button>
        <button className="relative text-death-muted hover:text-death-neon transition-colors">
          <FiBell size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-death-neon text-death-dark text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </button>
        <button 
          onClick={onToggleChat}
          className="text-death-muted hover:text-death-neon transition-colors"
        >
          <FiMessageSquare size={22} />
        </button>
        <div className="h-8 w-[1px] bg-[#00f3ff]/20 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-death-neon transition-colors">
              <img src="/assets/hero_bg.png" alt="Avatar" className="w-full h-full object-cover grayscale-[0.2]" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-death-success border-2 border-death-dark"></span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-bold text-sm">ShadowFang</span>
            <span className="text-xs text-death-success">En línea</span>
          </div>
        </div>
      </div>
    </header>
  );
}
