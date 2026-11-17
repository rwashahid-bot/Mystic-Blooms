import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiPackage, FiLogOut } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useAuth } from '../../context/AuthContext';
import './AccountLayout.css';

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="My Account" subtitle={`Welcome back, ${user?.name?.split(' ')[0] || ''} 🌸`} breadcrumbs={[{ label: 'My Account' }]} />
      <div className="container account-layout section">
        <nav className="account-layout__nav" aria-label="Account">
          <NavLink to="/account" end><FiUser /> Profile</NavLink>
          <NavLink to="/account/addresses"><FiMapPin /> Addresses</NavLink>
          <NavLink to="/account/orders"><FiPackage /> My Orders</NavLink>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <FiLogOut /> Log out
          </button>
        </nav>
        <div className="account-layout__content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AccountLayout;
