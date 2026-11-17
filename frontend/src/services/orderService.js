import http, { USE_MOCK } from './http';
import { db, delay, fail, audit, loadDb, saveDb, uid } from './mockDb';
import { calcTotals, calcUnitPrice } from '../utils/pricing';
import { validateDeliveryDate } from '../utils/dates';
import { normalizePhone } from '../utils/validators';

const capacityMap = () => {
  const map = {};
  db.all('orders')
    .filter((o) => o.status !== 'Cancelled')
    .forEach((o) => {
      map[o.requestedDate] = (map[o.requestedDate] || 0) + 1;
    });
  return map;
};

const nextOrderNumber = (prefix) => {
  const nums = db.all('orders').map((o) => Number(String(o.orderNumber).split('-').pop()) || 0);
  return `${prefix}-${Math.max(10000, ...nums) + 1}`;
};

const mock = {
  capacity: () => delay(capacityMap(), 50),

  /** "Server-side" order creation: re-prices items from the catalogue and snapshots them. */
  create: (payload) => {
    const settings = db.get('settings');
    if (settings.storeStatus === 'closed') return fail('The store is temporarily closed and not accepting orders.');

    const items = [];
    for (const line of payload.items) {
      const p = db.find('products', line.productId);
      if (!p || p.status !== 'published' || !p.available) return fail(`"${line.name}" is no longer available.`);
      if (p.type === 'ready-made' && (p.stock ?? 0) < line.quantity) return fail(`Only ${p.stock} left of "${p.name}".`);
      const unitPrice = calcUnitPrice(p, line.options);
      items.push({
        productId: p._id, name: p.name, sku: p.sku, color: p.color, image: p.images?.[0] || '',
        options: line.options, personalisation: line.personalisation || {}, leadTimeDays: p.leadTimeDays,
        unitPrice, quantity: line.quantity, lineTotal: unitPrice * line.quantity,
      });
    }

    const dateError = validateDeliveryDate(payload.requestedDate, items, settings, capacityMap());
    if (dateError) return fail(dateError);

    const coupon = payload.couponCode ? db.all('coupons').find((c) => c.code === payload.couponCode.toUpperCase()) : null;
    const totals = calcTotals({ items, coupon, city: payload.shipping.city, settings });
    if (settings.minOrderValue && totals.subtotal < settings.minOrderValue) {
      return fail(`Minimum order value is Rs. ${settings.minOrderValue}.`);
    }

    const order = db.insert('orders', {
      orderNumber: nextOrderNumber(settings.orderPrefix || 'MB'),
      customerId: payload.customerId || null,
      customer: { ...payload.customer, phone: normalizePhone(payload.customer.phone) },
      shipping: payload.shipping,
      recipient: payload.recipient,
      requestedDate: payload.requestedDate,
      items,
      ...totals,
      couponCode: totals.discount || coupon?.freeDelivery ? coupon?.code || '' : '',
      payment: {
        method: payload.payment.method,
        reference: payload.payment.reference || '',
        status: payload.payment.method !== 'cod' && payload.payment.reference ? 'Awaiting Verification' : 'Unpaid',
      },
      status: settings.orderStatuses[0] || 'New',
      statusHistory: [{ status: settings.orderStatuses[0] || 'New', at: new Date().toISOString(), note: 'Order placed' }],
      adminNotes: [],
      courier: { name: '', tracking: '', dispatchDate: '' },
      seen: false,
    });

    // Side effects: stock, sold counters, coupon usage
    items.forEach((i) => {
      const p = db.find('products', i.productId);
      const patch = { sold: (p.sold || 0) + i.quantity };
      if (p.type === 'ready-made') {
        patch.stock = Math.max((p.stock || 0) - i.quantity, 0);
        const d = loadDb();
        d.inventoryLog.unshift({ _id: uid('iv'), productId: p._id, change: -i.quantity, reason: `Order ${order.orderNumber}`, stockAfter: patch.stock, at: new Date().toISOString() });
        saveDb();
      }
      db.update('products', p._id, patch);
    });
    if (order.couponCode && coupon) db.update('coupons', coupon._id, { used: (coupon.used || 0) + 1 });

    return delay(order, 500);
  },

  track: (orderNumber, phone) => {
    const o = db.all('orders').find((x) => x.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase() && x.customer.phone === normalizePhone(phone));
    return o ? delay(o) : fail('No order found with this order number and phone.');
  },

  mine: (userId) => delay(db.all('orders').filter((o) => o.customerId === userId)),
  getMine: (userId, id) => {
    const o = db.all('orders').find((x) => (x._id === id || x.orderNumber === id) && x.customerId === userId);
    return o ? delay(o) : fail('Order not found');
  },

  list: () => delay(db.all('orders')),
  getById: (id) => {
    const o = db.find('orders', id);
    if (o && !o.seen) db.update('orders', id, { seen: true });
    return o ? delay(o) : fail('Order not found');
  },
  updateStatus: (id, status, note, actor) => {
    const o = db.find('orders', id);
    const history = [...o.statusHistory, { status, at: new Date().toISOString(), note, by: actor }];
    const patch = { status, statusHistory: history };
    // Restore ready-made stock on cancellation
    if (status === 'Cancelled' && o.status !== 'Cancelled') {
      o.items.forEach((i) => {
        const p = db.find('products', i.productId);
        if (p?.type === 'ready-made') db.update('products', p._id, { stock: (p.stock || 0) + i.quantity });
      });
    }
    audit(actor, 'status-change', 'order', id, `${o.status} → ${status}`);
    return delay(db.update('orders', id, patch));
  },
  updatePayment: (id, paymentStatus, actor) => {
    const o = db.find('orders', id);
    audit(actor, 'payment-change', 'order', id, `${o.payment.status} → ${paymentStatus}`);
    return delay(db.update('orders', id, { payment: { ...o.payment, status: paymentStatus, verifiedBy: actor, verifiedAt: new Date().toISOString() } }));
  },
  addNote: (id, text, actor) => {
    const o = db.find('orders', id);
    return delay(db.update('orders', id, { adminNotes: [...o.adminNotes, { text, at: new Date().toISOString(), by: actor }] }));
  },
  updateCourier: (id, courier, actor) => {
    audit(actor, 'courier-update', 'order', id, courier.tracking);
    return delay(db.update('orders', id, { courier }));
  },
};

