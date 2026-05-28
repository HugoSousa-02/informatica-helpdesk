import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// Formulário de criação/edição de ticket
const TicketForm = ({ initialData, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientId: initialData?.clientId || '',
    techId: initialData?.techId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    equipment: initialData?.equipment || '',
    priority: initialData?.priority || 'media',
    serviceType: initialData?.serviceType || 'loja',
    clientAddress: initialData?.clientAddress || '',
    scheduledAt: initialData?.scheduledAt || '',
    estimatedDuration: initialData?.estimatedDuration || 60,
  });

  // Carrega lista de clientes e técnicos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, techsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/users')
        ]);
        setClients(clientsRes.data);
        setTechs(techsRes.data.filter(u => u.role === 'tecnico' && u.active));
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium mb-1">Cliente *</label>
        <select name="clientId" value={form.clientId} onChange={handleChange} required className="input-field">
          <option value="">Selecionar cliente...</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      {/* Título e Equipamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Problema reportado" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Equipamento</label>
          <input type="text" name="equipment" value={form.equipment} onChange={handleChange} className="input-field" placeholder="Ex: Portátil HP, Impressora..." />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium mb-1">Descrição *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="input-field" placeholder="Descreva o problema..." />
      </div>

      {/* Prioridade e Tipo de Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prioridade</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Serviço *</label>
          <select name="serviceType" value={form.serviceType} onChange={handleChange} required className="input-field">
            <option value="loja">🏪 Na Loja</option>
            <option value="externo">🚗 Externo</option>
            <option value="remoto">🌐 Remoto</option>
          </select>
        </div>
      </div>

      {/* Morada (se serviço externo) */}
      {form.serviceType === 'externo' && (
        <div>
          <label className="block text-sm font-medium mb-1">Morada do Cliente *</label>
          <input type="text" name="clientAddress" value={form.clientAddress} onChange={handleChange} required className="input-field" placeholder="Morada completa" />
        </div>
      )}

      {/* Técnico, Data e Duração */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Técnico</label>
          <select name="techId" value={form.techId} onChange={handleChange} className="input-field">
            <option value="">Não atribuir</option>
            {techs.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
        </div>
        {(form.serviceType === 'externo') && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Data/Hora Agendada</label>
              <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duração (min)</label>
              <input type="number" name="estimatedDuration" value={form.estimatedDuration} onChange={handleChange} className="input-field" min="15" step="15" />
            </div>
          </>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'A guardar...' : (initialData ? 'Atualizar Ticket' : 'Criar Ticket')}
        </button>
      </div>
    </form>
  );
};

export default TicketForm;