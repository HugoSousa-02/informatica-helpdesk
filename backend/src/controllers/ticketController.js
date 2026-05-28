const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../services/socketService');
const emailService = require('../services/emailService');
const googleCalendar = require('../services/googleCalendar');

// LISTAR TICKETS com filtros
exports.listTickets = async (req, res) => {
  try {
    const { status, priority, techId, serviceType, search, clientId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (techId) where.techId = parseInt(techId);
    if (serviceType) where.serviceType = serviceType;
    if (clientId) where.clientId = parseInt(clientId);

    // Pesquisa por texto (título, descrição, nome do cliente)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { client: { name: { contains: search } } }
      ];
    }

    // Técnico vê apenas os seus próprios tickets
    if (req.user.role === 'tecnico') {
      where.techId = req.user.id;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        tech: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar tickets' });
  }
};

// OBTER TICKET por ID com todos os detalhes
exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        tech: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        notes: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        history: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { changedAt: 'desc' }
        },
        attachments: {
          include: { uploader: { select: { id: true, name: true } } }
        },
        stockMovements: {
          include: { item: true }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Verifica permissão: técnico só vê os seus próprios tickets
    if (req.user.role === 'tecnico' && ticket.techId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para ver este ticket' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter ticket' });
  }
};

// CRIAR TICKET
exports.createTicket = async (req, res) => {
  try {
    const {
      clientId, techId, title, description, equipment,
      priority, serviceType, clientAddress, scheduledAt, estimatedDuration
    } = req.body;

    // Validações
    if (!clientId || !title || !description || !serviceType) {
      return res.status(400).json({ error: 'Campos obrigatórios: cliente, título, descrição, tipo de serviço' });
    }

    if (serviceType === 'externo' && !clientAddress) {
      return res.status(400).json({ error: 'Morada do cliente é obrigatória para serviços externos' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientId: parseInt(clientId),
        techId: techId ? parseInt(techId) : null,
        title,
        description,
        equipment,
        priority: priority || 'media',
        serviceType,
        clientAddress: serviceType === 'externo' ? clientAddress : null,
        scheduledAt: serviceType === 'externo' && scheduledAt ? new Date(scheduledAt) : null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        createdBy: req.user.id
      },
      include: {
        client: true,
        tech: { select: { id: true, name: true, email: true } }
      }
    });

    // Criar evento no Google Calendar (se aplicável)
    if (serviceType === 'externo' && ticket.techId && ticket.scheduledAt) {
      googleCalendar.createOrUpdateEvent(ticket).catch(err => console.error(err));
    }

    // Notificar o técnico atribuído
    if (ticket.techId) {
      const tech = await prisma.user.findUnique({ where: { id: ticket.techId } });
      if (tech) {
        // Email
        emailService.sendTicketCreated(tech, ticket).catch(err => console.error(err));

        // Socket.io (tempo real)
        getIO().to(`user-${tech.id}`).emit('notification', {
          title: 'Novo ticket atribuído',
          message: `Ticket #${ticket.id} - ${ticket.title}`,
          url: `/tickets/${ticket.id}`
        });

        // Guarda na BD
        await prisma.notification.create({
          data: {
            userId: tech.id,
            title: 'Novo ticket',
            message: `Recebeste o ticket #${ticket.id} - ${ticket.title}`,
            type: 'ticket'
          }
        });
      }
    }

    // Histórico inicial
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId: req.user.id,
        newStatus: ticket.status
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar ticket' });
  }
};

// ATUALIZAR STATUS DO TICKET (com histórico)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: { client: true, tech: true }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const oldStatus = ticket.status;

    // Atualiza o status
    const updated = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: {
        status,
        resolvedAt: (status === 'resolvido' || status === 'fechado') ? new Date() : null
      },
      include: { client: true, tech: true }
    });

    // Regista no histórico
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId: req.user.id,
        oldStatus,
        newStatus: status
      }
    });

    // Atualiza evento Google Calendar
    if (updated.serviceType === 'externo' && updated.googleEventId) {
      googleCalendar.createOrUpdateEvent(updated).catch(err => console.error(err));
    }

    // Notifica o técnico da alteração
    if (ticket.techId && req.user.id !== ticket.techId) {
      const tech = await prisma.user.findUnique({ where: { id: ticket.techId } });
      if (tech) {
        emailService.sendStatusChange(tech, ticket, oldStatus, status).catch(err => console.error(err));

        getIO().to(`user-${tech.id}`).emit('notification', {
          title: 'Ticket atualizado',
          message: `Ticket #${ticket.id} mudou para "${status}"`,
          url: `/tickets/${ticket.id}`
        });
      }
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

// ADICIONAR NOTA AO TICKET
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, isInternal } = req.body;

    const ticketNote = await prisma.ticketNote.create({
      data: {
        ticketId: parseInt(id),
        userId: req.user.id,
        note,
        isInternal: isInternal || false
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(ticketNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar nota' });
  }
};

// UPLOAD DE ANEXO
exports.uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        ticketId: parseInt(id),
        filename: req.file.originalname,
        path: req.file.path,
        uploadedBy: req.user.id
      }
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
};