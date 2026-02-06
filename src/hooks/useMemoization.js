import { useMemo, useCallback, useRef, useEffect, useState } from 'react';


export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  const signalRef = useRef(0);

  const depsString = JSON.stringify(deps);
  const prevDepsString = useRef(depsString);

  if (depsString !== prevDepsString.current) {
    ref.current = factory();
    prevDepsString.current = depsString;
    signalRef.current += 1;
  }

  return useMemo(() => ref.current, [signalRef.current]);
};


export const useStableCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);


  useEffect(() => {
    const depsChanged = !deps || !depsRef.current || 
      deps.length !== depsRef.current.length ||
      deps.some((dep, index) => dep !== depsRef.current[index]);

    if (depsChanged) {
      callbackRef.current = callback;
      depsRef.current = deps;
    }
  });

  return useCallback((...args) => callbackRef.current(...args), []);
};


export const useExpensiveComputation = (computeFn, deps, cacheSize = 10) => {
  const cacheRef = useRef(new Map());
  const keysRef = useRef([]);

  return useMemo(() => {
    const key = JSON.stringify(deps);
    const cache = cacheRef.current;
    const keys = keysRef.current;

    if (cache.has(key)) {
      const value = cache.get(key);
      const keyIndex = keys.indexOf(key);
      if (keyIndex > -1) {
        keys.splice(keyIndex, 1);
        keys.push(key);
      }
      return value;
    }

    const result = computeFn();


    cache.set(key, result);
    keys.push(key);


    while (keys.length > cacheSize) {
      const oldestKey = keys.shift();
      cache.delete(oldestKey);
    }

    return result;
  }, deps);
};


export const useDebouncedMemo = (factory, deps, delay = 300) => {
  const timeoutRef = useRef();
  const valueRef = useRef();
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const newValue = factory();
      if (JSON.stringify(newValue) !== JSON.stringify(valueRef.current)) {
        valueRef.current = newValue;
        setTrigger(prev => prev + 1);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return useMemo(() => valueRef.current, [trigger]);
};


export const useSelectiveMemo = (obj, selector) => {
  return useMemo(() => {
    if (!obj || typeof selector !== 'function') return obj;
    return selector(obj);
  }, [obj, selector]);
};


export const useListMemo = (list, compareFn) => {
  const prevListRef = useRef(list);
  const memoizedListRef = useRef(list);

  const hasChanged = useMemo(() => {
    if (!prevListRef.current || !list) return true;
    if (prevListRef.current.length !== list.length) return true;

    if (compareFn) {
      return !list.every((item, index) => 
        compareFn(item, prevListRef.current[index])
      );
    }


    return !list.every((item, index) => 
      item === prevListRef.current[index]
    );
  }, [list, compareFn]);

  if (hasChanged) {
    memoizedListRef.current = list;
    prevListRef.current = list;
  }

  return memoizedListRef.current;
};


export const useComponentMemo = (Component, props, deps = []) => {
  return useMemo(() => {
    return <Component {...props} />;
  }, [Component, ...deps]);
};


export const useStyleMemo = (styleFactory, deps) => {
  return useMemo(() => {
    const styles = styleFactory();
    return Object.freeze(styles);
  }, deps);
};


export const useTransformMemo = (data, transformFn, deps = []) => {
  return useMemo(() => {
    if (!data || !transformFn) return data;
    return transformFn(data);
  }, [data, transformFn, ...deps]);
};


export const useInvalidatableMemo = (factory, deps) => {
  const [invalidationKey, setInvalidationKey] = useState(0);
  
  const memoizedValue = useMemo(factory, [...deps, invalidationKey]);
  
  const invalidate = useCallback(() => {
    setInvalidationKey(prev => prev + 1);
  }, []);

  return [memoizedValue, invalidate];
};

export default {
  useDeepMemo,
  useStableCallback,
  useExpensiveComputation,
  useDebouncedMemo,
  useSelectiveMemo,
  useListMemo,
  useComponentMemo,
  useStyleMemo,
  useTransformMemo,
  useInvalidatableMemo
};