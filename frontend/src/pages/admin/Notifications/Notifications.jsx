import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiShoppingCart, FiCreditCard, FiMessageSquare, FiStar, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { formatDateTime } from '../../../utils/format';
import './Notifications.css';

const TYPES = {
  order: { label: 'New orders', icon: FiShoppingCart },
  payment: { label: 'Payments to verify', icon: FiCreditCard },
  enquiry: { label: 'Enquiries', icon: FiMessageSquare },
  review: { label: 'Reviews', icon: FiStar },
  stock: { label: 'Stock alerts', icon: FiAlertTriangle },
  capacity: { label: 'Capacity alerts', icon: FiCalendar },
};

const Notifications = () => {
  const { alerts } = useOutletContext();
  const [type, setType] = useState('');
  const list = alerts.filter((a) => !type || a.type === type);

  return (
    <div className="notifications">
      <AdminPageHeader title="Notifications" subtitle="Everything that needs your attention. Email/WhatsApp automation can be connected to the backend later." />

      <div className="notifications__filters">
        <button className={!type ? 'is-active' : ''} onClick={() => setType('')}>All ({alerts.length})</button>
        {Object.entries(TYPES).map(([k, t]) => {
          const n = alerts.filter((a) => a.type === k).length;
          return n ? (
            <button key={k} className={type === k ? 'is-active' : ''} onClick={() => setType(k)}>
              {t.label} ({n})
            </button>
          ) : null;
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="🔔" title="You're all caught up" message="New orders, enquiries and alerts will show up here." />
      ) : (
        <ul className="notifications__list">
          {list.map((a) => {
            const Icon = TYPES[a.type]?.icon || FiShoppingCart;
            return (
              <li key={a.id}>
                <Link to={a.link} className={`notifications__item is-${a.type}`}>
                  <span className="notifications__icon"><Icon /></span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.text}</p>
                  </div>
                  <small>{formatDateTime(a.at)}</small>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
