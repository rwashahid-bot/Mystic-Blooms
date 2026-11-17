import { Link } from 'react-router-dom';
import './SectionHeading.css';

const SectionHeading = ({ eyebrow, title, subtitle, linkTo, linkText = 'View all', align = 'center' }) => (
  <div className={`section-heading section-heading--${align}`}>
    <div>
      {eyebrow && <span className="section-heading__eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {linkTo && (
      <Link to={linkTo} className="section-heading__link">
        {linkText} →
      </Link>
    )}
  </div>
);

export default SectionHeading;
