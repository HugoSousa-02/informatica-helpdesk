const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// LOGIN - Autentica o utilizador e retorna um token JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios' });
    }

    // Procura o utilizador pelo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica a password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

// REGISTAR UTILIZADOR - Apenas Admin pode criar contas
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verifica se o email já existe
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Este email já está registado' });
    }

    // Encripta a password
    const passwordHash = await bcrypt.hash(password, 10);

    // Cria o utilizador
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar utilizador' });
  }
};

// OBTER PERFIL - Retorna os dados do utilizador logado
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        active: true,
        googleToken: true, // indica se tem Google ligado (true/false, não o token)
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Retorna se tem Google Calendar ligado (true/false)
    res.json({
      ...user,
      googleConnected: !!user.googleToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
};

// ATUALIZAR PERFIL - Nome, email e foto
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, photo },
      select: { id: true, name: true, email: true, role: true, photo: true }
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

// ALTERAR PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Password atual incorreta' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    res.json({ message: 'Password alterada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar password' });
  }
};