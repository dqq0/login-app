const { Pool } = require('pg');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432
};

const mainDbName = process.env.DB_NAME || 'death_cloud_dev';

// Conexión principal para tablas compartidas (usuarios, mensajes, amigos, tickets)
const pool = new Pool({
  ...config,
  database: mainDbName
});

// Caché de pools específicos por juego
const gamePools = {};
const useFallbackSchema = {};

async function getGamePool(gameId) {
  // Normalizar el ID del juego para sufijo de DB / Esquema
  let dbSuffix = '';
  if (gameId === 'deathcloud-runner') dbSuffix = 'runner';
  else if (gameId === 'deathcloud-toxic-skies') dbSuffix = 'skies';
  else if (gameId === 'deathcloud-2d') dbSuffix = '2d';
  else dbSuffix = gameId.replace(/[^a-zA-Z0-9]/g, '_');

  const gameDbName = `${mainDbName}_${dbSuffix}`;

  if (gamePools[gameId]) {
    return { 
      pool: gamePools[gameId], 
      schema: useFallbackSchema[gameId] ? dbSuffix : 'public', 
      isFallback: useFallbackSchema[gameId],
      dbName: useFallbackSchema[gameId] ? mainDbName : gameDbName
    };
  }

  // Intentar crear un pool independiente
  const tempPool = new Pool({
    ...config,
    database: gameDbName
  });

  try {
    const client = await tempPool.connect();
    client.release();
    console.log(`🔌 Conexión exitosa a la base de datos independiente del juego: ${gameDbName}`);
    gamePools[gameId] = tempPool;
    useFallbackSchema[gameId] = false;
    return { pool: tempPool, schema: 'public', isFallback: false, dbName: gameDbName };
  } catch (err) {
    console.log(`⚠️ No se pudo conectar a la base de datos "${gameDbName}". Usando esquema de respaldo "${dbSuffix}" en la base de datos principal.`);
    await tempPool.end().catch(() => {});
    
    // Fallback: usar el pool principal con un esquema separado
    gamePools[gameId] = pool;
    useFallbackSchema[gameId] = true;
    return { pool: pool, schema: dbSuffix, isFallback: true, dbName: mainDbName };
  }
}

pool.getGamePool = getGamePool;
pool.pool = pool;

// --- RESILIENT IN-MEMORY MOCK DATABASE FALLBACK ---
const bcrypt = require('bcryptjs');
const sebaHash = bcrypt.hashSync('seba123', 10);
const diegoHash = bcrypt.hashSync('admin123', 10);

const memoryDb = {
  mensajes: [
    { usuario: 'System', texto: 'Enlace de datos establecido. Servidor funcionando en modo de simulación local.', hora: '12:00:00' }
  ],
  usuarios: [
    { 
      id: 1, 
      nombre_usuario: 'Sebastian', 
      nickname: 'Sebastian', 
      email: 'seba@test.com', 
      rol: 'admin', 
      clave_encriptada: sebaHash, 
      avatar_url: 'none', 
      bio: 'Piloto de Red', 
      fecha_creacion: new Date() 
    },
    { 
      id: 2, 
      nombre_usuario: 'diego', 
      nickname: 'Diego', 
      email: 'diego@deathcloud.com', 
      rol: 'admin', 
      clave_encriptada: diegoHash, 
      avatar_url: 'none', 
      bio: 'Piloto de Pruebas', 
      fecha_creacion: new Date() 
    }
  ],
  credits: {
    1: 2500,
    2: 2500
  },
  skins: {
    1: [],
    2: []
  },
  stats: {
    'deathcloud-runner': {
      101: { usuario_id: 101, score: '4532', name: 'ShadowFang' },
      102: { usuario_id: 102, score: '4127', name: 'LunaMist' },
      103: { usuario_id: 103, score: '3963', name: 'DarkReaper' },
      104: { usuario_id: 104, score: '3411', name: 'BloodWraith' },
      105: { usuario_id: 105, score: '3210', name: 'NightStalker' }
    },
    'deathcloud-toxic-skies': {
      201: { usuario_id: 201, score: '5110', name: 'BioHazard' },
      202: { usuario_id: 202, score: '4820', name: 'ToxicoV' },
      203: { usuario_id: 203, score: '3810', name: 'ShadowFang' }
    },
    'deathcloud-2d': {
      301: { usuario_id: 301, score: '8990', name: 'PixelMaster' },
      302: { usuario_id: 302, score: '7540', name: 'RetroJoe' },
      303: { usuario_id: 303, score: '6200', name: 'LunaMist' }
    }
  }
};

