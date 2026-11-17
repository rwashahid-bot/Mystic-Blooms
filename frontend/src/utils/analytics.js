import { addDays, toISODate } from './dates';

export const RANGE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' },
];

export const resolveRange = (preset, custom = {}) => {
  const today = toISODate(new Date());
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case '7d':
      return { from: toISODate(addDays(new Date(), -6)), to: today };
    case '30d':
      return { from: toISODate(addDays(new Date(), -29)), to: today };
    case 'month':
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case 'custom':
      return { from: custom.from || '', to: custom.to || '' };
    default:
      return { from: '', to: '' };
  }
};

export const filterByRange = (orders, { from, to }) =>
  orders.filter((o) => {
    const d = toISODate(o.createdAt);
    return (!from || d >= from) && (!to || d <= to);
  });

const PENDING = ['New', 'Confirmed'];
const PRODUCTION = ['In Preparation', 'Ready', 'Dispatched'];

export const summarize = (orders) => {
  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const placedTotal = valid.reduce((s, o) => s + o.total, 0);
  const paidRevenue = orders.filter((o) => o.payment.status === 'Paid').reduce((s, o) => s + o.total, 0);
  return {
    count: orders.length,
    pending: orders.filter((o) => PENDING.includes(o.status)).length,
    inProduction: orders.filter((o) => PRODUCTION.includes(o.status)).length,
    completed: orders.filter((o) => o.status === 'Delivered').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    placedTotal,
    paidRevenue,
    aov: valid.length ? Math.round(placedTotal / valid.length) : 0,
    cancellationRate: orders.length ? Math.round((orders.filter((o) => o.status === 'Cancelled').length / orders.length) * 100) : 0,
  };
};

/** Sales per day (non-cancelled) for a chart — limited to the last `maxDays` of the range. */
export const salesByDay = (orders, { from, to }, maxDays = 14) => {
  const end = to ? new Date(`${to}T00:00:00`) : new Date();
  let start = from ? new Date(`${from}T00:00:00`) : addDays(end, -(maxDays - 1));
  if ((end - start) / 86400000 > maxDays - 1) start = addDays(end, -(maxDays - 1));
  const days = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(toISODate(d));
  return days.map((day) => ({
    label: new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    value: orders.filter((o) => o.status !== 'Cancelled' && toISODate(o.createdAt) === day).reduce((s, o) => s + o.total, 0),
  }));
};

/** Groups non-cancelled orders by a key function → [{ label, orders, revenue }] sorted by revenue. */
export const groupOrders = (orders, keyFn) => {
  const map = {};
  orders
    .filter((o) => o.status !== 'Cancelled')
    .forEach((o) => {
      const key = keyFn(o) || 'Unknown';
      map[key] = map[key] || { label: key, orders: 0, revenue: 0 };
      map[key].orders += 1;
      map[key].revenue += o.total;
    });
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
};

export const topProducts = (orders, limit = 5) => {
  const map = {};
  orders
    .filter((o) => o.status !== 'Cancelled')
    .forEach((o) =>
      o.items.forEach((i) => {
        map[i.productId] = map[i.productId] || { productId: i.productId, name: i.name, quantity: 0, revenue: 0 };
        map[i.productId].quantity += i.quantity;
        map[i.productId].revenue += i.lineTotal;
      })
    );
  return Object.values(map).sort((a, b) => b.quantity - a.quantity).slice(0, limit);
};

export const salesByCategory = (orders, products, categories) => {
  const map = {};
  orders
    .filter((o) => o.status !== 'Cancelled')
    .forEach((o) =>
      o.items.forEach((i) => {
        const p = products.find((x) => x._id === i.productId);
        const c = categories.find((x) => x._id === p?.category);
        const key = c?.name || 'Other';
        map[key] = map[key] || { label: key, quantity: 0, revenue: 0 };
        map[key].quantity += i.quantity;
        map[key].revenue += i.lineTotal;
      })
    );
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
};

export const repeatCustomers = (orders) => {
  const map = {};
  orders.forEach((o) => {
    map[o.customer.phone] = map[o.customer.phone] || { name: o.customer.name, phone: o.customer.phone, orders: 0, spend: 0 };
    map[o.customer.phone].orders += 1;
    if (o.status !== 'Cancelled') map[o.customer.phone].spend += o.total;
  });
  return Object.values(map).filter((c) => c.orders > 1).sort((a, b) => b.orders - a.orders);
};
