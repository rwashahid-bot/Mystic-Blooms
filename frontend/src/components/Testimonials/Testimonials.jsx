import StarRating from '../StarRating/StarRating';
import './Testimonials.css';

const Testimonials = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <div className="testimonials">
      {items.map((t, i) => (
        <figure className="testimonial" key={i}>
          <StarRating value={t.rating || 5} size="sm" />
          <blockquote>“{t.text}”</blockquote>
          <figcaption>
            <span className="testimonial__avatar">{t.name?.[0]}</span>
            <span>
              <strong>{t.name}</strong>
              {t.city && <small>{t.city}</small>}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default Testimonials;
