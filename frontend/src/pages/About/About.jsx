import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import ProductImage from '../../components/ProductImage/ProductImage';
import Testimonials from '../../components/Testimonials/Testimonials';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import './About.css';

const About = () => {
  const { cms, settings } = useStore();
  const { about } = cms;
  usePageTitle('About Us', 'The story behind Mystic Blooms, handmade chenille flowers from Rawalpindi.');

  return (
    <div className="about">
      <PageHeader title={about.title} subtitle={settings.tagline} breadcrumbs={[{ label: 'About Us' }]} />

      <section className="container section about__story">
        <div className="about__media">
          {about.image ? <img src={about.image} alt="Our studio" /> : <ProductImage color="#d77fa1" alt="Handmade chenille flowers" />}
        </div>
        <div className="about__text">
          <span className="about__script">Hello from our studio</span>
          {about.story.split('\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <ul className="about__facts">
            <li><strong>100%</strong><span>Handmade</span></li>
            <li><strong>{settings.leadTimeDays} days</strong><span>Booking lead time</span></li>
            <li><strong>Nationwide</strong><span>Delivery across Pakistan</span></li>
          </ul>
        </div>
      </section>

      <section className="section about__process">
        <div className="container">
          <SectionHeading eyebrow="How it works" title="From stem to bloom" />
          <ol className="about__steps">
            {about.process.map((s, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {cms.testimonials?.length > 0 && (
        <section className="container section">
          <SectionHeading eyebrow="Kind words" title="Loved across Pakistan" />
          <Testimonials items={cms.testimonials} />
        </section>
      )}

      <section className="container about__cta">
        <h2>Ready to send some everlasting love?</h2>
        <div>
          <Link to="/shop" className="btn btn-primary">Shop the collection</Link>
          <Link to="/custom-order" className="btn btn-outline">Request a custom piece</Link>
        </div>
      </section>
    </div>
  );
};

export default About;
