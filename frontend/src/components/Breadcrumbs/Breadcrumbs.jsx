import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

/** items: [{ label, to? }] — last item is the current page */
const Breadcrumbs = ({ items = [] }) => (
  <nav className="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li><Link to="/">Home</Link></li>
      {items.map((item, i) => (
        <li key={i} aria-current={i === items.length - 1 ? 'page' : undefined}>
          {item.to && i !== items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
