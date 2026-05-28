import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../../hooks/useNotifications';

// Componente do sino de notificações (versão standalone)
const NotificationBell = ({ onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Notificações"
    >
      <FiBell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;