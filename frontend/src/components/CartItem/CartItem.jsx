import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import ProductImage from '../ProductImage/ProductImage';
import QuantitySelector from '../QuantitySelector/QuantitySelector';
import { formatPrice, optionsToText } from '../../utils/format';
import './CartItem.css';

const CartItem = ({ item, onQuantity, onRemove }) => {
  const p = item.personalisation || {};
  return (
    <div className="cart-item">
      <Link to={`/product/${item.slug}`} className="cart-item__img">
        <ProductImage src={item.image} alt={item.name} color={item.color} />
      </Link>

      <div className="cart-item__info">
        <Link to={`/product/${item.slug}`} className="cart-item__name">{item.name}</Link>
        {optionsToText(item.options) && <p className="cart-item__meta">{optionsToText(item.options)}</p>}
        {p.messageCard && <p className="cart-item__meta">💌 “{p.messageCard}”</p>}
        {p.recipientName && <p className="cart-item__meta">For: {p.recipientName}</p>}
        <p className="cart-item__meta">Prep time: {item.leadTimeDays} days</p>
        <p className="cart-item__unit">{formatPrice(item.unitPrice)} each</p>
      </div>

      <div className="cart-item__actions">
        <QuantitySelector size="sm" value={item.quantity} max={item.maxStock} onChange={(q) => onQuantity(item.key, q)} />
        <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
        <button className="cart-item__remove" onClick={() => onRemove(item.key)} aria-label={`Remove ${item.name}`}>
          <FiTrash2 /> Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
