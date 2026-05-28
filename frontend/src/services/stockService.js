import api from './api';

export const stockService = {
  // Listar itens de stock
  listItems: async (filters = {}) => {
    const response = await api.get('/stock/items', { params: filters });
    return response.data;
  },

  // Criar item de stock
  createItem: async (data) => {
    const response = await api.post('/stock/items', data);
    return response.data;
  },

  // Registar movimento de stock (entrada/saída)
  createMovement: async (data) => {
    const response = await api.post('/stock/movements', data);
    return response.data;
  },

  // Listar movimentos de stock
  listMovements: async (filters = {}) => {
    const response = await api.get('/stock/movements', { params: filters });
    return response.data;
  },

  // Obter itens com stock crítico
  getCriticalItems: async () => {
    const response = await api.get('/stock/items/critical');
    return response.data;
  }
};