const jwt = require('jsonwebtoken');

// Middleware de autenticação JWT
// Verifica se o token é válido e adiciona os dados do utilizador ao req.user
module.exports = (req, res, next) => {
  // Obtém o token do cabeçalho Authorization
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verifica e descodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};