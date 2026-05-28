import { useState } from 'react';
import { FiSave, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'smtp', label: 'Email (SMTP)' },
    { id: 'google', label: 'Google Calendar' },
    { id: 'push', label: 'Push Notifications' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Configurações guardadas!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        <form onSubmit={handleSave} className="space-y-4">
          {activeTab === 'smtp' && (
            <>
              <p className="text-sm text-gray-500">Configuração do servidor de email para notificações.</p>
              <input type="text" placeholder="SMTP Host" defaultValue={process.env.SMTP_HOST} className="input-field" />
              <input type="number" placeholder="SMTP Port" defaultValue={587} className="input-field" />
              <input type="email" placeholder="Email" className="input-field" />
              <input type="password" placeholder="Password" className="input-field" />
            </>
          )}

          {activeTab === 'google' && (
            <>
              <p className="text-sm text-gray-500">Credenciais OAuth2 da Google Cloud Console.</p>
              <input type="text" placeholder="Google Client ID" className="input-field" />
              <input type="text" placeholder="Google Client Secret" className="input-field" />
              <input type="text" placeholder="Redirect URI" className="input-field" />
            </>
          )}

          {activeTab === 'push' && (
            <>
              <p className="text-sm text-gray-500">Chaves VAPID para Web Push Notifications.</p>
              <input type="text" placeholder="VAPID Public Key" className="input-field" />
              <input type="text" placeholder="VAPID Private Key" className="input-field" />
            </>
          )}

          <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary flex items-center gap-2">
              {saved ? <FiCheck /> : <FiSave />}
              {saved ? 'Guardado!' : 'Guardar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;