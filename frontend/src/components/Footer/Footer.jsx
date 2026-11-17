import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Logo from '../Logo/Logo';
import { useStore } from '../../context/StoreContext';
import { isValidEmail } from '../../utils/validators';
import './Footer.css';

const Footer = () => {
  const { settings, categories } = useStore();
  const { contact } = settings;
  const [email, setEmail] = useState('');

  const subscribe = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return toast.error('Please enter a valid email.');
    toast.success('Thank you for subscribing! 🌸');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p>{settings.tagline}. Handmade in {contact.address} and delivered nationwide.</p>
          <div className="footer__social">
            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
            <a href={`mailto:${contact.email}`} aria-label="Email"><FiMail /></a>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            {categories.slice(0, 5).map((c) => (
              <li key={c._id}><Link to={`/category/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Help</h4>
          <ul>
            <li><Link to="/track-order">Track Order</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/policies/delivery">Delivery Policy</Link></li>
            <li><Link to="/policies/refund">Cancellation & Refunds</Link></li>
            <li><Link to="/policies/custom-orders">Custom Order Policy</Link></li>
            <li><Link to="/policies/privacy">Privacy Policy</Link></li>
            <li><Link to="/policies/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4>Get in touch</h4>
          <ul className="footer__contact">
            <li><FiMapPin /> {contact.address}</li>
            <li><FiPhone /> {contact.phone}</li>
            <li><FiMail /> {contact.email}</li>
          </ul>
          <form className="footer__newsletter" onSubmit={subscribe}>
            <label htmlFor="newsletter" className="sr-only">Email for newsletter</label>
            <input id="newsletter" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
