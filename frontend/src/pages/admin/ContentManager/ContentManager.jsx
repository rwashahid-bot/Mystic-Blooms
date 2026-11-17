import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiEye, FiSave, FiUploadCloud } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import ImageUploader from '../../../components/admin/ImageUploader/ImageUploader';
import Hero from '../../../components/Hero/Hero';
import Modal from '../../../components/Modal/Modal';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { contentService } from '../../../services/contentService';
import { formatDateTime } from '../../../utils/format';
import './ContentManager.css';

const TABS = [
  ['announcement', 'Announcement'],
  ['hero', 'Homepage hero'],
  ['about', 'About Us'],
  ['faqs', 'FAQs'],
  ['testimonials', 'Testimonials'],
  ['policies', 'Policy pages'],
  ['revisions', 'Revisions'],
];

/** Reusable list editor for FAQs / testimonials / process steps */
const ListEditor = ({ items, onChange, fields, newItem, addLabel }) => {
  const update = (i, patch) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const move = (i, d) => {
    const next = [...items];
    if (i + d < 0 || i + d >= next.length) return;
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="cms__list">
      {items.map((item, i) => (
        <div key={i} className="cms__list-item">
          <div className="cms__list-fields">
            {fields.map((f) => (
              <div className="form-group" key={f.key}>
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea className="textarea" rows={f.rows || 3} value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: e.target.value })} />
                ) : (
                  <input className="input" type={f.type || 'text'} min={f.min} max={f.max} value={item[f.key] ?? ''} onChange={(e) => update(i, { [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="cms__list-tools">
            <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Move up"><FiArrowUp /></button>
            <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Move down"><FiArrowDown /></button>
            <button type="button" className="icon-btn danger" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Remove"><FiTrash2 /></button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-light btn-sm" onClick={() => onChange([...items, { ...newItem }])}><FiPlus /> {addLabel}</button>
    </div>
  );
};

const ContentManager = () => {
  const { user } = useAuth();
  const { settings, refresh } = useStore();
  const [cms, setCms] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState('announcement');
  const [policyKey, setPolicyKey] = useState('delivery');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () =>
    contentService.getCmsAdmin().then((c) => {
      setCms(c);
      setDraft(structuredClone(c.draft));
    });

  useEffect(() => {
    load();
  }, []);

  if (!draft) return <Loader />;

  const set = (section, value) => setDraft((d) => ({ ...d, [section]: value }));
  const setIn = (section, key, value) => setDraft((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(cms.published);

  const saveDraft = async () => {
    setBusy(true);
    await contentService.saveDraft(draft, user.email);
    await load();
    setBusy(false);
    toast.success('Draft saved — not live yet');
  };

  const publish = async () => {
    setBusy(true);
    await contentService.publish(draft, user.email);
    await load();
    await refresh();
    setBusy(false);
    toast.success('Published! Changes are live on the website 🌸');
  };

  const restore = async (i) => {
    await contentService.restore(i, user.email);
    await load();
    toast.success('Revision loaded into draft. Review and publish to make it live.');
  };

  return (
    <div className="cms">
      <AdminPageHeader title="Website Content" subtitle={`Last published ${formatDateTime(cms.updatedAt)} by ${cms.updatedBy}${cms.draftSavedAt ? ` · Draft saved ${formatDateTime(cms.draftSavedAt)}` : ''}`}>
        <button className="btn btn-light btn-sm" onClick={() => setPreview(true)}><FiEye /> Preview</button>
        <button className="btn btn-outline btn-sm" onClick={saveDraft} disabled={busy}><FiSave /> Save draft</button>
        <button className="btn btn-primary btn-sm" onClick={publish} disabled={busy || !dirty}><FiUploadCloud /> Publish</button>
      </AdminPageHeader>

      {dirty && <p className="cms__dirty">You have unpublished changes.</p>}

      <div className="cms__layout">
        <nav className="cms__tabs" role="tablist">
          {TABS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>

        <section className="card cms__panel">
          {tab === 'announcement' && (
            <>
              <h3 className="card-title">Announcement bar</h3>
              <label className="checkbox cms__check">
                <input type="checkbox" checked={draft.announcement.enabled} onChange={(e) => setIn('announcement', 'enabled', e.target.checked)} /> Show announcement bar
              </label>
              <div className="form-group">
                <label htmlFor="cms-ann">Text</label>
                <input id="cms-ann" className="input" value={draft.announcement.text} onChange={(e) => setIn('announcement', 'text', e.target.value)} />
                <span className="field-hint">Use for booking lead time, holiday closures or delivery notices. Store status (closed / pre-order) in Settings overrides this.</span>
              </div>
            </>
          )}

          {tab === 'hero' && (
            <>
              <h3 className="card-title">Homepage hero</h3>
              <div className="form-group">
                <label htmlFor="h-eyebrow">Small heading</label>
                <input id="h-eyebrow" className="input" value={draft.hero.eyebrow} onChange={(e) => setIn('hero', 'eyebrow', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="h-heading">Main heading</label>
                <input id="h-heading" className="input" value={draft.hero.heading} onChange={(e) => setIn('hero', 'heading', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="h-sub">Text</label>
                <textarea id="h-sub" className="textarea" rows={3} value={draft.hero.subheading} onChange={(e) => setIn('hero', 'subheading', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="h-btn">Button text</label>
                  <input id="h-btn" className="input" value={draft.hero.buttonText} onChange={(e) => setIn('hero', 'buttonText', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="h-link">Button link</label>
                  <input id="h-link" className="input" placeholder="/shop" value={draft.hero.buttonLink} onChange={(e) => setIn('hero', 'buttonLink', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Hero image</label>
                <ImageUploader multiple={false} images={draft.hero.image ? [{ url: draft.hero.image, alt: '' }] : []} onChange={(imgs) => setIn('hero', 'image', imgs[0]?.url || '')} />
              </div>
            </>
          )}

          {tab === 'about' && (
            <>
              <h3 className="card-title">About Us page</h3>
              <div className="form-group">
                <label htmlFor="ab-title">Title</label>
                <input id="ab-title" className="input" value={draft.about.title} onChange={(e) => setIn('about', 'title', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="ab-story">Brand story</label>
                <textarea id="ab-story" className="textarea" rows={7} value={draft.about.story} onChange={(e) => setIn('about', 'story', e.target.value)} />
                <span className="field-hint">Leave a blank line between paragraphs. The first paragraph also appears on the homepage.</span>
              </div>
              <div className="form-group">
                <label>Studio photo</label>
                <ImageUploader multiple={false} images={draft.about.image ? [{ url: draft.about.image, alt: '' }] : []} onChange={(imgs) => setIn('about', 'image', imgs[0]?.url || '')} />
              </div>
              <h4 className="cms__sub">Process steps</h4>
              <ListEditor
                items={draft.about.process}
                onChange={(v) => setIn('about', 'process', v)}
                fields={[{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea', rows: 2 }]}
                newItem={{ title: '', text: '' }}
                addLabel="Add step"
              />
            </>
          )}

          {tab === 'faqs' && (
            <>
              <h3 className="card-title">FAQs</h3>
              <ListEditor
                items={draft.faqs}
                onChange={(v) => set('faqs', v)}
                fields={[{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer', type: 'textarea' }]}
                newItem={{ q: '', a: '' }}
                addLabel="Add FAQ"
              />
            </>
          )}

          {tab === 'testimonials' && (
            <>
              <h3 className="card-title">Testimonials</h3>
              <p className="field-hint cms__hint">Only add testimonials you have the customer's permission to share.</p>
              <ListEditor
                items={draft.testimonials}
                onChange={(v) => set('testimonials', v)}
                fields={[
                  { key: 'name', label: 'Name' },
                  { key: 'city', label: 'City' },
                  { key: 'rating', label: 'Rating (1–5)', type: 'number', min: 1, max: 5 },
                  { key: 'text', label: 'Testimonial', type: 'textarea', rows: 2 },
                ]}
                newItem={{ name: '', city: '', rating: 5, text: '' }}
                addLabel="Add testimonial"
              />
            </>
          )}

          {tab === 'policies' && (
            <>
              <h3 className="card-title">Policy pages</h3>
              <select className="select cms__policy-select" value={policyKey} onChange={(e) => setPolicyKey(e.target.value)} aria-label="Policy">
                {Object.entries(draft.policies).map(([k, p]) => <option key={k} value={k}>{p.title}</option>)}
              </select>
              <div className="form-group">
                <label htmlFor="pol-title">Title</label>
                <input id="pol-title" className="input" value={draft.policies[policyKey].title} onChange={(e) => set('policies', { ...draft.policies, [policyKey]: { ...draft.policies[policyKey], title: e.target.value } })} />
              </div>
              <div className="form-group">
                <label htmlFor="pol-content">Content</label>
                <textarea id="pol-content" className="textarea" rows={14} value={draft.policies[policyKey].content} onChange={(e) => set('policies', { ...draft.policies, [policyKey]: { ...draft.policies[policyKey], content: e.target.value } })} />
                <span className="field-hint">Shown at /policies/{policyKey}. Each line becomes a paragraph.</span>
              </div>
            </>
          )}

          {tab === 'revisions' && (
            <>
              <h3 className="card-title">Revision history</h3>
              <p className="field-hint cms__hint">The last 5 published versions. Restoring loads it into your draft — publish to make it live.</p>
              {(cms.revisions || []).length === 0 && <p className="text-muted">No previous versions yet.</p>}
              <ul className="cms__revisions">
                {(cms.revisions || []).map((r, i) => (
                  <li key={i}>
                    <span>{formatDateTime(r.at)} · replaced by {r.by}</span>
                    <button className="btn btn-light btn-sm" onClick={() => restore(i)}>Restore to draft</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} title="Draft preview" size="lg">
        {draft.announcement.enabled && <div className="cms__preview-ann">{draft.announcement.text}</div>}
        <div className="cms__preview">
          <Hero content={draft.hero} leadTimeDays={settings.leadTimeDays} />
        </div>
        <p className="field-hint">Preview shows the announcement bar and homepage hero. Other sections appear on their pages after publishing.</p>
      </Modal>
    </div>
  );
};

export default ContentManager;
