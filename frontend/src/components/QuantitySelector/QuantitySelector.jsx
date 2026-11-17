import { FiMinus, FiPlus } from 'react-icons/fi';
import './QuantitySelector.css';

const QuantitySelector = ({ value, onChange, min = 1, max = 99, size = 'md' }) => (
  <div className={`qty qty--${size}`}>
    <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
      <FiMinus />
    </button>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      aria-label="Quantity"
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
      }}
    />
    <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
      <FiPlus />
    </button>
  </div>
);

export default QuantitySelector;
