import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

// Cria o contexto de autenticação
export const AuthContext = createContext();

// Provider que envolve toda a aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao carregar a página, verifica se existe token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getProfile()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Função de login
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Verifica se o utilizador tem um determinado perfil
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);