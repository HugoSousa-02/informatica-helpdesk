import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { FiUser, FiMail, FiLock, FiCheck, FiAlertCircle } from 'react-icons/fi';

const Profile = () => {
  const { user, login: refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState(null);

  // Dados do perfil
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await authService.updateProfile(profile);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao atualizar perfil' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'As passwords não coincidem' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A password deve ter pelo menos 6 caracteres' });
      return;
    }

    try {
      await authService.changePassword(passwords.currentPassword, passwords.newPassword);
      setMessage({ type: 'success', text: 'Password alterada com sucesso!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao alterar password' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: FiUser },
    { id: 'password', label: 'Password', icon: FiLock },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">O Meu Perfil</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mensagem */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Formulário Perfil */}
      {activeTab === 'profile' && (
        <div className="card">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                <FiUser className="inline mr-1" /> Nome
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <FiMail className="inline mr-1" /> Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Guardar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulário Password */}
      {activeTab === 'password' && (
        <div className="card">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password Atual</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={e => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nova Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                className="input-field"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Nova Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={e => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-field"
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Alterar Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;