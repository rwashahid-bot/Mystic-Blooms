import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import Hero from '../../components/Hero/Hero';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import Testimonials from '../../components/Testimonials/Testimonials';
import Loader from '../../components/Loader/Loader';
import { useStore } from '../../context/StoreContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageTitle } from '../../hooks/usePageTitle';
import { productService } from '../../services/productService';
import './Home.css';

const Home = () => {
  const { cms, settings, categories } = useStore();
  usePageTitle('', settings.tagline);

  const { data, loading } = useAsync(async () => {
    const [featured, bestsellers, newArrivals] = await Promise.all([
      productService.list({ featured: true, limit: 4 }),
      productService.list({ bestseller: true, sort: 'popular', limit: 4 }),
      productService.list({ isNew: true, sort: 'newest', limit: 4 }),
    ]);
    return { featured, bestsellers, newArrivals };
  }, []);

  return (
    <div className="home">
      <Hero content={cms.hero} leadTimeDays={settings.leadTimeDays} />

      <section className="section container">
        <SectionHeading eyebrow="Browse" title="Shop by Category" subtitle="From single stems to overflowing baskets — find the perfect forever-flower." />
        <div className="home__categories">
          {categories.map((c, i) => (
            <CategoryCard key={c._id} category={c} index={i} />
          ))}
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          {data?.featured.length > 0 && (
            <section className="section container">
              <SectionHeading eyebrow="Handpicked" title="Featured Blooms" align="left" linkTo="/shop?sort=featured" />
              <ProductGrid products={data.featured} />
            </section>
          )}

          {data?.bestsellers.length > 0 && (
            <section className="section home__band">
              <div className="container">
                <SectionHeading eyebrow="Loved by you" title="Bestsellers" align="left" linkTo="/shop?sort=popular" />
                <ProductGrid products={data.bestsellers} />
              </div>
            </section>
          )}

          {data?.newArrivals.length > 0 && (
            <section className="section container">
              <SectionHeading eyebrow="Fresh from the studio" title="New Arrivals" align="left" linkTo="/shop?sort=newest" />
              <ProductGrid products={data.newArrivals} />
            </section>
          )}
        </>
      )}

      <section className="section container">
        <div className="home__about">
          <div>
            <span className="home__script">Made by hand, with love</span>
            <h2>{cms.about.title}</h2>
            <p>{cms.about.story.split('\n')[0]}</p>
            <Link to="/about" className="btn btn-outline">Read our story</Link>
          </div>
          <ol className="home__steps">
            {cms.about.process.map((step, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container">
        <div className="home__custom">
          <div>
            <h2>Have something special in mind?</h2>
            <p>Tell us your colours, occasion and budget — we will design a one-of-a-kind arrangement just for you.</p>
          </div>
          <Link to="/custom-order" className="btn btn-primary">Start a Custom Order</Link>
        </div>
      </section>

      {cms.testimonials?.length > 0 && (
        <section className="section home__band">
          <div className="container">
            <SectionHeading eyebrow="Kind words" title="What our customers say" />
            <Testimonials items={cms.testimonials} />
          </div>
        </section>
      )}

      <section className="section container text-center home__insta">
        <FaInstagram />
        <h2>Follow our blooms on Instagram</h2>
        <p className="text-muted">Behind-the-scenes, new designs and happy customers.</p>
        <a href={settings.contact.instagram} target="_blank" rel="noreferrer" className="btn btn-outline">
          @{settings.contact.instagram.split('/').filter(Boolean).pop()}
        </a>
      </section>
    </div>
  );
};

export default Home;
