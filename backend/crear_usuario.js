const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function crearUsuario() {
    const nombre = 'Sebastian';
    const email = 'seba@test.com'; // Usaremos este email para el login
    const passwordPlana = 'seba123'; // La contraseña que escribirás en el frontend

    try {
        // 1. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordPlana, salt);

        // 2. Insertar en la base de datos con los nombres de columna correctos
        const query = `
            INSERT INTO usuarios (nombre_usuario, nickname, email, clave_encriptada) 
            VALUES ($1, $1, $2, $3) 
            RETURNING id, nombre_usuario, nickname, email
        `;
        const values = [nombre, email, passwordHash];

        const res = await pool.query(query, values);
        console.log('✅ Usuario de prueba creado exitosamente:');
        console.log(res.rows[0]);

    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message);
    } finally {
        // Cerrar la conexión para que el script termine
        await pool.end();
    }
}

crearUsuario();