let isLocalMockMode = false;

function simulateQuery(text, params) {
  const query = text.trim().toLowerCase();
  
  // 1. Mensajes global chat
  if (query.startsWith('select') && query.includes('mensajes')) {
    return { rows: memoryDb.mensajes };
  }
  if (query.startsWith('insert into mensajes')) {
    const usuario = params[0];
    const texto = params[1];
    const hora = params[2] || new Date().toLocaleTimeString();
    memoryDb.mensajes.push({ usuario, texto, hora });
    return { rows: [] };
  }
  
  // 2. Usuarios
  if (query.startsWith('select') && query.includes('usuarios') && query.includes('where id = $1')) {
    const id = parseInt(params[0]);
    let user = memoryDb.usuarios.find(u => u.id === id);
    if (!user) {
      user = { id, nombre_usuario: `Piloto_${id}`, nickname: `Piloto_${id}`, email: `user${id}@deathcloud.com`, rol: 'user', avatar_url: 'none', bio: null, fecha_creacion: new Date() };
      memoryDb.usuarios.push(user);
    }
    return { rows: [user] };
  }
  if (query.startsWith('select') && query.includes('usuarios') && query.includes('email = $1 or nombre_usuario = $2')) {
    const email = params[0];
    const username = params[1];
    const user = memoryDb.usuarios.find(u => u.email === email || u.nombre_usuario === username);
    return { rows: user ? [user] : [] };
  }
  if (query.startsWith('select') && query.includes('usuarios') && query.includes('email = $1')) {
    const email = params[0];
    let user = memoryDb.usuarios.find(u => u.email === email);
    return { rows: user ? [user] : [] };
  }
  if (query.startsWith('select') && query.includes('usuarios') && (query.includes('nombre_usuario = $1') || query.includes('nickname = $1'))) {
    const name = params[0];
    let user = memoryDb.usuarios.find(u => u.nombre_usuario === name || u.nickname === name);
    if (!user) {
      user = { id: Math.floor(Math.random() * 1000) + 5000, nombre_usuario: name, nickname: name, email: `${name.toLowerCase()}@deathcloud.com`, rol: 'user', avatar_url: 'none', bio: 'Clasificación de prueba', fecha_creacion: new Date() };
      memoryDb.usuarios.push(user);
    }
    return { rows: [user] };
  }
  if (query.startsWith('select id, nombre_usuario') && query.includes('usuarios') && query.includes('any($1)')) {
    const ids = params[0] || [];
    const matched = memoryDb.usuarios.filter(u => ids.includes(u.id));
    ids.forEach(id => {
      if (!matched.some(u => u.id === id)) {
        let mockName = `Piloto_${id}`;
        Object.keys(memoryDb.stats).forEach(game => {
          if (memoryDb.stats[game][id]) mockName = memoryDb.stats[game][id].name;
        });
        const newUser = { id, nombre_usuario: mockName, nickname: mockName, email: `${mockName.toLowerCase()}@deathcloud.com`, rol: 'user', avatar_url: 'none', bio: null, fecha_creacion: new Date() };
        memoryDb.usuarios.push(newUser);
        matched.push(newUser);
      }
    });
    return { rows: matched };
  }
  if (query.startsWith('insert into usuarios')) {
    let name, email, passwordHash;
    if (params.length === 3) {
      name = params[0];
      email = params[1];
      passwordHash = params[2];
    } else {
      name = params[0];
      email = params[2];
      passwordHash = params[3];
    }
    const newId = Math.floor(Math.random() * 1000) + 1000;
    const user = { 
      id: newId, 
      nombre_usuario: name, 
      nickname: name, 
      email, 
      clave_encriptada: passwordHash,
      rol: 'user', 
      avatar_url: 'none', 
      bio: null, 
      fecha_creacion: new Date() 
    };
    memoryDb.usuarios.push(user);
    return { rows: [user] };
  }
  
  // 3. E-Points (credits)
  if (query.includes('user_credits') && query.startsWith('select')) {
    const userId = params[0];
    const credits = memoryDb.credits[userId] !== undefined ? memoryDb.credits[userId] : 2500;
    return { rows: [{ credits }] };
  }
  if (query.includes('user_credits') && query.startsWith('insert')) {
    const userId = params[0];
    const amount = params[1];
    if (query.includes('credits +') || query.includes('credits =')) {
      memoryDb.credits[userId] = (memoryDb.credits[userId] || 2500) + amount;
    } else {
      if (memoryDb.credits[userId] === undefined) {
        memoryDb.credits[userId] = amount !== undefined ? amount : 2500;
      }
    }
    return { rows: [{ credits: memoryDb.credits[userId] }] };
  }
  if (query.includes('user_credits') && query.startsWith('update')) {
    const amount = params[0];
    const userId = params[1];
    memoryDb.credits[userId] = (memoryDb.credits[userId] || 2500) - amount;
    return { rows: [{ credits: memoryDb.credits[userId] }] };
  }

  // 4. Skins
  if (query.includes('user_skins') && query.startsWith('select')) {
    const userId = params[0];
    const skins = memoryDb.skins[userId] || [];
    return { rows: skins.map(skin_id => ({ skin_id })) };
  }
  if (query.includes('user_skins') && query.startsWith('insert')) {
    const userId = params[0];
    const skinId = params[1];
    if (!memoryDb.skins[userId]) memoryDb.skins[userId] = [];
    if (!memoryDb.skins[userId].includes(skinId)) {
      memoryDb.skins[userId].push(skinId);
    }
    return { rows: [] };
  }

  // 5. Stats / Leaderboard
  if (query.includes('user_stats') && query.startsWith('select')) {
    let activeGame = 'deathcloud-runner';
    if (query.includes('skies.user_stats') || query.includes('skies_user_stats') || query.includes('skies')) activeGame = 'deathcloud-toxic-skies';
    else if (query.includes('2d.user_stats') || query.includes('2d_user_stats') || query.includes('retro2d') || query.includes('2d')) activeGame = 'deathcloud-2d';
    
    const statsList = Object.values(memoryDb.stats[activeGame] || {});
    statsList.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    return { rows: statsList };
  }
  if (query.includes('user_stats') && query.startsWith('insert')) {
    const userId = params[0];
    const score = params[1];
    let activeGame = 'deathcloud-runner';
    if (query.includes('skies.user_stats') || query.includes('skies_user_stats') || query.includes('skies')) activeGame = 'deathcloud-toxic-skies';
    else if (query.includes('2d.user_stats') || query.includes('2d_user_stats') || query.includes('retro2d') || query.includes('2d')) activeGame = 'deathcloud-2d';

    if (!memoryDb.stats[activeGame][userId]) {
      memoryDb.stats[activeGame][userId] = { usuario_id: userId, score: score.toString(), name: `User_${userId}` };
    } else {
      memoryDb.stats[activeGame][userId].score = score.toString();
    }
    return { rows: [] };
  }

  return { rows: [] };
}

const originalQuery = pool.query;
pool.query = async function(text, params) {
  if (isLocalMockMode) {
    return simulateQuery(text, params);
  }
  try {
    return await originalQuery.call(pool, text, params);
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.message.includes('connect')) {
      console.log('⚠️ [Base de Datos Desconectada] Iniciando Modo Local Simulador en Memoria.');
      isLocalMockMode = true;
      return simulateQuery(text, params);
    }
    throw err;
  }
};

module.exports = pool;
