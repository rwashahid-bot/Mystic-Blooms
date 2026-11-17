import { Link, NavLink, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import './Policy.css';

const Policy = () => {
  const { slug } = useParams();
  const { cms } = useStore();
  const policy = cms.policies?.[slug];
  usePageTitle(policy?.title);

  if (!policy) return <EmptyState title="Page not found" actionText="Go home" actionTo="/" />;

  return (
    <div className="policy">
      <PageHeader title={policy.title} breadcrumbs={[{ label: 'Policies' }, { label: policy.title }]} />
      <div className="container section policy__grid">
        <nav className="policy__nav" aria-label="Policies">
          {Object.entries(cms.policies).map(([key, p]) => (
            <NavLink key={key} to={`/policies/${key}`}>{p.title}</NavLink>
          ))}
          <Link to="/faqs">FAQs</Link>
        </nav>
        <article className="policy__content card">
          {policy.content.split('\n').map((line, i) => (line.trim() ? <p key={i}>{line}</p> : null))}
        </article>
      </div>
    </div>
  );
};

export default Policy;
