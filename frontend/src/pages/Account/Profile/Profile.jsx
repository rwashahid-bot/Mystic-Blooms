import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { isValidEmail, isValidPkPhone } from '../../../utils/validators';
import './Profile.css';

const Profile = () => {
  usePageTitle('My Profile');
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    if (!isValidEmail(form.email)) return toast.error('Enter a valid email.');
    if (!isValidPkPhone(form.phone)) return toast.error('Enter a valid mobile number.');
    setSaving(true);
    try {
      setUser(await authService.updateProfile(user._id, form));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next.length < 8) return toast.error('New password must be at least 8 characters.');
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match.');
    try {
      await authService.changePassword(user._id, pw.current, pw.next);
      toast.success('Password changed');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="profile">
      <form className="card" onSubmit={saveProfile}>
        <h3 className="card-title">Personal details</h3>
        <div className="form-group">
          <label htmlFor="p-name">Full name</label>
          <input id="p-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="p-email">Email</label>
            <input id="p-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="p-phone">Mobile</label>
            <input id="p-phone" type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>

      <form className="card" onSubmit={changePassword}>
        <h3 className="card-title">Change password</h3>
        <div className="form-group">
          <label htmlFor="pw-current">Current password</label>
          <input id="pw-current" type="password" className="input" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pw-next">New password</label>
            <input id="pw-next" type="password" className="input" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="pw-confirm">Confirm new password</label>
            <input id="pw-confirm" type="password" className="input" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-outline">Update password</button>
      </form>

      <p className="profile__privacy">
        Want your data corrected or deleted? Contact us and we'll take care of it, as described in our privacy policy.
      </p>
    </div>
  );
};

export default Profile;
