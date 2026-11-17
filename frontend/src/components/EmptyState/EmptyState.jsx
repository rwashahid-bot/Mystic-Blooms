import { Link } from 'react-router-dom';
import './EmptyState.css';

const EmptyState = ({ icon = '🌸', title, message, actionText, actionTo, onAction }) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {actionText && actionTo && <Link to={actionTo} className="btn btn-primary">{actionText}</Link>}
    {actionText && onAction && <button className="btn btn-primary" onClick={onAction}>{actionText}</button>}
  </div>
);

export default EmptyState;
