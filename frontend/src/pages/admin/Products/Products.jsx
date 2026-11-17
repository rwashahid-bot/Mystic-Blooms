import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiCopy, FiTrash2, FiEye, FiEyeOff, FiArchive, FiSearch, FiDownload } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import ProductImage from '../../../components/ProductImage/ProductImage';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { useAsync } from '../../../hooks/useAsync';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { exportCsv } from '../../../utils/exportCsv';
import { formatPrice } from '../../../utils/format';
import './Products.css';

const TYPE_LABEL = { 'ready-made': 'Ready-made', 'made-to-order': 'Made to order', custom: 'Custom enquiry' };

const Products = () => {
  const { user } = useAuth();
  const { refresh } = useStore();
  const navigate = useNavigate();
  const { data, loading, reload } = useAsync(async () => {
    const [products, categories] = await Promise.all([productService.list({ admin: true, sort: 'newest' }), categoryService.list({ includeInactive: true })]);
    return { products, categories };
  }, []);
  const [filters, setFilters] = useState({ q: '', category: '', status: '', type: '' });
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = filters.q.toLowerCase();
    return data.products.filter(
      (p) =>
        (!q || `${p.name} ${p.sku}`.toLowerCase().includes(q)) &&
        (!filters.category || p.category === filters.category) &&
        (!filters.status || p.status === filters.status) &&
        (!filters.type || p.type === filters.type)
    );
  }, [data, filters]);

  if (loading) return <Loader />;

  const catName = (id) => data.categories.find((c) => c._id === id)?.name || '—';

  const act = async (fn, msg) => {
    try {
      await fn();
      toast.success(msg);
      reload();
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const duplicate = async (p) => {
    const copy = await productService.duplicate(p._id, user.email);
    toast.success('Product duplicated as draft');
    navigate(`/admin/products/${copy._id}/edit`);
  };

  const doExport = () =>
    exportCsv(
      filtered.map((p) => ({
        Name: p.name, SKU: p.sku, Category: catName(p.category), Type: TYPE_LABEL[p.type], Price: p.price, 'Sale price': p.salePrice || '',
        Stock: p.type === 'ready-made' ? p.stock : '', 'Lead time (days)': p.leadTimeDays, Status: p.status, Featured: p.featured ? 'Yes' : 'No', Sold: p.sold || 0,
      })),
      'products.csv'
    );

  return (
    <div className="products-admin">
      <AdminPageHeader title="Products" subtitle={`${data.products.length} products in catalogue`}>
        <button className="btn btn-light btn-sm" onClick={doExport}><FiDownload /> Export</button>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm"><FiPlus /> Add product</Link>
      </AdminPageHeader>

      <div className="card products-admin__filters">
        <div className="products-admin__search">
          <FiSearch />
          <input className="input" placeholder="Search name or SKU" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} aria-label="Search products" />
        </div>
        <select className="select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {data.categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} aria-label="Status">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select className="select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} aria-label="Type">
          <option value="">All types</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🌷" title="No products found" actionText="Add product" actionTo="/admin/products/new" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock / Type</th><th>Lead</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="products-admin__product">
                      <ProductImage src={p.images?.[0]} alt={p.name} color={p.color} />
                      <div>
                        <Link to={`/admin/products/${p._id}/edit`}><strong>{p.name}</strong></Link>
                        <small>{p.sku} {p.featured && '· ⭐ Featured'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{catName(p.category)}</td>
                  <td>
                    {p.salePrice ? (
                      <>
                        <strong>{formatPrice(p.salePrice)}</strong>
                        <br />
                        <s className="text-muted">{formatPrice(p.price)}</s>
                      </>
                    ) : (
                      formatPrice(p.price)
                    )}
                  </td>
                  <td>
                    {p.type === 'ready-made' ? (
                      <span className={p.stock <= p.lowStockThreshold ? 'text-danger' : ''}>{p.stock} in stock</span>
                    ) : (
                      <span className="text-muted">{TYPE_LABEL[p.type]}</span>
                    )}
                    {!p.available && <div className="text-danger"><small>Paused</small></div>}
                  </td>
                  <td>{p.leadTimeDays}d</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="actions">
                    <Link to={`/admin/products/${p._id}/edit`} className="icon-btn" title="Edit" aria-label="Edit"><FiEdit2 /></Link>
                    <button className="icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => duplicate(p)}><FiCopy /></button>
                    {p.status === 'published' ? (
                      <button className="icon-btn" title="Unpublish" aria-label="Unpublish" onClick={() => act(() => productService.update(p._id, { status: 'draft' }, user.email), 'Unpublished')}><FiEyeOff /></button>
                    ) : (
                      <button className="icon-btn" title="Publish" aria-label="Publish" onClick={() => act(() => productService.update(p._id, { status: 'published' }, user.email), 'Published')}><FiEye /></button>
                    )}
                    {p.status !== 'archived' && (
                      <button className="icon-btn" title="Archive" aria-label="Archive" onClick={() => act(() => productService.update(p._id, { status: 'archived' }, user.email), 'Archived')}><FiArchive /></button>
                    )}
                    <button className="icon-btn danger" title="Delete" aria-label="Delete" onClick={() => setToDelete(p)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently deleted. Past orders keep their saved snapshot. Consider archiving instead.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          const p = toDelete;
          setToDelete(null);
          act(() => productService.remove(p._id, user.email), 'Product deleted');
        }}
      />
    </div>
  );
};

export default Products;
