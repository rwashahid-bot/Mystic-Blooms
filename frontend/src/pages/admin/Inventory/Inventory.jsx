import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSliders } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import Modal from '../../../components/Modal/Modal';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { useAsync } from '../../../hooks/useAsync';
import { productService } from '../../../services/productService';
import { orderService } from '../../../services/orderService';
import { addDays, toISODate } from '../../../utils/dates';
import { formatDate, formatDateTime } from '../../../utils/format';
import './Inventory.css';

const REASONS = ['Restock', 'Damaged', 'Correction', 'Gifted / sample', 'Returned'];

const Inventory = () => {
  const { user } = useAuth();
  const { settings, refresh } = useStore();
  const { data, loading, reload } = useAsync(async () => {
    const [products, log, capacity] = await Promise.all([productService.list({ admin: true }), productService.inventoryLog(), orderService.capacity()]);
    return { products, log, capacity };
  }, []);
  const [adjust, setAdjust] = useState(null);
  const [tab, setTab] = useState('stock');

  if (loading) return <Loader />;

  const readyMade = data.products.filter((p) => p.type === 'ready-made');
  const madeToOrder = data.products.filter((p) => p.type !== 'ready-made');
  const productName = (id) => data.products.find((p) => p._id === id)?.name || 'Deleted product';

  const submitAdjust = async (e) => {
    e.preventDefault();
    const change = Number(adjust.change);
    if (!change) return toast.error('Enter a non-zero quantity.');
    await productService.adjustStock(adjust.product._id, change, adjust.reason, user.email);
    toast.success('Stock updated');
    setAdjust(null);
    reload();
  };

  const toggleAvailable = async (p) => {
    await productService.update(p._id, { available: !p.available }, user.email);
    toast.success(p.available ? `${p.name} paused` : `${p.name} available again`);
    reload();
    refresh();
  };

  // Next 21 days of production capacity
  const days = Array.from({ length: 21 }, (_, i) => toISODate(addDays(new Date(), i)));

  return (
    <div className="inventory">
      <AdminPageHeader title="Inventory & Availability" subtitle="Stock for ready-made items, availability for made-to-order items, and booking capacity." />

      <div className="inventory__tabs" role="tablist">
        {[
          ['stock', `Ready-made stock (${readyMade.length})`],
          ['mto', `Made-to-order (${madeToOrder.length})`],
          ['capacity', 'Capacity calendar'],
          ['log', 'Movement history'],
        ].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'stock' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Low-stock alert</th><th>Available</th><th></th></tr></thead>
            <tbody>
              {readyMade.map((p) => {
                const low = (p.stock ?? 0) <= p.lowStockThreshold;
                return (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.sku}</td>
                    <td><span className={`inventory__stock ${p.stock === 0 ? 'is-out' : low ? 'is-low' : ''}`}>{p.stock}</span></td>
                    <td>≤ {p.lowStockThreshold}</td>
                    <td>
                      <label className="inventory__switch">
                        <input type="checkbox" checked={p.available} onChange={() => toggleAvailable(p)} />
                        <span />
                      </label>
                    </td>
                    <td>
                      <button className="btn btn-light btn-sm" onClick={() => setAdjust({ product: p, change: '', reason: 'Restock' })}>
                        <FiSliders /> Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'mto' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Product</th><th>Type</th><th>Lead time</th><th>Sold</th><th>Taking orders</th></tr></thead>
            <tbody>
              {madeToOrder.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.type === 'custom' ? 'Custom enquiry' : 'Made to order'}</td>
                  <td>{p.leadTimeDays} days</td>
                  <td>{p.sold || 0}</td>
                  <td>
                    <label className="inventory__switch">
                      <input type="checkbox" checked={p.available} onChange={() => toggleAvailable(p)} />
                      <span />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'capacity' && (
        <div className="card">
          <p className="field-hint">
            Daily capacity: <strong>{settings.dailyCapacity || 'unlimited'}</strong> orders per delivery date. Change it (and blocked dates) in Settings.
          </p>
          <div className="inventory__calendar">
            {days.map((d) => {
              const n = data.capacity[d] || 0;
              const blocked = settings.blockedDates.includes(d);
              const full = settings.dailyCapacity && n >= settings.dailyCapacity;
              return (
                <div key={d} className={`inventory__day ${blocked ? 'is-blocked' : full ? 'is-full' : n ? 'is-busy' : ''}`}>
                  <span>{formatDate(d, { year: undefined, weekday: 'short' })}</span>
                  <strong>{blocked ? 'Blocked' : `${n}${settings.dailyCapacity ? ` / ${settings.dailyCapacity}` : ''}`}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Product</th><th>Change</th><th>Stock after</th><th>Reason</th><th>By</th></tr></thead>
            <tbody>
              {data.log.length === 0 && <tr><td colSpan={6} className="text-muted">No stock movements yet.</td></tr>}
              {data.log.map((l) => (
                <tr key={l._id}>
                  <td>{formatDateTime(l.at)}</td>
                  <td>{productName(l.productId)}</td>
                  <td className={l.change > 0 ? 'text-success' : 'text-danger'}>{l.change > 0 ? `+${l.change}` : l.change}</td>
                  <td>{l.stockAfter}</td>
                  <td>{l.reason}</td>
                  <td className="text-muted">{l.by || 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!adjust} onClose={() => setAdjust(null)} title={`Adjust stock — ${adjust?.product.name}`} size="sm">
        {adjust && (
          <form onSubmit={submitAdjust}>
            <p className="field-hint">Current stock: {adjust.product.stock}. Use a negative number to remove stock.</p>
            <div className="form-group inventory__adjust">
              <label htmlFor="adj-qty">Quantity change</label>
              <input id="adj-qty" type="number" className="input" value={adjust.change} onChange={(e) => setAdjust({ ...adjust, change: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="adj-reason">Reason</label>
              <select id="adj-reason" className="select" value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })}>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-block">Save adjustment</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
