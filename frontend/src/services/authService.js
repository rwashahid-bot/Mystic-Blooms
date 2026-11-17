import http, { USE_MOCK, TOKEN_KEY } from './http';
import { db, delay, fail, uid, audit } from './mockDb';
import { normalizePhone } from '../utils/validators';

const publicUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

const mock = {
  login: (email, password, { adminOnly = false } = {}) => {
    const user = db.all('users').find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user || user.password !== password) return fail('Invalid email or password.');
    if (adminOnly && !['admin', 'staff'].includes(user.role)) return fail('You do not have admin access.');
    if (user.disabled) return fail('This account has been disabled.');
    audit(user.email, 'login', 'user', user._id);
    return delay({ token: `mock-${user._id}`, user: publicUser(user) });
  },
  register: ({ name, email, phone, password }) => {
    if (db.all('users').some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return fail('An account with this email already exists.');
    }
    const user = db.insert('users', { name, email, phone: normalizePhone(phone), password, role: 'customer', addresses: [] });
    return delay({ token: `mock-${user._id}`, user: publicUser(user) });
  },
  me: () => {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    const user = db.find('users', token.replace('mock-', ''));
    return user ? delay(publicUser(user), 50) : fail('Not authenticated', 50);
  },
  updateProfile: (id, data) => {
    const { password, role, ...safe } = data;
    return delay(publicUser(db.update('users', id, safe)));
  },
  changePassword: (id, current, next) => {
    const user = db.find('users', id);
    if (user.password !== current) return fail('Current password is incorrect.');
    db.update('users', id, { password: next });
    return delay({ ok: true });
  },
  saveAddress: (userId, address) => {
    const user = db.find('users', userId);
    let addresses = [...(user.addresses || [])];
    if (address.isDefault) addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    if (address._id) addresses = addresses.map((a) => (a._id === address._id ? address : a));
    else addresses.push({ ...address, _id: uid('ad'), isDefault: address.isDefault || addresses.length === 0 });
    return delay(publicUser(db.update('users', userId, { addresses })));
  },
  deleteAddress: (userId, addressId) => {
    const user = db.find('users', userId);
    return delay(publicUser(db.update('users', userId, { addresses: user.addresses.filter((a) => a._id !== addressId) })));
  },
  forgotPassword: () => delay({ message: 'If an account exists for this email, a reset link has been sent.' }),
};

export const authService = {
  login: (email, password, opts) => (USE_MOCK ? mock.login(email, password, opts) : http.post(opts?.adminOnly ? '/auth/admin/login' : '/auth/login', { email, password })),
  register: (data) => (USE_MOCK ? mock.register(data) : http.post('/auth/register', data)),
  me: () => (USE_MOCK ? mock.me() : http.get('/auth/me')),
  updateProfile: (id, data) => (USE_MOCK ? mock.updateProfile(id, data) : http.put('/users/me', data)),
  changePassword: (id, current, next) => (USE_MOCK ? mock.changePassword(id, current, next) : http.put('/users/me/password', { current, next })),
  saveAddress: (userId, address) =>
    USE_MOCK ? mock.saveAddress(userId, address) : address._id ? http.put(`/users/me/addresses/${address._id}`, address) : http.post('/users/me/addresses', address),
  deleteAddress: (userId, addressId) => (USE_MOCK ? mock.deleteAddress(userId, addressId) : http.delete(`/users/me/addresses/${addressId}`)),
  forgotPassword: (email) => (USE_MOCK ? mock.forgotPassword(email) : http.post('/auth/forgot-password', { email })),
};
