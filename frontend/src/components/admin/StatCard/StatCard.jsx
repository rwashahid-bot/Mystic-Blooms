import { Link } from 'react-router-dom';
import './StatCard.css';

const StatCard = ({ icon: Icon, label, value, hint, tone = 'primary', to }) => {
  const body = (
    <>
      <span className={`stat-card__icon stat-card__icon--${tone}`}>{Icon && <Icon />}</span>
      <div>
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {hint && <small className="stat-card__hint">{hint}</small>}
      </div>
    </>
  );
  return to ? <Link to={to} className="stat-card is-link">{body}</Link> : <div className="stat-card">{body}</div>;
};

export default StatCard;
