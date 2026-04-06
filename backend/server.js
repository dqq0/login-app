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

// --- LÓGICA DEL CHAT (WebSockets - TU TRABAJO) ---
io.on('connection', (socket) => {
  console.log('🟢 Nuevo Piloto detectado en la red');

  socket.on('enviar_mensaje', (data) => {
    console.log(`✉️ Transmisión de [${data.usuario}]: ${data.texto}`);
    io.emit('recibir_mensaje', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Piloto fuera de rango (Desconectado)');
  });
});

// --- RUTA DE REGISTRO (Agregada para que pases la pantalla) ---
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
    username: email.split('@')[0] 
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`🚀 BACKEND CORRIENDO: http://localhost:${PORT}`);
  console.log('-------------------------------------------');
});