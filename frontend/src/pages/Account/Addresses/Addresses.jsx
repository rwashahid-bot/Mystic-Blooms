import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import Modal from '../../../components/Modal/Modal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { authService } from '../../../services/authService';
import { usePageTitle } from '../../../hooks/usePageTitle';
import './Addresses.css';

const blank = { label: 'Home', address: '', city: '', postalCode: '', isDefault: false };

const Addresses = () => {
  usePageTitle('My Addresses');
  const { user, setUser } = useAuth();
  const { settings } = useStore();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    if (!editing.address.trim() || !editing.city.trim()) return toast.error('Address and city are required.');
    try {
      setUser(await authService.saveAddress(user._id, editing));
      toast.success('Address saved');
      setEditing(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setUser(await authService.deleteAddress(user._id, toDelete._id));
    setToDelete(null);
    toast.success('Address removed');
  };

  const addresses = user.addresses || [];

  return (
    <div className="addresses">
      <div className="addresses__head">
        <h2>Saved addresses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...blank })}>
          <FiPlus /> Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon="📍" title="No saved addresses" message="Save an address for faster checkout." />
      ) : (
        <div className="addresses__grid">
          {addresses.map((a) => (
            <div key={a._id} className={`card addresses__card ${a.isDefault ? 'is-default' : ''}`}>
              <div className="addresses__label">
                <strong>{a.label}</strong>
                {a.isDefault && <span className="chip">Default</span>}
              </div>
              <p>{a.address}</p>
              <p className="text-muted">{a.city} {a.postalCode}</p>
              <div className="addresses__actions">
                <button className="icon-btn" onClick={() => setEditing(a)} aria-label="Edit address"><FiEdit2 /></button>
                <button className="icon-btn danger" onClick={() => setToDelete(a)} aria-label="Delete address"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit address' : 'Add address'}>
        {editing && (
          <form onSubmit={save}>
            <div className="form-group">
              <label htmlFor="a-label">Label</label>
              <input id="a-label" className="input" placeholder="Home, Office..." value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="a-address" className="required">Full address</label>
              <textarea id="a-address" className="textarea" rows={2} value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="a-city" className="required">City</label>
                <input id="a-city" className="input" list="city-list" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
                <datalist id="city-list">
                  {settings.deliveryZones.filter((z) => z.city !== 'Other').map((z) => <option key={z.city} value={z.city} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label htmlFor="a-postal">Postal code</label>
                <input id="a-postal" className="input" value={editing.postalCode} onChange={(e) => setEditing({ ...editing, postalCode: e.target.value })} />
              </div>
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />
              Set as default address
            </label>
            <button className="btn btn-primary addresses__save">Save address</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} message={`Delete the address "${toDelete?.label}"?`} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
};

export default Addresses;
