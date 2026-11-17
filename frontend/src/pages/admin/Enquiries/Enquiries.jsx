import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiTrash2 } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { enquiryService } from '../../../services/marketingService';
import { formatDate, formatDateTime } from '../../../utils/format';
import './Enquiries.css';

const STATUSES = ['new', 'replied', 'quoted', 'converted', 'closed'];

const Enquiries = () => {
  const { user } = useAuth();
  const { data: enquiries, loading, reload } = useAsync(() => enquiryService.list(), []);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [quotes, setQuotes] = useState({});

  if (loading) return <Loader />;

  const list = enquiries.filter((e) => (!type || e.type === type) && (!status || e.status === status));

  const update = async (e, patch, msg) => {
    await enquiryService.update(e._id, patch, user.email);
    if (msg) toast.success(msg);
    reload();
  };

  const waLink = (e, text) => `https://wa.me/${e.phone.replace(/^0/, '92')}?text=${encodeURIComponent(text)}`;

  return (
    <div className="enquiries">
      <AdminPageHeader title="Enquiries" subtitle="Contact messages and custom-order requests. Reply with a quote, then create the order once confirmed." />

      <div className="enquiries__filters">
        <select className="select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="">All types</option>
          <option value="custom">Custom order requests</option>
          <option value="contact">Contact messages</option>
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="💌" title="No enquiries" />
      ) : (
        <div className="enquiries__list">
          {list.map((e) => (
            <article key={e._id} className={`card enquiries__item ${e.status === 'new' ? 'is-new' : ''}`}>
              <div className="enquiries__head">
                <div>
                  <span className="chip">{e.type === 'custom' ? 'Custom order' : 'Contact'}</span>
                  <h3>{e.name}</h3>
                  <p className="text-muted">{formatDateTime(e.createdAt)} · {e.phone} {e.email && `· ${e.email}`}</p>
                </div>
                <select className="select enquiries__status" value={e.status} onChange={(ev) => update(e, { status: ev.target.value }, 'Status updated')} aria-label="Enquiry status">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {e.type === 'custom' ? (
                <div className="enquiries__details">
                  <dl>
                    <div><dt>Occasion</dt><dd>{e.occasion || '—'}</dd></div>
                    <div><dt>Budget</dt><dd>{e.budget ? `Rs. ${e.budget}` : '—'}</dd></div>
                    <div><dt>Size</dt><dd>{e.size || '—'}</dd></div>
                    <div><dt>Colours</dt><dd>{e.colours || '—'}</dd></div>
                    <div><dt>Delivery date</dt><dd>{formatDate(e.deliveryDate)}</dd></div>
                    <div><dt>City</dt><dd>{e.city || '—'}</dd></div>
                  </dl>
                  <p className="enquiries__msg">{e.message}</p>
                  {e.referenceImage && <img src={e.referenceImage} alt="Customer reference" className="enquiries__img" />}
                  <div className="enquiries__quote">
                    <input
                      className="input"
                      type="number"
                      placeholder="Quote amount (Rs.)"
                      value={quotes[e._id] ?? e.quote ?? ''}
                      onChange={(ev) => setQuotes({ ...quotes, [e._id]: ev.target.value })}
                      aria-label="Quote amount"
                    />
                    <button className="btn btn-light btn-sm" onClick={() => update(e, { quote: Number(quotes[e._id] ?? e.quote), status: 'quoted' }, 'Quote saved')} disabled={!(quotes[e._id] ?? e.quote)}>
                      Save quote
                    </button>
                    {(quotes[e._id] ?? e.quote) && e.phone && (
                      <a className="btn btn-outline btn-sm" target="_blank" rel="noreferrer" href={waLink(e, `Hi ${e.name.split(' ')[0]}! Thank you for your custom ${e.occasion || ''} request at Mystic Blooms. Our quote is Rs. ${quotes[e._id] ?? e.quote}. Shall we go ahead?`)}>
                        <FaWhatsapp /> Send quote
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="enquiries__details">
                  <strong>{e.subject}</strong>
                  <p className="enquiries__msg">{e.message}</p>
                </div>
              )}

              <div className="enquiries__actions">
                {e.phone && <a className="btn btn-light btn-sm" href={waLink(e, `Hi ${e.name.split(' ')[0]}, thank you for contacting Mystic Blooms!`)} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a>}
                {e.email && <a className="btn btn-light btn-sm" href={`mailto:${e.email}?subject=Mystic Blooms`}><FiMail /> Email</a>}
                <StatusBadge status={e.status} />
                <button className="icon-btn danger" onClick={() => setToDelete(e)} aria-label="Delete"><FiTrash2 /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete the enquiry from ${toDelete?.name}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          await enquiryService.remove(toDelete._id, user.email);
          setToDelete(null);
          reload();
        }}
      />
    </div>
  );
};

export default Enquiries;
