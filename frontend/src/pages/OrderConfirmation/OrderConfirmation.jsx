import { Link, useLocation, useParams } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import OrderInfo from '../../components/OrderInfo/OrderInfo';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatPrice } from '../../utils/format';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  usePageTitle('Order Confirmed');
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const { settings } = useStore();
  const order = state?.order;

  const method = settings.paymentMethods.find((m) => m.id === order?.payment.method);
  const needsPayment = order && order.payment.method !== 'cod';
  const waText = encodeURIComponent(`Hi Mystic Blooms! I placed order ${orderNumber}${needsPayment ? ` and here is my payment proof for ${formatPrice(order.total)}.` : '.'}`);

  return (
    <div className="container section confirmation">
      <div className="confirmation__hero">
        <div className="confirmation__icon" aria-hidden="true">🌸</div>
        <h1>Thank you for your order!</h1>
        <p>
          Your order number is <strong>{orderNumber}</strong>. Save it to track your order. We'll review your order and confirm it shortly
          {order?.customer.email ? ` — a confirmation has been sent to ${order.customer.email}.` : '.'}
        </p>
      </div>

      {needsPayment && method && (
        <div className="confirmation__payment">
          <h3>Complete your payment</h3>
          <p>Please transfer <strong>{formatPrice(order.total)}</strong> using the details below and share the screenshot with us:</p>
          <pre>{method.instructions}</pre>
          <a className="btn btn-primary" href={`https://wa.me/${settings.contact.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer">
            <FaWhatsapp /> Send payment proof on WhatsApp
          </a>
        </div>
      )}

      {order && <OrderInfo order={order} showTimeline={false} />}

      <div className="confirmation__actions">
        <Link to="/track-order" className="btn btn-outline">Track your order</Link>
        <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
