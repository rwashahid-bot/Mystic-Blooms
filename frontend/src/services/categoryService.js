import http, { USE_MOCK } from './http';
import { db, delay, fail, audit } from './mockDb';
import { slugify } from '../utils/format';

const mock = {
  list: ({ includeInactive = false } = {}) => {
    const products = db.all('products');
    const list = db
      .all('categories')
      .filter((c) => includeInactive || c.active)
      .map((c) => ({ ...c, productCount: products.filter((p) => p.category === c._id).length }))
      .sort((a, b) => a.order - b.order);
    return delay(list);
  },
  getBySlug: (slug) => {
    const c = db.all('categories').find((x) => x.slug === slug && x.active);
    return c ? delay(c) : fail('Category not found');
  },
  create: (data, actor) => {
    const slug = data.slug || slugify(data.name);
    if (db.all('categories').some((c) => c.slug === slug)) return fail('Category slug already exists.');
    const order = db.all('categories').length + 1;
    const c = db.insert('categories', { active: true, order, ...data, slug });
    audit(actor, 'create', 'category', c._id, c.name);
    return delay(c);
  },
  update: (id, data, actor) => {
    const c = db.update('categories', id, data);
    audit(actor, 'update', 'category', id, c.name);
    return delay(c);
  },
  remove: (id, actor) => {
    const count = db.all('products').filter((p) => p.category === id).length;
    if (count) return fail(`Cannot delete: ${count} product(s) are still assigned. Reassign them first.`);
    db.remove('categories', id);
    audit(actor, 'delete', 'category', id);
    return delay({ ok: true });
  },
  reorder: (ids, actor) => {
    ids.forEach((id, i) => db.update('categories', id, { order: i + 1 }));
    audit(actor, 'reorder', 'category', '-', '');
    return delay({ ok: true });
  },
};

export const categoryService = {
  list: (params) => (USE_MOCK ? mock.list(params) : http.get('/categories', { params })),
  getBySlug: (slug) => (USE_MOCK ? mock.getBySlug(slug) : http.get(`/categories/${slug}`)),
  create: (data, actor) => (USE_MOCK ? mock.create(data, actor) : http.post('/admin/categories', data)),
  update: (id, data, actor) => (USE_MOCK ? mock.update(id, data, actor) : http.put(`/admin/categories/${id}`, data)),
  remove: (id, actor) => (USE_MOCK ? mock.remove(id, actor) : http.delete(`/admin/categories/${id}`)),
  reorder: (ids, actor) => (USE_MOCK ? mock.reorder(ids, actor) : http.put('/admin/categories/reorder', { ids })),
};
