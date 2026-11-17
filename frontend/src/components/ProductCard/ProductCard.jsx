import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import ProductImage from '../ProductImage/ProductImage';
import { formatPrice } from '../../utils/format';
import './ProductCard.css';

export const getAvailability = (p) => {
  if (!p.available) return { label: 'Unavailable', tone: 'out' };
  if (p.type === 'custom') return { label: 'Quote on request', tone: 'info' };
  if (p.type === 'made-to-order') return { label: 'Made to order', tone: 'info' };
  if ((p.stock ?? 0) <= 0) return { label: 'Out of stock', tone: 'out' };
  if (p.stock <= (p.lowStockThreshold || 0)) return { label: `Only ${p.stock} left`, tone: 'low' };
  return { label: 'In stock', tone: 'in' };
};

const ProductCard = ({ product }) => {
  const onSale = product.salePrice && product.salePrice < product.price;
  const availability = getAvailability(product);

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card__media">
        <ProductImage src={product.images?.[0]} alt={product.name} color={product.color} rounded={false} />
        <div className="product-card__tags">
          {onSale && <span className="product-card__tag product-card__tag--sale">Sale</span>}
          {product.isNew && <span className="product-card__tag">New</span>}
          {product.bestseller && <span className="product-card__tag product-card__tag--best">Bestseller</span>}
        </div>
      </Link>

      <div className="product-card__body">
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <div className="product-card__price">
          {product.type === 'custom' && <span className="product-card__from">From</span>}
          <span className="product-card__current">{formatPrice(onSale ? product.salePrice : product.price)}</span>
          {onSale && <span className="product-card__old">{formatPrice(product.price)}</span>}
        </div>
        <div className="product-card__meta">
          <span className={`product-card__stock is-${availability.tone}`}>{availability.label}</span>
          <span className="product-card__lead">
            <FiClock /> {product.leadTimeDays}d
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
