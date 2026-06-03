const pool = require('../config/db');

// Crear un nuevo ticket de soporte
exports.createTicket = async (req, res) => {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ success: false, message: "Debe suministrar título, descripción y categoría del ticket." });
    }

    const validCategories = ['cuenta', 'bug', 'tienda', 'otro'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, message: "Categoría inválida. Debe ser: cuenta, bug, tienda u otro." });
    }

    const validPriorities = ['baja', 'media', 'alta', 'critica'];
    const selectedPriority = priority && validPriorities.includes(priority) ? priority : 'media';

    try {
        const result = await pool.query(
            `INSERT INTO tickets (usuario_id, titulo, descripcion, categoria, estado, prioridad) 
             VALUES ($1, $2, $3, $4, 'abierto', $5) 
             RETURNING id, usuario_id, titulo, descripcion, categoria, estado, prioridad, fecha_creacion`,
            [req.user.id, title, description, category, selectedPriority]
        );

        res.status(201).json({
            success: true,
            message: "Ticket de soporte técnico registrado exitosamente.",
            ticket: result.rows[0]
        });
    } catch (err) {
        console.error('Error al crear ticket:', err);
        res.status(500).json({ success: false, message: "Error interno al crear el ticket de soporte." });
    }
};

// Obtener los tickets del usuario actual
exports.getMyTickets = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, titulo, descripcion, categoria, estado, prioridad, fecha_creacion FROM tickets WHERE usuario_id = $1 ORDER BY id DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            tickets: result.rows
        });
    } catch (err) {
        console.error('Error al obtener tickets:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar tus tickets de soporte." });
    }
};
