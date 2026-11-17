// Customers, staff & roles, audit log
import http, { USE_MOCK } from './http';
import { db, delay, fail, audit } from './mockDb';

const mock = {
  customers: () => {
    const users = db.all('users').filter((u) => u.role === 'customer');
    const orders = db.all('orders');
    const map = new Map();
    // Registered customers
    users.forEach((u) => map.set(u.phone, { _id: u._id, name: u.name, phone: u.phone, email: u.email, city: u.addresses?.[0]?.city || '', registered: true, notes: u.adminNotes || '', addresses: u.addresses || [], orders: [] }));
    // Guest customers are grouped by phone
    orders.forEach((o) => {
      const key = o.customer.phone;
      if (!map.has(key)) map.set(key, { _id: `guest-${key}`, name: o.customer.name, phone: key, email: o.customer.email, city: o.shipping.city, registered: false, notes: '', addresses: [], orders: [] });
      const c = map.get(key);
      c.orders.push(o);
      if (!c.city) c.city = o.shipping.city;
    });
    const list = [...map.values()].map((c) => {
      const valid = c.orders.filter((o) => o.status !== 'Cancelled');
      return {
        ...c,
        orderCount: c.orders.length,
        totalSpend: valid.reduce((s, o) => s + o.total, 0),
        lastOrder: c.orders.map((o) => o.createdAt).sort().pop() || null,
      };
    });
    return delay(list);
  },
  saveCustomerNote: (id, notes, actor) => {
    if (id.startsWith('guest-')) return fail('Notes can only be saved on registered customers for now.');
    audit(actor, 'note', 'customer', id);
    return delay(db.update('users', id, { adminNotes: notes }));
  },
  staff: () => delay(db.all('users').filter((u) => ['admin', 'staff'].includes(u.role)).map(({ password, ...u }) => u)),
  createStaff: (data, actor) => {
    if (db.all('users').some((u) => u.email.toLowerCase() === data.email.toLowerCase())) return fail('Email already in use.');
    const u = db.insert('users', { ...data, addresses: [] });
    audit(actor, 'create', 'staff', u._id, `${u.email} (${u.role})`);
    return delay(u);
  },
  updateStaff: (id, data, actor) => {
    audit(actor, 'update', 'staff', id, JSON.stringify(data.permissions || data.role || ''));
    return delay(db.update('users', id, data));
  },
  removeStaff: (id, actor) => {
    const admins = db.all('users').filter((u) => u.role === 'admin');
    if (admins.length === 1 && admins[0]._id === id) return fail('You cannot remove the only owner account.');
    db.remove('users', id);
    audit(actor, 'delete', 'staff', id);
    return delay({ ok: true });
  },
  auditLog: () => delay(db.all('auditLog')),
};

export const adminService = {
  customers: () => (USE_MOCK ? mock.customers() : http.get('/admin/customers')),
  saveCustomerNote: (id, notes, actor) => (USE_MOCK ? mock.saveCustomerNote(id, notes, actor) : http.put(`/admin/customers/${id}/notes`, { notes })),
  staff: () => (USE_MOCK ? mock.staff() : http.get('/admin/staff')),
  createStaff: (data, actor) => (USE_MOCK ? mock.createStaff(data, actor) : http.post('/admin/staff', data)),
  updateStaff: (id, data, actor) => (USE_MOCK ? mock.updateStaff(id, data, actor) : http.put(`/admin/staff/${id}`, data)),
  removeStaff: (id, actor) => (USE_MOCK ? mock.removeStaff(id, actor) : http.delete(`/admin/staff/${id}`)),
  auditLog: () => (USE_MOCK ? mock.auditLog() : http.get('/admin/audit-log')),
};
