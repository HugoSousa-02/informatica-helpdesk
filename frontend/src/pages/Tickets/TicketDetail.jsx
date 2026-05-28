import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/tickets/StatusBadge';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import { FiArrowLeft, FiSend, FiPaperclip } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await ticketService.getTicket(id);
      setTicket(data);
    } catch (error) {
      toast.error('Erro ao carregar ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await ticketService.updateStatus(id, newStatus);
      setTicket(prev => ({ ...prev, ...updated }));
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const note = await ticketService.addNote(id, newNote);
      setTicket(prev => ({ ...prev, notes: [...prev.notes, note] }));
      setNewNote('');
      toast.success('Nota adicionada!');
    } catch (error) {
      toast.error('Erro ao adicionar nota');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await ticketService.uploadAttachment(id, file);
      toast.success('Anexo enviado!');
      loadTicket();
    } catch (error) {
      toast.error('Erro ao enviar anexo');
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!ticket) return null;

  const statusFlow = ['aberto', 'em_progresso', 'aguarda_peca', 'resolvido', 'fechado'];
  const currentIndex = statusFlow.indexOf(ticket.status);

  const tabs = [
    { id: 'notes', label: 'Notas' },
    { id: 'history', label: 'Histórico' },
    { id: 'attachments', label: 'Anexos' },
  ];

  const priorityColors = {
    baixa: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-orange-100 text-orange-800',
    urgente: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <button onClick={() => navigate('/tickets')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
        <FiArrowLeft /> Voltar para tickets
      </button>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              #{ticket.id} - {ticket.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Cliente: <span className="font-medium text-gray-900 dark:text-white">{ticket.client?.name}</span>
              {ticket.client?.phone && ` • ${ticket.client.phone}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Informações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Equipamento:</span>
            <p className="font-medium">{ticket.equipment || 'N/D'}</p>
          </div>
          <div>
            <span className="text-gray-500">Tipo:</span>
            <p className="font-medium">{ticket.serviceType === 'externo' ? '🚗 Externo' : ticket.serviceType === 'remoto' ? '🌐 Remoto' : '🏪 Loja'}</p>
          </div>
          <div>
            <span className="text-gray-500">Técnico:</span>
            <p className="font-medium">{ticket.tech?.name || 'Não atribuído'}</p>
          </div>
          <div>
            <span className="text-gray-500">Criado por:</span>
            <p className="font-medium">{ticket.creator?.name}</p>
          </div>
        </div>

        {ticket.clientAddress && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-500">📍 Morada: </span>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(ticket.clientAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              {ticket.clientAddress}
            </a>
          </div>
        )}

        <div className="mt-4">
          <span className="text-sm text-gray-500">Descrição:</span>
          <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Alterar Status */}
      <div className="card mb-6">
        <h3 className="text-sm font-medium mb-3">Alterar Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusFlow.map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={ticket.status === status}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                ticket.status === status
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
              }`}
            >
              <StatusBadge status={status} />
            </button>
          ))}
        </div>
      </div>

      {/* Tabs: Notas, Histórico, Anexos */}
      <div className="card">
        <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notas */}
        {activeTab === 'notes' && (
          <div>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {ticket.notes?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Sem notas</p>
              ) : (
                ticket.notes?.map(note => (
                  <div key={note.id} className={`p-3 rounded-lg ${note.isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{note.user?.name}</span>
                      <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString('pt-PT')}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                    {note.isInternal && <span className="text-xs text-yellow-600 mt-1 block">🔒 Nota interna</span>}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Adicionar nota..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary flex items-center gap-1">
                <FiSend /> Enviar
              </button>
            </form>
          </div>
        )}

        {/* Histórico */}
        {activeTab === 'history' && <TicketTimeline history={ticket.history} />}

        {/* Anexos */}
        {activeTab === 'attachments' && (
          <div>
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer mb-4">
              <FiPaperclip /> Adicionar anexo
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            {ticket.attachments?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Sem anexos</p>
            ) : (
              <div className="space-y-2">
                {ticket.attachments?.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{att.filename}</p>
                      <p className="text-xs text-gray-500">{att.uploader?.name} • {new Date(att.createdAt).toLocaleDateString('pt-PT')}</p>
                    </div>
                    <a href={`/${att.path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                      Abrir
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;