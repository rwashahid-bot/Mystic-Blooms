import { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatCard from '../../../components/admin/StatCard/StatCard';
import BarChart from '../../../components/admin/BarChart/BarChart';
import Loader from '../../../components/Loader/Loader';
import { useAsync } from '../../../hooks/useAsync';
import { orderService } from '../../../services/orderService';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { RANGE_PRESETS, filterByRange, groupOrders, repeatCustomers, resolveRange, salesByCategory, salesByDay, summarize, topProducts } from '../../../utils/analytics';
import { exportCsv } from '../../../utils/exportCsv';
import { formatPrice, paymentLabel } from '../../../utils/format';
import { FiDollarSign, FiCreditCard, FiTrendingUp, FiXCircle } from 'react-icons/fi';
import './Reports.css';

const Breakdown = ({ title, rows, labelKey = 'label', countKey = 'orders', countLabel = 'Orders', onExport }) => {
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <section className="card reports__breakdown">
      <div className="reports__head">
        <h3 className="card-title">{title}</h3>
        {onExport && rows.length > 0 && <button className="btn btn-light btn-sm" onClick={onExport}><FiDownload /></button>}
      </div>
      {rows.length === 0 && <p className="text-muted">No data.</p>}
      <table className="reports__table">
        <thead><tr><th>{title.split(' ').pop()}</th><th>{countLabel}</th><th>Revenue</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[labelKey]}>
              <td>
                {r[labelKey]}
                <div className="reports__bar"><span style={{ width: `${(r.revenue / max) * 100}%` }} /></div>
              </td>
              <td>{r[countKey]}</td>
              <td>{formatPrice(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Reports = () => {
  const [preset, setPreset] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const { data, loading } = useAsync(async () => {
    const [orders, products, categories] = await Promise.all([orderService.list(), productService.list({ admin: true }), categoryService.list({ includeInactive: true })]);
    return { orders, products, categories };
  }, []);

  const range = resolveRange(preset, custom);
  const r = useMemo(() => {
    if (!data) return null;
    const orders = filterByRange(data.orders, range);
    return {
      orders,
      summary: summarize(orders),
      chart: salesByDay(orders, range, 30),
      byStatus: Object.entries(
        orders.reduce((m, o) => ({ ...m, [o.status]: { label: o.status, orders: (m[o.status]?.orders || 0) + 1, revenue: (m[o.status]?.revenue || 0) + o.total } }), {})
      ).map(([, v]) => v),
      byPayment: groupOrders(orders, (o) => paymentLabel(o.payment.method)),
      byCity: groupOrders(orders, (o) => o.shipping.city),
      byCategory: salesByCategory(orders, data.products, data.categories),
      products: topProducts(orders, 10),
      repeat: repeatCustomers(data.orders),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, preset, custom.from, custom.to]);

  if (loading || !r) return <Loader />;

  const exportRows = (rows, name) => exportCsv(rows.map((x) => ({ Name: x.label || x.name, Count: x.orders ?? x.quantity, Revenue: x.revenue })), `${name}.csv`);

  return (
    <div className="reports">
      <AdminPageHeader title="Reports" subtitle="Sales analysis for bookkeeping and planning. Cancelled orders are excluded from revenue.">
        <select className="select reports__select" value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="Date range">
          {RANGE_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        {preset === 'custom' && (
          <>
            <input type="date" className="input reports__select" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} aria-label="From" />
            <input type="date" className="input reports__select" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} aria-label="To" />
          </>
        )}
      </AdminPageHeader>

      <div className="reports__stats">
        <StatCard icon={FiDollarSign} label="Placed order total" value={formatPrice(r.summary.placedTotal)} hint={`${r.summary.count} orders`} />
        <StatCard icon={FiCreditCard} label="Paid revenue" value={formatPrice(r.summary.paidRevenue)} tone="success" />
        <StatCard icon={FiTrendingUp} label="Average order value" value={formatPrice(r.summary.aov)} tone="info" />
        <StatCard icon={FiXCircle} label="Cancellation rate" value={`${r.summary.cancellationRate}%`} hint={`${r.summary.cancelled} cancelled`} tone="danger" />
      </div>

      <section className="card reports__chart">
        <h3 className="card-title">Sales by date</h3>
        <BarChart data={r.chart} height={220} format={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
      </section>

      <div className="reports__grid">
        <Breakdown title="Sales by Category" rows={r.byCategory} countKey="quantity" countLabel="Items" onExport={() => exportRows(r.byCategory, 'sales-by-category')} />
        <Breakdown title="Top Products" rows={r.products} labelKey="name" countKey="quantity" countLabel="Sold" onExport={() => exportRows(r.products, 'top-products')} />
        <Breakdown title="Sales by Payment method" rows={r.byPayment} onExport={() => exportRows(r.byPayment, 'sales-by-payment')} />
        <Breakdown title="Orders by Status" rows={r.byStatus} />
        <Breakdown title="Sales by City" rows={r.byCity} onExport={() => exportRows(r.byCity, 'sales-by-city')} />

        <section className="card reports__breakdown">
          <h3 className="card-title">Repeat customers (all time)</h3>
          {r.repeat.length === 0 && <p className="text-muted">No repeat customers yet.</p>}
          <table className="reports__table">
            <thead><tr><th>Customer</th><th>Orders</th><th>Spend</th></tr></thead>
            <tbody>
              {r.repeat.slice(0, 10).map((c) => (
                <tr key={c.phone}><td>{c.name}<br /><small className="text-muted">{c.phone}</small></td><td>{c.orders}</td><td>{formatPrice(c.spend)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Reports;
