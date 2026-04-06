const { useState, useEffect } = React;

// 1. Iniciamos la conexión del WebSocket apuntando al backend
const socket = io('http://localhost:3000'); 

// --- COMPONENTE DEL CHAT (Se muestra después del Login) ---
const ChatScreen = ({ username }) => {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');

    useEffect(() => {
        // Escuchar cuando el servidor nos manda un mensaje nuevo
        socket.on('recibir_mensaje', (data) => {
            setMensajes((prevMensajes) => [...prevMensajes, data]);
        });

        // Limpieza al desmontar
        return () => {
            socket.off('recibir_mensaje');
        };
    }, []);

    const handleEnviar = (e) => {
        e.preventDefault();
        if (nuevoMensaje.trim() !== '') {
            const dataMensaje = {
                usuario: username || 'Piloto Anónimo',
                texto: nuevoMensaje,
                hora: new Date().toLocaleTimeString()
            };

            // Enviamos el mensaje al servidor
            socket.emit('enviar_mensaje', dataMensaje);
            setNuevoMensaje('');
        }
    };

    return (
        <div className="card chat-card" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <h2>COMUNICACIONES GLOBALES (DEATHCLOUD)</h2>
            <p style={{ color: 'var(--primary)', textAlign: 'center' }}>Conectado como: [{username}]</p>
            
            <div className="mensajes-box" style={{ 
                height: '400px', 
                overflowY: 'auto', 
                border: '1px solid rgba(0, 210, 255, 0.3)', 
                padding: '15px',
                marginTop: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}>
                {mensajes.length === 0 && <p style={{opacity: 0.5, textAlign: 'center'}}>No hay mensajes en la frecuencia...</p>}
                
                {mensajes.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <strong style={{ color: msg.usuario === username ? '#00ff88' : '#00d2ff' }}>
                            {msg.usuario}: 
                        </strong> 
                        <span style={{ marginLeft: '8px' }}>{msg.texto}</span> 
                        <small style={{ color: 'gray', float: 'right' }}>{msg.hora}</small>
                    </div>
                ))}
            </div>

            <form onSubmit={handleEnviar} style={{ display: 'flex', marginTop: '15px', gap: '10px' }}>
                <input 
                    type="text" 
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Transmite tu mensaje..."
                    style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--primary)' }}
                />
                <button type="submit" className="btn-main" style={{ width: 'auto', padding: '0 25px' }}>
                    TRANSMITIR
                </button>
            </form>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (Tu App Original modificada) ---
const App = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [status, setStatus] = useState({ msg: '', type: '' });
    const [isRegister, setIsRegister] = useState(false);
    
    // Nuevos estados para controlar la sesión
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedUser, setLoggedUser] = useState('');

    const ranking = [
        { id: 1, name: "SkyMaster_7", score: "1,240,000", ship: "Aether" },
        { id: 2, name: "Storm_Crasher", score: "1,115,400", ship: "Nimbus" },
        { id: 3, name: "Neon_Pilot", score: "980,000", ship: "Aether" },
        { id: 4, name: "Sebastian_E", score: "650,500", ship: "Straton" }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ msg: isRegister ? 'INICIALIZANDO REGISTRO...' : 'AUTENTICANDO...', type: 'loading' });
        
        try {
            const url = isRegister ? 'http://localhost:3000/api/register' : 'http://localhost:3000/api/login';
            const body = isRegister ? { nombre, email, password } : { email, password };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ msg: isRegister ? 'PILOTO REGISTRADO CON ÉXITO' : 'ACCESO CONCEDIDO', type: 'success' });
                
                if (isRegister) {
                    setTimeout(() => {
                        setIsRegister(false);
                        setStatus({ msg: '', type: '' });
                    }, 2000);
                } else {
                    // Magia aquí: Si el login es exitoso, pasamos al chat después de 1 segundo
                    setTimeout(() => {
                        // Usamos el nombre que devuelve la base de datos o el email como plan B
                        setLoggedUser(data.username || email.split('@')[0]); 
                        setIsLoggedIn(true);
                    }, 1000);
                }
            } else {
                setStatus({ msg: data.error || data.message || 'ERROR DESCONOCIDO', type: 'error' });
            }
        } catch (err) {
            setStatus({ msg: 'ERROR DE CONEXIÓN CON EL SERVIDOR CENTRAL', type: 'error' });
        }
    };

    return (
        <div className="main-wrapper">
            <h1 className="main-title">Deathcloud</h1>

            {/* SI ESTÁ CONECTADO: Muestra el Chat. SI NO: Muestra Login + Ranking */}
            {isLoggedIn ? (
                <ChatScreen username={loggedUser} />
            ) : (
                <div className="bento-grid">
                    {/* Lado Izquierdo: Login o Registro */}
                    <div className={`card ${status.type === 'success' ? 'success-glow' : ''}`}>
                        <h2>{isRegister ? 'REGISTRO DE PILOTO' : 'ACCESO PILOTO'}</h2>
                        {status.msg && <p style={{color: status.type==='error'?'#ff4444':'#00ff88', textAlign:'center', fontWeight:'bold'}}>{status.msg}</p>}
                        <form onSubmit={handleSubmit}>
                            {isRegister && (
                                <div className="input-group">
                                    <label>Alias de Piloto</label>
                                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required={isRegister} placeholder="Nombre de usuario" />
                                </div>
                            )}
                            <div className="input-group">
                                <label>Identificación</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@dominio.com" />
                            </div>
                            <div className="input-group">
                                <label>Clave de Encriptación</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                            </div>
                            <button type="submit" className="btn-main">
                                {isRegister ? 'Crear Cuenta' : 'Iniciar Conexión'}
                            </button>
                        </form>
                        
                        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9rem'}}>
                            <a href="#" 
                               onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setStatus({msg:'', type:''}); }}
                               style={{color: 'var(--primary)', textDecoration: 'none'}}>
                                {isRegister ? '¿Ya tienes acceso? Inicia conexión aquí' : '¿Aún no tienes cuenta? Regístrate aquí'}
                            </a>
                        </p>
                    </div>

                    {/* Lado Derecho: Ranking */}
                    <div className="card">
                        <h2>RANKING JUGADORES</h2>
                        <table className="ranking-table">
                            <tbody>
                                {ranking.map(p => (
                                    <tr key={p.id}>
                                        <td className="rank-pos">#{p.id}</td>
                                        <td className="player-info">{p.name} <br/><small style={{opacity:0.5}}>{p.ship}</small></td>
                                        <td className="score" style={{textAlign:'right'}}>{p.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);