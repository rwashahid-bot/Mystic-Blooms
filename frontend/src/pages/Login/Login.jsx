import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../../components/AuthCard/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import './Login.css';

const Login = () => {
  usePageTitle('Log In');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const homeFor = (u) => (['admin', 'staff'].includes(u.role) ? '/admin' : '/account');
  if (user) return <Navigate to={location.state?.from || homeFor(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(location.state?.from || homeFor(u), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to view your orders and saved addresses."
      footer={<>New to Mystic Blooms? <Link to="/register" state={location.state}>Create an account</Link></>}
    >
      <form onSubmit={submit} className="login-form" noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" className="input" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" className="input" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Link to="/forgot-password" className="login-form__forgot">Forgot password?</Link>
        {error && <p className="field-error login-form__error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
      </form>
    </AuthCard>
  );
};

export default Login;
