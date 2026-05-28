const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// LISTAR CLIENTES
exports.listClients = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { nif: { contains: search } }
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: { _count: { select: { tickets: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
};

// OBTER CLIENTE POR ID (com histórico de tickets)
exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        tickets: {
          include: {
            tech: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter cliente' });
  }
};

// CRIAR CLIENTE
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address, nif, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do cliente é obrigatório' });
    }

    const client = await prisma.client.create({
      data: { name, email, phone, address, nif, notes }
    });
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
};

// ATUALIZAR CLIENTE
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, nif, notes } = req.body;

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, address, nif, notes }
    });
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};