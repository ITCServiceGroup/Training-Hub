import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import TemplatePreview from '../TemplatePreview';
import { performanceLogger } from '../../utils/performanceLogger';

const LazyTemplatePreview = ({ 
  content, 
  className = '', 
  rootMargin = '50px',
  threshold = 0.1,
  placeholder = null,
  debounceMs = 100,
  ...props 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isVisible, setIsVisible] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Debounced visibility handler
  const handleVisibilityChange = useCallback((isIntersecting) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (isIntersecting && !hasRendered) {
        setIsLoading(true);
        const timerLabel = `lazy-template-render-${Date.now()}`;
        performanceLogger.startTimer(timerLabel);
        
        // Small delay to show loading state
        setTimeout(() => {
          setIsVisible(true);
          setHasRendered(true);
          setIsLoading(false);
          
          // Log performance
          setTimeout(() => {
            const duration = performanceLogger.endTimer(timerLabel);
            // Note: We don't have template ID here, so we use a generic label
            performanceLogger.logTemplateRender('template', true, false, duration);
          }, 100);
          
          // Once rendered, we can disconnect the observer
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }, 50);
      }
    }, debounceMs);
  }, [hasRendered, debounceMs]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        handleVisibilityChange(entry.isIntersecting);
      },
      {
        rootMargin,
        threshold
      }
    );

    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [rootMargin, threshold, handleVisibilityChange]);

  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    const loadingText = isLoading ? 'Loading preview...' : 'Preview will load when visible';
    const showPulse = isLoading;

    return (
      <div className={`template-preview-skeleton ${className} ${isDark ? 'bg-slate-800' : 'bg-white'} rounded border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
        <div className="h-80 flex items-center justify-center">
          <div className={`${showPulse ? 'animate-pulse' : ''} ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-lg w-full h-full mx-4 my-4 flex items-center justify-center transition-all duration-300`}>
            <div className={`text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              <div className="text-lg mb-2">
                {isLoading ? (
                  <div className="inline-block animate-spin">⚙️</div>
                ) : (
                  '📄'
                )}
              </div>
              <p className="text-sm">{loadingText}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={elementRef} 
      className="lazy-template-preview-container"
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        overflow: 'hidden' // This container doesn't need to scroll, the child will handle it
      }}
    >
      {isVisible ? (
        <TemplatePreview 
          content={content} 
          className={className}
          {...props}
        />
      ) : (
        renderPlaceholder()
      )}
    </div>
  );
};

export default LazyTemplatePreview;