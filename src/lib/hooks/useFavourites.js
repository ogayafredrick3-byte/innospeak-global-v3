import { useState, useCallback, useEffect } from 'react';

/**
 * useFavourites — manages favourite course codes with localStorage persistence.
 *
 * Returns the favourite set, a toggle function, and a checker.
 */
const STORAGE_KEY = 'isg-favourite-courses';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function useFavourites() {
  const [favourites, setFavourites] = useState(() => readStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favourites]));
    } catch {
      /* ignore quota errors */
    }
  }, [favourites]);

  const toggle = useCallback((code) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const isFavourite = useCallback((code) => favourites.has(code), [favourites]);

  return { favourites, toggle, isFavourite };
}
