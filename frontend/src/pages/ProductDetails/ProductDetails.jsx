import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiTruck, FiShoppingBag, FiMessageCircle, FiInfo } from 'react-icons/fi';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import ProductImage from '../../components/ProductImage/ProductImage';
import QuantitySelector from '../../components/QuantitySelector/QuantitySelector';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import StarRating from '../../components/StarRating/StarRating';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import { getAvailability } from '../../components/ProductCard/ProductCard';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/marketingService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { calcUnitPrice } from '../../utils/pricing';
import { formatPrice, formatDate } from '../../utils/format';
import './ProductDetails.css';

const MESSAGE_LIMIT = 150;

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { settings, categories } = useStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selected, setSelected] = useState({});
  const [personal, setPersonal] = useState({ recipientName: '', messageCard: '', colourPreference: '', specialInstructions: '' });
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('details');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setActiveImg(0);
    setQuantity(1);
    productService
      .getBySlug(slug)
      .then(async (p) => {
        if (!active) return;
        setProduct(p);
        // Pre-select first value of required options
        const defaults = {};
        (p.options || []).forEach((o) => {
          if (o.required && o.values[0]) defaults[o.name] = o.values[0].label;
        });
        setSelected(defaults);
        const [rel, revs] = await Promise.all([
          productService.list({ category: p.category, limit: 5 }),
          reviewService.forProduct(p._id),
        ]);
        if (!active) return;
        setRelated(rel.filter((r) => r._id !== p._id).slice(0, 4));
        setReviews(revs);
      })
      .catch(() => active && setProduct(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  usePageTitle(product?.seoTitle || product?.name, product?.seoDescription || product?.description);

  // Product structured data for SEO
  useEffect(() => {
    if (!product) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
      image: product.images,
      offers: { '@type': 'Offer', priceCurrency: 'PKR', price: product.salePrice || product.price, availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [product]);

  const unitPrice = useMemo(() => (product ? calcUnitPrice(product, selected) : 0), [product, selected]);

  if (loading) return <Loader fullPage />;
  if (!product) {
    return <EmptyState title="Product not found" message="This item may no longer be available." actionText="Back to shop" actionTo="/shop" />;
  }

  const category = categories.find((c) => c._id === product.category);
  const availability = getAvailability(product);
  const isReadyMade = product.type === 'ready-made';
  const isCustom = product.type === 'custom';
  const maxQty = isReadyMade ? product.stock || 0 : 20;
  const canBuy = product.available && settings.storeStatus !== 'closed' && (!isReadyMade || product.stock > 0);
  const onSale = product.salePrice && product.salePrice < product.price;
  const perso = product.personalisation || {};
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const images = product.images?.length ? product.images : [null];

  const validate = () => {
    const e = {};
    (product.options || []).forEach((o) => {
      if (o.required && !selected[o.name]) e[o.name] = `Please choose a ${o.name.toLowerCase()}.`;
    });
    if (personal.messageCard.length > MESSAGE_LIMIT) e.messageCard = `Message must be under ${MESSAGE_LIMIT} characters.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = (goToCheckout = false) => {
    if (!validate()) return toast.error('Please complete the required options.');
    const cleanPersonal = Object.fromEntries(Object.entries(personal).filter(([, v]) => v.trim()));
    addItem(product, { options: selected, personalisation: cleanPersonal, quantity });
    if (goToCheckout) navigate('/checkout');
    else
      toast.success(
        (t) => (
          <span>
            Added to cart! <Link to="/cart" onClick={() => toast.dismiss(t.id)} style={{ color: '#a64d6a', fontWeight: 600 }}>View cart</Link>
          </span>
        ),
        { duration: 3500 }
      );
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return toast.error('Please write a short comment.');
    try {
      await reviewService.create({ productId: product._id, userId: user._id, name: user.name, ...reviewForm });
      toast.success('Thank you! Your review will appear once approved.');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="pdp">
      <div className="container">
        <div className="pdp__crumbs">
          <Breadcrumbs items={[{ label: 'Shop', to: '/shop' }, category && { label: category.name, to: `/category/${category.slug}` }, { label: product.name }].filter(Boolean)} />
        </div>

        <div className="pdp__main">
          {/* Gallery */}
          <div className="pdp__gallery">
            <ProductImage src={images[activeImg]} alt={product.name} color={product.color} />
            {images.length > 1 && (
              <div className="pdp__thumbs">
                {images.map((img, i) => (
                  <button key={i} className={i === activeImg ? 'is-active' : ''} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                    <ProductImage src={img} alt="" color={product.color} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pdp__info">
            {category && <Link to={`/category/${category.slug}`} className="chip">{category.name}</Link>}
            <h1>{product.name}</h1>
            {reviews.length > 0 && (
              <a href="#reviews" className="pdp__rating" onClick={() => setTab('reviews')}>
                <StarRating value={avgRating} size="sm" /> {avgRating.toFixed(1)} ({reviews.length} review{reviews.length > 1 ? 's' : ''})
              </a>
            )}

            <div className="pdp__price">
              {isCustom && <span className="pdp__from">Starting from</span>}
              <span className="pdp__current">{formatPrice(unitPrice)}</span>
              {onSale && <span className="pdp__old">{formatPrice(product.price)}</span>}
            </div>

            <div className="pdp__facts">
              <span className={`pdp__stock is-${availability.tone}`}>● {availability.label}</span>
              <span>SKU: {product.sku}</span>
            </div>

            <p className="pdp__desc">{product.description}</p>

            <div className="pdp__notice">
              <FiClock />
              <div>
                <strong>Preparation time: {product.leadTimeDays} days.</strong> Every piece is handmade — please book at least {product.leadTimeDays} days before your delivery date. You'll choose your date at checkout.
              </div>
            </div>

            {!isCustom && (
              <>
                {(product.options || []).map((opt) => (
                  <div className="pdp__option" key={opt.name}>
                    <span className="pdp__option-label">
                      {opt.name} {opt.required && <em>*</em>}
                    </span>
                    <div className="pdp__option-values" role="radiogroup" aria-label={opt.name}>
                      {!opt.required && (
                        <button type="button" role="radio" aria-checked={!selected[opt.name]} className={!selected[opt.name] ? 'is-active' : ''} onClick={() => setSelected((s) => ({ ...s, [opt.name]: undefined }))}>
                          None
                        </button>
                      )}
                      {opt.values.map((v) => (
                        <button
                          type="button"
                          key={v.label}
                          role="radio"
                          aria-checked={selected[opt.name] === v.label}
                          className={selected[opt.name] === v.label ? 'is-active' : ''}
                          onClick={() => setSelected((s) => ({ ...s, [opt.name]: v.label }))}
                        >
                          {v.label}
                          {v.priceAdjustment > 0 && <small> +{formatPrice(v.priceAdjustment)}</small>}
                        </button>
                      ))}
                    </div>
                    {errors[opt.name] && <span className="field-error">{errors[opt.name]}</span>}
                  </div>
                ))}

                {Object.values(perso).some(Boolean) && (
                  <details className="pdp__personal" open>
                    <summary>Personalise your gift (optional)</summary>
                    {perso.recipientName && (
                      <div className="form-group">
                        <label htmlFor="recipientName">Recipient name</label>
                        <input id="recipientName" className="input" value={personal.recipientName} onChange={(e) => setPersonal({ ...personal, recipientName: e.target.value })} />
                      </div>
                    )}
                    {perso.messageCard && (
                      <div className="form-group">
                        <label htmlFor="messageCard">Message card</label>
                        <textarea
                          id="messageCard"
                          className={`textarea ${errors.messageCard ? 'has-error' : ''}`}
                          rows={3}
                          maxLength={MESSAGE_LIMIT + 20}
                          placeholder="Happy Birthday! With love..."
                          value={personal.messageCard}
                          onChange={(e) => setPersonal({ ...personal, messageCard: e.target.value })}
                        />
                        <span className="field-hint">{personal.messageCard.length}/{MESSAGE_LIMIT}</span>
                        {errors.messageCard && <span className="field-error">{errors.messageCard}</span>}
                      </div>
                    )}
                    {perso.colourPreference && (
                      <div className="form-group">
                        <label htmlFor="colourPreference">Colour preference</label>
                        <input id="colourPreference" className="input" placeholder="e.g. pastel pinks, no yellow" value={personal.colourPreference} onChange={(e) => setPersonal({ ...personal, colourPreference: e.target.value })} />
                      </div>
                    )}
                    {perso.specialInstructions && (
                      <div className="form-group">
                        <label htmlFor="specialInstructions">Special instructions</label>
                        <input id="specialInstructions" className="input" value={personal.specialInstructions} onChange={(e) => setPersonal({ ...personal, specialInstructions: e.target.value })} />
                      </div>
                    )}
                  </details>
                )}

                <div className="pdp__buy">
                  <QuantitySelector value={quantity} onChange={setQuantity} max={Math.max(maxQty, 1)} />
                  <button className="btn btn-outline" disabled={!canBuy} onClick={() => handleAdd(false)}>
                    <FiShoppingBag /> Add to Cart
                  </button>
                  <button className="btn btn-primary" disabled={!canBuy} onClick={() => handleAdd(true)}>
                    Order Now
                  </button>
                </div>
                {!canBuy && <p className="text-danger pdp__unavailable">This item is currently unavailable.</p>}
              </>
            )}

            {isCustom && (
              <Link to={`/custom-order?product=${product.slug}`} className="btn btn-primary btn-block">
                Request a Custom Quote
              </Link>
            )}

            <div className="pdp__extra">
              <span><FiTruck /> Nationwide delivery — fee shown at checkout</span>
              <Link to="/contact"><FiMessageCircle /> Have a complex request? Contact us</Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pdp__tabs" id="reviews">
          <div className="pdp__tablist" role="tablist">
            {[
              ['details', 'Details & Care'],
              ['delivery', 'Delivery'],
              ['reviews', `Reviews (${reviews.length})`],
            ].map(([key, label]) => (
              <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className="pdp__tabpanel" role="tabpanel">
            {tab === 'details' && (
              <div>
                <p>{product.description}</p>
                {product.careInstructions && (
                  <p className="pdp__care">
                    <FiInfo /> <strong>Care:</strong> {product.careInstructions}
                  </p>
                )}
                {product.occasions?.length > 0 && <p><strong>Perfect for:</strong> {product.occasions.join(', ')}</p>}
                {product.colors?.length > 0 && <p><strong>Colours:</strong> {product.colors.join(', ')}</p>}
              </div>
            )}
            {tab === 'delivery' && (
              <div>
                <p>We deliver nationwide across Pakistan. Delivery fees by city:</p>
                <ul className="pdp__zones">
                  {settings.deliveryZones.map((z) => (
                    <li key={z.city}>
                      <span>{z.city === 'Other' ? 'Other cities' : z.city}</span>
                      <span>{formatPrice(z.fee)} · {z.days} days</span>
                    </li>
                  ))}
                </ul>
                <Link to="/policies/delivery" className="pdp__link">Read full delivery policy →</Link>
              </div>
            )}
            {tab === 'reviews' && (
              <div className="pdp__reviews">
                {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
                {reviews.map((r) => (
                  <div className="pdp__review" key={r._id}>
                    <div>
                      <strong>{r.name}</strong> <StarRating value={r.rating} size="sm" />
                      <span className="text-muted"> · {formatDate(r.createdAt)}</span>
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))}

                {user ? (
                  <form className="pdp__review-form" onSubmit={submitReview}>
                    <h4>Write a review</h4>
                    <p className="field-hint">Only customers whose order of this item has been delivered can review.</p>
                    <StarRating value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} size="lg" />
                    <textarea className="textarea" placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} aria-label="Review comment" />
                    <button className="btn btn-primary btn-sm" type="submit">Submit review</button>
                  </form>
                ) : (
                  <p className="text-muted"><Link to="/login" className="pdp__link">Log in</Link> to review a product you've received.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="section">
            <SectionHeading title="You may also like" align="left" />
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
