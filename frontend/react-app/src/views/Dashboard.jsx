import React from 'react';
import { FiChevronLeft, FiChevronRight, FiList, FiLock, FiCalendar } from 'react-icons/fi';

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-16">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-16 min-h-[350px] relative z-10">
        <h1 className="font-display font-extrabold text-[5rem] md:text-[8rem] leading-none text-white drop-shadow-[0_0_20px_rgba(0,243,255,0.4)] tracking-wider">
          DEATH<br/>CLOUD
        </h1>
        <p className="text-death-neon uppercase tracking-[0.5em] font-semibold text-sm mb-12 drop-shadow-[0_0_5px_#00f3ff]">Un mundo. Un destino.</p>
        
        <button className="neon-button border border-[#00f3ff]/50 rounded-sm px-10 py-3 flex items-center gap-10 bg-death-dark/40 backdrop-blur-sm group">
          <FiChevronLeft className="text-death-neon group-hover:text-white transition-colors" />
          <span className="text-xl md:text-2xl font-bold tracking-widest">JUGAR AHORA</span>
          <FiChevronRight className="text-death-neon group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Leaderboard Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-[#00f3ff]/40 transition-colors">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#00f3ff]/20">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiList className="text-death-neon" /> Clasificación Global
            </h3>
            <a href="#" className="text-xs text-death-muted hover:text-death-neon transition-colors">Ver todo →</a>
          </div>
          <div className="flex flex-col gap-2">
            {[ 
              { rank: 1, name: 'ShadowFang', score: '4,532', color: 'text-death-neon' },
              { rank: 2, name: 'LunaMist', score: '4,127', color: 'text-[#c084fc]' },
              { rank: 3, name: 'DarkReaper', score: '3,963', color: 'text-[#f87171]' },
              { rank: 4, name: 'BloodWraith', score: '3,411', color: 'text-[#f472b6]' },
              { rank: 5, name: 'NightStalker', score: '3,210', color: 'text-[#4ade80]' },
            ].map(user => (
              <div key={user.rank} className="flex flex-row items-center justify-between group hover:bg-[#00f3ff]/5 p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#00f3ff]/20">
                <div className="flex items-center gap-4">
                  <span className="text-death-muted text-sm w-4 font-mono">{user.rank < 10 ? `0${user.rank}` : user.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-death-dark border border-[#00f3ff]/30 overflow-hidden shadow-inner">
                    <img src="/assets/hero_bg.png" alt="avatar" className="w-full h-full object-cover blur-[1px] group-hover:blur-0 transition-all" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-death-neon transition-colors">{user.name}</span>
                </div>
                <div className={`flex items-center gap-2 ${user.color} font-bold text-sm`}>
                  <span className="w-3 h-3 inline-block bg-current rounded-[2px] shadow-[0_0_5px_currentColor]"></span> {user.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Freemium Widget */}
        <div className="glass-panel glass-active flex flex-col p-5 transform transition-transform lg:-translate-y-4 hover:shadow-neon-strong z-20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-death-dark border border-death-neon px-4 py-1 rounded-full text-[10px] tracking-widest uppercase text-death-neon shadow-neon font-bold">
            Recomendado
          </div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#00f3ff]/20 mt-2">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiLock className="text-death-neon" /> Tienda Freemium
            </h3>
            <a href="#" className="text-xs text-death-muted hover:text-death-neon transition-colors">Ver tienda →</a>
          </div>
          
          <div className="flex flex-col flex-1 mt-2">
            <div className="relative w-full h-36 bg-black/50 rounded-lg overflow-hidden border border-[#00f3ff]/10 mb-4 group cursor-pointer shadow-inner">
              <img src="/assets/mech_shark.png" alt="Montura" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(0,243,255,0.3)]" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-base text-white">Montura Tiburón Mecánico</h4>
              <span className="text-xs text-[#c084fc] font-semibold mb-2 tracking-wide uppercase">Épico</span>
              <p className="text-xs text-death-muted leading-relaxed line-clamp-2">Surca los cielos de Death Cloud con esta imponente montura cibernética. Incluye efecto de rastro lumínico único.</p>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <button className="flex-1 neon-button border border-[#00f3ff]/40 rounded-lg py-2.5 flex items-center justify-center gap-2 bg-[#00f3ff]/10 hover:bg-death-neon hover:text-death-dark">
                <span className="w-3 h-3 bg-current rotate-45 inline-block shadow-sm"></span> <span className="font-bold">800</span>
              </button>
            </div>
          </div>
        </div>

        {/* News Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-[#00f3ff]/40 transition-colors">
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#00f3ff]/20">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiCalendar className="text-death-neon" /> Noticias Destacadas
            </h3>
            <a href="#" className="text-xs text-death-muted hover:text-death-neon transition-colors">Ver todas →</a>
          </div>
          
          <div className="flex flex-col gap-4 mt-2">
            {/* News Item 1 */}
            <div className="flex gap-4 cursor-pointer group bg-black/20 p-2 rounded-lg hover:bg-black/40 transition-colors border border-transparent hover:border-[#00f3ff]/20">
              <div className="w-24 h-16 rounded-md overflow-hidden border border-[#00f3ff]/20 flex-shrink-0 relative">
                <div className="absolute inset-0 bg-[#00f3ff]/10 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="/assets/hero_bg.png" alt="News" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-bold text-white group-hover:text-death-neon transition-colors leading-tight">Nuevo evento: Sombras Flotantes</h4>
                <p className="text-xs text-death-muted line-clamp-1 mt-1">Enfréntate a nuevos desafíos élite.</p>
                <span className="text-[10px] text-death-muted/60 mt-1 uppercase font-semibold">15 May 2026</span>
              </div>
            </div>
            
            {/* News Item 2 */}
            <div className="flex gap-4 cursor-pointer group bg-black/20 p-2 rounded-lg hover:bg-black/40 transition-colors border border-transparent hover:border-[#00f3ff]/20">
              <div className="w-24 h-16 rounded-md overflow-hidden border border-[#00f3ff]/20 flex-shrink-0 bg-death-dark flex items-center justify-center relative">
                <div className="absolute inset-0 bg-radial-gradient from-[#00f3ff]/20 to-transparent opacity-50 z-0"></div>
                <img src="/assets/premium_axe.png" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,243,255,0.8)] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300 relative z-10" />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-bold text-white group-hover:text-death-neon transition-colors leading-tight">Actualización 1.2.0</h4>
                <p className="text-xs text-death-muted line-clamp-1 mt-1">Nuevas armas legendarias y balance.</p>
                <span className="text-[10px] text-death-muted/60 mt-1 uppercase font-semibold">10 May 2026</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
