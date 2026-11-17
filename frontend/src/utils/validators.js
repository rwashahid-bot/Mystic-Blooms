// Pakistani mobile: 03XXXXXXXXX or +923XXXXXXXXX (spaces/dashes allowed)
export const isValidPkPhone = (phone = '') => /^(\+92|0092|0)3\d{9}$/.test(phone.replace(/[\s-]/g, ''));

export const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const normalizePhone = (phone = '') => {
  const p = phone.replace(/[\s-]/g, '');
  if (p.startsWith('+92')) return `0${p.slice(3)}`;
  if (p.startsWith('0092')) return `0${p.slice(4)}`;
  return p;
};

/** Runs a map of rule functions and returns { field: message } for failures. */
export const runValidation = (values, rules) => {
  const errors = {};
  Object.entries(rules).forEach(([field, rule]) => {
    const msg = rule(values[field], values);
    if (msg) errors[field] = msg;
  });
  return errors;
};

export const required = (label) => (v) => (!v || !String(v).trim() ? `${label} is required.` : '');
