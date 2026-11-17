import { Link } from 'react-router-dom';
import { FiTruck, FiHeart, FiCalendar } from 'react-icons/fi';
import ProductImage from '../ProductImage/ProductImage';
import './Hero.css';

const Hero = ({ content, leadTimeDays }) => (
  <section className="hero">
    <div className="container hero__inner">
      <div className="hero__text">
        {content.eyebrow && <span className="hero__eyebrow">{content.eyebrow}</span>}
        <h1>{content.heading}</h1>
        <p>{content.subheading}</p>
        <div className="hero__actions">
          <Link to={content.buttonLink || '/shop'} className="btn btn-primary">{content.buttonText || 'Shop Now'}</Link>
          <Link to="/custom-order" className="btn btn-outline">Request Custom Order</Link>
        </div>
        <ul className="hero__perks">
          <li><FiHeart /> 100% handmade</li>
          <li><FiTruck /> Nationwide delivery</li>
          <li><FiCalendar /> Book {leadTimeDays} days ahead</li>
        </ul>
      </div>

      <div className="hero__visual">
        {content.image ? (
          <img src={content.image} alt="Mystic Blooms handmade bouquet" className="hero__img" />
        ) : (
          <div className="hero__collage">
            <ProductImage color="#e89bb3" alt="Pink chenille flower" />
            <ProductImage color="#9b7fc2" alt="Lilac chenille flower" />
            <ProductImage color="#c0304f" alt="Red chenille rose" />
          </div>
        )}
      </div>
    </div>
  </section>
);

export default Hero;
