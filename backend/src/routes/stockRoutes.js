const router = require('express').Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Apenas admin e técnico acedem ao stock
router.get('/items', authMiddleware, authorize('admin', 'tecnico'), stockController.listItems);
router.get('/items/critical', authMiddleware, authorize('admin', 'tecnico'), stockController.getCriticalItems);
router.post('/items', authMiddleware, authorize('admin'), stockController.createItem);
router.get('/movements', authMiddleware, authorize('admin', 'tecnico'), stockController.listMovements);
router.post('/movements', authMiddleware, authorize('admin', 'tecnico'), stockController.createMovement);

module.exports = router;