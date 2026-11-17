import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader/PageHeader';
import { useStore } from '../../context/StoreContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import './FAQ.css';

const FAQ = () => {
  usePageTitle('FAQs');
  const { cms } = useStore();
  const [open, setOpen] = useState(0);

  return (
    <div className="faq">
      <PageHeader title="Frequently Asked Questions" subtitle="Everything you need to know about ordering handmade blooms." breadcrumbs={[{ label: 'FAQs' }]} />
      <div className="container section faq__body">
        {cms.faqs.map((item, i) => (
          <div key={i} className={`faq__item ${open === i ? 'is-open' : ''}`}>
            <button className="faq__q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} aria-controls={`faq-${i}`}>
              {item.q}
              <FiChevronDown />
            </button>
            <div id={`faq-${i}`} className="faq__a" hidden={open !== i}>
              <p>{item.a}</p>
            </div>
          </div>
        ))}
        <p className="faq__more">
          Still have questions? <Link to="/contact">Contact us</Link> — we're happy to help.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
