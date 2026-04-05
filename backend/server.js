const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);

// 1. Crear el servidor HTTP usando Express
const server = http.createServer(app);

// 2. Inicializar Socket.io adjuntándolo al servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier origen (PC o Android)
    methods: ["GET", "POST"]
  }
});

// 3. Configurar los eventos principales del WebSocket
io.on("connection", (socket) => {
  console.log("🟢 Nuevo dispositivo conectado. ID:", socket.id);

  // Escuchar evento de recibir mensaje desde PC o Android
  socket.on("enviar_mensaje", (data) => {
    console.log("✉️ Mensaje recibido en el servidor:", data);
    
    // Retransmitir el mensaje a TODOS los demás dispositivos conectados (Android/PC)
    io.emit("nuevo_mensaje", data);
  });

  // Evento cuando un usuario cierra la pestaña o la app
  socket.on("disconnect", () => {
    console.log("🔴 Dispositivo desconectado. ID:", socket.id);
  });
});

const PORT = 3000;
// IMPORTANTE: Ahora usamos server.listen en lugar de app.listen
server.listen(PORT, () => console.log(`✅ Servidor y WebSockets corriendo en http://localhost:${PORT}`));