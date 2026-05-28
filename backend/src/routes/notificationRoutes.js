const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, notificationController.listNotifications);
router.get('/unread-count', authMiddleware, notificationController.countUnread);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;