import { useState, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import TemplatePreview from '../TemplatePreview';
import { performanceLogger } from '../../utils/performanceLogger';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

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
  const [renderState, setRenderState] = useState('idle'); // 'idle', 'loading', 'rendered', 'error'

  // Handle intersection with performance tracking
  const handleIntersection = useCallback((isIntersecting) => {
    if (isIntersecting && renderState === 'idle') {
      try {
        setRenderState('loading');
        const timerLabel = `lazy-template-render-${Date.now()}`;
        performanceLogger.startTimer(timerLabel);
        
        // Small delay to show loading state, then render
        setTimeout(() => {
          try {
            setRenderState('rendered');
            
            // Log performance
            const duration = performanceLogger.endTimer(timerLabel);
            performanceLogger.logTemplateRender('template', true, false, duration);
          } catch (error) {
            console.error('LazyTemplatePreview: Error during render:', error);
            setRenderState('error');
            performanceLogger.endTimer(timerLabel);
          }
        }, 50);
      } catch (error) {
        console.error('LazyTemplatePreview: Error during loading:', error);
        setRenderState('error');
      }
    }
  }, [renderState]);

  // Use intersection observer hook
  const { elementRef, disconnect } = useIntersectionObserver(
    handleIntersection,
    { rootMargin, threshold },
    debounceMs
  );

  // Auto-disconnect observer when rendered
  useEffect(() => {
    if (renderState === 'rendered') {
      disconnect();
    }
  }, [renderState, disconnect]);

  // Memoized placeholder component
  const renderPlaceholder = useCallback(() => {
    if (placeholder) {
      return placeholder;
    }

    const isLoading = renderState === 'loading';
    const isError = renderState === 'error';
    const iconClasses = `text-lg mb-2 ${isLoading ? 'animate-spin' : ''}`;
    const skeletonClasses = `template-preview-skeleton ${className} ${
      isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
    } rounded border overflow-hidden`;
    const contentClasses = `${
      isLoading ? 'animate-pulse' : ''
    } ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-lg w-full h-full mx-4 my-4 flex items-center justify-center transition-all duration-300`;

    let icon = '📄';
    let text = 'Preview will load when visible';
    
    if (isLoading) {
      icon = '⚙️';
      text = 'Loading preview...';
    } else if (isError) {
      icon = '⚠️';
      text = 'Failed to load preview';
    }

    return (
      <div className={skeletonClasses}>
        <div className="h-80 flex items-center justify-center">
          <div className={contentClasses}>
            <div className={`text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              <div className={iconClasses}>
                {icon}
              </div>
              <p className="text-sm">{text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }, [placeholder, renderState, className, isDark]);

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
      {renderState === 'rendered' ? (
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

LazyTemplatePreview.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  className: PropTypes.string,
  rootMargin: PropTypes.string,
  threshold: PropTypes.number,
  placeholder: PropTypes.node,
  debounceMs: PropTypes.number
};

export default memo(LazyTemplatePreview);