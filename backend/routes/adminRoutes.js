const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Aplicar doble candado de seguridad a todas las rutas de este enrutador
router.use(authMiddleware);
router.use(adminMiddleware);

// Rutas de administración
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.put('/users/:id/role', adminController.changeUserRole);

module.exports = router;
