const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// LISTAR NOTIFICAÇÕES DO UTILIZADOR LOGADO
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
};

// MARCAR COMO LIDA
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { readAt: new Date() }
    });
    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
};

// MARCAR TODAS COMO LIDAS
exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() }
    });
    res.json({ message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar notificações' });
  }
};

// CONTAR NOTIFICAÇÕES NÃO LIDAS
exports.countUnread = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, readAt: null }
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao contar notificações' });
  }
};