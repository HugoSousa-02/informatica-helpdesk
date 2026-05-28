import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

// Hook personalizado para gerir a conexão Socket.io
export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Conecta ao servidor Socket.io
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      query: { userId: user.id }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket conectado:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    // Limpa a conexão ao desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Função para enviar eventos via socket
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  // Função para ouvir eventos
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Função para parar de ouvir eventos
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { socket: socketRef.current, emit, on, off };
};