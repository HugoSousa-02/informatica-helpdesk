import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import UserForm from './UserForm';
import { FiUserPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Desativar este utilizador?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Utilizador desativado');
      loadUsers();
    } catch (error) {
      toast.error('Erro ao desativar');
    }
  };

  const roleLabels = { admin: 'Admin', tecnico: 'Técnico', recepcao: 'Receção' };

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utilizadores</h1>
        <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <FiUserPlus /> Novo Utilizador
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
              <th className="py-3 px-2">Nome</th>
              <th className="py-3 px-2">Email</th>
              <th className="py-3 px-2">Perfil</th>
              <th className="py-3 px-2">Estado</th>
              <th className="py-3 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 px-2 font-medium">{u.name}</td>
                <td className="py-3 px-2 text-gray-500">{u.email}</td>
                <td className="py-3 px-2">
                  <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'tecnico' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`badge ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-3 px-2 flex gap-2">
                  <button onClick={() => { setEditingUser(u); setShowForm(true); }} className="text-blue-600 hover:text-blue-700">
                    <FiEdit2 />
                  </button>
                  {u.id !== user?.id && u.active && (
                    <button onClick={() => handleDeactivate(u.id)} className="text-red-600 hover:text-red-700">
                      <FiTrash2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}>
        <UserForm
          initialData={editingUser}
          onSuccess={() => { setShowForm(false); loadUsers(); }}
        />
      </Modal>
    </div>
  );
};

export default UserList;