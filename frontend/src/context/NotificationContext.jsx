import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Conecta ao Socket.io quando o utilizador faz login
  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      query: { userId: user.id }
    });

    // Recebe notificações em tempo real
    socket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Notificação marcada como lida
    socket.on('notificationRead', (id) => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // Carrega notificações existentes
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(console.error);

    // Conta não lidas
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count))
      .catch(console.error);

    return () => socket.disconnect();
  }, [user]);

  // Marca uma notificação como lida
  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Marca todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);