import { useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import OrderInfo from '../../components/OrderInfo/OrderInfo';
import { orderService } from '../../services/orderService';
import { usePageTitle } from '../../hooks/usePageTitle';
import { isValidPkPhone } from '../../utils/validators';
import './TrackOrder.css';

/** Guest order tracking: order number + phone used at checkout (prevents viewing others' orders). */
const TrackOrder = () => {
  usePageTitle('Track Your Order');
  const [form, setForm] = useState({ orderNumber: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.orderNumber.trim()) return setError('Please enter your order number.');
    if (!isValidPkPhone(form.phone)) return setError('Please enter the mobile number used for the order.');
    setLoading(true);
    try {
      setOrder(await orderService.track(form.orderNumber, form.phone));
    } catch (err) {
      setOrder(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track">
      <PageHeader title="Track Your Order" subtitle="Enter your order number and the mobile number you used at checkout." breadcrumbs={[{ label: 'Track Order' }]} />
      <div className="container section">
        <form className="card track__form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="orderNumber">Order number</label>
            <input id="orderNumber" className="input" placeholder="e.g. MB-10003" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="trackPhone">Mobile number</label>
            <input id="trackPhone" type="tel" className="input" placeholder="03XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Searching…' : 'Track'}</button>
          {error && <p className="field-error track__error">{error}</p>}
        </form>

        {order && (
          <div className="track__result">
            <OrderInfo order={order} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
