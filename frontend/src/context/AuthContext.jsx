import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { TOKEN_KEY } from '../services/http';

const AuthContext = createContext(null);

// Admin sections a staff member can be granted. Owner (admin) always has all of them.
export const ADMIN_PERMISSIONS = [
  'dashboard', 'orders', 'products', 'categories', 'inventory', 'customers', 'reviews',
  'coupons', 'enquiries', 'content', 'reports', 'notifications', 'staff', 'settings', 'audit',
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    try {
      setUser(await authService.me());
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleAuth = ({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  };

  const login = async (email, password, opts) => handleAuth(await authService.login(email, password, opts));
  const register = async (data) => handleAuth(await authService.register(data));
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const hasPermission = (key) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'staff') return (user.permissions || ['dashboard', 'orders']).includes(key);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser, isAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
