const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Lógica de Login (Verificación)
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar el usuario por email
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // 2. Comparar la contraseña enviada con el hash de la base de datos
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (validPassword) {
      res.json({
        message: 'Login exitoso',
        user: { id: user.id, nombre: user.nombre, email: user.email },
        token: 'secure_token_deathcloud_2026'
      });
    } else {
      res.status(401).json({ error: 'Contraseña incorrecta' });
    }

  } catch (err) {
    console.error('Error en el login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Lógica de Registro
const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si existe el usuario
    const userCheck = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña y crear usuario
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre || 'Piloto Nuevo', email, passwordHash]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  login,
  register
};
