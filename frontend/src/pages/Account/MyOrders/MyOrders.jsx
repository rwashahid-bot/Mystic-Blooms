import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { orderService } from '../../../services/orderService';
import { useAsync } from '../../../hooks/useAsync';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { reorderItems } from '../../../utils/reorder';
import { formatDate, formatPrice } from '../../../utils/format';
import './MyOrders.css';

const MyOrders = () => {
  usePageTitle('My Orders');
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { data: orders, loading } = useAsync(() => orderService.mine(user._id), [user._id]);

  const reorder = async (order) => {
    const { added, skipped } = await reorderItems(order, addItem);
    if (skipped.length) toast(`Not available anymore: ${skipped.join(', ')}`, { icon: 'ℹ️' });
    if (added) navigate('/cart');
  };

  if (loading) return <Loader />;
  if (!orders?.length) return <EmptyState icon="📦" title="No orders yet" message="When you place an order it will appear here." actionText="Start shopping" actionTo="/shop" />;

  return (
    <div className="my-orders">
      <h2>My orders</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Delivery</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><Link to={`/account/orders/${o._id}`} className="my-orders__link">{o.orderNumber}</Link></td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatDate(o.requestedDate)}</td>
                <td>{formatPrice(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="actions">
                  <Link to={`/account/orders/${o._id}`} className="btn btn-light btn-sm">View</Link>
                  <button className="btn btn-outline btn-sm" onClick={() => reorder(o)}>Reorder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrders;
