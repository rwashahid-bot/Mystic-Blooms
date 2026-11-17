import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { calcUnitPrice } from '../utils/pricing';

const CartContext = createContext(null);
const CART_KEY = 'mb_cart';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

// Same product + same options + same personalisation = same cart line
const lineKey = (productId, options, personalisation) => `${productId}|${JSON.stringify(options)}|${JSON.stringify(personalisation)}`;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, { options = {}, personalisation = {}, quantity = 1 } = {}) => {
    const key = lineKey(product._id, options, personalisation);
    const maxStock = product.type === 'ready-made' ? product.stock ?? 0 : 99;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, maxStock) } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          color: product.color,
          image: product.images?.[0] || '',
          type: product.type,
          leadTimeDays: product.leadTimeDays,
          maxStock,
          options,
          personalisation,
          unitPrice: calcUnitPrice(product, options),
          quantity: Math.min(quantity, maxStock),
        },
      ];
    });
  };

  const updateQuantity = (key, quantity) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) } : i)));

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const clearCart = () => {
    setItems([]);
  };

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
