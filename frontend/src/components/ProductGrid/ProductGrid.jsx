import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products = [], columns = 4 }) => (
  <div className={`product-grid product-grid--${columns}`}>
    {products.map((p) => (
      <ProductCard key={p._id} product={p} />
    ))}
  </div>
);

export default ProductGrid;
