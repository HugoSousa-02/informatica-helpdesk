const router = require('express').Router();
const agendaController = require('../controllers/agendaController');
const authMiddleware = require('../middleware/auth');

router.get('/events', authMiddleware, agendaController.getAgendaEvents);
router.get('/today', authMiddleware, agendaController.getTodayExternal);

module.exports = router;