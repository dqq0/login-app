import React, { useState, useEffect } from 'react';
import { FiList, FiSearch, FiAward, FiArrowUp, FiTrendingUp } from 'react-icons/fi';
import { useGame } from '../context/GameContext';

export default function Ranking() {
  const { gameInfo } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/game/${gameInfo.id}/leaderboard`);
        const data = await res.json();
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          const mapped = data.leaderboard.map(p => {
            // Convert string score to integer if it has commas
            const scoreVal = typeof p.score === 'string' ? parseInt(p.score.replace(/,/g, '')) : p.score;
            return {
              rank: p.rank,
              name: p.name,
              id: `${p.name}#DC`,
              wins: Math.floor(scoreVal * 0.08) + 12,
              losses: Math.floor(scoreVal * 0.03) + 5,
              score: scoreVal,
              avatar: p.avatar_url || 'none'
            };
          });
          setLeaderboard(mapped);
        } else {
          setLeaderboard(getFallbackLeaderboard(gameInfo.id));
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLeaderboard(getFallbackLeaderboard(gameInfo.id));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameInfo.id]);

  const getFallbackLeaderboard = (gameId) => {
    return gameInfo.leaderboard.map((p, idx) => {
      const scoreVal = parseInt(p.score.replace(/,/g, ''));
      return {
        rank: idx + 1,
        name: p.name,
        id: `${p.name}#DC`,
        wins: 300 - idx * 25,
        losses: 100 + idx * 12,
        score: scoreVal,
        avatar: 'none'
      };
    });
  };

  const filteredLeaderboard = leaderboard.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in max-w-6xl mx-auto w-full transition-all duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-theme-neon/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-wide uppercase flex items-center gap-3" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
            <FiAward className="text-theme-neon" /> Clasificación Global
          </h1>
          <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
            Los 10 mejores pilotos activos en la red DeathCloud
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-neon" size={16} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar piloto..."
            className="w-full bg-black/40 border border-theme-neon/20 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-theme-neon transition-all"
          />
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="glass-panel overflow-hidden border border-theme-neon/15 shadow-neon-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-theme-neon/10 text-[10px] font-black tracking-widest text-theme-muted uppercase">
                <th className="py-4 px-6 text-center w-20">RANGO</th>
                <th className="py-4 px-6">PILOTO</th>
                <th className="py-4 px-6 text-center">VICTORIAS</th>
                <th className="py-4 px-6 text-center">DERROTAS</th>
                <th className="py-4 px-6">WIN RATE</th>
                <th className="py-4 px-6 text-right">PUNTUACIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-theme-muted italic">
                    No se encontraron pilotos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((player) => {
                  const totalGames = player.wins + player.losses;
                  const winRate = ((player.wins / totalGames) * 100).toFixed(1);
                  
                  // Stylized Rank tags
                  const getRankBadge = (rank) => {
                    if (rank === 1) return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded font-black shadow-[0_0_8px_rgba(245,158,11,0.2)]">#01</span>;
                    if (rank === 2) return <span className="bg-slate-300/20 text-slate-300 border border-slate-300/30 px-2 py-1 rounded font-black">#02</span>;
                    if (rank === 3) return <span className="bg-amber-700/20 text-amber-600 border border-amber-700/30 px-2 py-1 rounded font-black">#03</span>;
                    return <span className="text-theme-muted font-mono">{rank < 10 ? `0${rank}` : rank}</span>;
                  };

                  return (
                    <tr key={player.rank} className="hover:bg-theme-neon/5 transition-colors group cursor-pointer">
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center font-bold">
                        {getRankBadge(player.rank)}
                      </td>
                      
                      {/* Name/Avatar Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-black/40 border border-theme-neon/20 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-theme-neon/50 transition-colors">
                            {player.avatar !== 'none' ? (
                              <img src={player.avatar} alt="avatar" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-xs font-bold text-theme-neon font-display">{player.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-theme-neon transition-colors">{player.name}</span>
                            <span className="text-[10px] text-theme-muted/50 font-mono mt-0.5">{player.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Wins Column */}
                      <td className="py-4 px-6 text-center font-bold text-white">
                        {player.wins}
                      </td>

                      {/* Losses Column */}
                      <td className="py-4 px-6 text-center text-theme-muted">
                        {player.losses}
                      </td>

                      {/* Win rate Bar Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 w-32 md:w-44">
                          <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-theme-neon shadow-neon-sm" 
                              style={{ width: `${winRate}%`, boxShadow: '0 0 5px var(--theme-neon)' }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-theme-neon">{winRate}%</span>
                        </div>
                      </td>

                      {/* Score Column */}
                      <td className="py-4 px-6 text-right font-black text-white text-sm font-mono tracking-wide group-hover:text-theme-neon transition-colors">
                        {player.score.toLocaleString()} <span className="text-[10px] font-normal text-theme-muted">EP</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info Widget */}
      <div className="flex justify-between items-center bg-black/20 border border-white/5 rounded-2xl p-4 mt-6">
        <span className="text-[10px] text-theme-muted flex items-center gap-1.5 uppercase font-bold tracking-wider">
          <FiTrendingUp className="text-theme-neon" /> Actualizado en tiempo real desde la VPN
        </span>
        <span className="text-[10px] text-theme-muted font-mono">
          Total Pilotos: 4,532
        </span>
      </div>

    </div>
  );
}
