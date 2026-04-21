import React from 'react';
import { FiChevronLeft, FiChevronRight, FiList, FiLock, FiCalendar } from 'react-icons/fi';
import { useGame } from '../context/GameContext';

export default function Dashboard() {
  const { gameInfo } = useGame();

  const titleLines = gameInfo.displayName.split(' ');

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-16 fade-in transition-all duration-500">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-16 min-h-[350px] relative z-10 transition-all duration-500">
        <h1 className="font-display font-extrabold text-[5rem] md:text-[8rem] leading-none text-white tracking-wider" style={{ textShadow: '0 0 20px var(--theme-neon-glow)' }}>
          {titleLines.map((word, idx) => (
            <React.Fragment key={idx}>
              {word}<br/>
            </React.Fragment>
          ))}
        </h1>
        <p className="text-theme-neon uppercase tracking-[0.5em] font-semibold text-sm mb-12" style={{ textShadow: '0 0 5px var(--theme-neon)' }}>
          {gameInfo.tagline}
        </p>
        
        <button className="neon-button border border-theme-neon/50 rounded-sm px-10 py-3 flex items-center gap-10 bg-theme-dark/40 backdrop-blur-sm group">
          <FiChevronLeft className="text-theme-neon group-hover:text-white transition-colors" />
          <span className="text-xl md:text-2xl font-bold tracking-widest">JUGAR AHORA</span>
          <FiChevronRight className="text-theme-neon group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Leaderboard Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-theme-neon/40 transition-colors duration-500">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiList className="text-theme-neon" /> Clasificación
            </h3>
            <a href="#" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver todo →</a>
          </div>
          <div className="flex flex-col gap-2">
            {gameInfo.leaderboard.map(user => (
              <div key={user.rank} className="flex flex-row items-center justify-between group hover:bg-theme-neon/10 p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-theme-neon/20">
                <div className="flex items-center gap-4">
                  <span className="text-theme-muted text-sm w-4 font-mono">{user.rank < 10 ? `0${user.rank}` : user.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-theme-dark border border-theme-neon/30 overflow-hidden shadow-inner flex items-center justify-center">
                    {gameInfo.assets.heroBackground !== "none" ? (
                       <img src={gameInfo.assets.heroBackground} alt="avatar" className="w-full h-full object-cover blur-[1px] group-hover:blur-0 transition-all" />
                    ) : (
                       <span className="text-[10px] text-theme-muted">{user.name.substring(0,2)}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-theme-neon transition-colors">{user.name}</span>
                </div>
                <div className={`flex items-center gap-2 ${user.color} font-bold text-sm`} style={{ color: user.color.includes('#') ? user.color.replace('text-[', '').replace(']','') : '' }}>
                  <span className="w-3 h-3 inline-block bg-current rounded-[2px] shadow-[0_0_5px_currentColor]"></span> {user.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Freemium Widget */}
        <div className="glass-panel glass-active flex flex-col p-5 transform transition-transform lg:-translate-y-4 hover:shadow-neon-strong z-20 relative duration-500">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-dark border border-theme-neon px-4 py-1 rounded-full text-[10px] tracking-widest uppercase text-theme-neon shadow-neon font-bold transition-colors">
            Destacado
          </div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 mt-2 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiLock className="text-theme-neon" /> Tienda
            </h3>
            <a href="#" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver tienda →</a>
          </div>
          
          {gameInfo.store.slice(0,1).map(item => (
            <div key={item.id} className="flex flex-col flex-1 mt-2">
              <div className="relative w-full h-36 bg-black/50 rounded-lg overflow-hidden border border-theme-neon/10 mb-4 group cursor-pointer shadow-inner flex items-center justify-center transition-colors">
                {item.image !== "none" ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 0 15px var(--theme-neon-glow))' }} />
                ) : (
                  <span className="text-theme-muted text-xs">Sin Imagen</span>
                )}
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-base text-white">{item.title}</h4>
                <span className={`text-xs ${item.rarityColor} font-semibold mb-2 tracking-wide uppercase`}>{item.rarity}</span>
                <p className="text-xs text-theme-muted leading-relaxed line-clamp-2">{item.description}</p>
              </div>
              <div className="mt-auto pt-4 flex gap-2">
                <button className="flex-1 neon-button border border-theme-neon/40 rounded-lg py-2.5 flex items-center justify-center gap-2 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark transition-colors">
                  <span className="w-3 h-3 bg-current rotate-45 inline-block shadow-sm"></span> <span className="font-bold">{item.price}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* News Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-theme-neon/40 transition-colors duration-500">
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiCalendar className="text-theme-neon" /> Noticias
            </h3>
            <a href="#" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver todas →</a>
          </div>
          
          <div className="flex flex-col gap-4 mt-2">
            {gameInfo.news.map((n, idx) => (
              <div key={n.id} className="flex gap-4 cursor-pointer group bg-black/20 p-2 rounded-lg hover:bg-black/40 transition-colors border border-transparent hover:border-theme-neon/20">
                <div className="w-24 h-16 rounded-md overflow-hidden border border-theme-neon/20 flex-shrink-0 relative bg-theme-dark flex items-center justify-center transition-colors">
                  <div className="absolute inset-0 bg-theme-neon/10 group-hover:bg-transparent transition-colors z-10"></div>
                  {n.image !== "none" ? (
                    <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-[10px] text-theme-muted">Noticia {idx+1}</span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-white group-hover:text-theme-neon transition-colors leading-tight">{n.title}</h4>
                  <p className="text-xs text-theme-muted line-clamp-1 mt-1">{n.desc}</p>
                  <span className="text-[10px] text-theme-muted/60 mt-1 uppercase font-semibold">{n.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
