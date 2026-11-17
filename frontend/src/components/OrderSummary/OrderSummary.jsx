import { formatPrice } from '../../utils/format';
import './OrderSummary.css';

/** Totals box used in Cart, Checkout and order details. */
const OrderSummary = ({ subtotal, discount = 0, deliveryFee, total, couponCode, children, title = 'Order Summary', deliveryNote }) => (
  <div className="order-summary">
    <h3>{title}</h3>
    <dl>
      <div>
        <dt>Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="order-summary__discount">
          <dt>Discount {couponCode && <span className="chip">{couponCode}</span>}</dt>
          <dd>− {formatPrice(discount)}</dd>
        </div>
      )}
      <div>
        <dt>Delivery</dt>
        <dd>{deliveryFee === null || deliveryFee === undefined ? <span className="text-muted">{deliveryNote || 'Calculated at checkout'}</span> : deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</dd>
      </div>
      <div className="order-summary__total">
        <dt>Total</dt>
        <dd>{formatPrice(total ?? subtotal - discount + (deliveryFee || 0))}</dd>
      </div>
    </dl>
    {children}
  </div>
);

export default OrderSummary;
