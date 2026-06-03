import React, { useState } from 'react';
import { FiMessageSquare, FiTrendingUp, FiLayers, FiSend, FiUser, FiCalendar, FiThumbsUp } from 'react-icons/fi';

const MOCK_NEWS = [
  { id: 1, title: "Torneo de Temporada: Death Cloud Cup", desc: "Inscríbete con tu equipo y compite por un pozo acumulado de 50,000 E-Points.", date: "Hace 2 horas", author: "Riot Staff", likes: 124, image: "/assets/hero_bg.png" },
  { id: 2, title: "Notas del Parche 1.2.0: Ajustes Cibernéticos", desc: "Balanceo de armas, mejoras visuales y optimización del cliente para conexiones VPN lentas.", date: "Hace 1 día", author: "Dev Team", likes: 89, image: "/assets/premium_axe.png" },
];

const INITIAL_POSTS = [
  { 
    id: 1, 
    title: "¿Cuál es la mejor táctica para la Montura Tiburón?", 
    content: "He estado probando giros cerrados a alta velocidad y noto que el rastro de luz ayuda a cegar a los perseguidores. ¿Qué opinan ustedes?", 
    author: "ShadowFang", 
    date: "Hace 3 horas", 
    likes: 24, 
    replies: 2,
    repliesList: [
      { id: 101, author: "LunaMist", content: "¡Completamente de acuerdo! Además, si aceleras justo en las curvas dobles, el destello confunde por completo a la IA.", date: "Hace 2h", likes: 5 },
      { id: 102, author: "CypherCore", content: "Yo prefiero guardarme el impulso para la recta final, pero probaré esa táctica en la clasificatoria.", date: "Hace 1h", likes: 2 }
    ]
  },
  { 
    id: 2, 
    title: "Problemas al conectar con FortiClient", 
    content: "Para los que tengan cortes de sesión continuos en el puerto 5432, recuerden ajustar la MTU a 1350 en la interfaz virtual.", 
    author: "CypherCore", 
    date: "Hace 5 horas", 
    likes: 45, 
    replies: 1,
    repliesList: [
      { id: 201, author: "DarkReaper", content: "¡Hermano, me salvaste la vida! Llevaba toda la tarde intentando conectar desde mi red local.", date: "Hace 3h", likes: 11 }
    ]
  },
  { 
    id: 3, 
    title: "Armas legendarias filtradas", 
    content: "Se filtraron diseños en el servidor de pruebas y el hacha premium tiene stats de daño crítico altísimos. ¡Ahorren sus EP!", 
    author: "LunaMist", 
    date: "Hace 1 día", 
    likes: 32, 
    replies: 1,
    repliesList: [
      { id: 301, author: "BloodWraith", content: "Espero que no la balanceen antes del lanzamiento oficial, vale cada E-Point.", date: "Hace 12h", likes: 4 }
    ]
  },
];

