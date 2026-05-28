const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Todas as rotas de utilizadores requerem autenticação e perfil admin
router.get('/', authMiddleware, authorize('admin'), userController.listUsers);
router.get('/:id', authMiddleware, authorize('admin'), userController.getUser);
router.put('/:id', authMiddleware, authorize('admin'), userController.updateUser);
router.delete('/:id', authMiddleware, authorize('admin'), userController.deactivateUser);

module.exports = router;