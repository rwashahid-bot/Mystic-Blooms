import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import ImageUploader from '../../../components/admin/ImageUploader/ImageUploader';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { contentService } from '../../../services/contentService';
import { USE_MOCK } from '../../../services/http';
import { resetDb } from '../../../services/mockDb';
import { formatDate } from '../../../utils/format';
import { toISODate } from '../../../utils/dates';
import './Settings.css';

const CORE_STATUSES = ['New', 'Confirmed', 'In Preparation', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'];

const Settings = () => {
  const { user } = useAuth();
  const { refresh } = useStore();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    contentService.getSettings().then((x) => setS(structuredClone(x)));
  }, []);

  if (!s) return <Loader />;

  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const setContact = (k, v) => setS((p) => ({ ...p, contact: { ...p.contact, [k]: v } }));
  const setNotif = (k, v) => setS((p) => ({ ...p, notifications: { ...p.notifications, [k]: v } }));
  const setZone = (i, patch) => set('deliveryZones', s.deliveryZones.map((z, k) => (k === i ? { ...z, ...patch } : z)));
  const setMethod = (i, patch) => set('paymentMethods', s.paymentMethods.map((m, k) => (k === i ? { ...m, ...patch } : m)));

  const save = async () => {
    if (!s.businessName.trim()) return toast.error('Business name is required.');
    if (!s.paymentMethods.some((m) => m.enabled)) return toast.error('Enable at least one payment method.');
    if (!s.deliveryZones.length) return toast.error('Add at least one delivery city.');
    setSaving(true);
    try {
      const payload = {
        ...s,
        leadTimeDays: Number(s.leadTimeDays) || 0,
        dailyCapacity: Number(s.dailyCapacity) || 0,
        minOrderValue: Number(s.minOrderValue) || 0,
        freeDeliveryOver: Number(s.freeDeliveryOver) || 0,
        deliveryZones: s.deliveryZones.filter((z) => z.city.trim()).map((z) => ({ ...z, city: z.city.trim(), fee: Number(z.fee) || 0 })),
      };
      setS(await contentService.updateSettings(payload, user.email));
      await refresh();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const today = toISODate(new Date());

  return (
    <div className="settings">
      <AdminPageHeader title="Store Settings" subtitle="Business details, booking rules, delivery, payments and notifications.">
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save settings'}</button>
      </AdminPageHeader>

      <div className="settings__grid">
        <section className="card">
          <h3 className="card-title">Store status</h3>
          <div className="settings__status">
            {[
              ['open', 'Open', 'Accepting orders normally'],
              ['preorder', 'Pre-orders only', 'Orders accepted, banner shown'],
              ['closed', 'Temporarily closed', 'Checkout disabled'],
            ].map(([v, l, d]) => (
              <label key={v} className={`settings__status-opt ${s.storeStatus === v ? 'is-active' : ''}`}>
                <input type="radio" name="status" checked={s.storeStatus === v} onChange={() => set('storeStatus', v)} />
                <strong>{l}</strong>
                <small>{d}</small>
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Booking & capacity</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="st-lead">Default lead time (days)</label>
              <input id="st-lead" type="number" min="0" className="input" value={s.leadTimeDays} onChange={(e) => set('leadTimeDays', e.target.value)} />
              <span className="field-hint">Used for new products & custom requests.</span>
            </div>
            <div className="form-group">
              <label htmlFor="st-cap">Orders per delivery day</label>
              <input id="st-cap" type="number" min="0" className="input" value={s.dailyCapacity} onChange={(e) => set('dailyCapacity', e.target.value)} />
              <span className="field-hint">0 = unlimited</span>
            </div>
          </div>
          <label className="settings__label">Blocked dates (no deliveries)</label>
          <div className="settings__inline">
            <input type="date" className="input" min={today} value={blockDate} onChange={(e) => setBlockDate(e.target.value)} aria-label="Date to block" />
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => {
                if (!blockDate || s.blockedDates.includes(blockDate)) return;
                set('blockedDates', [...s.blockedDates, blockDate].sort());
                setBlockDate('');
              }}
            >
              <FiPlus /> Block
            </button>
          </div>
          <div className="settings__chips">
            {s.blockedDates.length === 0 && <span className="text-muted">No blocked dates.</span>}
            {s.blockedDates.map((d) => (
              <span key={d} className="chip settings__chip">
                {formatDate(d)}
                <button type="button" onClick={() => set('blockedDates', s.blockedDates.filter((x) => x !== d))} aria-label={`Unblock ${d}`}>×</button>
              </span>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Business details</h3>
          <div className="form-group">
            <label htmlFor="st-name">Business name</label>
            <input id="st-name" className="input" value={s.businessName} onChange={(e) => set('businessName', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="st-tag">Tagline</label>
            <input id="st-tag" className="input" value={s.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Logo</label>
            <ImageUploader multiple={false} images={s.logoUrl ? [{ url: s.logoUrl, alt: s.businessName }] : []} onChange={(imgs) => set('logoUrl', imgs[0]?.url || '')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="st-cur">Currency</label>
              <input id="st-cur" className="input" value={s.currency} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="st-prefix">Order number prefix</label>
              <input id="st-prefix" className="input" value={s.orderPrefix} onChange={(e) => set('orderPrefix', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} />
              <span className="field-hint">e.g. {s.orderPrefix}-10045</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Contact channels</h3>
          <div className="form-group">
            <label htmlFor="st-wa">WhatsApp number (international, no +)</label>
            <input id="st-wa" className="input" placeholder="923001234567" value={s.contact.whatsapp} onChange={(e) => setContact('whatsapp', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="st-phone">Phone</label>
              <input id="st-phone" className="input" value={s.contact.phone} onChange={(e) => setContact('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="st-email">Email</label>
              <input id="st-email" className="input" value={s.contact.email} onChange={(e) => setContact('email', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="st-ig">Instagram URL</label>
            <input id="st-ig" className="input" value={s.contact.instagram} onChange={(e) => setContact('instagram', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="st-addr">Location</label>
              <input id="st-addr" className="input" value={s.contact.address} onChange={(e) => setContact('address', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="st-hours">Business hours</label>
              <input id="st-hours" className="input" value={s.contact.hours} onChange={(e) => setContact('hours', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="st-resp">Response time message</label>
            <input id="st-resp" className="input" value={s.contact.responseTime} onChange={(e) => setContact('responseTime', e.target.value)} />
          </div>
        </section>

        <section className="card settings__wide">
          <h3 className="card-title">Delivery cities & charges</h3>
          <div className="form-row settings__three">
            <div className="form-group">
              <label htmlFor="st-min">Minimum order (Rs.)</label>
              <input id="st-min" type="number" min="0" className="input" value={s.minOrderValue} onChange={(e) => set('minOrderValue', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="st-free">Free delivery over (Rs.)</label>
              <input id="st-free" type="number" min="0" className="input" value={s.freeDeliveryOver} onChange={(e) => set('freeDeliveryOver', e.target.value)} />
              <span className="field-hint">0 = disabled</span>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>City</th><th>Fee (Rs.)</th><th>Estimated days</th><th></th></tr></thead>
              <tbody>
                {s.deliveryZones.map((z, i) => (
                  <tr key={i}>
                    <td><input className="input" value={z.city} onChange={(e) => setZone(i, { city: e.target.value })} aria-label="City" disabled={z.city === 'Other'} /></td>
                    <td><input className="input" type="number" min="0" value={z.fee} onChange={(e) => setZone(i, { fee: e.target.value })} aria-label="Fee" /></td>
                    <td><input className="input" value={z.days} onChange={(e) => setZone(i, { days: e.target.value })} aria-label="Days" /></td>
                    <td>{z.city !== 'Other' && <button className="icon-btn danger" onClick={() => set('deliveryZones', s.deliveryZones.filter((_, k) => k !== i))} aria-label="Remove city"><FiTrash2 /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-light btn-sm settings__add" onClick={() => set('deliveryZones', [...s.deliveryZones.filter((z) => z.city !== 'Other'), { city: '', fee: 0, days: '' }, ...s.deliveryZones.filter((z) => z.city === 'Other')])}>
            <FiPlus /> Add city
          </button>
          <p className="field-hint">“Other” is the fallback fee for any city not listed. Remove it to restrict delivery to listed cities only.</p>
        </section>

        <section className="card settings__wide">
          <h3 className="card-title">Payment methods</h3>
          <div className="settings__methods">
            {s.paymentMethods.map((m, i) => (
              <div key={m.id} className={`settings__method ${m.enabled ? '' : 'is-off'}`}>
                <label className="checkbox">
                  <input type="checkbox" checked={m.enabled} onChange={(e) => setMethod(i, { enabled: e.target.checked })} />
                  <strong>{m.label}</strong>
                </label>
                <textarea className="textarea" rows={3} value={m.instructions} onChange={(e) => setMethod(i, { instructions: e.target.value })} aria-label={`${m.label} instructions`} />
              </div>
            ))}
          </div>
          <p className="field-hint">Card payments can be added later through a payment gateway. Never store card numbers or passwords.</p>
        </section>

        <section className="card">
          <h3 className="card-title">Order statuses</h3>
          <div className="settings__chips">
            {s.orderStatuses.map((st) => (
              <span key={st} className="chip settings__chip">
                {st}
                {!CORE_STATUSES.includes(st) && <button type="button" onClick={() => set('orderStatuses', s.orderStatuses.filter((x) => x !== st))} aria-label={`Remove ${st}`}>×</button>}
              </span>
            ))}
          </div>
          <div className="settings__inline">
            <input className="input" placeholder="Add custom status, e.g. Awaiting Approval" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => {
                const v = newStatus.trim();
                if (!v || s.orderStatuses.includes(v)) return;
                const list = [...s.orderStatuses];
                list.splice(list.indexOf('Cancelled'), 0, v);
                set('orderStatuses', list);
                setNewStatus('');
              }}
            >
              Add
            </button>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Notification templates</h3>
          <div className="form-group">
            <label htmlFor="st-admin-email">Admin alert email</label>
            <input id="st-admin-email" className="input" value={s.notifications.adminEmail} onChange={(e) => setNotif('adminEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="st-tpl1">Order confirmation message</label>
            <textarea id="st-tpl1" className="textarea" rows={2} value={s.notifications.orderConfirmation} onChange={(e) => setNotif('orderConfirmation', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="st-tpl2">Status update message</label>
            <textarea id="st-tpl2" className="textarea" rows={2} value={s.notifications.statusUpdate} onChange={(e) => setNotif('statusUpdate', e.target.value)} />
            <span className="field-hint">Placeholders: {'{name}'}, {'{orderNumber}'}, {'{status}'}</span>
          </div>
        </section>

        {USE_MOCK && (
          <section className="card settings__danger settings__wide">
            <h3 className="card-title">Demo data</h3>
            <p className="text-muted">The site is running without a backend. All data is stored in this browser. You can reset it to the original sample data.</p>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>Reset demo data</button>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message="All orders, products, settings and content in this browser will be replaced with the original sample data."
        confirmText="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDb();
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Settings;
