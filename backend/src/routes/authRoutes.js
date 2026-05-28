const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Rotas públicas
router.post('/login', authController.login);

// Rotas protegidas (precisam de token JWT)
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// Apenas Admin pode criar utilizadores
router.post('/register', authMiddleware, authorize('admin'), authController.createUser);

module.exports = router;