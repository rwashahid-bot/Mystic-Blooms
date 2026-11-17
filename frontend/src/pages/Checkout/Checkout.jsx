import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiLock } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader/PageHeader';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import CouponInput from '../../components/CouponInput/CouponInput';
import ProductImage from '../../components/ProductImage/ProductImage';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { orderService } from '../../services/orderService';
import { calcTotals } from '../../utils/pricing';
import { getEarliestDeliveryDate, getRequiredLeadTime, validateDeliveryDate } from '../../utils/dates';
import { isValidEmail, isValidPkPhone } from '../../utils/validators';
import { formatDate, formatPrice, optionsToText } from '../../utils/format';
import './Checkout.css';

const Checkout = () => {
  usePageTitle('Checkout');
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const zoneCities = settings.deliveryZones.map((z) => z.city);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: defaultAddress?.address || '',
    city: defaultAddress ? (zoneCities.includes(defaultAddress.city) ? defaultAddress.city : 'Other') : '',
    otherCity: defaultAddress && !zoneCities.includes(defaultAddress.city) ? defaultAddress.city : '',
    postalCode: defaultAddress?.postalCode || '',
    notes: '',
    isGift: false,
    recipientName: '',
    recipientPhone: '',
    giftMessage: '',
    hidePrices: true,
    requestedDate: '',
    paymentMethod: settings.paymentMethods.find((m) => m.enabled)?.id || 'cod',
    paymentReference: '',
    agree: false,
  });
  const [coupon, setCoupon] = useState(null);
  const [capacity, setCapacity] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    orderService.capacity().then(setCapacity).catch(() => {});
  }, []);

  const earliest = getEarliestDeliveryDate(items, settings);
  const leadDays = getRequiredLeadTime(items, settings);
  const totals = useMemo(() => calcTotals({ items, coupon, city: form.city, settings }), [items, coupon, form.city, settings]);
  const enabledMethods = settings.paymentMethods.filter((m) => m.enabled);
  const selectedMethod = enabledMethods.find((m) => m.id === form.paymentMethod);

  if (!items.length && !submitting) return <Navigate to="/cart" replace />;

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your full name.';
    if (!isValidPkPhone(form.phone)) e.phone = 'Enter a valid mobile number, e.g. 03001234567.';
    if (form.email && !isValidEmail(form.email)) e.email = 'Enter a valid email address.';
    if (form.address.trim().length < 8) e.address = 'Please enter your complete address.';
    if (!form.city) e.city = 'Please select your city.';
    if (form.city === 'Other' && !form.otherCity.trim()) e.otherCity = 'Please type your city name.';
    if (form.isGift) {
      if (!form.recipientName.trim()) e.recipientName = "Recipient's name is required.";
      if (!isValidPkPhone(form.recipientPhone)) e.recipientPhone = "Enter recipient's valid mobile number.";
    }
    const dateErr = validateDeliveryDate(form.requestedDate, items, settings, capacity);
    if (dateErr) e.requestedDate = dateErr;
    if (!form.paymentMethod) e.paymentMethod = 'Please choose a payment method.';
    if (!form.agree) e.agree = 'Please accept the policies to continue.';
    if (settings.minOrderValue && subtotal < settings.minOrderValue) e.form = `Minimum order value is ${formatPrice(settings.minOrderValue)}.`;
    setErrors(e);
    return e;
  };

  const placeOrder = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted fields.');
      const first = document.querySelector('.has-error, .checkout__error-anchor');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderService.create({
        customerId: user?.role === 'customer' ? user._id : null,
        customer: { name: form.name.trim(), phone: form.phone, email: form.email.trim() },
        shipping: {
          address: form.address.trim(),
          city: form.city === 'Other' ? form.otherCity.trim() : form.city,
          zone: form.city,
          postalCode: form.postalCode.trim(),
          notes: form.notes.trim(),
        },
        recipient: form.isGift
          ? { isGift: true, name: form.recipientName.trim(), phone: form.recipientPhone, message: form.giftMessage.trim(), hidePrices: form.hidePrices }
          : { isGift: false },
        requestedDate: form.requestedDate,
        items: items.map((i) => ({ productId: i.productId, name: i.name, options: i.options, personalisation: i.personalisation, quantity: i.quantity })),
        couponCode: coupon?.code || '',
        payment: { method: form.paymentMethod, reference: form.paymentReference.trim() },
      });
      clearCart();
      navigate(`/order-confirmation/${order.orderNumber}`, { state: { order }, replace: true });
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  const field = (key, label, props = {}, required = true) => (
    <div className="form-group">
      <label htmlFor={key} className={required ? 'required' : ''}>{label}</label>
      <input id={key} className={`input ${errors[key] ? 'has-error' : ''}`} value={form[key]} onChange={set(key)} aria-invalid={!!errors[key]} {...props} />
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="checkout">
      <PageHeader title="Checkout" breadcrumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <form className="container section checkout__grid" onSubmit={placeOrder} noValidate>
        <div className="checkout__forms">
          {!user && (
            <p className="checkout__login">
              Have an account? <Link to="/login" state={{ from: '/checkout' }}>Log in</Link> for faster checkout — or continue as a guest.
            </p>
          )}

          <section className="card">
            <h3 className="card-title"><span>1</span> Contact details</h3>
            {field('name', 'Full name', { autoComplete: 'name' })}
            <div className="form-row">
              {field('phone', 'Mobile number', { type: 'tel', placeholder: '03XX XXXXXXX', autoComplete: 'tel' })}
              {field('email', 'Email (for order updates)', { type: 'email', autoComplete: 'email' }, false)}
            </div>
          </section>

          <section className="card">
            <h3 className="card-title"><span>2</span> Delivery address</h3>
            {user?.addresses?.length > 0 && (
              <div className="checkout__saved">
                {user.addresses.map((a) => (
                  <button
                    type="button"
                    key={a._id}
                    className="chip"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        address: a.address,
                        city: zoneCities.includes(a.city) ? a.city : 'Other',
                        otherCity: zoneCities.includes(a.city) ? '' : a.city,
                        postalCode: a.postalCode,
                      }))
                    }
                  >
                    Use “{a.label}”
                  </button>
                ))}
              </div>
            )}
            {field('address', 'Full address', { placeholder: 'House #, street, area', autoComplete: 'street-address' })}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city" className="required">City</label>
                <select id="city" className={`select ${errors.city ? 'has-error' : ''}`} value={form.city} onChange={set('city')}>
                  <option value="">Select city</option>
                  {settings.deliveryZones.map((z) => (
                    <option key={z.city} value={z.city}>
                      {z.city === 'Other' ? 'Other city' : z.city} — {formatPrice(z.fee)}
                    </option>
                  ))}
                </select>
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              {field('postalCode', 'Postal code', { autoComplete: 'postal-code', inputMode: 'numeric' }, false)}
            </div>
            {form.city === 'Other' && field('otherCity', 'Your city name')}
            <div className="form-group">
              <label htmlFor="notes">Delivery notes</label>
              <textarea id="notes" className="textarea" rows={2} placeholder="Landmark, gate code, best time to call..." value={form.notes} onChange={set('notes')} />
            </div>

            <label className="checkbox">
              <input type="checkbox" checked={form.isGift} onChange={set('isGift')} />
              <span>🎁 This is a gift — deliver to someone else</span>
            </label>
            {form.isGift && (
              <div className="checkout__gift">
                <div className="form-row">
                  {field('recipientName', "Recipient's name")}
                  {field('recipientPhone', "Recipient's mobile", { type: 'tel' })}
                </div>
                <div className="form-group">
                  <label htmlFor="giftMessage">Gift card message</label>
                  <textarea id="giftMessage" className="textarea" rows={2} maxLength={200} value={form.giftMessage} onChange={set('giftMessage')} />
                </div>
                <label className="checkbox">
                  <input type="checkbox" checked={form.hidePrices} onChange={set('hidePrices')} />
                  <span>Hide prices on the packing slip</span>
                </label>
              </div>
            )}
          </section>

          <section className="card">
            <h3 className="card-title"><span>3</span> Delivery date</h3>
            <div className="checkout__lead">
              <FiCalendar />
              <p>
                Your items are handmade and need <strong>{leadDays} days</strong> to prepare. The earliest date available is <strong>{formatDate(earliest)}</strong>.
                {settings.dailyCapacity > 0 && ' Some dates may be fully booked.'}
              </p>
            </div>
            <div className="form-group checkout__error-anchor">
              <label htmlFor="requestedDate" className="required">Requested delivery date</label>
              <input id="requestedDate" type="date" min={earliest} className={`input ${errors.requestedDate ? 'has-error' : ''}`} value={form.requestedDate} onChange={set('requestedDate')} />
              {errors.requestedDate && <span className="field-error">{errors.requestedDate}</span>}
            </div>
          </section>

          <section className="card">
            <h3 className="card-title"><span>4</span> Payment method</h3>
            <div className="checkout__methods" role="radiogroup">
              {enabledMethods.map((m) => (
                <label key={m.id} className={`checkout__method ${form.paymentMethod === m.id ? 'is-active' : ''}`}>
                  <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={set('paymentMethod')} />
                  {m.label}
                </label>
              ))}
            </div>
            {selectedMethod && (
              <div className="checkout__instructions">
                <pre>{selectedMethod.instructions}</pre>
                {selectedMethod.id !== 'cod' && (
                  <>
                    {field('paymentReference', 'Transaction ID / reference', { placeholder: 'Paste after you transfer (optional now)' }, false)}
                    <p className="field-hint">
                      You can also send the payment screenshot on WhatsApp after placing your order. We confirm orders once payment is verified.
                    </p>
                  </>
                )}
              </div>
            )}
            <p className="checkout__secure"><FiLock /> We never ask for or store card numbers or passwords.</p>
          </section>
        </div>

        <aside className="checkout__aside">
          <OrderSummary subtotal={totals.subtotal} discount={totals.discount} couponCode={coupon?.code} deliveryFee={form.city ? totals.deliveryFee : null} total={totals.total} deliveryNote="Select your city">
            <ul className="checkout__items">
              {items.map((i) => (
                <li key={i.key}>
                  <ProductImage src={i.image} alt={i.name} color={i.color} />
                  <div>
                    <strong>{i.name}</strong>
                    {optionsToText(i.options) && <small>{optionsToText(i.options)}</small>}
                    <small>Qty {i.quantity}</small>
                  </div>
                  <span>{formatPrice(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <CouponInput subtotal={subtotal} applied={coupon} onApply={setCoupon} />

            <label className={`checkbox checkout__agree ${errors.agree ? 'checkout__error-anchor' : ''}`}>
              <input type="checkbox" checked={form.agree} onChange={set('agree')} />
              <span>
                I agree to the <Link to="/policies/terms" target="_blank">Terms</Link>, <Link to="/policies/delivery" target="_blank">Delivery</Link> and{' '}
                <Link to="/policies/refund" target="_blank">Cancellation</Link> policies and understand items are handmade to order.
              </span>
            </label>
            {errors.agree && <span className="field-error">{errors.agree}</span>}
            {errors.form && <p className="field-error">{errors.form}</p>}

            <button type="submit" className="btn btn-primary btn-block checkout__submit" disabled={submitting || settings.storeStatus === 'closed'}>
              {submitting ? 'Placing order…' : `Place Order · ${formatPrice(totals.total)}`}
            </button>
          </OrderSummary>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
