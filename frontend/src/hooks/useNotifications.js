import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

// Hook personalizado para aceder ao contexto de notificações
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
};