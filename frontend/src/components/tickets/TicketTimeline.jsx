import { FiUser, FiClock } from 'react-icons/fi';

// Componente que mostra a timeline de histórico de alterações do ticket
const TicketTimeline = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-gray-500 text-center py-8">Sem histórico registado</p>;
  }

  const statusLabels = {
    aberto: 'Aberto',
    em_progresso: 'Em Progresso',
    aguarda_peca: 'Aguarda Peça',
    resolvido: 'Resolvido',
    fechado: 'Fechado'
  };

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          {/* Linha da timeline */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 pb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">
                  {entry.user?.name || 'Utilizador'}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiClock className="w-3 h-3" />
                  <span>{new Date(entry.changedAt).toLocaleString('pt-PT')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entry.oldStatus && entry.newStatus ? (
                  <>
                    Alterou de <span className="font-medium">{statusLabels[entry.oldStatus] || entry.oldStatus}</span>
                    {' '}para{' '}
                    <span className="font-medium">{statusLabels[entry.newStatus] || entry.newStatus}</span>
                  </>
                ) : (
                  <>
                    Criou o ticket com status <span className="font-medium">{statusLabels[entry.newStatus] || entry.newStatus}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketTimeline;