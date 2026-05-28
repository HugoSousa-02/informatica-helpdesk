const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/emailService');

// LISTAR ITENS DE STOCK
exports.listItems = async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { reference: { contains: search } }
      ];
    }
    if (category) where.category = category;

    const items = await prisma.stockItem.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar stock' });
  }
};

// CRIAR ITEM DE STOCK
exports.createItem = async (req, res) => {
  try {
    const { name, reference, category, quantity, minQuantity, supplier, costPrice } = req.body;

    const item = await prisma.stockItem.create({
      data: {
        name,
        reference,
        category,
        quantity: quantity || 0,
        minQuantity: minQuantity || 5,
        supplier,
        costPrice: costPrice ? parseFloat(costPrice) : null
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar item' });
  }
};

// REGISTAR MOVIMENTO DE STOCK (entrada ou saída)
exports.createMovement = async (req, res) => {
  try {
    const { itemId, ticketId, type, quantity, notes } = req.body;

    const item = await prisma.stockItem.findUnique({ where: { id: parseInt(itemId) } });
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Verifica stock suficiente para saídas
    if (type === 'saida' && item.quantity < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Cria o movimento e atualiza a quantidade numa transação
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          itemId: parseInt(itemId),
          ticketId: ticketId ? parseInt(ticketId) : null,
          type,
          quantity: parseInt(quantity),
          userId: req.user.id,
          notes
        }
      }),
      prisma.stockItem.update({
        where: { id: parseInt(itemId) },
        data: {
          quantity: type === 'entrada'
            ? item.quantity + parseInt(quantity)
            : item.quantity - parseInt(quantity)
        }
      })
    ]);

    // Verifica stock mínimo após o movimento
    const updatedItem = await prisma.stockItem.findUnique({ where: { id: parseInt(itemId) } });
    if (updatedItem.quantity <= updatedItem.minQuantity) {
      // Notifica admins
      const admins = await prisma.user.findMany({ where: { role: 'admin', active: true } });
      admins.forEach(admin => {
        emailService.sendStockAlert(admin, [updatedItem]).catch(err => console.error(err));
      });
    }

    res.status(201).json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registar movimento' });
  }
};

// LISTAR MOVIMENTOS
exports.listMovements = async (req, res) => {
  try {
    const { itemId } = req.query;
    const where = {};
    if (itemId) where.itemId = parseInt(itemId);

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        item: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        ticket: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar movimentos' });
  }
};

// OBTER ITENS COM STOCK CRÍTICO
exports.getCriticalItems = async (req, res) => {
  try {
    const items = await prisma.stockItem.findMany({
      where: { quantity: { lte: prisma.stockItem.fields.minQuantity } },
      orderBy: { quantity: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter stock crítico' });
  }
};