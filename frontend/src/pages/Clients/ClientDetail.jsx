import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/tickets/StatusBadge';
import { FiArrowLeft, FiEdit2, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clients/${id}`)
      .then(res => setClient(res.data))
      .catch(() => navigate('/clients'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!client) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
        <FiArrowLeft /> Voltar
      </button>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {client.email && <span className="flex items-center gap-1"><FiMail /> {client.email}</span>}
              {client.phone && <span className="flex items-center gap-1"><FiPhone /> {client.phone}</span>}
              {client.address && <span className="flex items-center gap-1"><FiMapPin /> {client.address}</span>}
              {client.nif && <span>NIF: {client.nif}</span>}
            </div>
          </div>
          <Link to={`/tickets/new?clientId=${client.id}`} className="btn-primary text-sm">
            + Novo Ticket
          </Link>
        </div>
        {client.notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">{client.notes}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Histórico de Tickets ({client.tickets?.length || 0})</h2>
        {client.tickets?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum ticket registado</p>
        ) : (
          <div className="space-y-2">
            {client.tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium">#{ticket.id} - {ticket.title}</p>
                  <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('pt-PT')} • {ticket.tech?.name || 'Sem técnico'}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;