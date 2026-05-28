import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Carrega a preferência de tema do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Alterna modo escuro
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue);
      document.documentElement.classList.toggle('dark', newValue);
      return newValue;
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Conteúdo principal */}
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default Layout;