const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener datos del perfil del usuario en sesión
exports.getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre_usuario, nickname, email, rol, avatar_url, bio, fecha_creacion FROM usuarios WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Piloto no encontrado en el sistema." });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar el perfil." });
    }
};

// Actualizar datos del perfil (avatar, biografía y nickname)
exports.updateProfile = async (req, res) => {
    const { avatar_url, bio, nickname } = req.body;

    try {
        const result = await pool.query(
            'UPDATE usuarios SET avatar_url = $1, bio = $2, nickname = $3 WHERE id = $4 RETURNING id, nombre_usuario, nickname, email, avatar_url, bio, fecha_creacion',
            [avatar_url || 'none', bio || null, nickname || null, req.user.id]
        );

        res.json({
            success: true,
            message: "Perfil actualizado correctamente.",
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ success: false, message: "Error interno al actualizar datos del perfil." });
    }
};

// Cambiar contraseña de forma segura
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Debe suministrar la contraseña actual y la nueva." });
    }

    try {
        // Obtener clave_encriptada del usuario
        const result = await pool.query('SELECT clave_encriptada FROM usuarios WHERE id = $1', [req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        const user = result.rows[0];

        // Validar clave anterior con bcrypt
        const validPassword = await bcrypt.compare(oldPassword, user.clave_encriptada);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: "La contraseña actual es incorrecta." });
        }

        // Encriptar la nueva clave
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Actualizar base de datos
        await pool.query('UPDATE usuarios SET clave_encriptada = $1 WHERE id = $2', [newPasswordHash, req.user.id]);

        res.json({
            success: true,
            message: "Contraseña actualizada exitosamente."
        });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        res.status(500).json({ success: false, message: "Error interno al actualizar la clave de acceso." });
    }
};

// Cambiar el DeathCloud ID (nombre_usuario) permanente validando la contraseña
exports.changeDeathCloudId = async (req, res) => {
    const { password, newDeathCloudId } = req.body;

    if (!password || !newDeathCloudId) {
        return res.status(400).json({ success: false, message: "Debe suministrar la contraseña actual y el nuevo DeathCloud ID." });
    }

    try {
        // 1. Obtener la clave encriptada para validar la identidad
        const userRes = await pool.query('SELECT clave_encriptada FROM usuarios WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }
        
        const user = userRes.rows[0];

        // 2. Validar contraseña
        const validPassword = await bcrypt.compare(password, user.clave_encriptada);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: "La contraseña ingresada es incorrecta." });
        }

        // 3. Verificar si el nuevo ID ya existe
        const checkRes = await pool.query('SELECT id FROM usuarios WHERE nombre_usuario = $1 AND id <> $2', [newDeathCloudId, req.user.id]);
        if (checkRes.rows.length > 0) {
            return res.status(400).json({ success: false, message: "El DeathCloud ID ya está en uso." });
        }

        // 4. Actualizar nombre_usuario
        await pool.query('UPDATE usuarios SET nombre_usuario = $1 WHERE id = $2', [newDeathCloudId, req.user.id]);

        res.json({
            success: true,
            message: "DeathCloud ID actualizado exitosamente.",
            newDeathCloudId
        });
    } catch (err) {
        console.error('Error al cambiar DeathCloud ID:', err);
        res.status(500).json({ success: false, message: "Error interno al actualizar el DeathCloud ID." });
    }
};

// Obtener datos de perfil público de cualquier piloto (para modal en chat)
exports.getPublicProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const result = await pool.query(
            'SELECT nombre_usuario, nickname, rol, avatar_url, bio, fecha_creacion FROM usuarios WHERE nombre_usuario = $1 OR nickname = $1 LIMIT 1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Piloto no encontrado en el sistema." });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error al obtener perfil público:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar el perfil público." });
    }
};
