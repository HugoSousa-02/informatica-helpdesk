import api from './api';

export const ticketService = {
  // Listar tickets com filtros opcionais
  listTickets: async (filters = {}) => {
    const response = await api.get('/tickets', { params: filters });
    return response.data;
  },

  // Obter ticket por ID
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Criar novo ticket
  createTicket: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  // Atualizar status do ticket
  updateStatus: async (id, status) => {
    const response = await api.put(`/tickets/${id}/status`, { status });
    return response.data;
  },

  // Adicionar nota ao ticket
  addNote: async (ticketId, note, isInternal = false) => {
    const response = await api.post(`/tickets/${ticketId}/notes`, { note, isInternal });
    return response.data;
  },

  // Upload de anexo
  uploadAttachment: async (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};