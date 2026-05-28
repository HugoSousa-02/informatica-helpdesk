import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/tickets/StatusBadge';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

const TicketList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    serviceType: '',
  });

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.priority) activeFilters.priority = filters.priority;
      if (filters.serviceType) activeFilters.serviceType = filters.serviceType;
      if (filters.search) activeFilters.search = filters.search;

      const data = await ticketService.listTickets(activeFilters);
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTickets();
  };

  const priorityBadge = (priority) => {
    const config = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800',
    };
    return config[priority] || '';
  };

  const serviceTypeLabel = {
    loja: '🏪 Loja',
    externo: '🚗 Externo',
    remoto: '🌐 Remoto',
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
        <Link to="/tickets/new" className="btn-primary inline-flex items-center gap-2">
          <FiPlus /> Novo Ticket
        </Link>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar tickets..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="input-field sm:w-40"
          >
            <option value="">Todos os estados</option>
            <option value="aberto">Aberto</option>
            <option value="em_progresso">Em Progresso</option>
            <option value="aguarda_peca">Aguarda Peça</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>
          <select
            value={filters.priority}
            onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="input-field sm:w-36"
          >
            <option value="">Todas as prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
          <button type="submit" className="btn-secondary flex items-center gap-2">
            <FiFilter /> Filtrar
          </button>
        </form>
      </div>

      {/* Tabela */}
      {loading ? (
        <Spinner size="lg" />
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Título</th>
                <th className="py-3 px-2">Cliente</th>
                <th className="py-3 px-2">Prioridade</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2">Tipo</th>
                <th className="py-3 px-2">Técnico</th>
                <th className="py-3 px-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-2">
                    <Link to={`/tickets/${ticket.id}`} className="text-blue-600 font-medium hover:underline">
                      #{ticket.id}
                    </Link>
                  </td>
                  <td className="py-3 px-2">
                    <Link to={`/tickets/${ticket.id}`} className="hover:text-blue-600 transition-colors">
                      <p className="font-medium truncate max-w-[200px]">{ticket.title}</p>
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{ticket.client?.name}</td>
                  <td className="py-3 px-2">
                    <span className={`badge ${priorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-3 px-2 text-xs">{serviceTypeLabel[ticket.serviceType]}</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{ticket.tech?.name || '-'}</td>
                  <td className="py-3 px-2 text-xs text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketList;