// Carrega as variáveis de ambiente do ficheiro .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Importa as rotas da API
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const stockRoutes = require('./src/routes/stockRoutes');
const agendaRoutes = require('./src/routes/agendaRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Importa o serviço de Socket.io
const { setupSocket } = require('./src/services/socketService');

const app = express();
const server = http.createServer(app);

// Configura o Socket.io com CORS para o frontend
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware global
app.use(cors());                                      // Permite requisições do frontend
app.use(express.json());                              // Processa JSON no body
app.use(express.urlencoded({ extended: true }));      // Processa formulários
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Ficheiros estáticos

// Rotas da API REST
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/notifications', notificationRoutes);

// Inicia o Socket.io
setupSocket(io);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});