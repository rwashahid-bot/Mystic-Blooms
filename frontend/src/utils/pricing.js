export const basePrice = (product) =>
  product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

/** Unit price including option price adjustments. */
export const calcUnitPrice = (product, selected = {}) => {
  let price = basePrice(product);
  (product.options || []).forEach((opt) => {
    const val = opt.values.find((v) => v.label === selected[opt.name]);
    if (val) price += Number(val.priceAdjustment) || 0;
  });
  return price;
};

export const getDeliveryFee = (city, settings, subtotal = 0) => {
  if (!city || !settings) return 0;
  if (settings.freeDeliveryOver && subtotal >= settings.freeDeliveryOver) return 0;
  const zones = settings.deliveryZones || [];
  const zone = zones.find((z) => z.city.toLowerCase() === city.toLowerCase()) || zones.find((z) => z.city === 'Other');
  return zone ? Number(zone.fee) : 0;
};

/** Returns '' when valid, otherwise an error message. */
export const checkCoupon = (coupon, subtotal) => {
  if (!coupon) return 'Invalid coupon code.';
  if (!coupon.active) return 'This coupon is not active.';
  const today = new Date().toISOString().slice(0, 10);
  if (coupon.startDate && today < coupon.startDate) return 'This coupon is not valid yet.';
  if (coupon.endDate && today > coupon.endDate) return 'This coupon has expired.';
  if (coupon.usageLimit && coupon.used >= coupon.usageLimit) return 'This coupon has reached its usage limit.';
  if (coupon.minOrder && subtotal < coupon.minOrder) return `Minimum order of Rs. ${coupon.minOrder} required.`;
  return '';
};

export const calcDiscount = (coupon, subtotal) => {
  if (!coupon || checkCoupon(coupon, subtotal)) return 0;
  if (coupon.type === 'percent') return Math.round((subtotal * coupon.value) / 100);
  return Math.min(Number(coupon.value) || 0, subtotal);
};

export const calcTotals = ({ items = [], coupon = null, city = '', settings = null }) => {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discount = calcDiscount(coupon, subtotal);
  let deliveryFee = getDeliveryFee(city, settings, subtotal);
  if (coupon?.freeDelivery && !checkCoupon(coupon, subtotal)) deliveryFee = 0;
  const total = Math.max(subtotal - discount + deliveryFee, 0);
  return { subtotal, discount, deliveryFee, total };
};
