const pool = require('../config/db');
const bcrypt = require('bcryptjs');

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
            'INSERT INTO usuarios (nombre_usuario, email, clave_encriptada) VALUES ($1, $2, $3) RETURNING id, nombre_usuario, email',
            [username, email, passwordHash]
        );

        res.json({ 
            success: true, 
            message: "Registro exitoso", 
            user: { 
                id: result.rows[0].id, 
                username: result.rows[0].nombre_usuario 
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

        // Verificar password
        const validPassword = await bcrypt.compare(password, user.clave_encriptada);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: "Credenciales inválidas" });
        }

        // Login exitoso
        res.json({ 
            success: true, 
            message: "Acceso concedido",
            username: user.nombre_usuario,
            token: "token-simulado-" + Date.now() // Token simplificado por ahora
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};