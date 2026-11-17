import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../../components/AuthCard/AuthCard';
import { authService } from '../../services/authService';
import { usePageTitle } from '../../hooks/usePageTitle';
import { isValidEmail } from '../../utils/validators';
import './ForgotPassword.css';

const ForgotPassword = () => {
  usePageTitle('Reset Password');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) return setError('Please enter a valid email.');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset password" subtitle="Enter your email and we'll send you a reset link." footer={<Link to="/login">← Back to login</Link>}>
      {message ? (
        <p className="forgot__success">{message}</p>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label htmlFor="fp-email">Email</label>
            <input id="fp-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <span className="field-error">{error}</span>}
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
