import { useState } from 'react';
import { authService } from '../../services/authService';
import api from '../../services/api';
import { toast } from 'react-toastify';

const UserForm = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'tecnico',
    active: initialData?.active !== undefined ? initialData.active : true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/users/${initialData.id}`, form);
        toast.success('Utilizador atualizado!');
      } else {
        await authService.createUser(form);
        toast.success('Utilizador criado!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao guardar utilizador');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" placeholder="Nome *" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required />
      <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input-field" required />
      {!isEditing && (
        <input type="password" placeholder="Password *" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} className="input-field" required minLength={6} />
      )}
      <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} className="input-field">
        <option value="tecnico">Técnico</option>
        <option value="recepcao">Receção</option>
        <option value="admin">Admin</option>
      </select>
      {isEditing && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({...p, active: e.target.checked}))} className="rounded" />
          Ativo
        </label>
      )}
      <button type="submit" className="btn-primary w-full">
        {isEditing ? 'Atualizar' : 'Criar Utilizador'}
      </button>
    </form>
  );
};

export default UserForm;