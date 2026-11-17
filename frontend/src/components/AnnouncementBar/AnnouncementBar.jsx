import { useStore } from '../../context/StoreContext';
import './AnnouncementBar.css';

const STATUS_TEXT = {
  closed: '⚠️ We are temporarily closed and not accepting new orders. Please check back soon!',
  preorder: '📅 We are currently accepting pre-orders only.',
};

const AnnouncementBar = () => {
  const { cms, settings } = useStore();
  const statusMsg = STATUS_TEXT[settings.storeStatus];
  const text = statusMsg || (cms.announcement?.enabled ? cms.announcement.text : '');
  if (!text) return null;

  return (
    <div className={`announcement ${statusMsg ? 'announcement--alert' : ''}`} role="status">
      <div className="container announcement__inner">{text}</div>
    </div>
  );
};

export default AnnouncementBar;
