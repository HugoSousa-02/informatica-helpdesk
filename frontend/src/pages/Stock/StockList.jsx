import { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import MovementForm from './MovementForm';
import { FiPlus, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StockList = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewItem, setShowNewItem] = useState(false);
  const [showMovement, setShowMovement] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', reference: '', category: '', quantity: 0, minQuantity: 5, supplier: '', costPrice: '' });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await stockService.listItems();
      setItems(data);
    } catch (error) {
      toast.error('Erro ao carregar stock');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await stockService.createItem(newItem);
      toast.success('Item criado!');
      setShowNewItem(false);
      setNewItem({ name: '', reference: '', category: '', quantity: 0, minQuantity: 5, supplier: '', costPrice: '' });
      loadItems();
    } catch (error) {
      toast.error('Erro ao criar item');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowNewItem(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Novo Item
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
              <th className="py-3 px-2">Item</th>
              <th className="py-3 px-2">Referência</th>
              <th className="py-3 px-2">Categoria</th>
              <th className="py-3 px-2">Qtd</th>
              <th className="py-3 px-2">Mín</th>
              <th className="py-3 px-2">Fornecedor</th>
              <th className="py-3 px-2">Preço</th>
              <th className="py-3 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isCritical = item.quantity <= item.minQuantity;
              return (
                <tr key={item.id} className={`border-b border-gray-100 dark:border-gray-700 ${isCritical ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                  <td className="py-3 px-2 font-medium">
                    {isCritical && <FiAlertTriangle className="inline text-red-500 mr-1" />}
                    {item.name}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{item.reference || '-'}</td>
                  <td className="py-3 px-2">{item.category || '-'}</td>
                  <td className={`py-3 px-2 font-bold ${isCritical ? 'text-red-600' : ''}`}>{item.quantity}</td>
                  <td className="py-3 px-2 text-gray-500">{item.minQuantity}</td>
                  <td className="py-3 px-2">{item.supplier || '-'}</td>
                  <td className="py-3 px-2">{item.costPrice ? `${item.costPrice}€` : '-'}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => setShowMovement({ itemId: item.id, itemName: item.name })} className="text-blue-600 hover:underline text-xs">
                      <FiPackage className="inline mr-1" />Movimento
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showNewItem} onClose={() => setShowNewItem(false)} title="Novo Item de Stock">
        <form onSubmit={handleCreateItem} className="space-y-3">
          <input type="text" placeholder="Nome *" value={newItem.name} onChange={e => setNewItem(p => ({...p, name: e.target.value}))} className="input-field" required />
          <input type="text" placeholder="Referência" value={newItem.reference} onChange={e => setNewItem(p => ({...p, reference: e.target.value}))} className="input-field" />
          <input type="text" placeholder="Categoria" value={newItem.category} onChange={e => setNewItem(p => ({...p, category: e.target.value}))} className="input-field" />
          <input type="number" placeholder="Quantidade inicial" value={newItem.quantity} onChange={e => setNewItem(p => ({...p, quantity: parseInt(e.target.value)}))} className="input-field" />
          <input type="number" placeholder="Quantidade mínima" value={newItem.minQuantity} onChange={e => setNewItem(p => ({...p, minQuantity: parseInt(e.target.value)}))} className="input-field" />
          <input type="text" placeholder="Fornecedor" value={newItem.supplier} onChange={e => setNewItem(p => ({...p, supplier: e.target.value}))} className="input-field" />
          <input type="number" step="0.01" placeholder="Preço de custo" value={newItem.costPrice} onChange={e => setNewItem(p => ({...p, costPrice: e.target.value}))} className="input-field" />
          <button type="submit" className="btn-primary w-full">Criar Item</button>
        </form>
      </Modal>

      <Modal isOpen={!!showMovement} onClose={() => setShowMovement(null)} title={`Movimento - ${showMovement?.itemName || ''}`}>
        {showMovement && (
          <MovementForm
            itemId={showMovement.itemId}
            onSuccess={() => { setShowMovement(null); loadItems(); }}
          />
        )}
      </Modal>
    </div>
  );
};

export default StockList;