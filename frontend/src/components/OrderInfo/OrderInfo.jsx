import ProductImage from '../ProductImage/ProductImage';
import OrderTimeline from '../OrderTimeline/OrderTimeline';
import OrderSummary from '../OrderSummary/OrderSummary';
import StatusBadge from '../StatusBadge/StatusBadge';
import { formatDate, formatDateTime, formatPrice, optionsToText, paymentLabel } from '../../utils/format';
import './OrderInfo.css';

/** Customer-facing order view (confirmation, tracking, account). Uses the saved snapshots only. */
const OrderInfo = ({ order, showTimeline = true }) => (
  <div className="order-info">
    <div className="order-info__head">
      <div>
        <h2>Order {order.orderNumber}</h2>
        <p className="text-muted">Placed on {formatDateTime(order.createdAt)}</p>
      </div>
      <div className="order-info__badges">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.payment.status} />
      </div>
    </div>

    {showTimeline && (
      <div className="card">
        <OrderTimeline status={order.status} history={order.statusHistory} />
        {order.courier?.tracking && (
          <p className="order-info__courier">
            🚚 Dispatched with <strong>{order.courier.name}</strong> — tracking #{order.courier.tracking}
          </p>
        )}
      </div>
    )}

    <div className="order-info__grid">
      <div className="card">
        <h3 className="card-title">Items</h3>
        <ul className="order-info__items">
          {order.items.map((item, i) => (
            <li key={i}>
              <ProductImage src={item.image} alt={item.name} color={item.color} />
              <div>
                <strong>{item.name}</strong>
                {optionsToText(item.options) && <small>{optionsToText(item.options)}</small>}
                {item.personalisation?.messageCard && <small>💌 “{item.personalisation.messageCard}”</small>}
                <small>
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </small>
              </div>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-info__side">
        <OrderSummary title="Payment" subtotal={order.subtotal} discount={order.discount} couponCode={order.couponCode} deliveryFee={order.deliveryFee} total={order.total}>
          <p className="order-info__pay">
            {paymentLabel(order.payment.method)}
            {order.payment.reference && <> · Ref: {order.payment.reference}</>}
          </p>
        </OrderSummary>

        <div className="card">
          <h3 className="card-title">Delivery</h3>
          <p><strong>Requested date:</strong> {formatDate(order.requestedDate)}</p>
          <p>{order.customer.name} · {order.customer.phone}</p>
          <p className="text-muted">
            {order.shipping.address}, {order.shipping.city} {order.shipping.postalCode}
          </p>
          {order.shipping.notes && <p className="text-muted">Note: {order.shipping.notes}</p>}
          {order.recipient?.isGift && (
            <div className="order-info__gift">
              🎁 Gift for <strong>{order.recipient.name}</strong> ({order.recipient.phone})
              {order.recipient.message && <p>“{order.recipient.message}”</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default OrderInfo;
