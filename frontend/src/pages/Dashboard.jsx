import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import StatusBadge from '../components/tickets/StatusBadge';
import {
  FiClipboard, FiClock, FiAlertTriangle, FiPackage,
  FiArrowRight, FiCalendar
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [todayAgenda, setTodayAgenda] = useState([]);
  const [criticalStock, setCriticalStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Carrega estatísticas, tickets recentes, agenda de hoje e stock crítico
        const ticketsRes = await api.get('/tickets');
        const allTickets = ticketsRes.data;

        // Calcula estatísticas
        setStats({
          aberto: allTickets.filter(t => t.status === 'aberto').length,
          emProgresso: allTickets.filter(t => t.status === 'em_progresso').length,
          urgente: allTickets.filter(t => t.priority === 'urgente' && t.status !== 'fechado').length,
          total: allTickets.length,
        });

        // Últimos 5 tickets atualizados
        const sorted = [...allTickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRecentTickets(sorted.slice(0, 5));

        // Agenda de hoje (serviços externos)
        const agendaRes = await api.get('/agenda/today');
        setTodayAgenda(agendaRes.data);

        // Stock crítico
        try {
          const stockRes = await api.get('/stock/items/critical');
          setCriticalStock(stockRes.data);
        } catch (err) {
          // Receção não tem acesso a stock
          setCriticalStock([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <Spinner size="lg" />;

  // Cards do dashboard
  const cards = [
    { label: 'Tickets Abertos', value: stats?.aberto || 0, icon: FiClipboard, color: 'blue', to: '/tickets?status=aberto' },
    { label: 'Em Progresso', value: stats?.emProgresso || 0, icon: FiClock, color: 'yellow', to: '/tickets?status=em_progresso' },
    { label: 'Urgentes', value: stats?.urgente || 0, icon: FiAlertTriangle, color: 'red', to: '/tickets?priority=urgente' },
    { label: 'Stock Crítico', value: criticalStock.length, icon: FiPackage, color: 'orange', to: '/stock' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
        <span className="text-lg font-normal text-gray-500 ml-2">Bem-vindo, {user?.name}</span>
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.label} to={card.to} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${colorClasses[card.color]}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimos Tickets</h2>
            <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver todos <FiArrowRight />
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum ticket encontrado</p>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">#{ticket.id} - {ticket.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ticket.client?.name}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Agenda de Hoje */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              <FiCalendar className="inline mr-2" />
              Agenda de Hoje
            </h2>
            <Link to="/agenda" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Calendário <FiArrowRight />
            </Link>
          </div>
          {todayAgenda.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Sem serviços externos hoje</p>
          ) : (
            <div className="space-y-2">
              {todayAgenda.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">#{ticket.id} - {ticket.client?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ticket.scheduledAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {ticket.tech?.name || 'Sem técnico'}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Crítico (só admin e técnico) */}
      {criticalStock.length > 0 && user?.role !== 'recepcao' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-red-600">🚨 Stock em Nível Crítico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Item</th>
                  <th className="text-left py-2">Referência</th>
                  <th className="text-right py-2">Quantidade</th>
                  <th className="text-right py-2">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {criticalStock.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2 text-gray-500">{item.reference || '-'}</td>
                    <td className="py-2 text-right text-red-600 font-bold">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-500">{item.minQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;