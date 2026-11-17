import http, { USE_MOCK } from './http';
import { db, delay, fail, uid, audit, loadDb, saveDb } from './mockDb';
import { basePrice } from '../utils/pricing';
import { slugify } from '../utils/format';

const isInStock = (p) => p.available && (p.type !== 'ready-made' || (p.stock ?? 0) > 0);

const sorters = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'price-asc': (a, b) => basePrice(a) - basePrice(b),
  'price-desc': (a, b) => basePrice(b) - basePrice(a),
  popular: (a, b) => (b.sold || 0) - (a.sold || 0),
  featured: (a, b) => Number(b.featured) - Number(a.featured) || (b.sold || 0) - (a.sold || 0),
};

const mock = {
  list: (params = {}) => {
    const { category, search, minPrice, maxPrice, availability, occasion, color, type, sort = 'featured', admin, featured, bestseller, isNew, limit } = params;
    let list = db.all('products');
    if (!admin) {
      const activeCats = db.all('categories').filter((c) => c.active).map((c) => c._id);
      list = list.filter((p) => p.status === 'published' && activeCats.includes(p.category));
    }
    if (category) {
      const cat = db.all('categories').find((c) => c.slug === category || c._id === category);
      list = list.filter((p) => p.category === cat?._id);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => [p.name, p.description, p.sku, ...(p.tags || [])].join(' ').toLowerCase().includes(q));
    }
    if (minPrice) list = list.filter((p) => basePrice(p) >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => basePrice(p) <= Number(maxPrice));
    if (availability === 'in-stock') list = list.filter(isInStock);
    if (availability === 'out-of-stock') list = list.filter((p) => !isInStock(p));
    if (occasion) list = list.filter((p) => (p.occasions || []).includes(occasion));
    if (color) list = list.filter((p) => (p.colors || []).includes(color));
    if (type) list = list.filter((p) => p.type === type);
    if (featured) list = list.filter((p) => p.featured);
    if (bestseller) list = list.filter((p) => p.bestseller);
    if (isNew) list = list.filter((p) => p.isNew);
    list = [...list].sort(sorters[sort] || sorters.featured);
    if (limit) list = list.slice(0, Number(limit));
    return delay(list);
  },
  getBySlug: (slug) => {
    const p = db.all('products').find((x) => x.slug === slug && x.status === 'published');
    return p ? delay(p) : fail('Product not found');
  },
  getById: (id) => {
    const p = db.find('products', id);
    return p ? delay(p) : fail('Product not found');
  },
  filters: () => {
    const products = db.all('products').filter((p) => p.status === 'published');
    const uniq = (arr) => [...new Set(arr)].sort();
    return delay({
      occasions: uniq(products.flatMap((p) => p.occasions || [])),
      colors: uniq(products.flatMap((p) => p.colors || [])),
    });
  },
  create: (data, actor) => {
    const slug = data.slug || slugify(data.name);
    if (db.all('products').some((p) => p.slug === slug)) return fail('A product with this slug already exists.');
    const p = db.insert('products', { sold: 0, ...data, slug });
    audit(actor, 'create', 'product', p._id, p.name);
    return delay(p);
  },
  update: (id, data, actor) => {
    if (data.slug && db.all('products').some((p) => p.slug === data.slug && p._id !== id)) return fail('Slug already used by another product.');
    const before = db.find('products', id);
    const p = db.update('products', id, data);
    if (before && data.price !== undefined && before.price !== data.price) audit(actor, 'price-change', 'product', id, `${before.price} → ${data.price}`);
    audit(actor, 'update', 'product', id, p.name);
    return delay(p);
  },
  duplicate: (id, actor) => {
    const src = db.find('products', id);
    const copy = { ...structuredClone(src), name: `${src.name} (Copy)`, slug: `${src.slug}-copy-${Date.now().toString(36).slice(-4)}`, status: 'draft', sold: 0 };
    delete copy._id;
    delete copy.createdAt;
    const p = db.insert('products', copy);
    audit(actor, 'duplicate', 'product', p._id, src.name);
    return delay(p);
  },
  remove: (id, actor) => {
    const p = db.find('products', id);
    db.remove('products', id);
    audit(actor, 'delete', 'product', id, p?.name);
    return delay({ ok: true });
  },
  adjustStock: (id, change, reason, actor) => {
    const p = db.find('products', id);
    const stockAfter = Math.max((p.stock || 0) + Number(change), 0);
    db.update('products', id, { stock: stockAfter });
    const d = loadDb();
    d.inventoryLog.unshift({ _id: uid('iv'), productId: id, change: Number(change), reason, stockAfter, at: new Date().toISOString(), by: actor });
    saveDb();
    audit(actor, 'stock-adjust', 'product', id, `${change > 0 ? '+' : ''}${change} (${reason})`);
    return delay(db.find('products', id));
  },
  inventoryLog: () => delay(db.all('inventoryLog')),
};

export const productService = {
  list: (params) => (USE_MOCK ? mock.list(params) : http.get('/products', { params })),
  getBySlug: (slug) => (USE_MOCK ? mock.getBySlug(slug) : http.get(`/products/slug/${slug}`)),
  getById: (id) => (USE_MOCK ? mock.getById(id) : http.get(`/products/${id}`)),
  filters: () => (USE_MOCK ? mock.filters() : http.get('/products/filters')),
  create: (data, actor) => (USE_MOCK ? mock.create(data, actor) : http.post('/admin/products', data)),
  update: (id, data, actor) => (USE_MOCK ? mock.update(id, data, actor) : http.put(`/admin/products/${id}`, data)),
  duplicate: (id, actor) => (USE_MOCK ? mock.duplicate(id, actor) : http.post(`/admin/products/${id}/duplicate`)),
  remove: (id, actor) => (USE_MOCK ? mock.remove(id, actor) : http.delete(`/admin/products/${id}`)),
  adjustStock: (id, change, reason, actor) =>
    USE_MOCK ? mock.adjustStock(id, change, reason, actor) : http.post(`/admin/products/${id}/stock`, { change, reason }),
  inventoryLog: () => (USE_MOCK ? mock.inventoryLog() : http.get('/admin/inventory/log')),
};
