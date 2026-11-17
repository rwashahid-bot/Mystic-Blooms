import './Loader.css';

const Loader = ({ fullPage = false, text = '' }) => (
  <div className={`loader ${fullPage ? 'loader--full' : ''}`} role="status" aria-live="polite">
    <span className="loader__flower" aria-hidden="true">
      <span /><span /><span /><span /><span />
    </span>
    <span className="loader__text">{text || 'Loading...'}</span>
  </div>
);

export default Loader;
