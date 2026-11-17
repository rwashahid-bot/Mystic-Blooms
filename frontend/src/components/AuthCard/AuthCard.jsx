import './AuthCard.css';

/** Centered card wrapper shared by Login, Register and Forgot Password pages. */
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="auth-card__wrap">
    <div className="auth-card">
      <div className="auth-card__head">
        <span className="auth-card__icon" aria-hidden="true">🌸</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="auth-card__footer">{footer}</div>}
    </div>
  </div>
);

export default AuthCard;
