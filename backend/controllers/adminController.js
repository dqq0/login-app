const pool = require('../config/db');

// Obtener todos los usuarios (excluyendo password)
exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre_usuario, email, rol, baneado, motivo_ban, fecha_creacion FROM usuarios ORDER BY id ASC'
        );
        res.json({
            success: true,
            users: result.rows
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener la lista de usuarios." });
    }
};

// Banear o Desbanear a un usuario
exports.toggleBanUser = async (req, res) => {
    const { id } = req.params;
    const { baneado, motivo_ban } = req.body;

    try {
        // No permitir que un administrador se banee a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: "Acción denegada. No puedes suspender tu propio usuario de administración." 
            });
        }

        const result = await pool.query(
            'UPDATE usuarios SET baneado = $1, motivo_ban = $2 WHERE id = $3 RETURNING id, nombre_usuario, baneado, motivo_ban',
            [baneado, baneado ? (motivo_ban || 'Suspensión administrativa') : null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        res.json({
            success: true,
            message: baneado ? "Usuario suspendido correctamente." : "Usuario reactivado correctamente.",
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error al suspender/reactivar usuario:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el estado de suspensión." });
    }
};

// Cambiar el rol de un usuario
exports.changeUserRole = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol || !['user', 'admin'].includes(rol)) {
        return res.status(400).json({ success: false, message: "Rol no válido. Los roles admitidos son: 'user' o 'admin'." });
    }

    try {
        // No permitir que un administrador se degrade a sí mismo para evitar orfandad del panel
        if (parseInt(id) === req.user.id && rol !== 'admin') {
            return res.status(400).json({ 
                success: false, 
                message: "Acción denegada. No puedes remover tus propios permisos de administrador para evitar orfandad en el sistema." 
            });
        }

        const result = await pool.query(
            'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre_usuario, rol',
            [rol, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        res.json({
            success: true,
            message: `Rol actualizado a '${rol}' exitosamente.`,
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error al cambiar rol del usuario:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el rol." });
    }
};
