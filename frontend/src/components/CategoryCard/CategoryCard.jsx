import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import ProductImage from '../ProductImage/ProductImage';
import './CategoryCard.css';

const PALETTE = ['#e89bb3', '#9b7fc2', '#f08a7e', '#4fa3c7', '#c9a24a', '#6c4a7d'];

const CategoryCard = ({ category, index = 0 }) => (
  <Link to={`/category/${category.slug}`} className="category-card">
    <ProductImage src={category.image} alt={category.name} color={PALETTE[index % PALETTE.length]} rounded={false} />
    <div className="category-card__overlay">
      <h3>{category.name}</h3>
      <span>
        Explore <FiArrowRight />
      </span>
    </div>
  </Link>
);

export default CategoryCard;
