const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const pool = require('./config/db');
const { getGamePool } = pool;
const gameRoutes = require('./routes/gameRoutes');

// --- MIDDLEWARES ---
// Configuración de CORS más segura
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // En producción debería ser el dominio real
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- ROUTES ---
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api', gameRoutes);

// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
  res.send(`
    <body style="background: #09090b; color: #00d2ff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <h1>🚀 SERVIDOR DEATHCLOUD ACTIVO</h1>
      <p style="color: #fff; opacity: 0.8;">El backend está escuchando en el puerto 3000</p>
      <div style="border: 1px solid #00d2ff; padding: 10px; border-radius: 5px;">Socket.io: ONLINE</div>
      <p style="font-size: 0.8rem; margin-top: 20px; color: #555;">v2.0 - JWT Enabled</p>
    </body>
  `);
});

// --- CENTRALIZED ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error('❌ Error detectado:', err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const server = http.createServer(app);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', async (socket) => {
  console.log('🟢 Nuevo Piloto detectado en la red');

  try {
    const result = await pool.query('SELECT usuario, texto, hora FROM mensajes ORDER BY id ASC LIMIT 100');
    socket.emit('historial_mensajes', result.rows);
  } catch (err) {
    console.error('Error al obtener el historial de mensajes:', err);
  }

  socket.on('enviar_mensaje', async (data) => {
    console.log(`✉️ Transmisión de [${data.usuario}]: ${data.texto}`);
    try {
      // 1. Guardar el nuevo mensaje
      await pool.query(
        'INSERT INTO mensajes (usuario, texto, hora) VALUES ($1, $2, $3)',
        [data.usuario, data.texto, data.hora || new Date().toLocaleTimeString()]
      );
      
      // 2. Limpieza automática: Mantener solo los últimos 1000 mensajes
      await pool.query(
        'DELETE FROM mensajes WHERE id NOT IN (SELECT id FROM mensajes ORDER BY id DESC LIMIT 1000)'
      );
      
      io.emit('recibir_mensaje', data);
    } catch (err) {
      console.error('Error al guardar o limpiar mensajes:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Piloto desconectado');
  });
});

