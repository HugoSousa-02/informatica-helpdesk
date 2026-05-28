// Serviço de Socket.io para notificações em tempo real

let io;

module.exports = {
  // Configura o servidor Socket.io
  setupSocket: (serverIO) => {
    io = serverIO;

    io.on('connection', (socket) => {
      // Obtém o ID do utilizador do query string
      const userId = socket.handshake.query.userId;

      if (userId) {
        // Coloca o utilizador numa "sala" privada com o seu ID
        socket.join(`user-${userId}`);
        console.log(`Utilizador ${userId} conectado via Socket.io`);
      }

      // Evento: marcar notificação como lida
      socket.on('markAsRead', (notificationId) => {
        // Este evento é ouvido pelo frontend para atualizar a UI
        socket.emit('notificationRead', notificationId);
      });

      // Evento: utilizador desconecta
      socket.on('disconnect', () => {
        console.log('Cliente desconectado do Socket.io');
      });
    });
  },

  // Retorna a instância do Socket.io para usar nos controllers
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io não foi inicializado. Chame setupSocket primeiro.');
    }
    return io;
  }
};