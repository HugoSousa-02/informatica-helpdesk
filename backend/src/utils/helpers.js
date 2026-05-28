// Funções utilitárias usadas em vários controllers

// Formata uma data para o formato português
exports.formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Traduz o status do ticket para português
exports.translateStatus = (status) => {
  const translations = {
    aberto: 'Aberto',
    em_progresso: 'Em Progresso',
    aguarda_peca: 'Aguarda Peça',
    resolvido: 'Resolvido',
    fechado: 'Fechado'
  };
  return translations[status] || status;
};

// Traduz a prioridade para português
exports.translatePriority = (priority) => {
  const translations = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente'
  };
  return translations[priority] || priority;
};