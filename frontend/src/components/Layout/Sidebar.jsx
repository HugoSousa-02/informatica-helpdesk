import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiHome, FiClipboard, FiUsers, FiCalendar,
  FiPackage, FiSettings, FiUser, FiSun, FiMoon
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose, darkMode, toggleDarkMode }) => {
  const { user, hasRole } = useAuth();

  // Links do menu baseados no perfil do utilizador
  const menuItems = [
    { to: '/', icon: FiHome, label: 'Dashboard', roles: ['admin', 'tecnico', 'recepcao'] },
    { to: '/tickets', icon: FiClipboard, label: 'Tickets', roles: ['admin', 'tecnico', 'recepcao'] },
    { to: '/clients', icon: FiUsers, label: 'Clientes', roles: ['admin', 'tecnico', 'recepcao'] },
    { to: '/agenda', icon: FiCalendar, label: 'Agenda', roles: ['admin', 'tecnico', 'recepcao'] },
    { to: '/stock', icon: FiPackage, label: 'Stock', roles: ['admin', 'tecnico'] },
    { to: '/users', icon: FiUser, label: 'Utilizadores', roles: ['admin'] },
    { to: '/settings', icon: FiSettings, label: 'Configurações', roles: ['admin'] },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiClipboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">HelpDesk</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestão Informática</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems
            .filter(item => item.roles.includes(user?.role))
            .map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        {/* Rodapé: modo escuro */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;