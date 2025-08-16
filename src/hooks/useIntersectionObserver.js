import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for intersection observer with debouncing
 * @param {Function} onIntersect - Callback when element intersects
 * @param {Object} options - Intersection observer options
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} - { elementRef }
 */
export const useIntersectionObserver = (onIntersect, options = {}, debounceMs = 100) => {
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onIntersect(entry.isIntersecting, entry);
    }, debounceMs);
  }, [onIntersect, debounceMs]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });

    observerRef.current.observe(element);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleIntersection, options]);

  // Provide method to disconnect observer
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return { elementRef, disconnect };
};

export default useIntersectionObserver;