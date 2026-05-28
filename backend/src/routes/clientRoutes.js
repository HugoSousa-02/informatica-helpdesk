const router = require('express').Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de clientes requerem autenticação
router.get('/', authMiddleware, clientController.listClients);
router.get('/:id', authMiddleware, clientController.getClient);
router.post('/', authMiddleware, clientController.createClient);
router.put('/:id', authMiddleware, clientController.updateClient);

module.exports = router;