import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './Logo.css';

const Logo = ({ to = '/', size = 'md', light = false }) => {
  const { settings } = useStore();
  return (
    <Link to={to} className={`logo logo--${size} ${light ? 'logo--light' : ''}`} aria-label={`${settings.businessName} home`}>
      {settings.logoUrl ? (
        <img src={settings.logoUrl} alt={settings.businessName} className="logo__img" />
      ) : (
        <>
          <span className="logo__badge" aria-hidden="true">
            <span>MB</span>
          </span>
          <span className="logo__text">{settings.businessName}</span>
        </>
      )}
    </Link>
  );
};

export default Logo;
