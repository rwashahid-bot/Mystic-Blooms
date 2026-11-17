import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../../components/AnnouncementBar/AnnouncementBar';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import './MainLayout.css';

const MainLayout = () => (
  <div className="main-layout">
    <a href="#main" className="skip-link">Skip to content</a>
    <AnnouncementBar />
    <Navbar />
    <main id="main" className="main-layout__content">
      <Outlet />
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default MainLayout;
