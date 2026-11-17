import './AdminPageHeader.css';

const AdminPageHeader = ({ title, subtitle, children }) => (
  <div className="admin-page-header no-print">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {children && <div className="admin-page-header__actions">{children}</div>}
  </div>
);

export default AdminPageHeader;
