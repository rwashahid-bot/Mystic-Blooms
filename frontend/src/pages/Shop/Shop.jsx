import PageHeader from '../../components/PageHeader/PageHeader';
import ProductBrowser from '../../components/ProductBrowser/ProductBrowser';
import { usePageTitle } from '../../hooks/usePageTitle';
import './Shop.css';

const Shop = () => {
  usePageTitle('Shop All Flowers', 'Browse handmade chenille bouquets, single stems, baskets and gifts.');
  return (
    <div className="shop">
      <PageHeader title="Shop All Blooms" subtitle="Every flower is handmade from soft chenille stems — they never wilt." breadcrumbs={[{ label: 'Shop' }]} />
      <section className="container shop__body">
        <ProductBrowser />
      </section>
    </div>
  );
};

export default Shop;
