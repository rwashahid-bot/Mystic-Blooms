import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { enquiryService } from '../../services/marketingService';
import { addDays, toISODate } from '../../utils/dates';
import { fileToDataUrl } from '../../utils/exportCsv';
import { isValidEmail, isValidPkPhone } from '../../utils/validators';
import './CustomOrder.css';

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Nikkah / Mehndi', 'Eid', "Mother's Day", 'Graduation', 'Corporate', 'Just Because', 'Other'];
const BUDGETS = ['Under 3,000', '3,000 – 6,000', '6,000 – 10,000', '10,000 – 20,000', '20,000+'];
const SIZES = ['Small', 'Medium', 'Large', 'Extra Large', 'Not sure'];

const CustomOrder = () => {
  usePageTitle('Custom Order Request', 'Request a custom handmade chenille bouquet designed just for you.');
  const { settings } = useStore();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const earliest = toISODate(addDays(new Date(), settings.leadTimeDays));

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    occasion: '',
    colours: '',
    budget: '',
    size: '',
    deliveryDate: '',
    city: '',
    message: params.get('product') ? `Based on: ${params.get('product').replace(/-/g, ' ')}\n` : '',
    referenceImage: '',
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB.');
    try {
      setForm((f) => ({ ...f, referenceImage: '' }));
      const url = await fileToDataUrl(file, 700);
      setForm((f) => ({ ...f, referenceImage: url }));
    } catch {
      toast.error('Could not read that image.');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required.';
    if (!isValidPkPhone(form.phone)) er.phone = 'Enter a valid mobile number.';
    if (form.email && !isValidEmail(form.email)) er.email = 'Enter a valid email.';
    if (!form.occasion) er.occasion = 'Please choose an occasion.';
    if (!form.budget) er.budget = 'Please choose a budget range.';
    if (!form.deliveryDate) er.deliveryDate = 'Please choose a date.';
    else if (form.deliveryDate < earliest) er.deliveryDate = `Custom orders need at least ${settings.leadTimeDays} days.`;
    if (form.message.trim().length < 10) er.message = 'Please describe your idea (at least 10 characters).';
    setErrors(er);
    if (Object.keys(er).length) return toast.error('Please complete the required fields.');

    setSending(true);
    try {
      await enquiryService.create({ type: 'custom', ...form, userId: user?._id || null });
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const err = (k) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <div className="custom-order">
      <PageHeader title="Custom Order Request" subtitle="Dreaming of something unique? Share your idea and we'll send you a personalised quote." breadcrumbs={[{ label: 'Custom Order' }]} />

      <div className="container section custom-order__grid">
        <aside className="custom-order__aside">
          <h3>How custom orders work</h3>
          <ol>
            <li>Fill in this form with as much detail as you can.</li>
            <li>We reply within 24 hours with a design idea and quote.</li>
            <li>Once you approve and pay the advance, we start crafting.</li>
            <li>Your one-of-a-kind piece is delivered on your date.</li>
          </ol>
          <p className="text-muted">
            Please allow at least <strong>{settings.leadTimeDays} days</strong>. See our <Link to="/policies/custom-orders">custom order policy</Link>.
          </p>
        </aside>

        <div className="card">
          {done ? (
            <div className="custom-order__done">
              <span>🌷</span>
              <h3>Request received!</h3>
              <p className="text-muted">Thank you, {form.name.split(' ')[0]}. We'll contact you on {form.phone} with a quote soon.</p>
              <Link to="/shop" className="btn btn-primary">Browse ready designs</Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="co-name" className="required">Your name</label>
                  <input id="co-name" className={`input ${errors.name ? 'has-error' : ''}`} value={form.name} onChange={set('name')} />
                  {err('name')}
                </div>
                <div className="form-group">
                  <label htmlFor="co-phone" className="required">Mobile number</label>
                  <input id="co-phone" type="tel" className={`input ${errors.phone ? 'has-error' : ''}`} value={form.phone} onChange={set('phone')} />
                  {err('phone')}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="co-email">Email</label>
                  <input id="co-email" type="email" className={`input ${errors.email ? 'has-error' : ''}`} value={form.email} onChange={set('email')} />
                  {err('email')}
                </div>
                <div className="form-group">
                  <label htmlFor="co-city">Delivery city</label>
                  <input id="co-city" className="input" value={form.city} onChange={set('city')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="co-occasion" className="required">Occasion</label>
                  <select id="co-occasion" className={`select ${errors.occasion ? 'has-error' : ''}`} value={form.occasion} onChange={set('occasion')}>
                    <option value="">Select</option>
                    {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  {err('occasion')}
                </div>
                <div className="form-group">
                  <label htmlFor="co-date" className="required">Delivery date</label>
                  <input id="co-date" type="date" min={earliest} className={`input ${errors.deliveryDate ? 'has-error' : ''}`} value={form.deliveryDate} onChange={set('deliveryDate')} />
                  {err('deliveryDate')}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="co-budget" className="required">Budget (Rs.)</label>
                  <select id="co-budget" className={`select ${errors.budget ? 'has-error' : ''}`} value={form.budget} onChange={set('budget')}>
                    <option value="">Select</option>
                    {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  {err('budget')}
                </div>
                <div className="form-group">
                  <label htmlFor="co-size">Size</label>
                  <select id="co-size" className="select" value={form.size} onChange={set('size')}>
                    <option value="">Select</option>
                    {SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="co-colours">Preferred colours</label>
                <input id="co-colours" className="input" placeholder="e.g. blush pink, ivory and sage green" value={form.colours} onChange={set('colours')} />
              </div>
              <div className="form-group">
                <label htmlFor="co-message" className="required">Describe your idea</label>
                <textarea id="co-message" rows={4} className={`textarea ${errors.message ? 'has-error' : ''}`} placeholder="Flower types, number of stems, wrapping, anything special..." value={form.message} onChange={set('message')} />
                {err('message')}
              </div>

              <div className="form-group">
                <span className="custom-order__label">Reference image (optional)</span>
                {form.referenceImage ? (
                  <div className="custom-order__preview">
                    <img src={form.referenceImage} alt="Reference" />
                    <button type="button" onClick={() => setForm({ ...form, referenceImage: '' })} aria-label="Remove image"><FiX /></button>
                  </div>
                ) : (
                  <label className="custom-order__upload">
                    <FiUpload /> Upload an inspiration photo
                    <input type="file" accept="image/*" onChange={onImage} />
                  </label>
                )}
              </div>

              <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Request a Quote'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;
