import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { enquiryService } from '../../services/marketingService';
import { isValidEmail, isValidPkPhone } from '../../utils/validators';
import './Contact.css';

const initial = { name: '', contact: '', subject: '', message: '', website: '' };

const Contact = () => {
  usePageTitle('Contact Us');
  const { settings } = useStore();
  const { contact } = settings;
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    // Honeypot field: bots fill hidden inputs, humans don't
    if (form.website) return;
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!isValidPkPhone(form.contact) && !isValidEmail(form.contact)) er.contact = 'Enter a valid phone number or email.';
    if (!form.subject.trim()) er.subject = 'Please add a subject.';
    if (form.message.trim().length < 10) er.message = 'Message should be at least 10 characters.';
    setErrors(er);
    if (Object.keys(er).length) return;

    // Simple client-side rate limit (server must enforce its own)
    const last = Number(localStorage.getItem('mb_last_contact') || 0);
    if (Date.now() - last < 60000) return toast.error('Please wait a minute before sending another message.');

    setSending(true);
    try {
      const isEmail = isValidEmail(form.contact);
      await enquiryService.create({
        type: 'contact',
        name: form.name.trim(),
        phone: isEmail ? '' : form.contact,
        email: isEmail ? form.contact : '',
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      localStorage.setItem('mb_last_contact', String(Date.now()));
      setSent(true);
      setForm(initial);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact">
      <PageHeader title="Contact Us" subtitle="Questions, bulk orders or just want to say hi? We'd love to hear from you." breadcrumbs={[{ label: 'Contact' }]} />

      <div className="container section contact__grid">
        <div className="contact__info">
          <a className="contact__wa" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
            <FaWhatsapp />
            <div>
              <strong>Chat on WhatsApp</strong>
              <span>Fastest way to reach us</span>
            </div>
          </a>
          <ul className="contact__list">
            <li><FiPhone /> <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>
            <li><FiMail /> <a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li><FaInstagram /> <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a></li>
            <li><FiMapPin /> {contact.address} — delivering nationwide</li>
            <li><FiClock /> {contact.hours}</li>
          </ul>
          <p className="text-muted contact__response">{contact.responseTime}</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="contact__sent">
              <span>💌</span>
              <h3>Message sent!</h3>
              <p className="text-muted">Thank you for reaching out. {contact.responseTime}</p>
              <button className="btn btn-outline btn-sm" onClick={() => setSent(false)}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h3 className="card-title">Send us a message</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="c-name" className="required">Name</label>
                  <input id="c-name" className={`input ${errors.name ? 'has-error' : ''}`} value={form.name} onChange={set('name')} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="c-contact" className="required">Phone or email</label>
                  <input id="c-contact" className={`input ${errors.contact ? 'has-error' : ''}`} value={form.contact} onChange={set('contact')} />
                  {errors.contact && <span className="field-error">{errors.contact}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="c-subject" className="required">Subject</label>
                <input id="c-subject" className={`input ${errors.subject ? 'has-error' : ''}`} value={form.subject} onChange={set('subject')} />
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="c-message" className="required">Message</label>
                <textarea id="c-message" className={`textarea ${errors.message ? 'has-error' : ''}`} rows={5} value={form.message} onChange={set('message')} />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="contact__hp" value={form.website} onChange={set('website')} aria-hidden="true" />
              <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send Message'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
