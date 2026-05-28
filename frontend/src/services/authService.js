import api from './api';

export const authService = {
  // Login - retorna token e dados do utilizador
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Obter perfil do utilizador logado
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Atualizar perfil (nome, email, foto)
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Alterar password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Criar utilizador (apenas admin)
  createUser: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};