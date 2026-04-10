const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Middlewares: Permiten recibir datos y conectar desde el puerto 5500 (Live Server)
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Configuración de WebSockets
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
  res.send(`
    <body style="background: #09090b; color: #00d2ff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <h1>🚀 SERVIDOR DEATHCLOUD ACTIVO</h1>
      <p style="color: #fff; opacity: 0.8;">El backend está escuchando en el puerto 3000</p>
      <div style="border: 1px solid #00d2ff; padding: 10px; border-radius: 5px;">Socket.io: ONLINE</div>
    </body>
  `);
});

// --- LÓGICA DEL CHAT Y BASE DE DATOS ---
const pool = require('./config/db');

// Iniciamos la tabla por si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    hora VARCHAR(50) NOT NULL
  )
`).then(() => console.log('📦 Tabla de mensajes verificada en la BD'))
  .catch(err => console.error('❌ Error verificando la tabla de mensajes:', err));

io.on('connection', async (socket) => {
  console.log('🟢 Nuevo Piloto detectado en la red');

  // Recuperar historial de la base de datos y mandarlo al cliente
  try {
    const result = await pool.query('SELECT usuario, texto, hora FROM mensajes ORDER BY id ASC LIMIT 100');
    socket.emit('historial_mensajes', result.rows);
  } catch (err) {
    console.error('Error al obtener el historial de mensajes:', err);
  }

  socket.on('enviar_mensaje', async (data) => {
    console.log(`✉️ Transmisión de [${data.usuario}]: ${data.texto}`);
    
    // Guardar el mensaje en la base de datos
    try {
      await pool.query(
        'INSERT INTO mensajes (usuario, texto, hora) VALUES ($1, $2, $3)',
        [data.usuario, data.texto, data.hora || new Date().toLocaleTimeString()]
      );
      // Emitir el mensaje al resto (o a todos)
      io.emit('recibir_mensaje', data);
    } catch (err) {
      console.error('Error al guardar en la base de datos:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Piloto fuera de rango (Desconectado)');
  });
});

// --- RUTA DE REGISTRO ---
app.post('/api/register', (req, res) => {
  const { email } = req.body;
  console.log(`📝 Nuevo registro simulado: ${email}`);
  res.json({ success: true, message: "Usuario registrado correctamente" });
});

// --- RUTA DE LOGIN ---
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  console.log(`🔑 Intento de acceso: ${email}`);
  res.json({ 
    success: true, 
    message: "Acceso concedido",
    username: email.split('@')[0],
    token: "token-simulado-12345" // Quedó el token de Diego
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`🚀 BACKEND CORRIENDO: http://localhost:${PORT}`);
  console.log('-------------------------------------------');
});