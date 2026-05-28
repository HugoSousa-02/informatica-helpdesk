import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

// Componente que protege as rotas - redireciona para login se não autenticado
const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // Mostra spinner enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza as rotas filhas
  return <Outlet />;
};

export default PrivateRoute;