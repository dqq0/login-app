import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const Chat = ({ onLogout }) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Nos conectamos al Backend con WebSocket (Socket.io)
    // Cuando lo pasen a prod o lo pruebe Android en red local, esto puede cambiar a conectarse a la IP.
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // 2. Escuchar evento desde el Backend cuando se retransmite un mensaje (de PC o Android)
    newSocket.on('recibir_mensaje', (data) => {
      // Tomamos el array de mensajes antiguos y le agregamos el nuevo
      setMensajes((prevMensajes) => [...prevMensajes, data]);
    });

    // 3. Cuando se cierra el componente (ej. cerrar sesión), nos desconectamos
    return () => newSocket.disconnect();
  }, []);

  const enviarMensaje = (e) => {
    e.preventDefault();
    // Validar que no manden vacío
    if (mensaje.trim() !== '' && socket) {
      // 4. Emitir el mensaje al Backend
      const usuario = localStorage.getItem('username') || 'Piloto Web';
      socket.emit('enviar_mensaje', { usuario: usuario, texto: mensaje });
      setMensaje(''); // Limpiar el input después de enviar
    }
  };

  return (
    <div className="main-wrapper">
      <h1 className="main-title">DEATHCLOUD NET</h1>

      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>COMMS GLOBALES</h2>
          <button onClick={onLogout} style={{ background: 'transparent', color: '#ff4e4e', border: '1px solid #ff4e4e', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron', textTransform: 'uppercase' }}>Desconectar</button>
        </div>
        
        <div className="chat-messages">
          {mensajes.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>[{msg.usuario || 'Desconocido'}]:</strong> {msg.texto || msg}
            </div>
          ))}
          {mensajes.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: '100px' }}>Red vacía. Transmisión a la espera...</p>}
        </div>

        <form onSubmit={enviarMensaje} className="chat-input-wrapper">
          <input 
            type="text" 
            value={mensaje} 
            onChange={(e) => setMensaje(e.target.value)} 
            placeholder="Introduce tu mensaje..."
          />
          <button type="submit" className="btn-main">TRANSMITIR</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
