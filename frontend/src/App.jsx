import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TicketList from './pages/Tickets/TicketList';
import TicketDetail from './pages/Tickets/TicketDetail';
import NewTicket from './pages/Tickets/NewTicket';
import ClientList from './pages/Clients/ClientList';
import ClientDetail from './pages/Clients/ClientDetail';
import Agenda from './pages/Agenda';
import StockList from './pages/Stock/StockList';
import UserList from './pages/Users/UserList';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Rota pública: Login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/tickets/new" element={<NewTicket />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/stock" element={<StockList />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Redireciona para dashboard por padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;