import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiShoppingCart, FiBox, FiFolder, FiLayers, FiUsers, FiStar, FiTag, FiMessageSquare,
  FiEdit3, FiBarChart2, FiBell, FiShield, FiSettings, FiList, FiExternalLink,
} from 'react-icons/fi';
import Logo from '../../Logo/Logo';
import { useAuth } from '../../../context/AuthContext';
import './AdminSidebar.css';

export const ADMIN_NAV = [
  { section: 'Overview' },
  { to: '/admin', label: 'Dashboard', icon: FiGrid, perm: 'dashboard', end: true },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingCart, perm: 'orders' },
  { to: '/admin/notifications', label: 'Notifications', icon: FiBell, perm: 'notifications' },
  { section: 'Catalogue' },
  { to: '/admin/products', label: 'Products', icon: FiBox, perm: 'products' },
  { to: '/admin/categories', label: 'Categories', icon: FiFolder, perm: 'categories' },
  { to: '/admin/inventory', label: 'Inventory', icon: FiLayers, perm: 'inventory' },
  { section: 'Customers' },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers, perm: 'customers' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: FiMessageSquare, perm: 'enquiries' },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar, perm: 'reviews' },
  { to: '/admin/coupons', label: 'Coupons', icon: FiTag, perm: 'coupons' },
  { section: 'Store' },
  { to: '/admin/content', label: 'Website CMS', icon: FiEdit3, perm: 'content' },
  { to: '/admin/reports', label: 'Reports', icon: FiBarChart2, perm: 'reports' },
  { to: '/admin/staff', label: 'Staff & Roles', icon: FiShield, perm: 'staff' },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings, perm: 'settings' },
  { to: '/admin/audit-log', label: 'Audit Log', icon: FiList, perm: 'audit' },
];

const AdminSidebar = ({ open, onClose, badges = {} }) => {
  const { hasPermission } = useAuth();

  // Hide section headings that have no visible links after them
  const visible = ADMIN_NAV.filter((item, i) => {
    if (item.section) {
      const next = ADMIN_NAV.slice(i + 1);
      const end = next.findIndex((n) => n.section);
      return (end === -1 ? next : next.slice(0, end)).some((n) => hasPermission(n.perm));
    }
    return hasPermission(item.perm);
  });

  return (
    <>
      <div className={`admin-sidebar__backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Logo to="/admin" size="sm" light />
          <span>Admin</span>
        </div>
        <nav aria-label="Admin">
          {visible.map((item) =>
            item.section ? (
              <span key={item.section} className="admin-sidebar__section">{item.section}</span>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose}>
                <item.icon />
                <span>{item.label}</span>
                {badges[item.perm] > 0 && <em className="admin-sidebar__badge">{badges[item.perm]}</em>}
              </NavLink>
            )
          )}
        </nav>
        <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__store">
          <FiExternalLink /> View store
        </a>
      </aside>
    </>
  );
};

export default AdminSidebar;