export default function Comunidad({ user, onLoginTrigger }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('comunidad_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('comunidad_posts', JSON.stringify(newPosts));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      author: localStorage.getItem('nickname') || localStorage.getItem('username') || "Jugador_Anonimo",
      date: "Hace un momento",
      likes: 0,
      replies: 0,
      repliesList: []
    };

    savePosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
  };

  const handleLikePost = (id) => {
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    const updated = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    savePosts(updated);
  };

  const handleAddReply = (e, postId) => {
    e.preventDefault();
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      author: localStorage.getItem('nickname') || localStorage.getItem('username') || "Jugador_Anonimo",
      content: replyText,
      date: "Hace un momento",
      likes: 0
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: p.replies + 1,
          repliesList: [...(p.repliesList || []), newReply]
        };
      }
      return p;
    });

    savePosts(updated);
    setReplyText('');
  };

  const handleLikeReply = (postId, replyId) => {
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          repliesList: p.repliesList.map(r => r.id === replyId ? { ...r, likes: r.likes + 1 } : r)
        };
      }
      return p;
    });
    savePosts(updated);
  };

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in max-w-6xl mx-auto w-full transition-all duration-500">
      
      {/* Header Info */}
      <div className="border-b border-theme-neon/20 pb-6 mb-8">
        <h1 className="font-display font-black text-4xl text-white tracking-wide uppercase flex items-center gap-3" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
          <FiLayers className="text-theme-neon" /> Hub de Comunidad
        </h1>
        <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
          Entérate de las últimas transmisiones y debates de la red DeathCloud
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda / Central: Foro de Discusión */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <FiMessageSquare className="text-theme-neon" /> Crear Publicación
            </h3>
            
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <input 
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título del debate..."
                required
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all font-semibold"
              />
              <textarea 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escribe el contenido del mensaje..."
                rows={3}
                required
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all leading-relaxed"
              />
              <button 
                type="submit"
                className="self-end neon-button border border-theme-neon/40 rounded-lg px-6 py-2 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all flex items-center gap-2"
              >
                <FiSend size={12} /> PUBLICAR EN RED
              </button>
            </form>
          </div>

          {/* Listado de Posts */}
          <div className="flex flex-col gap-4">
            {posts.map(post => {
              const isExpanded = expandedPostId === post.id;
              return (
                <div key={post.id} className="glass-panel p-5 hover:border-theme-neon/30 transition-all duration-300 flex flex-col gap-3">
                  <div 
                    className="flex justify-between items-start cursor-pointer group"
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                  >
                    <h4 className="font-bold text-base text-white group-hover:text-theme-neon transition-colors">{post.title}</h4>
                    <span className="text-[10px] text-theme-muted font-mono">{post.date}</span>
                  </div>
                  
                  <p className="text-xs text-theme-muted leading-relaxed whitespace-pre-line">{post.content}</p>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-[10px] text-theme-muted">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-theme-neon" />
                      <span className="font-bold text-white">{post.author}</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post.id);
                        }}
                        className="flex items-center gap-1 hover:text-theme-neon transition-colors"
                        title="Me gusta"
                      >
                        <FiThumbsUp /> <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className={`flex items-center gap-1 hover:text-theme-neon transition-colors ${isExpanded ? 'text-theme-neon' : ''}`}
                      >
                        <FiMessageSquare /> <span>{post.replies} respuestas</span>
                      </button>
                    </div>
                  </div>

                  {/* Accordion Expanded Section */}
                  {isExpanded && (
                    <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                      <h5 className="text-xs font-bold text-white tracking-widest uppercase mb-1">Respuestas ({post.replies})</h5>
                      
                      {/* Comments list */}
                      <div className="flex flex-col gap-3 pl-4 border-l border-theme-neon/20">
                        {(!post.repliesList || post.repliesList.length === 0) ? (
                          <div className="text-xs text-theme-muted italic">No hay respuestas en este debate. ¡Sé el primero!</div>
                        ) : (
                          post.repliesList.map(reply => (
                            <div key={reply.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 hover:border-theme-neon/10 transition-colors">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-theme-neon">{reply.author}</span>
                                <span className="text-theme-muted/50 font-mono">{reply.date}</span>
                              </div>
                              <p className="text-xs text-theme-text/90 leading-relaxed">{reply.content}</p>
                              <div className="flex justify-end mt-0.5">
                                <button 
                                  onClick={() => handleLikeReply(post.id, reply.id)}
                                  className="flex items-center gap-1 text-[9px] text-theme-muted hover:text-theme-neon transition-colors"
                                >
                                  <FiThumbsUp size={10} /> <span>{reply.likes || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply form */}
                      <form onSubmit={(e) => handleAddReply(e, post.id)} className="flex items-center gap-2 mt-2">
                        <input 
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe una respuesta y presiona Enter..."
                          required
                          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all"
                        />
                        <button 
                          type="submit"
                          className="neon-button border border-theme-neon/40 rounded-xl px-4 py-2.5 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all flex items-center justify-center"
                        >
                          RESPONDER
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Noticias del juego */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-5">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <FiTrendingUp className="text-theme-neon" /> Noticias Oficiales
            </h3>

            <div className="flex flex-col gap-5">
              {MOCK_NEWS.map(news => (
                <div key={news.id} className="flex flex-col gap-2 group cursor-pointer">
                  {/* News image preview */}
                  <div className="h-32 w-full rounded-xl overflow-hidden border border-white/5 relative bg-black/40">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                  </div>
                  
                  <span className="text-[9px] font-mono text-theme-neon uppercase tracking-wider flex items-center gap-1.5 mt-1">
                    <FiCalendar size={10} /> {news.date} • {news.author}
                  </span>
                  
                  <h4 className="font-bold text-sm text-white group-hover:text-theme-neon transition-colors leading-snug">{news.title}</h4>
                  <p className="text-[11px] text-theme-muted leading-relaxed line-clamp-2">{news.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
