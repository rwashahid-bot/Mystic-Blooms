import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiSearch } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import Modal from '../../../components/Modal/Modal';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { adminService } from '../../../services/adminService';
import { exportCsv } from '../../../utils/exportCsv';
import { formatDate, formatPrice } from '../../../utils/format';
import './Customers.css';

const Customers = () => {
  const { user } = useAuth();
  const { data: customers, loading, reload } = useAsync(() => adminService.customers(), []);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('spend');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');

  const list = useMemo(() => {
    if (!customers) return [];
    const query = q.toLowerCase();
    const sorters = {
      spend: (a, b) => b.totalSpend - a.totalSpend,
      orders: (a, b) => b.orderCount - a.orderCount,
      recent: (a, b) => String(b.lastOrder).localeCompare(String(a.lastOrder)),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return customers.filter((c) => `${c.name} ${c.phone} ${c.email} ${c.city}`.toLowerCase().includes(query)).sort(sorters[sort]);
  }, [customers, q, sort]);

  if (loading) return <Loader />;

  const open = (c) => {
    setSelected(c);
    setNotes(c.notes || '');
  };

  const saveNotes = async () => {
    try {
      await adminService.saveCustomerNote(selected._id, notes, user.email);
      toast.success('Notes saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const doExport = () =>
    exportCsv(
      list.map((c) => ({ Name: c.name, Phone: c.phone, Email: c.email, City: c.city, Registered: c.registered ? 'Yes' : 'Guest', Orders: c.orderCount, 'Total spend': c.totalSpend, 'Last order': c.lastOrder ? formatDate(c.lastOrder) : '' })),
      'customers.csv'
    );

  return (
    <div className="customers-admin">
      <AdminPageHeader title="Customers" subtitle={`${customers.length} customers (registered + guest checkouts)`}>
        <button className="btn btn-light btn-sm" onClick={doExport}><FiDownload /> Export</button>
      </AdminPageHeader>

      <div className="card customers-admin__bar">
        <div className="customers-admin__search">
          <FiSearch />
          <input className="input" placeholder="Search name, phone, email, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
        </div>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="spend">Top spenders</option>
          <option value="orders">Most orders</option>
          <option value="recent">Recent orders</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Orders</th><th>Total spend</th><th>Last order</th><th></th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td>
                  <strong>{c.name}</strong> {c.registered ? <span className="chip">Account</span> : <span className="customers-admin__guest">Guest</span>}
                  {c.email && <><br /><small className="text-muted">{c.email}</small></>}
                </td>
                <td>{c.phone}</td>
                <td>{c.city || '—'}</td>
                <td>{c.orderCount}</td>
                <td><strong>{formatPrice(c.totalSpend)}</strong></td>
                <td>{c.lastOrder ? formatDate(c.lastOrder) : '—'}</td>
                <td><button className="btn btn-light btn-sm" onClick={() => open(c)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {selected && (
          <div className="customers-admin__detail">
            <div className="customers-admin__info">
              <p><strong>Phone:</strong> <a href={`tel:${selected.phone}`}>{selected.phone}</a></p>
              {selected.email && <p><strong>Email:</strong> {selected.email}</p>}
              <p><strong>Orders:</strong> {selected.orderCount} · <strong>Spend:</strong> {formatPrice(selected.totalSpend)}</p>
            </div>

            {selected.addresses.length > 0 && (
              <>
                <h4>Saved addresses</h4>
                <ul className="customers-admin__addr">
                  {selected.addresses.map((a) => <li key={a._id}><strong>{a.label}:</strong> {a.address}, {a.city}</li>)}
                </ul>
              </>
            )}

            <h4>Order history</h4>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {selected.orders.map((o) => (
                    <tr key={o._id}>
                      <td><Link to={`/admin/orders/${o._id}`} className="customers-admin__link">{o.orderNumber}</Link></td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                  {selected.orders.length === 0 && <tr><td colSpan={4} className="text-muted">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>

            {selected.registered && (
              <>
                <h4>Private notes</h4>
                <textarea className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, allergies to scents, VIP…" aria-label="Customer notes" />
                <button className="btn btn-primary btn-sm customers-admin__save" onClick={saveNotes}>Save notes</button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