// --- DB INITIALIZATION ---
async function initDB() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      clave_encriptada VARCHAR(255) NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(100) NOT NULL,
      texto TEXT NOT NULL,
      hora VARCHAR(50) NOT NULL
    )`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'user'`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS baneado BOOLEAN DEFAULT false`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS motivo_ban VARCHAR(255)`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT 'none'`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio VARCHAR(255) DEFAULT NULL`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nickname VARCHAR(50)`,
    `UPDATE usuarios SET nickname = nombre_usuario WHERE nickname IS NULL`,
    `CREATE TABLE IF NOT EXISTS amigos (
      id SERIAL PRIMARY KEY,
      usuario_id_envia INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      usuario_id_recibe INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')),
      fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_respuesta TIMESTAMP DEFAULT NULL,
      CONSTRAINT unique_solicitud_amistad UNIQUE (usuario_id_envia, usuario_id_recibe),
      CONSTRAINT check_no_auto_amistad CHECK (usuario_id_envia <> usuario_id_recibe)
    )`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(100) NOT NULL,
      descripcion TEXT NOT NULL,
      categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('cuenta', 'bug', 'tienda', 'otro')),
      estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
      prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (let query of queries) {
      await pool.query(query);
    }
    console.log('📦 Base de datos principal sincronizada');

    // Inicializar bases de datos / esquemas de juegos
    const gameIds = ['deathcloud-runner', 'deathcloud-toxic-skies', 'deathcloud-2d'];
    
    // Datos de jugadores por defecto para poblar las clasificaciones si están vacías
    const defaultStats = {
      'deathcloud-runner': [
        { name: 'ShadowFang', score: '4532' },
        { name: 'LunaMist', score: '4127' },
        { name: 'DarkReaper', score: '3963' },
        { name: 'BloodWraith', score: '3411' },
        { name: 'NightStalker', score: '3210' }
      ],
      'deathcloud-toxic-skies': [
        { name: 'BioHazard', score: '5110' },
        { name: 'ToxicoV', score: '4820' },
        { name: 'ShadowFang', score: '3810' }
      ],
      'deathcloud-2d': [
        { name: 'PixelMaster', score: '8990' },
        { name: 'RetroJoe', score: '7540' },
        { name: 'LunaMist', score: '6200' }
      ]
    };

    for (let gameId of gameIds) {
      const { pool: gamePool, schema, isFallback, dbName } = await getGamePool(gameId);

      if (isFallback) {
        // Crear esquema si no existe en la base de datos principal
        await gamePool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      }

      const t = (table) => schema === 'public' ? table : `${schema}.${table}`;

      // Crear tabla de créditos (E-Points)
      await gamePool.query(`
        CREATE TABLE IF NOT EXISTS ${t('user_credits')} (
          usuario_id INT PRIMARY KEY,
          credits INT DEFAULT 2500
        )
      `);

      // Crear tabla de skins compradas
      await gamePool.query(`
        CREATE TABLE IF NOT EXISTS ${t('user_skins')} (
          id SERIAL PRIMARY KEY,
          usuario_id INT NOT NULL,
          skin_id VARCHAR(100) NOT NULL,
          fecha_adquisicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de estadísticas (puntajes para clasificación)
      await gamePool.query(`
        CREATE TABLE IF NOT EXISTS ${t('user_stats')} (
          usuario_id INT PRIMARY KEY,
          score VARCHAR(50) DEFAULT '0',
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Poblar tabla de estadísticas por defecto si está vacía
      const checkStats = await gamePool.query(`SELECT COUNT(*) FROM ${t('user_stats')}`);
      if (parseInt(checkStats.rows[0].count) === 0) {
        console.log(`🌱 Poblando clasificaciones iniciales de prueba para [${gameId}]...`);
        const stats = defaultStats[gameId];
        for (let entry of stats) {
          // Intentar asociar con un ID de usuario real de la tabla principal
          // Si no existe, usamos IDs incrementales de prueba (ej. 9901, 9902, etc.)
          const userRes = await pool.query(
            'SELECT id FROM usuarios WHERE nombre_usuario = $1 OR nickname = $1 LIMIT 1',
            [entry.name]
          );
          
          let targetUserId = userRes.rows.length > 0 ? userRes.rows[0].id : Math.floor(Math.random() * 1000) + 5000;
          
          // Si usamos IDs ficticios de líderes, registrar su usuario en la base principal para que getLeaderboard los pueda mapear
          if (userRes.rows.length === 0) {
            await pool.query(
              `INSERT INTO usuarios (id, nombre_usuario, nickname, email, clave_encriptada) 
               VALUES ($1, $2, $2, $3, 'hashed_mock_password') 
               ON CONFLICT (id) DO NOTHING`,
              [targetUserId, entry.name, `${entry.name.toLowerCase()}@deathcloud.com`]
            );
          }

          await gamePool.query(
            `INSERT INTO ${t('user_stats')} (usuario_id, score) VALUES ($1, $2) ON CONFLICT (usuario_id) DO NOTHING`,
            [targetUserId, entry.score]
          );
        }
      }

      console.log(`🎮 Base de datos/Esquema inicializado para [${gameId}] en [${dbName}] (esquema: ${schema})`);
    }
  } catch (err) {
    console.error('❌ Error inicializando la BD:', err);
  }
}

initDB();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, '0.0.0.0', () => {
  console.log('-------------------------------------------');
  console.log(`🚀 DEATHCLOUD BACKEND [${ENV.toUpperCase()}]`);
  console.log(`📡 PUERTO: ${PORT}`);
  console.log(`📦 DB: ${process.env.DB_NAME || 'app_db'}`);
  console.log('-------------------------------------------');
});