const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de Piloto
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Verificar si ya existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE email = $1 OR nombre_usuario = $2', [email, username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: "El usuario o email ya están registrados" });
        }

        // Encriptar password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar
        const result = await pool.query(
            'INSERT INTO usuarios (nombre_usuario, nickname, email, clave_encriptada, rol, baneado) VALUES ($1, $1, $2, $3, \'user\', false) RETURNING id, nombre_usuario, nickname, email, rol',
            [username, email, passwordHash]
        );

        res.json({ 
            success: true, 
            message: "Registro exitoso", 
            user: { 
                id: result.rows[0].id, 
                username: result.rows[0].nombre_usuario,
                nickname: result.rows[0].nickname,
                rol: result.rows[0].rol
            } 
        });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Login de Piloto
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Credenciales inválidas" });
        }

        const user = result.rows[0];

        // Control de Ban: Verificar si el usuario está suspendido
        if (user.baneado) {
            return res.status(403).json({ 
                success: false, 
                message: `Transmisión rechazada. Tu cuenta ha sido suspendida. Motivo: ${user.motivo_ban || 'No especificado'}.` 
            });
        }

        // Verificar password
        const validPassword = await bcrypt.compare(password, user.clave_encriptada);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: "Credenciales inválidas" });
        }

        // Generar Token Real inyectando el rol y el estado de ban en el payload
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.nombre_usuario,
                rol: user.rol,
                baneado: user.baneado
            },
            process.env.JWT_SECRET || 'deathcloud-secret-key-2026',
            { expiresIn: '24h' }
        );

        // Login exitoso
        res.json({ 
            success: true, 
            message: "Acceso concedido",
            username: user.nombre_usuario,
            nickname: user.nickname || user.nombre_usuario,
            rol: user.rol,
            token: token
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};