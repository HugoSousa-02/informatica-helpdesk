const router = require('express').Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Todas as rotas de tickets requerem autenticação
router.get('/', authMiddleware, ticketController.listTickets);
router.get('/:id', authMiddleware, ticketController.getTicket);
router.post('/', authMiddleware, ticketController.createTicket);
router.put('/:id/status', authMiddleware, ticketController.updateStatus);
router.post('/:id/notes', authMiddleware, ticketController.addNote);
router.post('/:id/attachments', authMiddleware, upload.single('file'), ticketController.uploadAttachment);

module.exports = router;