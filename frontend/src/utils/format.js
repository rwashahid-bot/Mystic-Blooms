export const formatPrice = (amount, currency = 'PKR') => {
  const n = Number(amount) || 0;
  return `${currency === 'PKR' ? 'Rs.' : currency} ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value, opts = {}) => {
  if (!value) return '—';
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const slugify = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const titleCase = (s = '') => s.replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());

export const optionsToText = (options = {}) =>
  Object.entries(options)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');

export const paymentLabel = (id) =>
  ({ cod: 'Cash on Delivery', bank: 'Bank Transfer', easypaisa: 'Easypaisa', jazzcash: 'JazzCash' }[id] || id);
