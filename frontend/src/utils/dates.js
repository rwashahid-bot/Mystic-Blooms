// Booking calendar helpers — the core business rule (≈2 week lead time).

export const toISODate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/** Longest lead time among cart items (falls back to the store default). */
export const getRequiredLeadTime = (items = [], settings = {}) => {
  const fallback = Number(settings.leadTimeDays) || 0;
  if (!items.length) return fallback;
  return Math.max(...items.map((i) => Number(i.leadTimeDays ?? fallback)));
};

export const getEarliestDeliveryDate = (items, settings) =>
  toISODate(addDays(new Date(), getRequiredLeadTime(items, settings)));

/**
 * Validates a requested delivery date against lead time, blocked dates and daily capacity.
 * @param {string} date        yyyy-mm-dd
 * @param {object} capacityMap { 'yyyy-mm-dd': ordersCount }
 */
export const validateDeliveryDate = (date, items, settings, capacityMap = {}) => {
  if (!date) return 'Please choose a delivery date.';
  const earliest = getEarliestDeliveryDate(items, settings);
  if (date < earliest) {
    return `Handmade orders need ${getRequiredLeadTime(items, settings)} days. Earliest available date is ${earliest}.`;
  }
  if ((settings.blockedDates || []).includes(date)) {
    return 'Sorry, we are not taking deliveries on this date. Please choose another.';
  }
  const cap = Number(settings.dailyCapacity) || 0;
  if (cap > 0 && (capacityMap[date] || 0) >= cap) {
    return 'This date is fully booked. Please choose another date.';
  }
  return '';
};
