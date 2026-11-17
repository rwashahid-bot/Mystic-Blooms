import './StatusBadge.css';

const TONES = {
  // Order status
  New: 'info', Confirmed: 'primary', 'In Preparation': 'warning', Ready: 'teal', Dispatched: 'purple', Delivered: 'success', Cancelled: 'danger',
  // Payment status
  Unpaid: 'neutral', 'Awaiting Verification': 'warning', 'Partially Paid': 'teal', Paid: 'success', Refunded: 'purple', Failed: 'danger',
  // Generic
  published: 'success', draft: 'neutral', archived: 'danger', active: 'success', inactive: 'neutral',
  pending: 'warning', approved: 'success', rejected: 'danger', new: 'info', replied: 'primary', quoted: 'purple', converted: 'success', closed: 'neutral',
};

const StatusBadge = ({ status, tone }) => (
  <span className={`status-badge status-badge--${tone || TONES[status] || 'neutral'}`}>{status}</span>
);

export default StatusBadge;
