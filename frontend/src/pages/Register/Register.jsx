import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../../components/AuthCard/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { isValidEmail, isValidPkPhone } from '../../utils/validators';
import './Register.css';

const Register = () => {
  usePageTitle('Create Account');
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required.';
    if (!isValidEmail(form.email)) er.email = 'Enter a valid email.';
    if (!isValidPkPhone(form.phone)) er.phone = 'Enter a valid mobile number.';
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) er.confirm = 'Passwords do not match.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone, password: form.password });
      toast.success('Account created! 🌸');
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const input = (k, label, type = 'text', autoComplete) => (
    <div className="form-group">
      <label htmlFor={`reg-${k}`}>{label}</label>
      <input id={`reg-${k}`} type={type} autoComplete={autoComplete} className={`input ${errors[k] ? 'has-error' : ''}`} value={form[k]} onChange={set(k)} />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <AuthCard title="Create an account" subtitle="Track orders, save addresses and reorder in one tap." footer={<>Already have an account? <Link to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="register-form" noValidate>
        {input('name', 'Full name', 'text', 'name')}
        {input('email', 'Email', 'email', 'email')}
        {input('phone', 'Mobile number', 'tel', 'tel')}
        {input('password', 'Password', 'password', 'new-password')}
        {input('confirm', 'Confirm password', 'password', 'new-password')}
        {errors.form && <p className="field-error register-form__error" role="alert">{errors.form}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
        <p className="register-form__note">
          By signing up you agree to our <Link to="/policies/privacy">Privacy Policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
};

export default Register;
