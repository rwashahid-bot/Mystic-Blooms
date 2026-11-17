import { useEffect } from 'react';

/** Sets document title and meta description (basic SEO for an SPA). */
export const usePageTitle = (title, description) => {
  useEffect(() => {
    document.title = title ? `${title} | Mystic Blooms` : 'Mystic Blooms | Handmade Chenille Flowers';
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
};
