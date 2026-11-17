import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiStar, FiChevronLeft, FiChevronRight, FiLink } from 'react-icons/fi';
import { fileToDataUrl } from '../../../utils/exportCsv';
import './ImageUploader.css';

/**
 * Multi-image manager: upload, add by URL, reorder, set primary (first), alt text.
 * images: [{ url, alt }]. In production replace fileToDataUrl with an upload to object storage.
 */
const ImageUploader = ({ images = [], onChange, multiple = true, max = 8 }) => {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const addFiles = async (e) => {
    const files = [...(e.target.files || [])].slice(0, max - images.length);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      const added = [];
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`${f.name} is larger than 5 MB`);
          continue;
        }
        added.push({ url: await fileToDataUrl(f), alt: '' });
      }
      onChange(multiple ? [...images, ...added] : added.slice(0, 1));
    } finally {
      setBusy(false);
    }
  };

  const addUrl = () => {
    if (!/^https?:\/\//.test(url.trim())) return toast.error('Enter a valid image URL (https://...)');
    onChange(multiple ? [...images, { url: url.trim(), alt: '' }] : [{ url: url.trim(), alt: '' }]);
    setUrl('');
  };

  const move = (i, dir) => {
    const next = [...images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const makePrimary = (i) => onChange([images[i], ...images.filter((_, k) => k !== i)]);
  const remove = (i) => onChange(images.filter((_, k) => k !== i));
  const setAlt = (i, alt) => onChange(images.map((img, k) => (k === i ? { ...img, alt } : img)));

  return (
    <div className="image-uploader">
      {images.length > 0 && (
        <div className="image-uploader__grid">
          {images.map((img, i) => (
            <div key={i} className={`image-uploader__item ${i === 0 ? 'is-primary' : ''}`}>
              <img src={img.url} alt={img.alt || ''} />
              {i === 0 && multiple && <span className="image-uploader__primary">Primary</span>}
              <div className="image-uploader__tools">
                {multiple && (
                  <>
                    <button type="button" onClick={() => move(i, -1)} aria-label="Move left"><FiChevronLeft /></button>
                    {i !== 0 && <button type="button" onClick={() => makePrimary(i)} aria-label="Make primary"><FiStar /></button>}
                    <button type="button" onClick={() => move(i, 1)} aria-label="Move right"><FiChevronRight /></button>
                  </>
                )}
                <button type="button" onClick={() => remove(i)} aria-label="Remove image" className="danger"><FiX /></button>
              </div>
              <input className="input" placeholder="Alt text (for accessibility)" value={img.alt} onChange={(e) => setAlt(i, e.target.value)} aria-label="Alt text" />
            </div>
          ))}
        </div>
      )}

      {images.length < (multiple ? max : 1) && (
        <div className="image-uploader__add">
          <label className="image-uploader__drop">
            <FiUpload /> {busy ? 'Processing…' : multiple ? 'Upload images' : 'Upload image'}
            <input type="file" accept="image/*" multiple={multiple} onChange={addFiles} disabled={busy} />
          </label>
          <div className="image-uploader__url">
            <FiLink />
            <input className="input" placeholder="…or paste an image URL" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
            <button type="button" className="btn btn-light btn-sm" onClick={addUrl}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
