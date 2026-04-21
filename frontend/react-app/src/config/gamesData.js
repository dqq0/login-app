export const games = [
  {
    id: "death-cloud",
    displayName: "Death Cloud",
    tagline: "Un mundo. Un destino.",
    subTagline: "Shape the Storm",
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
        rarityColor: "text-[#c084fc]",
        description: "Surca los cielos de Death Cloud con esta imponente montura cibernética. Incluye efecto de rastro lumínico único.",
        image: "/assets/mech_shark.png",
        price: 800
      }
    ],
    news: [
      {
        id: "news-1",
        title: "Nuevo evento: Sombras Flotantes",
        desc: "Enfréntate a nuevos desafíos élite.",
        date: "15 May 2026",
        image: "/assets/hero_bg.png"
      },
      {
        id: "news-2",
        title: "Actualización 1.2.0",
        desc: "Nuevas armas legendarias y balance.",
        date: "10 May 2026",
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
    id: "skeleton-base",
    displayName: "Platform Esqueleto",
    tagline: "Motor Genérico",
    subTagline: "Launcher Shell Mode",
    symbol: "BASE",
    theme: {
      "theme-dark": "26 26 26", // #1a1a1a
      "theme-gradient-start": "45 45 45", // #2d2d2d
      "theme-panel": "rgba(40, 40, 40, 0.7)",
      "theme-neon": "251 191 36", // fbbf24
      "theme-neon-glow": "rgba(251, 191, 36, 0.5)",
      "theme-text": "243 244 246", // #f3f4f6
      "theme-muted": "156 163 175", // #9ca3af
      "theme-success": "34 197 94" // #22c55e
    },
    assets: {
      heroBackground: "none",
      storePrimaryItem: "not-found",
      newsItem1: "not-found"
    },
    store: [
      {
        id: "placeholder-1",
        title: "Placeholder Item",
        rarity: "Común",
        rarityColor: "text-theme-muted",
        description: "Contenido no definido desde el backend de juegos.",
        image: "none",
        price: 999
      }
    ],
    news: [
      {
        id: "pnews-1",
        title: "Sistema Desplegado",
        desc: "El framework ha cargado eficientemente.",
        date: "01 Ene 1970",
        image: "none"
      }
    ],
    leaderboard: [
      { rank: 1, name: "PlayerOne", score: "999", color: "text-theme-neon" },
      { rank: 2, name: "PlayerTwo", score: "888", color: "text-theme-muted" }
    ]
  }
];
