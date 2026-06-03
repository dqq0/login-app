const pool = require('../config/db');

// Enviar solicitud de amistad
exports.sendFriendRequest = async (req, res) => {
    const { friendUsername } = req.body;

    if (!friendUsername) {
        return res.status(400).json({ success: false, message: "Debe suministrar el nombre de usuario o nickname del piloto." });
    }

    try {
        // Buscar el id del piloto destino por nombre_usuario o nickname
        const destUserResult = await pool.query(
            'SELECT id, nombre_usuario FROM usuarios WHERE nombre_usuario = $1 OR nickname = $1 LIMIT 1',
            [friendUsername]
        );

        if (destUserResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: `El piloto '${friendUsername}' no existe.` });
        }

        const friendId = destUserResult.rows[0].id;
        const actualFriendUsername = destUserResult.rows[0].nombre_usuario;

        // Validar no auto-solicitud
        if (friendId === req.user.id) {
            return res.status(400).json({ success: false, message: "No puedes enviarte una solicitud de amistad a ti mismo." });
        }

        // Verificar si ya existe una solicitud en cualquier dirección
        const checkResult = await pool.query(
            'SELECT * FROM amigos WHERE (usuario_id_envia = $1 AND usuario_id_recibe = $2) OR (usuario_id_envia = $2 AND usuario_id_recibe = $1)',
            [req.user.id, friendId]
        );

        if (checkResult.rows.length > 0) {
            const friendship = checkResult.rows[0];
            if (friendship.estado === 'aceptado') {
                return res.status(400).json({ success: false, message: "Ya eres amigo de este piloto." });
            } else if (friendship.usuario_id_envia === req.user.id) {
                return res.status(400).json({ success: false, message: "Ya has enviado una solicitud de amistad pendiente a este piloto." });
            } else {
                return res.status(400).json({ success: false, message: "Este piloto ya te ha enviado una solicitud de amistad. Por favor, revísala." });
            }
        }

        // Crear la solicitud de amistad en la BD
        const insertResult = await pool.query(
            'INSERT INTO amigos (usuario_id_envia, usuario_id_recibe, estado) VALUES ($1, $2, \'pendiente\') RETURNING id, usuario_id_envia, usuario_id_recibe, estado, fecha_solicitud',
            [req.user.id, friendId]
        );

        res.status(201).json({
            success: true,
            message: `Solicitud de amistad enviada a '${actualFriendUsername}' exitosamente.`,
            request: insertResult.rows[0]
        });
    } catch (err) {
        console.error('Error al enviar solicitud de amistad:', err);
        res.status(500).json({ success: false, message: "Error interno al enviar la solicitud de amistad." });
    }
};

// Obtener amigos y solicitudes pendientes
exports.getFriendsAndRequests = async (req, res) => {
    try {
        // Amigos Aceptados (incluyendo nickname)
        const friendsResult = await pool.query(
            `SELECT a.id as friendship_id, u.id as user_id, u.nombre_usuario, u.nickname, u.email, u.avatar_url, u.bio
             FROM amigos a
             JOIN usuarios u ON (u.id = a.usuario_id_envia OR u.id = a.usuario_id_recibe)
             WHERE (a.usuario_id_envia = $1 OR a.usuario_id_recibe = $1)
               AND a.estado = 'aceptado'
               AND u.id <> $1`,
            [req.user.id]
        );

        // Solicitudes recibidas pendientes (incluyendo nickname)
        const incomingResult = await pool.query(
            `SELECT a.id as request_id, u.id as sender_id, u.nombre_usuario, u.nickname, u.avatar_url, a.fecha_solicitud
             FROM amigos a
             JOIN usuarios u ON u.id = a.usuario_id_envia
             WHERE a.usuario_id_recibe = $1 AND a.estado = 'pendiente'`,
            [req.user.id]
        );

        // Solicitudes enviadas pendientes (incluyendo nickname)
        const outgoingResult = await pool.query(
            `SELECT a.id as request_id, u.id as receiver_id, u.nombre_usuario, u.nickname, u.avatar_url, a.fecha_solicitud
             FROM amigos a
             JOIN usuarios u ON u.id = a.usuario_id_recibe
             WHERE a.usuario_id_envia = $1 AND a.estado = 'pendiente'`,
            [req.user.id]
        );

        res.json({
            success: true,
            friends: friendsResult.rows,
            requests: {
                incoming: incomingResult.rows,
                outgoing: outgoingResult.rows
            }
        });
    } catch (err) {
        console.error('Error al obtener amigos:', err);
        res.status(500).json({ success: false, message: "Error interno al obtener el listado de amistades." });
    }
};

// Responder solicitud de amistad (aceptar / rechazar / cancelar)
exports.respondFriendRequest = async (req, res) => {
    const { requestId, action } = req.body; // action: 'aceptado' | 'rechazado'

    if (!requestId || !action) {
        return res.status(400).json({ success: false, message: "Debe suministrar el ID de la solicitud y la acción." });
    }

    try {
        if (action === 'aceptado') {
            const updateResult = await pool.query(
                `UPDATE amigos 
                 SET estado = 'aceptado', fecha_respuesta = CURRENT_TIMESTAMP 
                 WHERE id = $1 AND usuario_id_recibe = $2 
                 RETURNING id`,
                [requestId, req.user.id]
            );
            if (updateResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Solicitud no encontrada o no tienes permisos para aceptarla." });
            }
            res.json({ success: true, message: "Solicitud de amistad aceptada correctamente." });
        } else {
            // Si se rechaza, eliminamos el registro de la tabla amigos
            const deleteResult = await pool.query(
                `DELETE FROM amigos 
                 WHERE id = $1 AND (usuario_id_recibe = $2 OR usuario_id_envia = $2) 
                 RETURNING id`,
                [requestId, req.user.id]
            );
            if (deleteResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Solicitud no encontrada." });
            }
            res.json({ success: true, message: "Solicitud de amistad rechazada/cancelada." });
        }
    } catch (err) {
        console.error('Error al responder solicitud de amistad:', err);
        res.status(500).json({ success: false, message: "Error interno al procesar la solicitud de amistad." });
    }
};

// Eliminar amigo existente
exports.removeFriend = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Debe suministrar el ID de la amistad." });
    }

    try {
        const deleteResult = await pool.query(
            `DELETE FROM amigos 
             WHERE id = $1 AND (usuario_id_envia = $2 OR usuario_id_recibe = $2) 
             RETURNING id`,
            [id, req.user.id]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Amigo no encontrado o no tienes permisos." });
        }

        res.json({ success: true, message: "Amistad finalizada de forma segura." });
    } catch (err) {
        console.error('Error al eliminar amigo:', err);
        res.status(500).json({ success: false, message: "Error interno al eliminar amigo." });
    }
};
