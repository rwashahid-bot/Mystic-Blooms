import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import Modal from '../../../components/Modal/Modal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Loader from '../../../components/Loader/Loader';
import { useAuth, ADMIN_PERMISSIONS } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { adminService } from '../../../services/adminService';
import { formatDate } from '../../../utils/format';
import { isValidEmail } from '../../../utils/validators';
import './Staff.css';

const blank = { name: '', email: '', phone: '', password: '', role: 'staff', permissions: ['dashboard', 'orders'], disabled: false };
const SENSITIVE = ['staff', 'settings', 'audit'];

const Staff = () => {
  const { user } = useAuth();
  const { data: staff, loading, reload } = useAsync(() => adminService.staff(), []);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  if (loading) return <Loader />;

  const togglePerm = (p) =>
    setEditing((e) => ({ ...e, permissions: e.permissions.includes(p) ? e.permissions.filter((x) => x !== p) : [...e.permissions, p] }));

  const save = async (e) => {
    e.preventDefault();
    if (!editing.name.trim() || !isValidEmail(editing.email)) return toast.error('Name and a valid email are required.');
    if (!editing._id && editing.password.length < 8) return toast.error('Temporary password must be at least 8 characters.');
    try {
      const { _id, password, ...rest } = editing;
      if (_id) await adminService.updateStaff(_id, password ? { ...rest, password } : rest, user.email);
      else await adminService.createStaff(editing, user.email);
      toast.success('Team member saved');
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="staff">
      <AdminPageHeader title="Staff & Roles" subtitle="Give helpers limited access, e.g. only to view and process orders.">
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...blank })}><FiPlus /> Add staff</button>
      </AdminPageHeader>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Access</th><th>Added</th><th></th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong> {s._id === user._id && <span className="chip">You</span>} {s.disabled && <span className="text-danger"> (disabled)</span>}</td>
                <td>{s.email}</td>
                <td>{s.role === 'admin' ? 'Owner / super admin' : 'Staff'}</td>
                <td className="staff__perms">{s.role === 'admin' ? 'Full access' : (s.permissions || ['dashboard', 'orders']).join(', ')}</td>
                <td>{formatDate(s.createdAt)}</td>
                <td className="actions">
                  {s.role !== 'admin' && (
                    <>
                      <button className="icon-btn" onClick={() => setEditing({ ...blank, ...s, password: '', permissions: s.permissions || ['dashboard', 'orders'] })} aria-label="Edit"><FiEdit2 /></button>
                      <button className="icon-btn danger" onClick={() => setToDelete(s)} aria-label="Remove"><FiTrash2 /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit staff member' : 'Add staff member'} size="lg">
        {editing && (
          <form onSubmit={save}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="st-name" className="required">Name</label>
                <input id="st-name" className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="st-email" className="required">Email (login)</label>
                <input id="st-email" type="email" className="input" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} disabled={!!editing._id} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="st-phone">Phone</label>
                <input id="st-phone" className="input" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="st-pass" className={editing._id ? '' : 'required'}>{editing._id ? 'Reset password (optional)' : 'Temporary password'}</label>
                <input id="st-pass" type="password" autoComplete="new-password" className="input" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
              </div>
            </div>

            <h4 className="staff__sub">Access permissions</h4>
            <div className="staff__grid">
              {ADMIN_PERMISSIONS.map((p) => (
                <label key={p} className={`checkbox staff__perm ${SENSITIVE.includes(p) ? 'is-sensitive' : ''}`}>
                  <input type="checkbox" checked={editing.permissions.includes(p)} onChange={() => togglePerm(p)} />
                  {p}{SENSITIVE.includes(p) && ' ⚠️'}
                </label>
              ))}
            </div>
            <p className="field-hint">⚠️ Sensitive sections — only grant if you fully trust this person.</p>

            <label className="checkbox staff__disable">
              <input type="checkbox" checked={editing.disabled} onChange={(e) => setEditing({ ...editing, disabled: e.target.checked })} /> Disable this account (blocks login)
            </label>

            <button className="btn btn-primary">Save</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Remove ${toDelete?.name}'s admin access? They will no longer be able to log in.`}
        confirmText="Remove"
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          try {
            await adminService.removeStaff(toDelete._id, user.email);
            toast.success('Staff removed');
            reload();
          } catch (err) {
            toast.error(err.message);
          }
          setToDelete(null);
        }}
      />
    </div>
  );
};

export default Staff;
