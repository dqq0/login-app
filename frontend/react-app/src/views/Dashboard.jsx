import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiList, FiLock, FiCalendar, FiDownload, FiX, FiCheckCircle, FiAlertTriangle, FiShoppingBag } from 'react-icons/fi';
import { useGame } from '../context/GameContext';

export default function Dashboard({ user, credits, purchasedSkins, buySkin, onLoginTrigger }) {
  const { gameInfo } = useGame();
  
  // Download Simulation states
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Shop Confirmation modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  const titleLines = gameInfo.displayName.split(' ');

  // Download launcher simulation
  const handleDownloadLauncher = () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloading(false);
            // Trigger actual download of public/launcher_mock.txt
            const link = document.createElement('a');
            link.href = '/launcher_mock.txt';
            link.setAttribute('download', 'launcher_mock.txt');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Buy Item Action
  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchaseError(null);

    const currentCredits = credits !== undefined ? credits : 2500;
    if (currentCredits < selectedItem.price) {
      setPurchaseError(`E-Points insuficientes. Se requieren ${selectedItem.price} EP.`);
      return;
    }

    if (buySkin) {
      const result = await buySkin(selectedItem.id, selectedItem.price);
      if (result.success) {
        setPurchaseSuccess(true);
      } else {
        setPurchaseError(result.message || 'Error al procesar la compra.');
      }
    } else {
      setPurchaseSuccess(true);
    }
  };

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/game/${gameInfo.id}/leaderboard`);
        const data = await res.json();
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard.slice(0, 5));
        } else {
          setLeaderboard(getFallbackLeaderboard(gameInfo.id));
        }
      } catch (err) {
        console.error("Error fetching dashboard leaderboard:", err);
        setLeaderboard(getFallbackLeaderboard(gameInfo.id));
      }
    };

    fetchLeaderboard();
  }, [gameInfo.id]);

  const getFallbackLeaderboard = (gameId) => {
    return gameInfo.leaderboard.map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      score: p.score,
      avatar_url: 'none',
      color: idx === 0 ? 'text-theme-neon' : idx === 1 ? 'text-[#c084fc]' : idx === 2 ? 'text-[#f87171]' : 'text-theme-muted'
    }));
  };

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-16 fade-in transition-all duration-500">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-16 min-h-[350px] relative z-10 transition-all duration-500">
        <h1 className="font-display font-black text-[3.8rem] md:text-[6.5rem] leading-none text-white tracking-wider uppercase flex flex-col items-center" style={{ textShadow: '0 0 20px var(--theme-neon-glow)' }}>
          <span>DEATH CLOUD</span>
          <span className="text-theme-neon text-[2.2rem] md:text-[4.2rem] tracking-[0.3em] font-medium mt-3" style={{ textShadow: '0 0 10px var(--theme-neon-glow)' }}>
            {gameInfo.id === 'deathcloud-runner' ? 'RUNNER' : gameInfo.id === 'deathcloud-toxic-skies' ? 'TOXIC SKIES' : '2D'}
          </span>
        </h1>
        <p className="text-theme-muted uppercase tracking-[0.4em] font-bold text-[10px] md:text-xs mb-12 mt-6">
          {gameInfo.tagline}
        </p>
        
        <button 
          onClick={handleDownloadLauncher}
          className="neon-button border border-theme-neon/50 rounded-sm px-10 py-3 flex items-center gap-10 bg-theme-dark/40 backdrop-blur-sm group relative overflow-hidden"
        >
          {downloading ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-theme-neon border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl md:text-2xl font-bold tracking-widest font-mono text-theme-neon">DESCARGANDO {downloadProgress}%</span>
            </div>
          ) : (
            <>
              <FiChevronLeft className="text-theme-neon group-hover:text-white transition-colors" />
              <span className="text-xl md:text-2xl font-bold tracking-widest">JUGAR AHORA</span>
              <FiChevronRight className="text-theme-neon group-hover:text-white transition-colors" />
            </>
          )}
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
            <Link to="/ranking" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver todo →</Link>
          </div>
          <div className="flex flex-col gap-2">
            {leaderboard.map(user => (
              <div key={user.rank} className="flex flex-row items-center justify-between group hover:bg-theme-neon/10 p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-theme-neon/20">
                <div className="flex items-center gap-4">
                  <span className="text-theme-muted text-sm w-4 font-mono">{user.rank < 10 ? `0${user.rank}` : user.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-theme-dark border border-theme-neon/30 overflow-hidden shadow-inner flex items-center justify-center">
                    {user.avatar_url && user.avatar_url !== "none" ? (
                       <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover blur-[1px] group-hover:blur-0 transition-all" />
                    ) : (
                       <span className="text-[10px] text-theme-muted">{user.name.substring(0,2)}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-theme-neon transition-colors">{user.name}</span>
                </div>
                <div className={`flex items-center gap-2 ${user.color || 'text-theme-muted'} font-bold text-sm`} style={{ color: user.color && user.color.includes('#') ? user.color.replace('text-[', '').replace(']','') : '' }}>
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
            <Link to="/tienda" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver tienda →</Link>
          </div>
          
          {gameInfo.store.slice(0,1).map(item => {
            const isOwned = purchasedSkins && purchasedSkins.includes(item.id);
            return (
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
                  <button 
                    onClick={() => {
                      if (!user) {
                        if (onLoginTrigger) onLoginTrigger();
                        return;
                      }
                      if (isOwned) return;
                      setSelectedItem(item);
                      setPurchaseSuccess(false);
                      setPurchaseError(null);
                    }}
                    disabled={isOwned}
                    className={`flex-1 neon-button border rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all ${
                      isOwned 
                        ? 'bg-theme-success/10 border-theme-success/30 text-theme-success cursor-default shadow-none' 
                        : 'border-theme-neon/40 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark'
                    }`}
                  >
                    <span className="w-3 h-3 bg-current rotate-45 inline-block shadow-sm"></span> 
                    <span className="font-bold">{isOwned ? 'Adquirido' : `${item.price} EP`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* News Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-theme-neon/40 transition-colors duration-500">
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiCalendar className="text-theme-neon" /> Noticias
            </h3>
            <Link to="/comunidad" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver todas →</Link>
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

      {/* Store Purchase Modal Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative text-center">
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>

            {purchaseSuccess ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <FiCheckCircle className="text-theme-success animate-bounce" size={56} />
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider">¡COMPRA EXITOSA!</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Has adquirido correctamente la <strong>{selectedItem.title}</strong>.<br/>
                  Se han descontado {selectedItem.price} EP de tu cuenta.
                </p>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="mt-4 neon-button border border-theme-neon rounded-lg px-8 py-2 bg-theme-neon text-theme-dark font-bold hover:shadow-neon transition-all"
                >
                  ACEPTAR
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2">
                <FiShoppingBag className="text-theme-neon" size={48} />
                <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">CONFIRMAR ADQUISICIÓN</h3>
                
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl w-full text-left my-2">
                  <div className="flex justify-between font-bold text-sm text-white">
                    <span>{selectedItem.title}</span>
                    <span className="text-theme-neon">{selectedItem.price} EP</span>
                  </div>
                  <p className="text-[11px] text-theme-muted mt-2 leading-relaxed">{selectedItem.description}</p>
                </div>

                {purchaseError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2 w-full text-left font-semibold">
                    <FiAlertTriangle size={16} className="flex-shrink-0" />
                    <span>{purchaseError}</span>
                  </div>
                )}

                <div className="text-xs text-theme-muted my-1">
                  Saldo actual: <span className="font-bold text-white">{credits !== undefined ? credits.toLocaleString() : '2,500'} EP</span>
                </div>

                <div className="flex gap-4 w-full mt-2">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 border border-white/10 hover:border-white/35 rounded-lg py-2.5 text-xs font-bold text-theme-muted transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={handlePurchase}
                    className="flex-1 neon-button border border-theme-neon bg-theme-neon/15 text-theme-neon hover:bg-theme-neon hover:text-theme-dark rounded-lg py-2.5 text-xs font-bold transition-all shadow-neon-sm"
                  >
                    ADQUIRIR
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
