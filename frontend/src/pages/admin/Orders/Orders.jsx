import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiDownload, FiSearch } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { useStore } from '../../../context/StoreContext';
import { useAsync } from '../../../hooks/useAsync';
import { orderService } from '../../../services/orderService';
import { exportCsv } from '../../../utils/exportCsv';
import { toISODate } from '../../../utils/dates';
import { formatDate, formatDateTime, formatPrice, optionsToText, paymentLabel } from '../../../utils/format';
import './Orders.css';

const PAYMENT_STATUSES = ['Unpaid', 'Awaiting Verification', 'Partially Paid', 'Paid', 'Refunded', 'Failed'];
const PAGE_SIZE = 15;

const Orders = () => {
  const { settings } = useStore();
  const [params] = useSearchParams();
  const { data: orders, loading } = useAsync(() => orderService.list(), []);
  const [filters, setFilters] = useState({ q: '', status: params.get('status') || '', payment: '', city: '', from: '', to: '' });
  const [page, setPage] = useState(1);

  const set = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.value });
    setPage(1);
  };

  const cities = useMemo(() => [...new Set((orders || []).map((o) => o.shipping.city))].sort(), [orders]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = filters.q.trim().toLowerCase();
    return orders
      .filter((o) => {
        const d = toISODate(o.createdAt);
        return (
          (!q || [o.orderNumber, o.customer.name, o.customer.phone].join(' ').toLowerCase().includes(q)) &&
          (!filters.status || o.status === filters.status) &&
          (!filters.payment || o.payment.status === filters.payment) &&
          (!filters.city || o.shipping.city === filters.city) &&
          (!filters.from || d >= filters.from) &&
          (!filters.to || d <= filters.to)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const doExport = () =>
    exportCsv(
      filtered.map((o) => ({
        'Order #': o.orderNumber,
        'Placed at': formatDateTime(o.createdAt),
        Customer: o.customer.name,
        Phone: o.customer.phone,
        Email: o.customer.email,
        Address: o.shipping.address,
        City: o.shipping.city,
        'Postal code': o.shipping.postalCode,
        'Requested date': o.requestedDate,
        Items: o.items.map((i) => `${i.quantity}x ${i.name}${optionsToText(i.options) ? ` (${optionsToText(i.options)})` : ''}`).join('; '),
        Subtotal: o.subtotal,
        Discount: o.discount,
        Coupon: o.couponCode,
        'Delivery fee': o.deliveryFee,
        Total: o.total,
        'Payment method': paymentLabel(o.payment.method),
        'Payment status': o.payment.status,
        'Payment ref': o.payment.reference,
        Status: o.status,
        Courier: o.courier?.name,
        Tracking: o.courier?.tracking,
      })),
      `orders-${toISODate(new Date())}.csv`
    );

  if (loading) return <Loader />;

  return (
    <div className="orders-admin">
      <AdminPageHeader title="Orders" subtitle={`${filtered.length} of ${orders.length} orders`}>
        <button className="btn btn-outline btn-sm" onClick={doExport} disabled={!filtered.length}>
          <FiDownload /> Export CSV
        </button>
      </AdminPageHeader>

      <div className="orders-admin__filters card">
        <div className="orders-admin__search">
          <FiSearch />
          <input className="input" placeholder="Search order #, name or phone" value={filters.q} onChange={set('q')} aria-label="Search orders" />
        </div>
        <select className="select" value={filters.status} onChange={set('status')} aria-label="Order status">
          <option value="">All statuses</option>
          {settings.orderStatuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="select" value={filters.payment} onChange={set('payment')} aria-label="Payment status">
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="select" value={filters.city} onChange={set('city')} aria-label="City">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="date" className="input" value={filters.from} onChange={set('from')} aria-label="From date" />
        <input type="date" className="input" value={filters.to} onChange={set('to')} aria-label="To date" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="No orders match" message="Try clearing some filters." />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Deliver on</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o._id} className={!o.seen && o.status === 'New' ? 'orders-admin__unseen' : ''}>
                    <td><Link to={`/admin/orders/${o._id}`} className="orders-admin__link">{o.orderNumber}</Link></td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      {o.customer.name}
                      <br />
                      <small className="text-muted">{o.customer.phone}</small>
                    </td>
                    <td>{o.shipping.city}</td>
                    <td>{formatDate(o.requestedDate)}</td>
                    <td><strong>{formatPrice(o.total)}</strong></td>
                    <td>
                      <small className="text-muted">{paymentLabel(o.payment.method)}</small>
                      <br />
                      <StatusBadge status={o.payment.status} />
                    </td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="orders-admin__pager">
              <button className="btn btn-light btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button className="btn btn-light btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
