import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import Logo from '../../../components/Logo/Logo';
import { useAuth } from '../../../context/AuthContext';
import { USE_MOCK } from '../../../services/http';
import './AdminLogin.css';

const AdminLogin = () => {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && isAdmin) return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password, { adminOnly: true });
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <Logo to="/" />
        <h1><FiLock /> Admin Panel</h1>
        <p className="text-muted">Sign in to manage orders, products and content.</p>
        <div className="form-group">
          <label htmlFor="al-email">Email</label>
          <input id="al-email" type="email" className="input" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="al-pass">Password</label>
          <input id="al-pass" type="password" className="input" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        {USE_MOCK && (
          <div className="admin-login__demo">
            <strong>Demo mode (no backend yet)</strong>
            <span>Owner: admin@mysticblooms.pk / admin123</span>
            <span>Staff: staff@mysticblooms.pk / staff123</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
