// Tiny localStorage "database" so the frontend works fully before the backend exists.
// Every service checks USE_MOCK and switches to real API calls once VITE_API_URL is set.
import {
  seedSettings, seedCms, seedCategories, seedProducts, seedUsers, seedOrders,
  seedCoupons, seedReviews, seedEnquiries, seedInventoryLog,
} from '../data/seedData';

const KEY = 'mb_mock_db_v1';

const seed = () => ({
  settings: seedSettings,
  cms: { published: seedCms, draft: seedCms, updatedAt: new Date().toISOString(), updatedBy: 'system', revisions: [] },
  categories: seedCategories,
  products: seedProducts,
  users: seedUsers,
  orders: seedOrders,
  coupons: seedCoupons,
  reviews: seedReviews,
  enquiries: seedEnquiries,
  inventoryLog: seedInventoryLog,
  auditLog: [],
});

let cache = null;

export const loadDb = () => {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : seed();
  } catch {
    cache = seed();
  }
  return cache;
};

export const saveDb = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Mock DB could not be saved (storage full?)', e);
  }
};

export const resetDb = () => {
  cache = seed();
  saveDb();
};

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Simulate a little network latency so loaders/UX behave like production.
export const delay = (data, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

export const fail = (message, ms = 200) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

export const db = {
  all: (col) => loadDb()[col],
  find: (col, id) => loadDb()[col].find((x) => x._id === id),
  insert: (col, doc) => {
    const item = { _id: uid(col.slice(0, 2)), createdAt: new Date().toISOString(), ...doc };
    loadDb()[col].unshift(item);
    saveDb();
    return item;
  },
  update: (col, id, patch) => {
    const list = loadDb()[col];
    const idx = list.findIndex((x) => x._id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDb();
    return list[idx];
  },
  remove: (col, id) => {
    const d = loadDb();
    d[col] = d[col].filter((x) => x._id !== id);
    saveDb();
  },
  get: (key) => loadDb()[key],
  set: (key, value) => {
    loadDb()[key] = value;
    saveDb();
    return value;
  },
};

export const audit = (actor, action, entity, entityId, details = '') => {
  const d = loadDb();
  d.auditLog.unshift({ _id: uid('al'), actor, action, entity, entityId, details, at: new Date().toISOString() });
  d.auditLog = d.auditLog.slice(0, 500);
  saveDb();
};
