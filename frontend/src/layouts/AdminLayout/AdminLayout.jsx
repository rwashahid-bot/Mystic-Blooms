import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar/AdminTopbar';
import { useAdminAlerts } from '../../hooks/useAdminAlerts';
import './AdminLayout.css';

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { alerts, reload } = useAdminAlerts();
  const location = useLocation();

  // Refresh alerts when navigating between admin pages
  useEffect(() => {
    reload();
    document.title = 'Admin | Mystic Blooms';
  }, [location.pathname, reload]);

  const badges = {
    orders: alerts.filter((a) => a.type === 'order' || a.type === 'payment').length,
    enquiries: alerts.filter((a) => a.type === 'enquiry').length,
    reviews: alerts.filter((a) => a.type === 'review').length,
    inventory: alerts.filter((a) => a.type === 'stock').length,
  };

  return (
    <div className="admin-layout">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} badges={badges} />
      <div className="admin-layout__main">
        <AdminTopbar onMenu={() => setMenuOpen(true)} alerts={alerts} />
        <main className="admin-layout__content">
          <Outlet context={{ alerts, reloadAlerts: reload }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
