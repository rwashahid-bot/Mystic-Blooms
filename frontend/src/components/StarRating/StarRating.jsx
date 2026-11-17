import { FaStar, FaRegStar } from 'react-icons/fa';
import './StarRating.css';

/** Read-only by default; pass onChange to make it an input. */
const StarRating = ({ value = 0, onChange, size = 'md' }) => (
  <div className={`star-rating star-rating--${size} ${onChange ? 'is-input' : ''}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) =>
      onChange ? (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-checked={value === n} role="radio">
          {n <= value ? <FaStar /> : <FaRegStar />}
        </button>
      ) : (
        <span key={n}>{n <= Math.round(value) ? <FaStar /> : <FaRegStar />}</span>
      )
    )}
  </div>
);

export default StarRating;
