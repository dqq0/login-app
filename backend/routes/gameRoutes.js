const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

// Clasificación global por juego (accesible por invitados)
router.get('/game/:gameId/leaderboard', gameController.getLeaderboard);

// Operaciones específicas de usuario protegidas por sesión
router.get('/game/:gameId/credits', authMiddleware, gameController.getCredits);
router.post('/game/:gameId/credits/add', authMiddleware, gameController.addCredits);
router.get('/game/:gameId/skins', authMiddleware, gameController.getSkins);
router.post('/game/:gameId/skins/buy', authMiddleware, gameController.buySkin);
router.post('/game/:gameId/stats', authMiddleware, gameController.updateScore);

module.exports = router;
