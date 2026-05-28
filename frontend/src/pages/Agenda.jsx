import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('pt');
const localizer = momentLocalizer(moment);

const Agenda = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [techFilter, setTechFilter] = useState('');
  const [techs, setTechs] = useState([]);

  const loadEvents = useCallback(async () => {
    try {
      const params = {};
      if (techFilter) params.techId = techFilter;
      const res = await api.get('/agenda/events', { params });
      const formatted = res.data.map(event => ({
        ...event,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [techFilter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    if (user?.role !== 'tecnico') {
      api.get('/users').then(res => {
        setTechs(res.data.filter(u => u.role === 'tecnico' && u.active));
      });
    }
  }, [user]);

  const eventStyleGetter = (event) => {
    const colors = {
      urgente: { bg: '#fecaca', text: '#991b1b' },
      alta: { bg: '#fed7aa', text: '#9a3412' },
      media: { bg: '#fef08a', text: '#854d0e' },
      baixa: { bg: '#bbf7d0', text: '#166534' },
    };
    const color = colors[event.priority] || colors.media;
    if (event.status === 'resolvido' || event.status === 'fechado') {
      return { style: { backgroundColor: '#e5e7eb', color: '#6b7280', textDecoration: 'line-through' } };
    }
    return { style: { backgroundColor: color.bg, color: color.text, borderRadius: '6px' } };
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Agenda</h1>
      <div className="card mb-4">
        {user?.role !== 'tecnico' && (
          <select value={techFilter} onChange={e => setTechFilter(e.target.value)} className="input-field w-48">
            <option value="">Todos os técnicos</option>
            {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>
      <div className="card" style={{ height: 'calc(100vh - 250px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={event => navigate(`/tickets/${event.id}`)}
          views={['month', 'week', 'day']}
          defaultView="week"
          messages={{
            today: 'Hoje',
            previous: 'Anterior',
            next: 'Seguinte',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
          }}
        />
      </div>
    </div>
  );
};

export default Agenda;