import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import './PageHeader.css';

/** Soft banner used at the top of inner storefront pages. */
const PageHeader = ({ title, subtitle, breadcrumbs }) => (
  <section className="page-header">
    <div className="container">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </section>
);

export default PageHeader;
