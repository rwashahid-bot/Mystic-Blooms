import { FiCheck } from 'react-icons/fi';
import { formatDateTime } from '../../utils/format';
import './OrderTimeline.css';

const FLOW = ['New', 'Confirmed', 'In Preparation', 'Ready', 'Dispatched', 'Delivered'];

/** Progress tracker for customers + full history list. */
const OrderTimeline = ({ status, history = [], showHistory = true }) => {
  const cancelled = status === 'Cancelled';
  const currentIdx = FLOW.indexOf(status);

  return (
    <div className="order-timeline">
      {cancelled ? (
        <div className="order-timeline__cancelled">This order was cancelled.</div>
      ) : (
        <ol className="order-timeline__steps">
          {FLOW.map((step, i) => (
            <li key={step} className={`${i < currentIdx ? 'is-done' : ''} ${i === currentIdx ? 'is-current' : ''}`}>
              <span className="order-timeline__dot">{i <= currentIdx ? <FiCheck /> : i + 1}</span>
              <span className="order-timeline__label">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {showHistory && history.length > 0 && (
        <ul className="order-timeline__history">
          {[...history].reverse().map((h, i) => (
            <li key={i}>
              <strong>{h.status}</strong>
              <span>{formatDateTime(h.at)}</span>
              {h.note && <p>{h.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderTimeline;
