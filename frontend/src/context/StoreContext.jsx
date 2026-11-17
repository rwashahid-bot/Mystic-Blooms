import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { categoryService } from '../services/categoryService';
import { seedSettings, seedCms } from '../data/seedData';

const StoreContext = createContext(null);

/** Public store data shared by every page: settings, published CMS content and categories. */
export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState(seedSettings);
  const [cms, setCms] = useState(seedCms);
  const [categories, setCategories] = useState([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [s, c, cats] = await Promise.all([contentService.getSettings(), contentService.getCms(), categoryService.list()]);
      setSettings(s);
      setCms(c);
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load store data', e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <StoreContext.Provider value={{ settings, cms, categories, ready, refresh }}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
