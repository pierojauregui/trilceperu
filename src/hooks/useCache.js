import { useState, useEffect, useCallback, useRef } from 'react';

export const useMemoryCache = (key, fetcher, options = {}) => {
  const {
    ttl = 5 * 60 * 1000, 
    staleWhileRevalidate = true
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  const getCachedData = useCallback((cacheKey) => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > ttl;
    
    if (isExpired && !staleWhileRevalidate) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return {
      data: cached.data,
      isStale: isExpired
    };
  }, [ttl, staleWhileRevalidate]);

  const setCachedData = useCallback((cacheKey, newData) => {
    cacheRef.current.set(cacheKey, {
      data: newData,
      timestamp: Date.now()
    });
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!key || !fetcher) return;

    const cached = getCachedData(key);
    
    if (cached && !forceRefresh) {
      setData(cached.data);
      
      if (cached.isStale && staleWhileRevalidate) {
        try {
          const freshData = await fetcher();
          setCachedData(key, freshData);
          setData(freshData);
        } catch (err) {
         
          console.warn('Failed to revalidate cache:', err);
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setCachedData(key, result);
      setData(result);
    } catch (err) {
      setError(err);
      if (cached) {
        setData(cached.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, getCachedData, setCachedData, staleWhileRevalidate]);

  const invalidateCache = useCallback(() => {
    if (key) {
      cacheRef.current.delete(key);
    }
  }, [key]);

  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    invalidate: invalidateCache,
    clearAll: clearAllCache
  };
};


export const usePersistentCache = (key, fetcher, options = {}) => {
  const {
    ttl = 30 * 60 * 1000, 
    storageKey = `cache_${key}`
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoredData = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      if (now - parsed.timestamp > ttl) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsed.data;
    } catch (err) {
      console.warn('Error reading from localStorage:', err);
      return null;
    }
  }, [storageKey, ttl]);

  const setStoredData = useCallback((newData) => {
    try {
      const toStore = {
        data: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch (err) {
      console.warn('Error writing to localStorage:', err);
    }
  }, [storageKey]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!key || !fetcher) return;

    const stored = getStoredData();
    
    if (stored && !forceRefresh) {
      setData(stored);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setStoredData(result);
      setData(result);
    } catch (err) {
      setError(err);

      if (stored) {
        setData(stored);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, getStoredData, setStoredData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(storageKey);
    setData(null);
  }, [storageKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    clearCache
  };
};


export const useQueryCache = () => {
  const pendingQueries = useRef(new Map());
  const cache = useRef(new Map());

  const query = useCallback(async (key, fetcher, options = {}) => {
    const { ttl = 5 * 60 * 1000 } = options;


    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }


    if (pendingQueries.current.has(key)) {
      return pendingQueries.current.get(key);
    }


    const queryPromise = fetcher()
      .then(data => {
        cache.current.set(key, {
          data,
          timestamp: Date.now()
        });
        pendingQueries.current.delete(key);
        return data;
      })
      .catch(error => {
        pendingQueries.current.delete(key);
        throw error;
      });

    pendingQueries.current.set(key, queryPromise);
    return queryPromise;
  }, []);

  const invalidate = useCallback((key) => {
    cache.current.delete(key);
    pendingQueries.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cache.current.clear();
    pendingQueries.current.clear();
  }, []);

  return { query, invalidate, clear };
};

export default useMemoryCache;