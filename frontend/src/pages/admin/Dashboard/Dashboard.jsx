import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiClock, FiTool, FiCheckCircle, FiXCircle, FiDollarSign, FiCreditCard, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatCard from '../../../components/admin/StatCard/StatCard';
import BarChart from '../../../components/admin/BarChart/BarChart';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { orderService } from '../../../services/orderService';
import { productService } from '../../../services/productService';
import { RANGE_PRESETS, filterByRange, resolveRange, salesByDay, summarize, topProducts } from '../../../utils/analytics';
import { toISODate } from '../../../utils/dates';
import { formatDate, formatPrice } from '../../../utils/format';
import './Dashboard.css';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [preset, setPreset] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });

  const { data, loading } = useAsync(async () => {
    const [orders, products] = await Promise.all([orderService.list(), hasPermission('inventory') ? productService.list({ admin: true }) : []]);
    return { orders, products };
  }, []);

  const range = resolveRange(preset, custom);
  const view = useMemo(() => {
    if (!data) return null;
    const ranged = filterByRange(data.orders, range);
    const today = toISODate(new Date());
    const month = today.slice(0, 7);
    return {
      stats: summarize(ranged),
      todayCount: data.orders.filter((o) => toISODate(o.createdAt) === today).length,
      monthCount: data.orders.filter((o) => toISODate(o.createdAt).startsWith(month)).length,
      chart: salesByDay(ranged, range),
      top: topProducts(ranged),
      recent: [...data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
      lowStock: data.products.filter((p) => p.type === 'ready-made' && p.status === 'published' && (p.stock ?? 0) <= (p.lowStockThreshold || 0)),
      upcoming: data.orders
        .filter((o) => !['Delivered', 'Cancelled'].includes(o.status) && o.requestedDate >= today)
        .sort((a, b) => a.requestedDate.localeCompare(b.requestedDate))
        .slice(0, 5),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, preset, custom.from, custom.to]);

  if (loading || !view) return <Loader />;
  const { stats } = view;

  return (
    <div className="dashboard">
      <AdminPageHeader title={`Hello, ${user.name.split(' ')[0]} 🌸`} subtitle="Here's what's happening with your store.">
        <div className="dashboard__range">
          <select className="select" value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="Date range">
            {RANGE_PRESETS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {preset === 'custom' && (
            <>
              <input type="date" className="input" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} aria-label="From" />
              <input type="date" className="input" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} aria-label="To" />
            </>
          )}
        </div>
      </AdminPageHeader>

      <div className="dashboard__stats">
        <StatCard icon={FiShoppingCart} label="Orders today" value={view.todayCount} hint={`${view.monthCount} this month`} to="/admin/orders" />
        <StatCard icon={FiClock} label="Pending" value={stats.pending} hint="New + Confirmed" tone="info" to="/admin/orders?status=New" />
        <StatCard icon={FiTool} label="In production" value={stats.inProduction} hint="Preparing / Ready / Dispatched" tone="warning" />
        <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} tone="success" />
        <StatCard icon={FiXCircle} label="Cancelled" value={stats.cancelled} hint={`${stats.cancellationRate}% rate`} tone="danger" />
      </div>

      <div className="dashboard__stats dashboard__stats--money">
        <StatCard icon={FiDollarSign} label="Placed order total" value={formatPrice(stats.placedTotal)} hint="Excludes cancelled orders" />
        <StatCard icon={FiCreditCard} label="Paid revenue" value={formatPrice(stats.paidRevenue)} hint="Payment status = Paid" tone="success" />
        <StatCard icon={FiTrendingUp} label="Average order value" value={formatPrice(stats.aov)} tone="info" />
      </div>

      <div className="dashboard__grid">
        <section className="card">
          <h3 className="card-title">Sales trend</h3>
          <BarChart data={view.chart} format={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
        </section>

        <section className="card">
          <h3 className="card-title">Top products</h3>
          {view.top.length === 0 && <p className="text-muted">No sales in this period.</p>}
          <ol className="dashboard__top">
            {view.top.map((p, i) => (
              <li key={p.productId}>
                <span>{i + 1}</span>
                <strong>{p.name}</strong>
                <small>{p.quantity} sold · {formatPrice(p.revenue)}</small>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="dashboard__grid">
        <section className="card">
          <div className="dashboard__card-head">
            <h3 className="card-title">Recent orders</h3>
            <Link to="/admin/orders">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {view.recent.map((o) => (
                  <tr key={o._id}>
                    <td><Link to={`/admin/orders/${o._id}`} className="dashboard__link">{o.orderNumber}</Link></td>
                    <td>{o.customer.name}<br /><small className="text-muted">{o.shipping.city}</small></td>
                    <td>{formatPrice(o.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><StatusBadge status={o.payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="dashboard__side">
          <section className="card">
            <h3 className="card-title">Upcoming deliveries</h3>
            {view.upcoming.length === 0 && <p className="text-muted">Nothing scheduled.</p>}
            <ul className="dashboard__list">
              {view.upcoming.map((o) => (
                <li key={o._id}>
                  <Link to={`/admin/orders/${o._id}`}>{o.orderNumber}</Link>
                  <span>{formatDate(o.requestedDate)}</span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          </section>

          {hasPermission('inventory') && (
            <section className="card">
              <h3 className="card-title"><FiAlertTriangle /> Low stock</h3>
              {view.lowStock.length === 0 && <p className="text-muted">All stocked up 👍</p>}
              <ul className="dashboard__list">
                {view.lowStock.map((p) => (
                  <li key={p._id}>
                    <Link to={`/admin/products/${p._id}/edit`}>{p.name}</Link>
                    <span className={p.stock ? 'text-muted' : 'text-danger'}>{p.stock || 0} left</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
