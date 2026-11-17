import './ProductImage.css';

/**
 * Shows the product photo, or a soft illustrated chenille flower in the product's colour
 * when no photo has been uploaded yet.
 */
const ProductImage = ({ src, alt = '', color = '#e89bb3', className = '', rounded = true }) => {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`product-image ${rounded ? 'is-rounded' : ''} ${className}`} />;
  }

  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <div
      className={`product-image product-image--placeholder ${rounded ? 'is-rounded' : ''} ${className}`}
      style={{ '--flower': color }}
      role="img"
      aria-label={alt}
    >
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <path d="M100 120 C 98 150, 104 170, 100 196" stroke="#6b9b5e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="80" cy="165" rx="16" ry="7" fill="#7fb06f" transform="rotate(-30 80 165)" />
        <ellipse cx="120" cy="150" rx="16" ry="7" fill="#7fb06f" transform="rotate(30 120 150)" />
        <g transform="translate(100 88)">
          {petals.map((deg) => (
            <ellipse key={deg} cx="0" cy="-34" rx="17" ry="32" fill="var(--flower)" opacity="0.92" transform={`rotate(${deg})`} />
          ))}
          {petals.map((deg) => (
            <ellipse key={`i${deg}`} cx="0" cy="-20" rx="9" ry="18" fill="#fff" opacity="0.22" transform={`rotate(${deg + 22})`} />
          ))}
          <circle r="15" fill="#ffd979" />
          <circle r="15" fill="none" stroke="#f0b94a" strokeWidth="3" strokeDasharray="2 4" />
        </g>
      </svg>
    </div>
  );
};

export default ProductImage;
