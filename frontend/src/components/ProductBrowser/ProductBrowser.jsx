import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSliders, FiX } from 'react-icons/fi';
import ProductFilters from '../ProductFilters/ProductFilters';
import ProductGrid from '../ProductGrid/ProductGrid';
import Loader from '../Loader/Loader';
import EmptyState from '../EmptyState/EmptyState';
import { productService } from '../../services/productService';
import './ProductBrowser.css';

const FILTER_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'availability', 'type', 'occasion', 'color', 'sort'];

/** Search + filter + sort + grid. Filters are stored in the URL so results are shareable. */
const ProductBrowser = ({ categorySlug }) => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ occasions: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const values = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const queryKey = params.toString();

  useEffect(() => {
    productService.filters().then(setFilterOptions).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const query = Object.fromEntries(new URLSearchParams(queryKey));
    productService
      .list({ ...query, category: categorySlug || query.category, sort: query.sort || 'featured' })
      .then((list) => active && setProducts(list))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [queryKey, categorySlug]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const reset = () => setParams({}, { replace: true });

  return (
    <div className="browser">
      <div className={`browser__sidebar ${showFilters ? 'is-open' : ''}`}>
        <button className="browser__close" onClick={() => setShowFilters(false)} aria-label="Close filters">
          <FiX />
        </button>
        <ProductFilters values={values} onChange={update} onReset={reset} options={filterOptions} hideCategory={!!categorySlug} />
      </div>

      <div className="browser__main">
        <div className="browser__toolbar">
          <button className="btn btn-light btn-sm browser__filter-btn" onClick={() => setShowFilters(true)}>
            <FiSliders /> Filters
          </button>
          <p className="text-muted">
            {loading ? 'Searching…' : `${products.length} product${products.length === 1 ? '' : 's'}`}
            {values.search && <> for “<strong>{values.search}</strong>”</>}
          </p>
          <label className="browser__sort">
            <span>Sort by</span>
            <select className="select" value={values.sort || 'featured'} onChange={(e) => update('sort', e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        {loading ? (
          <Loader />
        ) : products.length ? (
          <ProductGrid products={products} columns={3} />
        ) : (
          <EmptyState title="No flowers found" message="Try changing your filters or search term." actionText="Clear filters" onAction={reset} />
        )}
      </div>
    </div>
  );
};

export default ProductBrowser;
