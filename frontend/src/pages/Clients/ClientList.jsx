import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { FiPlus, FiSearch, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '', nif: '', notes: '' });

  useEffect(() => { loadClients(); }, [search]);

  const loadClients = async () => {
    try {
      const params = search ? { search } : {};
      const res = await api.get('/clients', { params });
      setClients(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', newClient);
      toast.success('Cliente criado!');
      setShowModal(false);
      setNewClient({ name: '', email: '', phone: '', address: '', nif: '', notes: '' });
      loadClients();
    } catch (error) {
      toast.error('Erro ao criar cliente');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
          <FiPlus /> Novo Cliente
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <Link key={client.id} to={`/clients/${client.id}`} className="card hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{client.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {client.email && <p className="flex items-center gap-1"><FiMail className="w-3 h-3" /> {client.email}</p>}
                {client.phone && <p className="flex items-center gap-1"><FiPhone className="w-3 h-3" /> {client.phone}</p>}
                <p className="flex items-center gap-1"><FiUser className="w-3 h-3" /> {client._count?.tickets || 0} tickets</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Cliente">
        <form onSubmit={handleCreate} className="space-y-3">
          <input type="text" placeholder="Nome *" value={newClient.name} onChange={e => setNewClient(p => ({...p, name: e.target.value}))} className="input-field" required />
          <input type="email" placeholder="Email" value={newClient.email} onChange={e => setNewClient(p => ({...p, email: e.target.value}))} className="input-field" />
          <input type="text" placeholder="Telefone" value={newClient.phone} onChange={e => setNewClient(p => ({...p, phone: e.target.value}))} className="input-field" />
          <input type="text" placeholder="Morada" value={newClient.address} onChange={e => setNewClient(p => ({...p, address: e.target.value}))} className="input-field" />
          <input type="text" placeholder="NIF" value={newClient.nif} onChange={e => setNewClient(p => ({...p, nif: e.target.value}))} className="input-field" />
          <textarea placeholder="Notas" value={newClient.notes} onChange={e => setNewClient(p => ({...p, notes: e.target.value}))} className="input-field" rows={2} />
          <button type="submit" className="btn-primary w-full">Criar Cliente</button>
        </form>
      </Modal>
    </div>
  );
};

export default ClientList;