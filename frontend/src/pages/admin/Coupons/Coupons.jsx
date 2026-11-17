import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import Modal from '../../../components/Modal/Modal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { couponService } from '../../../services/marketingService';
import { formatDate, formatPrice } from '../../../utils/format';
import './Coupons.css';

const blank = { code: '', type: 'percent', value: 10, minOrder: 0, startDate: '', endDate: '', usageLimit: 0, active: true, freeDelivery: false };

const Coupons = () => {
  const { user } = useAuth();
  const { data: coupons, loading, reload } = useAsync(() => couponService.list(), []);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  if (loading) return <Loader />;

  const save = async (e) => {
    e.preventDefault();
    if (!/^[A-Z0-9_-]{3,20}$/i.test(editing.code)) return toast.error('Code must be 3–20 letters/numbers.');
    if (editing.type === 'percent' && (editing.value <= 0 || editing.value > 100)) return toast.error('Percentage must be 1–100.');
    if (editing.endDate && editing.startDate && editing.endDate < editing.startDate) return toast.error('End date must be after start date.');
    const payload = { ...editing, value: Number(editing.value) || 0, minOrder: Number(editing.minOrder) || 0, usageLimit: Number(editing.usageLimit) || 0 };
    delete payload._id;
    try {
      if (editing._id) await couponService.update(editing._id, payload, user.email);
      else await couponService.create(payload, user.email);
      toast.success('Coupon saved');
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const describe = (c) => {
    const parts = [];
    if (c.value) parts.push(c.type === 'percent' ? `${c.value}% off` : `${formatPrice(c.value)} off`);
    if (c.freeDelivery) parts.push('Free delivery');
    return parts.join(' + ') || '—';
  };

  const isExpired = (c) => c.endDate && c.endDate < new Date().toISOString().slice(0, 10);

  return (
    <div className="coupons-admin">
      <AdminPageHeader title="Coupons & Promotions" subtitle="Only one coupon can be used per order (no stacking).">
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...blank })}><FiPlus /> New coupon</button>
      </AdminPageHeader>

      {coupons.length === 0 ? (
        <EmptyState icon="🏷️" title="No coupons yet" actionText="Create coupon" onAction={() => setEditing({ ...blank })} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Code</th><th>Discount</th><th>Min. order</th><th>Valid</th><th>Usage</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><code className="coupons-admin__code">{c.code}</code></td>
                  <td>{describe(c)}</td>
                  <td>{c.minOrder ? formatPrice(c.minOrder) : '—'}</td>
                  <td>{c.startDate || c.endDate ? `${c.startDate ? formatDate(c.startDate) : '…'} → ${c.endDate ? formatDate(c.endDate) : '…'}` : 'Always'}</td>
                  <td>{c.used}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td><StatusBadge status={isExpired(c) ? 'expired' : c.active ? 'active' : 'inactive'} tone={isExpired(c) ? 'danger' : undefined} /></td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => setEditing({ ...c })} aria-label="Edit"><FiEdit2 /></button>
                    <button className="icon-btn danger" onClick={() => setToDelete(c)} aria-label="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit coupon' : 'New coupon'}>
        {editing && (
          <form onSubmit={save}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cp-code" className="required">Code</label>
                <input id="cp-code" className="input" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-group">
                <label htmlFor="cp-type">Discount type</label>
                <select id="cp-type" className="select" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed amount (Rs.)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cp-value">{editing.type === 'percent' ? 'Percent off' : 'Amount off (Rs.)'}</label>
                <input id="cp-value" type="number" min="0" className="input" value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="cp-min">Minimum order (Rs.)</label>
                <input id="cp-min" type="number" min="0" className="input" value={editing.minOrder} onChange={(e) => setEditing({ ...editing, minOrder: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cp-start">Start date</label>
                <input id="cp-start" type="date" className="input" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="cp-end">End date</label>
                <input id="cp-end" type="date" className="input" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cp-limit">Usage limit (0 = unlimited)</label>
              <input id="cp-limit" type="number" min="0" className="input" value={editing.usageLimit} onChange={(e) => setEditing({ ...editing, usageLimit: e.target.value })} />
            </div>
            <div className="coupons-admin__checks">
              <label className="checkbox"><input type="checkbox" checked={editing.freeDelivery} onChange={(e) => setEditing({ ...editing, freeDelivery: e.target.checked })} /> Also gives free delivery</label>
              <label className="checkbox"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
            <button className="btn btn-primary">Save coupon</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete coupon ${toDelete?.code}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          await couponService.remove(toDelete._id, user.email);
          setToDelete(null);
          toast.success('Coupon deleted');
          reload();
        }}
      />
    </div>
  );
};

export default Coupons;
