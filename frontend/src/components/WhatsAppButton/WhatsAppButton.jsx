import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../../context/StoreContext';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const { settings } = useStore();
  const text = encodeURIComponent('Hi Mystic Blooms! I have a question about an order.');
  return (
    <a className="wa-button" href={`https://wa.me/${settings.contact.whatsapp}?text=${text}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
      <FaWhatsapp />
    </a>
  );
};

export default WhatsAppButton;
