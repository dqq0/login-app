export const games = [
  {
    id: "deathcloud-runner",
    displayName: "DeathCloud Runner",
    tagline: "Un mundo. Un destino.",
    subTagline: "DeathCloud Runner",
    symbol: "DC",
    theme: {
      "theme-dark": "4 8 18",       // #040812
      "theme-gradient-start": "13 27 42", // #0d1b2a
      "theme-panel": "rgba(10, 15, 30, 0.65)",
      "theme-neon": "0 243 255",    // #00f3ff
      "theme-neon-glow": "rgba(0, 243, 255, 0.5)",
      "theme-text": "224 242 254",  // #e0f2fe
      "theme-muted": "125 211 252", // #7dd3fc
      "theme-success": "34 197 94"  // #22c55e
    },
    assets: {
      heroBackground: "/assets/hero_bg.png",
      storePrimaryItem: "/assets/mech_shark.png",
      newsItem1: "/assets/premium_axe.png"
    },
    store: [
      {
        id: "mount-01",
        title: "Montura Tiburón Mecánico",
        rarity: "Épico",
        rarityColor: "text-theme-neon",
        description: "Surca los cielos de Death Cloud con esta imponente montura cibernética. Incluye efecto de rastro lumínico único.",
        image: "/assets/mech_shark.png",
        price: 800
      }
    ],
    news: [
      {
        id: "news-1",
        title: "Torneo de Temporada: Death Cloud Cup",
        desc: "Inscríbete con tu equipo y compite por un pozo acumulado de 50,000 E-Points.",
        date: "Hace 2 horas",
        image: "/assets/hero_bg.png"
      },
      {
        id: "news-2",
        title: "Actualización 1.2.0",
        desc: "Nuevas armas legendarias y balance.",
        date: "Hace 1 día",
        image: "/assets/premium_axe.png"
      }
    ],
    leaderboard: [
      { rank: 1, name: "ShadowFang", score: "4,532", color: "text-theme-neon" },
      { rank: 2, name: "LunaMist", score: "4,127", color: "text-[#c084fc]" },
      { rank: 3, name: "DarkReaper", score: "3,963", color: "text-[#f87171]" },
      { rank: 4, name: "BloodWraith", score: "3,411", color: "text-[#f472b6]" },
      { rank: 5, name: "NightStalker", score: "3,210", color: "text-[#4ade80]" }
    ]
  },
  {
    id: "deathcloud-toxic-skies",
    displayName: "DeathCloud Skies",
    tagline: "Sobrevive la lluvia ácida.",
    subTagline: "DeathCloud Toxic Skies",
    symbol: "TS",
    theme: {
      "theme-dark": "4 18 8",       // Dark forest/toxic green-black
      "theme-gradient-start": "13 42 20", // Deep forest green
      "theme-panel": "rgba(10, 30, 15, 0.65)",
      "theme-neon": "34 197 94",    // Green neon
      "theme-neon-glow": "rgba(34, 197, 94, 0.5)",
      "theme-text": "220 252 231",  // Light green-white
      "theme-muted": "74 222 128",  // Muted green
      "theme-success": "34 197 94"
    },
    assets: {
      heroBackground: "none",
      storePrimaryItem: "not-found",
      newsItem1: "not-found"
    },
    store: [
      {
        id: "toxic-skin-01",
        title: "Traje de Filtro Tóxico Élite",
        rarity: "Legendario",
        rarityColor: "text-theme-neon",
        description: "Traje con blindaje anticorrosión y máscara purificadora de neón verde.",
        image: "none",
        price: 1200
      }
    ],
    news: [
      {
        id: "toxic-news-1",
        title: "Temporada Tóxica Desplegada",
        desc: "El gas ha cubierto las zonas bajas. La altura otorga inmunidad temporal.",
        date: "Hace 1 día",
        image: "none"
      }
    ],
    leaderboard: [
      { rank: 1, name: "BioHazard", score: "5,110", color: "text-theme-neon" },
      { rank: 2, name: "ToxicoV", score: "4,820", color: "text-theme-muted" }
    ]
  },
  {
    id: "deathcloud-2d",
    displayName: "DeathCloud 2D",
    tagline: "Aventura retro en plataforma.",
    subTagline: "DeathCloud 2D",
    symbol: "2D",
    theme: {
      "theme-dark": "18 8 4",       // Dark orange/amber-black
      "theme-gradient-start": "42 20 13", // Deep rust
      "theme-panel": "rgba(30, 15, 10, 0.65)",
      "theme-neon": "249 115 22",   // Orange neon
      "theme-neon-glow": "rgba(249, 115, 22, 0.5)",
      "theme-text": "255 237 213",  // Light orange-white
      "theme-muted": "251 146 60",  // Muted orange
      "theme-success": "34 197 94"
    },
    assets: {
      heroBackground: "none",
      storePrimaryItem: "not-found",
      newsItem1: "not-found"
    },
    store: [
      {
        id: "retro-skin-01",
        title: "Aspecto Retro Pixel 8-Bit",
        rarity: "Raro",
        rarityColor: "text-theme-neon",
        description: "Transforma tu modelo 3D en un sprite pixelado clásico de los 80.",
        image: "none",
        price: 450
      }
    ],
    news: [
      {
        id: "retro-news-1",
        title: "Modo Arcade de Fin de Semana",
        desc: "Vuelve a jugar con vidas limitadas y multiplicadores de puntuación.",
        date: "Hace 3 días",
        image: "none"
      }
    ],
    leaderboard: [
      { rank: 1, name: "PixelMaster", score: "8,990", color: "text-theme-neon" },
      { rank: 2, name: "RetroJoe", score: "7,540", color: "text-theme-muted" }
    ]
  }
];
