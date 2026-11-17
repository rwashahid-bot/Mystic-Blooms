import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderInfo from '../../../components/OrderInfo/OrderInfo';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { orderService } from '../../../services/orderService';
import { useAsync } from '../../../hooks/useAsync';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { reorderItems } from '../../../utils/reorder';
import './MyOrderDetails.css';

const MyOrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { data: order, loading, error } = useAsync(() => orderService.getMine(user._id, id), [id, user._id]);
  usePageTitle(order ? `Order ${order.orderNumber}` : 'Order');

  if (loading) return <Loader />;
  if (error || !order) return <EmptyState title="Order not found" actionText="Back to my orders" actionTo="/account/orders" />;

  const reorder = async () => {
    const { added, skipped } = await reorderItems(order, addItem);
    if (skipped.length) toast(`Not available anymore: ${skipped.join(', ')}`, { icon: 'ℹ️' });
    if (added) navigate('/cart');
  };

  return (
    <div className="my-order-details">
      <div className="my-order-details__bar">
        <Link to="/account/orders">← All orders</Link>
        <button className="btn btn-outline btn-sm" onClick={reorder}>Reorder these items</button>
      </div>
      <OrderInfo order={order} />
    </div>
  );
};

export default MyOrderDetails;
