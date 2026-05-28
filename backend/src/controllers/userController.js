const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// LISTAR UTILIZADORES - Apenas Admin
exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        active: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar utilizadores' });
  }
};

// OBTER UTILIZADOR POR ID
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        active: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter utilizador' });
  }
};

// ATUALIZAR UTILIZADOR - Apenas Admin
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, role, active },
      select: { id: true, name: true, email: true, role: true, active: true }
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar utilizador' });
  }
};

// DESATIVAR UTILIZADOR (soft delete) - Apenas Admin
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { active: false }
    });

    res.json({ message: 'Utilizador desativado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao desativar utilizador' });
  }
};