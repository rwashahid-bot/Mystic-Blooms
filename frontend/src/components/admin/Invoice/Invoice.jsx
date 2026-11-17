import { useStore } from '../../../context/StoreContext';
import { formatDate, formatPrice, optionsToText, paymentLabel } from '../../../utils/format';
import './Invoice.css';

/** Printable invoice / packing slip. Packing slip hides prices when the gift option asks for it. */
const Invoice = ({ order, mode = 'invoice' }) => {
  const { settings } = useStore();
  const isSlip = mode === 'slip';
  const hidePrices = isSlip && order.recipient?.hidePrices;
  const shipTo = order.recipient?.isGift
    ? { name: order.recipient.name, phone: order.recipient.phone }
    : { name: order.customer.name, phone: order.customer.phone };

  return (
    <div className="invoice print-area">
      <header className="invoice__head">
        <div>
          <h2>{settings.businessName}</h2>
          <p>{settings.contact.address}</p>
          <p>{settings.contact.phone} · {settings.contact.email}</p>
        </div>
        <div className="invoice__meta">
          <h3>{isSlip ? 'Packing Slip' : 'Invoice'}</h3>
          <p>Order <strong>{order.orderNumber}</strong></p>
          <p>Date: {formatDate(order.createdAt)}</p>
          <p>Deliver on: {formatDate(order.requestedDate)}</p>
        </div>
      </header>

      <section className="invoice__parties">
        {!isSlip && (
          <div>
            <h4>Billed to</h4>
            <p>{order.customer.name}</p>
            <p>{order.customer.phone}</p>
            {order.customer.email && <p>{order.customer.email}</p>}
          </div>
        )}
        <div>
          <h4>Ship to</h4>
          <p>{shipTo.name}</p>
          <p>{shipTo.phone}</p>
          <p>{order.shipping.address}</p>
          <p>{order.shipping.city} {order.shipping.postalCode}</p>
        </div>
      </section>

      <table className="invoice__table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            {!hidePrices && <th>Unit</th>}
            {!hidePrices && <th>Total</th>}
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, k) => (
            <tr key={k}>
              <td>
                {i.name} <small>({i.sku})</small>
                {optionsToText(i.options) && <div className="invoice__opt">{optionsToText(i.options)}</div>}
              </td>
              <td>{i.quantity}</td>
              {!hidePrices && <td>{formatPrice(i.unitPrice)}</td>}
              {!hidePrices && <td>{formatPrice(i.lineTotal)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {!hidePrices && (
        <div className="invoice__totals">
          <p><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
          {order.discount > 0 && <p><span>Discount ({order.couponCode})</span><span>− {formatPrice(order.discount)}</span></p>}
          <p><span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span></p>
          <p className="invoice__grand"><span>Total</span><span>{formatPrice(order.total)}</span></p>
          <p><span>Payment</span><span>{paymentLabel(order.payment.method)} — {order.payment.status}</span></p>
        </div>
      )}

      {order.recipient?.isGift && order.recipient.message && (
        <div className="invoice__message">
          <h4>Gift message</h4>
          <p>“{order.recipient.message}”</p>
        </div>
      )}

      <footer className="invoice__foot">Thank you for choosing {settings.businessName} 🌸 Handmade with love.</footer>
    </div>
  );
};

export default Invoice;
