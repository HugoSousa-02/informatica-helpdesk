// Middleware de autorização por perfil (role)
// Uso: authorize('admin', 'tecnico') -> só admin e técnico podem aceder
module.exports = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente para esta ação' });
    }

    next();
  };
};