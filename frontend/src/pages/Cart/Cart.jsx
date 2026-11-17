import { Link, useNavigate } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader/PageHeader';
import CartItem from '../../components/CartItem/CartItem';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import EmptyState from '../../components/EmptyState/EmptyState';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getEarliestDeliveryDate, getRequiredLeadTime } from '../../utils/dates';
import { formatDate, formatPrice } from '../../utils/format';
import './Cart.css';

const Cart = () => {
  usePageTitle('Your Cart');
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <>
        <PageHeader title="Your Cart" breadcrumbs={[{ label: 'Cart' }]} />
        <EmptyState icon="🛍️" title="Your cart is empty" message="Looks like you haven't picked any blooms yet." actionText="Start shopping" actionTo="/shop" />
      </>
    );
  }

  const belowMin = settings.minOrderValue && subtotal < settings.minOrderValue;
  const closed = settings.storeStatus === 'closed';

  return (
    <div className="cart-page">
      <PageHeader title="Your Cart" breadcrumbs={[{ label: 'Cart' }]} />
      <div className="container section cart-page__grid">
        <div className="card">
          <div className="cart-page__notice">
            <FiClock />
            <span>
              Your items need <strong>{getRequiredLeadTime(items, settings)} days</strong> to prepare. Earliest delivery:{' '}
              <strong>{formatDate(getEarliestDeliveryDate(items, settings))}</strong>
            </span>
          </div>
          {items.map((item) => (
            <CartItem key={item.key} item={item} onQuantity={updateQuantity} onRemove={removeItem} />
          ))}
          <Link to="/shop" className="cart-page__continue">← Continue shopping</Link>
        </div>

        <aside>
          <OrderSummary subtotal={subtotal} deliveryFee={null} total={subtotal} deliveryNote="Calculated by city at checkout">
            <p className="field-hint cart-page__hint">Have a coupon? You can apply it at checkout.</p>
            {belowMin && <p className="field-error cart-page__hint">Minimum order value is {formatPrice(settings.minOrderValue)}.</p>}
            {closed && <p className="field-error cart-page__hint">The store is temporarily closed.</p>}
            <button className="btn btn-primary btn-block cart-page__checkout" disabled={belowMin || closed} onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </OrderSummary>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
