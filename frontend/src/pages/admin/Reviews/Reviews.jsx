import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import StarRating from '../../../components/StarRating/StarRating';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { reviewService } from '../../../services/marketingService';
import { productService } from '../../../services/productService';
import { formatDate } from '../../../utils/format';
import './Reviews.css';

const Reviews = () => {
  const { user } = useAuth();
  const { data, loading, reload } = useAsync(async () => {
    const [reviews, products] = await Promise.all([reviewService.list(), productService.list({ admin: true })]);
    return { reviews, products };
  }, []);
  const [filter, setFilter] = useState('pending');
  const [toDelete, setToDelete] = useState(null);

  if (loading) return <Loader />;

  const productName = (id) => data.products.find((p) => p._id === id)?.name || 'Deleted product';
  const list = data.reviews.filter((r) => !filter || r.status === filter);
  const count = (s) => data.reviews.filter((r) => r.status === s).length;

  const moderate = async (r, status) => {
    await reviewService.moderate(r._id, status, user.email);
    toast.success(status === 'approved' ? 'Review published' : 'Review rejected');
    reload();
  };

  return (
    <div className="reviews-admin">
      <AdminPageHeader title="Reviews" subtitle="Approve reviews from verified buyers before they appear on product pages. Testimonials are managed in Website CMS." />

      <div className="reviews-admin__tabs">
        {[
          ['pending', `Pending (${count('pending')})`],
          ['approved', `Published (${count('approved')})`],
          ['rejected', `Rejected (${count('rejected')})`],
          ['', `All (${data.reviews.length})`],
        ].map(([v, l]) => (
          <button key={v} className={filter === v ? 'is-active' : ''} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="⭐" title="No reviews here" />
      ) : (
        <div className="reviews-admin__list">
          {list.map((r) => (
            <article key={r._id} className="card reviews-admin__item">
              <div className="reviews-admin__head">
                <div>
                  <strong>{r.name}</strong> <StarRating value={r.rating} size="sm" />
                  <p className="text-muted">on <em>{productName(r.productId)}</em> · {formatDate(r.createdAt)} {r.orderId && '· ✅ Verified buyer'}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="reviews-admin__comment">“{r.comment}”</p>
              <div className="reviews-admin__actions">
                {r.status !== 'approved' && <button className="btn btn-primary btn-sm" onClick={() => moderate(r, 'approved')}><FiCheck /> Approve</button>}
                {r.status !== 'rejected' && <button className="btn btn-light btn-sm" onClick={() => moderate(r, 'rejected')}><FiX /> Reject</button>}
                <button className="icon-btn danger" onClick={() => setToDelete(r)} aria-label="Delete review"><FiTrash2 /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        message="Delete this review permanently?"
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          await reviewService.remove(toDelete._id, user.email);
          setToDelete(null);
          toast.success('Review deleted');
          reload();
        }}
      />
    </div>
  );
};

export default Reviews;
