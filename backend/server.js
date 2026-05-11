const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const pool = require('./config/db');

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
      await pool.query(
        'INSERT INTO mensajes (usuario, texto, hora) VALUES ($1, $2, $3)',
        [data.usuario, data.texto, data.hora || new Date().toLocaleTimeString()]
      );
      io.emit('recibir_mensaje', data);
    } catch (err) {
      console.error('Error al guardar mensaje:', err);
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
    )`
  ];

  try {
    for (let query of queries) {
      await pool.query(query);
    }
    console.log('📦 Base de datos sincronizada');
  } catch (err) {
    console.error('❌ Error inicializando la BD:', err);
  }
}

initDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-------------------------------------------');
  console.log(`🚀 BACKEND CORRIENDO EN PUERTO: ${PORT}`);
  console.log('-------------------------------------------');
});