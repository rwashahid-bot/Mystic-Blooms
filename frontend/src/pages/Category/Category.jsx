import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import ProductBrowser from '../../components/ProductBrowser/ProductBrowser';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import { categoryService } from '../../services/categoryService';
import { useAsync } from '../../hooks/useAsync';
import { usePageTitle } from '../../hooks/usePageTitle';
import './Category.css';

const Category = () => {
  const { slug } = useParams();
  const { data: category, loading, error } = useAsync(() => categoryService.getBySlug(slug), [slug]);
  usePageTitle(category?.name, category?.description);

  if (loading) return <Loader fullPage />;
  if (error || !category) {
    return <EmptyState title="Category not found" message="This collection may have been moved or hidden." actionText="Browse all products" actionTo="/shop" />;
  }

  return (
    <div className="category-page">
      <PageHeader title={category.name} subtitle={category.description} breadcrumbs={[{ label: 'Shop', to: '/shop' }, { label: category.name }]} />
      <section className="container category-page__body">
        <ProductBrowser categorySlug={slug} />
      </section>
    </div>
  );
};

export default Category;
