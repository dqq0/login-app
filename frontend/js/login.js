const { useState } = React;

const App = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [status, setStatus] = useState({ msg: '', type: '' });
    const [isRegister, setIsRegister] = useState(false);

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
                }
            } else {
                setStatus({ msg: data.error || 'ERROR DESCONOCIDO', type: 'error' });
            }
        } catch (err) {
            setStatus({ msg: 'ERROR DE CONEXIÓN CON EL SERVIDOR', type: 'error' });
        }
    };

    return (
        <div className="main-wrapper">
            <h1 className="main-title">Deathcloud</h1>

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
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);