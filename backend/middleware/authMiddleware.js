const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ success: false, message: "Token inválido o expirado." });
    }
};
