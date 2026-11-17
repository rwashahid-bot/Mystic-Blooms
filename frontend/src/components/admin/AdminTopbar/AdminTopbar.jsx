import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { formatDateTime } from '../../../utils/format';
import './AdminTopbar.css';

const STORE_STATUS = { open: 'Store open', closed: 'Store closed', preorder: 'Pre-orders only' };

const AdminTopbar = ({ onMenu, alerts = [] }) => {
  const { user, logout } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = alerts.filter((a) => a.unread).length;

  return (
    <header className="admin-topbar">
      <button className="admin-topbar__menu" onClick={onMenu} aria-label="Open menu">
        <FiMenu />
      </button>

      <span className={`admin-topbar__status is-${settings.storeStatus}`}>{STORE_STATUS[settings.storeStatus]}</span>

      <div className="admin-topbar__right">
        <div className="admin-topbar__bell-wrap">
          <button className="admin-topbar__bell" onClick={() => setOpen((o) => !o)} aria-label={`Notifications (${unread})`} aria-expanded={open}>
            <FiBell />
            {unread > 0 && <span>{unread > 9 ? '9+' : unread}</span>}
          </button>
          {open && (
            <div className="admin-topbar__dropdown" onMouseLeave={() => setOpen(false)}>
              <div className="admin-topbar__dropdown-head">
                <strong>Notifications</strong>
                <Link to="/admin/notifications" onClick={() => setOpen(false)}>See all</Link>
              </div>
              {alerts.length === 0 && <p className="admin-topbar__empty">You're all caught up 🌸</p>}
              {alerts.slice(0, 6).map((a) => (
                <Link key={a.id} to={a.link} className="admin-topbar__alert" onClick={() => setOpen(false)}>
                  <strong>{a.title}</strong>
                  <span>{a.text}</span>
                  <small>{formatDateTime(a.at)}</small>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="admin-topbar__user">
          <span className="admin-topbar__avatar">{user?.name?.[0]}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.role === 'admin' ? 'Owner' : 'Staff'}</small>
          </div>
        </div>
        <button
          className="admin-topbar__logout"
          onClick={() => {
            logout();
            navigate('/admin/login');
          }}
          aria-label="Log out"
          title="Log out"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