export const orderService = {
  capacity: () => (USE_MOCK ? mock.capacity() : http.get('/orders/capacity')),
  create: (payload) => (USE_MOCK ? mock.create(payload) : http.post('/orders', payload)),
  track: (orderNumber, phone) => (USE_MOCK ? mock.track(orderNumber, phone) : http.post('/orders/track', { orderNumber, phone })),
  mine: (userId) => (USE_MOCK ? mock.mine(userId) : http.get('/orders/mine')),
  getMine: (userId, id) => (USE_MOCK ? mock.getMine(userId, id) : http.get(`/orders/mine/${id}`)),
  // Admin
  list: (params) => (USE_MOCK ? mock.list(params) : http.get('/admin/orders', { params })),
  getById: (id) => (USE_MOCK ? mock.getById(id) : http.get(`/admin/orders/${id}`)),
  updateStatus: (id, status, note, actor) => (USE_MOCK ? mock.updateStatus(id, status, note, actor) : http.put(`/admin/orders/${id}/status`, { status, note })),
  updatePayment: (id, status, actor) => (USE_MOCK ? mock.updatePayment(id, status, actor) : http.put(`/admin/orders/${id}/payment`, { status })),
  addNote: (id, text, actor) => (USE_MOCK ? mock.addNote(id, text, actor) : http.post(`/admin/orders/${id}/notes`, { text })),
  updateCourier: (id, courier, actor) => (USE_MOCK ? mock.updateCourier(id, courier, actor) : http.put(`/admin/orders/${id}/courier`, courier)),
};
