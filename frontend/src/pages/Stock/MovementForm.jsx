import { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MovementForm = ({ itemId, onSuccess }) => {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    type: 'entrada',
    quantity: 1,
    ticketId: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/tickets', { params: { status: 'aberto,em_progresso,aguarda_peca' } })
      .then(res => setTickets(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockService.createMovement({
        itemId,
        type: form.type,
        quantity: parseInt(form.quantity),
        ticketId: form.ticketId || null,
        notes: form.notes,
      });
      toast.success('Movimento registado!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao registar movimento');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="input-field">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantidade</label>
        <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({...p, quantity: e.target.value}))} className="input-field" required />
      </div>
      {form.type === 'saida' && (
        <div>
          <label className="block text-sm font-medium mb-1">Ticket associado (opcional)</label>
          <select value={form.ticketId} onChange={e => setForm(p => ({...p, ticketId: e.target.value}))} className="input-field">
            <option value="">Sem ticket</option>
            {tickets.map(t => <option key={t.id} value={t.id}>#{t.id} - {t.title}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Notas</label>
        <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-field" rows={2} />
      </div>
      <button type="submit" className="btn-primary w-full">Registar Movimento</button>
    </form>
  );
};

export default MovementForm;