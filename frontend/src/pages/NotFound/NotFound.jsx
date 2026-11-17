import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import './NotFound.css';

const NotFound = () => {
  usePageTitle('Page Not Found');
  return (
    <div className="container not-found">
      <span className="not-found__code">404</span>
      <h1>This bloom wandered off 🌷</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div>
        <Link to="/" className="btn btn-primary">Back to home</Link>
        <Link to="/shop" className="btn btn-outline">Browse the shop</Link>
      </div>
    </div>
  );
};

export default NotFound;
