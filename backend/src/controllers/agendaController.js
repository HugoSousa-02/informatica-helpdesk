const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// OBTER EVENTOS DA AGENDA (serviços externos agendados)
exports.getAgendaEvents = async (req, res) => {
  try {
    const { start, end, techId } = req.query;
    const where = {
      serviceType: 'externo',
      scheduledAt: {
        gte: start ? new Date(start) : new Date(),
        lte: end ? new Date(end) : undefined
      }
    };

    // Filtra por técnico (admin/receção veem todos)
    if (techId) where.techId = parseInt(techId);
    if (req.user.role === 'tecnico') where.techId = req.user.id;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        tech: { select: { id: true, name: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    // Formata para o calendário do frontend
    const events = tickets.map(ticket => ({
      id: ticket.id,
      title: `#${ticket.id} - ${ticket.client.name}`,
      start: ticket.scheduledAt,
      end: new Date(new Date(ticket.scheduledAt).getTime() + (ticket.estimatedDuration || 60) * 60000),
      priority: ticket.priority,
      status: ticket.status,
      techName: ticket.tech?.name,
      clientName: ticket.client.name,
      clientAddress: ticket.clientAddress,
      resource: ticket // dados completos para detalhes
    }));

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter eventos da agenda' });
  }
};

// OBTER SERVIÇOS EXTERNOS DE HOJE (para o dashboard)
exports.getTodayExternal = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const where = {
      serviceType: 'externo',
      scheduledAt: { gte: startOfDay, lt: endOfDay }
    };

    if (req.user.role === 'tecnico') where.techId = req.user.id;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        tech: { select: { id: true, name: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter agenda de hoje' });
  }
};