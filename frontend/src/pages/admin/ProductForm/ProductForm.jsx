import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import ImageUploader from '../../../components/admin/ImageUploader/ImageUploader';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { slugify } from '../../../utils/format';
import './ProductForm.css';

const empty = (leadTimeDays) => ({
  name: '', slug: '', description: '', category: '', type: 'made-to-order', images: [], color: '#e89bb3',
  price: '', salePrice: '', sku: '', stock: 0, lowStockThreshold: 3, available: true, leadTimeDays,
  featured: false, bestseller: false, isNew: true, status: 'draft', tags: '', colors: '', occasions: '',
  options: [], personalisation: { recipientName: true, messageCard: true, colourPreference: false, specialInstructions: true },
  careInstructions: '', seoTitle: '', seoDescription: '',
});

const toList = (s) => (Array.isArray(s) ? s : String(s || '').split(',').map((x) => x.trim()).filter(Boolean));

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const { settings, refresh } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService.list({ includeInactive: true }).then(setCategories);
    if (isEdit) {
      productService
        .getById(id)
        .then((p) =>
          setForm({
            ...p,
            salePrice: p.salePrice ?? '',
            stock: p.stock ?? 0,
            images: (p.images || []).map((url, i) => ({ url, alt: p.imageAlts?.[i] || '' })),
            tags: (p.tags || []).join(', '),
            colors: (p.colors || []).join(', '),
            occasions: (p.occasions || []).join(', '),
          })
        )
        .catch(() => {
          toast.error('Product not found');
          navigate('/admin/products');
        });
    } else {
      setForm(empty(settings.leadTimeDays));
    }
  }, [id, isEdit, navigate, settings.leadTimeDays]);

  if (!form) return <Loader />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const bind = (key) => ({
    value: form[key],
    onChange: (e) => set(key, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
  });

  // ----- Options / variants builder -----
  const updateOption = (i, patch) => set('options', form.options.map((o, k) => (k === i ? { ...o, ...patch } : o)));
  const updateValue = (i, j, patch) => updateOption(i, { values: form.options[i].values.map((v, k) => (k === j ? { ...v, ...patch } : v)) });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.category) e.category = 'Choose a category.';
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price.';
    if (form.salePrice && Number(form.salePrice) >= Number(form.price)) e.salePrice = 'Sale price must be lower than the price.';
    if (!form.sku.trim()) e.sku = 'SKU is required.';
    if (form.leadTimeDays === '' || Number(form.leadTimeDays) < 0) e.leadTimeDays = 'Enter lead time in days.';
    form.options.forEach((o, i) => {
      if (!o.name.trim() || !o.values.length || o.values.some((v) => !v.label.trim())) e[`opt${i}`] = 'Every option needs a name and labelled values.';
    });
    setErrors(e);
    return e;
  };

  const save = async (e) => {
    e.preventDefault();
    if (Object.keys(validate()).length) return toast.error('Please fix the highlighted fields.');
    setSaving(true);
    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: form.type === 'ready-made' ? Number(form.stock) : null,
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
      leadTimeDays: Number(form.leadTimeDays),
      images: form.images.map((i) => i.url),
      imageAlts: form.images.map((i) => i.alt),
      tags: toList(form.tags),
      colors: toList(form.colors),
      occasions: toList(form.occasions),
      options: form.options.map((o) => ({ ...o, values: o.values.map((v) => ({ label: v.label.trim(), priceAdjustment: Number(v.priceAdjustment) || 0 })) })),
    };
    delete payload._id;
    try {
      if (isEdit) await productService.update(id, payload, user.email);
      else await productService.create(payload, user.email);
      toast.success(isEdit ? 'Product updated' : 'Product created');
      refresh();
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <form className="product-form" onSubmit={save} noValidate>
      <Link to="/admin/products" className="product-form__back"><FiArrowLeft /> All products</Link>
      <AdminPageHeader title={isEdit ? `Edit: ${form.name}` : 'Add product'}>
        {isEdit && form.status === 'published' && (
          <a href={`/product/${form.slug}`} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">View on store</a>
        )}
        <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
      </AdminPageHeader>

      <div className="product-form__grid">
        <div className="product-form__main">
          <section className="card">
            <h3 className="card-title">Basic information</h3>
            <div className="form-group">
              <label htmlFor="pf-name" className="required">Product name</label>
              <input
                id="pf-name"
                className={`input ${errors.name ? 'has-error' : ''}`}
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
              />
              {err('name')}
            </div>
            <div className="form-group">
              <label htmlFor="pf-slug">URL slug</label>
              <input id="pf-slug" className="input" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} />
              <span className="field-hint">/product/{form.slug || 'your-product'}</span>
            </div>
            <div className="form-group">
              <label htmlFor="pf-desc">Description</label>
              <textarea id="pf-desc" className="textarea" rows={4} {...bind('description')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pf-cat" className="required">Category</label>
                <select id="pf-cat" className={`select ${errors.category ? 'has-error' : ''}`} {...bind('category')}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}{!c.active ? ' (hidden)' : ''}</option>)}
                </select>
                {err('category')}
              </div>
              <div className="form-group">
                <label htmlFor="pf-type">Product type</label>
                <select id="pf-type" className="select" {...bind('type')}>
                  <option value="ready-made">Ready-made (tracked stock)</option>
                  <option value="made-to-order">Made to order</option>
                  <option value="custom">Custom enquiry (quote)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Images</h3>
            <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
            <div className="form-group product-form__color">
              <label htmlFor="pf-color">Placeholder colour (shown when there is no photo)</label>
              <input id="pf-color" type="color" {...bind('color')} />
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Pricing</h3>
            <div className="form-row product-form__three">
              <div className="form-group">
                <label htmlFor="pf-price" className="required">Price (Rs.)</label>
                <input id="pf-price" type="number" min="0" className={`input ${errors.price ? 'has-error' : ''}`} {...bind('price')} />
                {err('price')}
              </div>
              <div className="form-group">
                <label htmlFor="pf-sale">Sale price (Rs.)</label>
                <input id="pf-sale" type="number" min="0" className={`input ${errors.salePrice ? 'has-error' : ''}`} {...bind('salePrice')} />
                {err('salePrice')}
              </div>
              <div className="form-group">
                <label htmlFor="pf-sku" className="required">SKU / code</label>
                <input id="pf-sku" className={`input ${errors.sku ? 'has-error' : ''}`} {...bind('sku')} />
                {err('sku')}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="product-form__card-head">
              <h3 className="card-title">Options & variants</h3>
              <button type="button" className="btn btn-light btn-sm" onClick={() => set('options', [...form.options, { name: '', required: true, values: [{ label: '', priceAdjustment: 0 }] }])}>
                <FiPlus /> Add option
              </button>
            </div>
            <p className="field-hint">e.g. Size, Colour, Stem count, Wrapping, Add-ons. Price adjustment is added to the base price.</p>
            {form.options.map((opt, i) => (
              <div className="product-form__option" key={i}>
                <div className="product-form__option-head">
                  <input className="input" placeholder="Option name (e.g. Size)" value={opt.name} onChange={(e) => updateOption(i, { name: e.target.value })} aria-label="Option name" />
                  <label className="checkbox">
                    <input type="checkbox" checked={opt.required} onChange={(e) => updateOption(i, { required: e.target.checked })} /> Required
                  </label>
                  <button type="button" className="icon-btn danger" onClick={() => set('options', form.options.filter((_, k) => k !== i))} aria-label="Remove option"><FiTrash2 /></button>
                </div>
                {opt.values.map((v, j) => (
                  <div className="product-form__value" key={j}>
                    <input className="input" placeholder="Value (e.g. Large)" value={v.label} onChange={(e) => updateValue(i, j, { label: e.target.value })} aria-label="Value label" />
                    <input className="input" type="number" placeholder="+ Rs." value={v.priceAdjustment} onChange={(e) => updateValue(i, j, { priceAdjustment: e.target.value })} aria-label="Price adjustment" />
                    <button type="button" className="icon-btn" onClick={() => updateOption(i, { values: opt.values.filter((_, k) => k !== j) })} aria-label="Remove value" disabled={opt.values.length === 1}>×</button>
                  </div>
                ))}
                <button type="button" className="product-form__add-value" onClick={() => updateOption(i, { values: [...opt.values, { label: '', priceAdjustment: 0 }] })}>+ Add value</button>
                {err(`opt${i}`)}
              </div>
            ))}
          </section>

          <section className="card">
            <h3 className="card-title">Personalisation fields</h3>
            <div className="product-form__checks">
              {[
                ['recipientName', 'Recipient name'],
                ['messageCard', 'Message card'],
                ['colourPreference', 'Colour preference'],
                ['specialInstructions', 'Special instructions'],
              ].map(([k, label]) => (
                <label key={k} className="checkbox">
                  <input type="checkbox" checked={!!form.personalisation[k]} onChange={(e) => set('personalisation', { ...form.personalisation, [k]: e.target.checked })} /> {label}
                </label>
              ))}
            </div>
            <div className="form-group product-form__care">
              <label htmlFor="pf-care">Care instructions</label>
              <textarea id="pf-care" className="textarea" rows={2} {...bind('careInstructions')} />
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">SEO</h3>
            <div className="form-group">
              <label htmlFor="pf-seot">SEO title</label>
              <input id="pf-seot" className="input" maxLength={70} placeholder={form.name} {...bind('seoTitle')} />
              <span className="field-hint">{form.seoTitle.length}/70</span>
            </div>
            <div className="form-group">
              <label htmlFor="pf-seod">SEO description</label>
              <textarea id="pf-seod" className="textarea" rows={2} maxLength={160} {...bind('seoDescription')} />
              <span className="field-hint">{form.seoDescription.length}/160</span>
            </div>
          </section>
        </div>

        <aside className="product-form__side">
          <section className="card">
            <h3 className="card-title">Status</h3>
            <select className="select" {...bind('status')} aria-label="Status">
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <div className="product-form__checks product-form__checks--col">
              <label className="checkbox"><input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} /> Available for order</label>
              <label className="checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on homepage</label>
              <label className="checkbox"><input type="checkbox" checked={form.bestseller} onChange={(e) => set('bestseller', e.target.checked)} /> Bestseller badge</label>
              <label className="checkbox"><input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} /> New arrival</label>
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Availability</h3>
            <div className="form-group">
              <label htmlFor="pf-lead" className="required">Preparation lead time (days)</label>
              <input id="pf-lead" type="number" min="0" className={`input ${errors.leadTimeDays ? 'has-error' : ''}`} {...bind('leadTimeDays')} />
              {err('leadTimeDays')}
            </div>
            {form.type === 'ready-made' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pf-stock">Stock</label>
                  <input id="pf-stock" type="number" min="0" className="input" {...bind('stock')} />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-low">Low-stock alert</label>
                  <input id="pf-low" type="number" min="0" className="input" {...bind('lowStockThreshold')} />
                </div>
              </div>
            )}
            {form.type !== 'ready-made' && <p className="field-hint">Made-to-order items are limited by the daily order capacity in Settings.</p>}
          </section>

          <section className="card">
            <h3 className="card-title">Organisation</h3>
            <div className="form-group">
              <label htmlFor="pf-occ">Occasions</label>
              <input id="pf-occ" className="input" placeholder="Birthday, Eid, Wedding" {...bind('occasions')} />
            </div>
            <div className="form-group">
              <label htmlFor="pf-colors">Colours</label>
              <input id="pf-colors" className="input" placeholder="Pink, White" {...bind('colors')} />
            </div>
            <div className="form-group">
              <label htmlFor="pf-tags">Tags</label>
              <input id="pf-tags" className="input" placeholder="roses, pastel" {...bind('tags')} />
              <span className="field-hint">Comma separated — used by search & filters.</span>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
};

export default ProductForm;
