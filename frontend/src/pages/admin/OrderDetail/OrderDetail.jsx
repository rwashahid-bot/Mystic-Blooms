import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPrinter, FiPackage, FiArrowLeft } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import Invoice from '../../../components/admin/Invoice/Invoice';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import ProductImage from '../../../components/ProductImage/ProductImage';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Loader from '../../../components/Loader/Loader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { useAsync } from '../../../hooks/useAsync';
import { orderService } from '../../../services/orderService';
import { formatDate, formatDateTime, formatPrice, optionsToText, paymentLabel } from '../../../utils/format';
import './OrderDetail.css';

const PAYMENT_STATUSES = ['Unpaid', 'Awaiting Verification', 'Partially Paid', 'Paid', 'Refunded', 'Failed'];

const fillTemplate = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { settings } = useStore();
  const { data: order, setData: setOrder, loading, error } = useAsync(() => orderService.getById(id), [id]);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [note, setNote] = useState('');
  const [courier, setCourier] = useState(null);
  const [printMode, setPrintMode] = useState('invoice');
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (loading) return <Loader />;
  if (error || !order) return <EmptyState title="Order not found" actionText="Back to orders" actionTo="/admin/orders" />;

  const courierForm = courier || order.courier || { name: '', tracking: '', dispatchDate: '' };
  const actor = user.email;

  const changeStatus = async (status = statusForm.status, noteText = statusForm.note) => {
    if (!status || status === order.status) return toast.error('Choose a different status.');
    try {
      setOrder(await orderService.updateStatus(order._id, status, noteText, actor));
      setStatusForm({ status: '', note: '' });
      toast.success(`Status changed to ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onStatusSubmit = (e) => {
    e.preventDefault();
    if (statusForm.status === 'Cancelled') setConfirmCancel(true);
    else changeStatus();
  };

  const changePayment = async (status) => {
    setOrder(await orderService.updatePayment(order._id, status, actor));
    toast.success(`Payment marked ${status}`);
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setOrder(await orderService.addNote(order._id, note.trim(), actor));
    setNote('');
  };

  const saveCourier = async (e) => {
    e.preventDefault();
    setOrder(await orderService.updateCourier(order._id, courierForm, actor));
    setCourier(null);
    toast.success('Courier details saved');
  };

  const print = (mode) => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 50);
  };

  const waNumber = order.customer.phone.replace(/^0/, '92');
  const waMessage = encodeURIComponent(
    fillTemplate(settings.notifications?.statusUpdate || 'Hi {name}, your order {orderNumber} is now {status}.', {
      name: order.customer.name.split(' ')[0],
      orderNumber: order.orderNumber,
      status: order.status,
    }) + (order.courier?.tracking ? ` Tracking: ${order.courier.name} #${order.courier.tracking}` : '')
  );

  const nextStatuses = settings.orderStatuses.filter((s) => s !== order.status);

  return (
    <div className="order-detail">
      <div className="no-print">
        <Link to="/admin/orders" className="order-detail__back"><FiArrowLeft /> All orders</Link>
        <AdminPageHeader title={`Order ${order.orderNumber}`} subtitle={`Placed ${formatDateTime(order.createdAt)}`}>
          <button className="btn btn-light btn-sm" onClick={() => print('invoice')}><FiPrinter /> Invoice</button>
          <button className="btn btn-light btn-sm" onClick={() => print('slip')}><FiPackage /> Packing slip</button>
          <a className="btn btn-outline btn-sm" href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noreferrer">
            <FaWhatsapp /> Notify customer
          </a>
        </AdminPageHeader>

        <div className="order-detail__badges">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.payment.status} />
          <span className="chip">Deliver on {formatDate(order.requestedDate)}</span>
        </div>

        <div className="order-detail__grid">
          <div className="order-detail__main">
            <section className="card">
              <h3 className="card-title">Items ({order.items.length})</h3>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Product</th><th>Options & personalisation</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {order.items.map((i, k) => (
                      <tr key={k}>
                        <td>
                          <div className="order-detail__product">
                            <ProductImage src={i.image} alt={i.name} color={i.color} />
                            <div>
                              <strong>{i.name}</strong>
                              <small>{i.sku}</small>
                            </div>
                          </div>
                        </td>
                        <td className="order-detail__opts">
                          {optionsToText(i.options) || '—'}
                          {Object.entries(i.personalisation || {}).map(([k2, v]) => (
                            <div key={k2}><em>{k2.replace(/([A-Z])/g, ' $1').toLowerCase()}:</em> {v}</div>
                          ))}
                        </td>
                        <td>{i.quantity}</td>
                        <td>{formatPrice(i.unitPrice)}</td>
                        <td><strong>{formatPrice(i.lineTotal)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <dl className="order-detail__totals">
                <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                {order.discount > 0 && <div><dt>Discount ({order.couponCode})</dt><dd>− {formatPrice(order.discount)}</dd></div>}
                <div><dt>Delivery fee</dt><dd>{formatPrice(order.deliveryFee)}</dd></div>
                <div className="is-total"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
              </dl>
            </section>

            <section className="card">
              <h3 className="card-title">Update status</h3>
              <form className="order-detail__status" onSubmit={onStatusSubmit}>
                <select className="select" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} aria-label="New status">
                  <option value="">Move to…</option>
                  {nextStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input className="input" placeholder="Note (optional, visible to customer)" value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} />
                <button className="btn btn-primary btn-sm">Update</button>
              </form>
              <h4 className="order-detail__subhead">Status history</h4>
              <ul className="order-detail__history">
                {[...order.statusHistory].reverse().map((h, k) => (
                  <li key={k}>
                    <StatusBadge status={h.status} />
                    <span>{formatDateTime(h.at)}</span>
                    {h.by && <span className="text-muted">by {h.by}</span>}
                    {h.note && <p>{h.note}</p>}
                  </li>
                ))}
              </ul>
            </section>

            <section className="card">
              <h3 className="card-title">Private admin notes</h3>
              <ul className="order-detail__notes">
                {order.adminNotes.length === 0 && <li className="text-muted">No notes yet.</li>}
                {order.adminNotes.map((n, k) => (
                  <li key={k}>
                    <p>{n.text}</p>
                    <small>{n.by} · {formatDateTime(n.at)}</small>
                  </li>
                ))}
              </ul>
              <form className="order-detail__note-form" onSubmit={addNote}>
                <input className="input" placeholder="Add a private note (not visible to customer)" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn btn-light btn-sm">Add note</button>
              </form>
            </section>
          </div>

          <aside className="order-detail__side">
            <section className="card">
              <h3 className="card-title">Customer</h3>
              <p><strong>{order.customer.name}</strong> {order.customerId ? <span className="chip">Registered</span> : <span className="chip">Guest</span>}</p>
              <p><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></p>
              {order.customer.email && <p><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></p>}
              <hr className="divider" />
              <h4 className="order-detail__subhead">Delivery address</h4>
              <p>{order.shipping.address}</p>
              <p>{order.shipping.city} {order.shipping.postalCode}</p>
              {order.shipping.notes && <p className="order-detail__note">📝 {order.shipping.notes}</p>}
              {order.recipient?.isGift && (
                <div className="order-detail__gift">
                  <strong>🎁 Gift recipient</strong>
                  <p>{order.recipient.name} · {order.recipient.phone}</p>
                  {order.recipient.message && <p>“{order.recipient.message}”</p>}
                  {order.recipient.hidePrices && <small>Hide prices on packing slip</small>}
                </div>
              )}
            </section>

            <section className="card">
              <h3 className="card-title">Payment</h3>
              <p>{paymentLabel(order.payment.method)}</p>
              {order.payment.reference && <p>Reference: <strong>{order.payment.reference}</strong></p>}
              {order.payment.verifiedBy && <p className="text-muted">Updated by {order.payment.verifiedBy}</p>}
              <div className="form-group order-detail__pay">
                <label htmlFor="pay-status">Payment status</label>
                <select id="pay-status" className="select" value={order.payment.status} onChange={(e) => changePayment(e.target.value)}>
                  {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </section>

            <section className="card">
              <h3 className="card-title">Courier / tracking</h3>
              <form onSubmit={saveCourier}>
                <div className="form-group">
                  <label htmlFor="c-name">Courier</label>
                  <input id="c-name" className="input" list="couriers" value={courierForm.name} onChange={(e) => setCourier({ ...courierForm, name: e.target.value })} />
                  <datalist id="couriers">
                    {['TCS', 'Leopards', 'M&P', 'Trax', 'PostEx', 'Rider (local)'].map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label htmlFor="c-track">Tracking number</label>
                  <input id="c-track" className="input" value={courierForm.tracking} onChange={(e) => setCourier({ ...courierForm, tracking: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="c-date">Dispatch date</label>
                  <input id="c-date" type="date" className="input" value={courierForm.dispatchDate} onChange={(e) => setCourier({ ...courierForm, dispatchDate: e.target.value })} />
                </div>
                <button className="btn btn-outline btn-sm" disabled={!courier}>Save courier</button>
              </form>
            </section>
          </aside>
        </div>
      </div>

      <div className="order-detail__print">
        <Invoice order={order} mode={printMode} />
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="The customer will see the order as cancelled and ready-made stock will be returned to inventory."
        confirmText="Yes, cancel order"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          setConfirmCancel(false);
          await changeStatus('Cancelled', statusForm.note);
        }}
      />
    </div>
  );
};

export default OrderDetail;
