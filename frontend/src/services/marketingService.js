// Coupons, reviews and enquiries (contact + custom-order requests)
import http, { USE_MOCK } from './http';
import { db, delay, fail, audit } from './mockDb';
import { checkCoupon } from '../utils/pricing';

const mockCoupons = {
  list: () => delay(db.all('coupons')),
  validate: (code, subtotal) => {
    const c = db.all('coupons').find((x) => x.code === code.trim().toUpperCase());
    const err = checkCoupon(c, subtotal);
    return err ? fail(err) : delay(c);
  },
  create: (data, actor) => {
    const code = data.code.trim().toUpperCase();
    if (db.all('coupons').some((c) => c.code === code)) return fail('Coupon code already exists.');
    const c = db.insert('coupons', { used: 0, ...data, code });
    audit(actor, 'create', 'coupon', c._id, code);
    return delay(c);
  },
  update: (id, data, actor) => {
    audit(actor, 'update', 'coupon', id, data.code);
    return delay(db.update('coupons', id, { ...data, code: data.code?.toUpperCase() }));
  },
  remove: (id, actor) => {
    db.remove('coupons', id);
    audit(actor, 'delete', 'coupon', id);
    return delay({ ok: true });
  },
};

export const couponService = {
  list: () => (USE_MOCK ? mockCoupons.list() : http.get('/admin/coupons')),
  validate: (code, subtotal) => (USE_MOCK ? mockCoupons.validate(code, subtotal) : http.post('/coupons/validate', { code, subtotal })),
  create: (data, actor) => (USE_MOCK ? mockCoupons.create(data, actor) : http.post('/admin/coupons', data)),
  update: (id, data, actor) => (USE_MOCK ? mockCoupons.update(id, data, actor) : http.put(`/admin/coupons/${id}`, data)),
  remove: (id, actor) => (USE_MOCK ? mockCoupons.remove(id, actor) : http.delete(`/admin/coupons/${id}`)),
};

const mockReviews = {
  forProduct: (productId) => delay(db.all('reviews').filter((r) => r.productId === productId && r.status === 'approved')),
  list: () => delay(db.all('reviews')),
  create: (data) => {
    // Verified buyers only: the order must be delivered and contain the product
    const order = db.all('orders').find((o) => o.customerId === data.userId && o.status === 'Delivered' && o.items.some((i) => i.productId === data.productId));
    if (!order) return fail('Only customers with a delivered order of this product can leave a review.');
    if (db.all('reviews').some((r) => r.productId === data.productId && r.userId === data.userId)) return fail('You have already reviewed this product.');
    return delay(db.insert('reviews', { ...data, orderId: order._id, status: 'pending' }));
  },
  moderate: (id, status, actor) => {
    audit(actor, `review-${status}`, 'review', id);
    return delay(db.update('reviews', id, { status, publishedAt: status === 'approved' ? new Date().toISOString() : null }));
  },
  remove: (id, actor) => {
    db.remove('reviews', id);
    audit(actor, 'delete', 'review', id);
    return delay({ ok: true });
  },
};

export const reviewService = {
  forProduct: (productId) => (USE_MOCK ? mockReviews.forProduct(productId) : http.get(`/products/${productId}/reviews`)),
  list: () => (USE_MOCK ? mockReviews.list() : http.get('/admin/reviews')),
  create: (data) => (USE_MOCK ? mockReviews.create(data) : http.post(`/products/${data.productId}/reviews`, data)),
  moderate: (id, status, actor) => (USE_MOCK ? mockReviews.moderate(id, status, actor) : http.put(`/admin/reviews/${id}`, { status })),
  remove: (id, actor) => (USE_MOCK ? mockReviews.remove(id, actor) : http.delete(`/admin/reviews/${id}`)),
};

const mockEnquiries = {
  create: (data) => delay(db.insert('enquiries', { ...data, status: 'new' }), 400),
  list: () => delay(db.all('enquiries')),
  update: (id, data, actor) => {
    audit(actor, 'update', 'enquiry', id, data.status || '');
    return delay(db.update('enquiries', id, data));
  },
  remove: (id, actor) => {
    db.remove('enquiries', id);
    audit(actor, 'delete', 'enquiry', id);
    return delay({ ok: true });
  },
};

export const enquiryService = {
  create: (data) => (USE_MOCK ? mockEnquiries.create(data) : http.post('/enquiries', data)),
  list: () => (USE_MOCK ? mockEnquiries.list() : http.get('/admin/enquiries')),
  update: (id, data, actor) => (USE_MOCK ? mockEnquiries.update(id, data, actor) : http.put(`/admin/enquiries/${id}`, data)),
  remove: (id, actor) => (USE_MOCK ? mockEnquiries.remove(id, actor) : http.delete(`/admin/enquiries/${id}`)),
};
