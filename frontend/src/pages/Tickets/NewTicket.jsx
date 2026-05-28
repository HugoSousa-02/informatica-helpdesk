import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import TicketForm from '../../components/tickets/TicketForm';
import { toast } from 'react-toastify';

const NewTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const ticket = await ticketService.createTicket(data);
      toast.success(`Ticket #${ticket.id} criado com sucesso!`);
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar ticket');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Novo Ticket</h1>
      <div className="card">
        <TicketForm onSubmit={handleSubmit} onCancel={() => navigate('/tickets')} />
      </div>
    </div>
  );
};

export default NewTicket;