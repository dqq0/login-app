import React, { useState } from 'react';
import { FiShoppingBag, FiCheckCircle, FiAlertTriangle, FiX, FiTag } from 'react-icons/fi';

const STORE_ITEMS = [
  { id: "skin-01", title: "Aspecto: Sombra Abisal", category: "aspectos", rarity: "Legendario", rarityColor: "text-[#c084fc]", description: "Viste a tu piloto con el manto de la tormenta de sombras. Incluye voz personalizada y efectos de partículas oscuras.", image: "/assets/hero_bg.png", price: 1500 },
  { id: "mount-01", title: "Montura: Tiburón Mecánico", category: "aspectos", rarity: "Épico", rarityColor: "text-theme-neon", description: "Surca los cielos cibernéticos de Death Cloud con un rastro de neón inigualable.", image: "/assets/mech_shark.png", price: 800 },
  { id: "weapon-01", title: "Hacha de Combate Premium", category: "armas", rarity: "Raro", rarityColor: "text-[#f87171]", description: "Un hacha forjada con el metal del núcleo. Otorga bonificaciones visuales críticas.", image: "/assets/premium_axe.png", price: 600 },
  { id: "icon-01", title: "Icono: Tiburón Mecánico", category: "iconos", rarity: "Común", rarityColor: "text-theme-muted", description: "Icono holográfico exclusivo del Tiburón Mecánico para tu perfil visible.", image: "/assets/mech_shark.png", price: 150 },
  { id: "icon-02", title: "Icono: Hacha Premium", category: "iconos", rarity: "Común", rarityColor: "text-theme-muted", description: "Icono holográfico exclusivo del Hacha Premium para tu perfil visible.", image: "/assets/premium_axe.png", price: 150 },
];

export default function Tienda({ user, credits, purchasedSkins, buySkin, onLoginTrigger }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  const filteredItems = activeCategory === 'todos' 
    ? STORE_ITEMS
    : STORE_ITEMS.filter(item => item.category === activeCategory);

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchaseError(null);

    const balance = credits !== undefined ? credits : 2500;
    if (balance < selectedItem.price) {
      setPurchaseError(`E-Points insuficientes. Se requieren ${selectedItem.price} EP y tu saldo es ${balance} EP.`);
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

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in max-w-6xl mx-auto w-full transition-all duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-theme-neon/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-wide uppercase flex items-center gap-3" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
            <FiShoppingBag className="text-theme-neon" /> Tienda del Sector
          </h1>
          <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
            Adquiere artículos virtuales exclusivos con tus E-Points
          </p>
        </div>

        {/* Balance Display Widget */}
        <div className="bg-theme-neon/5 border border-theme-neon/30 px-5 py-3 rounded-2xl flex flex-col text-right shadow-neon-sm min-w-[150px]">
          <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted">Tu Saldo Activo</span>
          <span className="text-xl font-black text-theme-neon font-mono mt-0.5">{(credits !== undefined ? credits : 2500).toLocaleString()} EP</span>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5 w-fit">
        {['todos', 'aspectos', 'armas', 'iconos'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-theme-neon text-theme-dark shadow-neon'
                : 'text-theme-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isOwned = purchasedSkins && purchasedSkins.includes(item.id);
          return (
            <div key={item.id} className="glass-panel p-5 flex flex-col hover:shadow-neon duration-500 hover:border-theme-neon/20 transition-all">
              {/* Image Box */}
              <div className="relative w-full h-44 bg-black/30 border border-white/5 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-4">
                <img src={item.image} alt={item.title} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" style={{ filter: 'drop-shadow(0 0 10px var(--theme-neon-glow))' }} />
              </div>

              <div className="flex flex-col flex-1">
                <span className={`text-[10px] ${item.rarityColor} font-black uppercase tracking-widest mb-1`}>{item.rarity}</span>
                <h3 className="font-bold text-base text-white hover:text-theme-neon transition-colors cursor-pointer">{item.title}</h3>
                <p className="text-xs text-theme-muted mt-2 leading-relaxed flex-1">{item.description}</p>
                
                <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1">
                    <FiTag className="text-theme-neon" /> {item.price} EP
                  </span>
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
                    className={`neon-button border rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      isOwned 
                        ? 'bg-theme-success/10 border-theme-success/30 text-theme-success cursor-default shadow-none' 
                        : 'border-theme-neon/40 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark'
                    }`}
                  >
                    {isOwned ? 'Adquirido' : 'Adquirir'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Dialog Modal */}
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
                  Saldo actual: <span className="font-bold text-white">{(credits !== undefined ? credits : 2500).toLocaleString()} EP</span>
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
