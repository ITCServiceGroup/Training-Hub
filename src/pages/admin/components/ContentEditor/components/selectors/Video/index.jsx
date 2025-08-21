import { useNode } from '@craftjs/core';
import { Resizer } from '../Resizer';
import React from 'react';
import { VideoSettings } from './VideoSettings';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor } from '../../../utils/themeColors';

export const Video = ({
  src = '',
  embedUrl = '',
  alt = 'Video',
  width = '100%',
  height = 'auto',
  margin = ['0', '0', '0', '0'],
  padding = ['0', '0', '0', '0'],
  radius = 0,
  alignment = 'center',
  border = {
    style: 'none',
    width: 0,
    color: { r: 0, g: 0, b: 0, a: 1 }
  },
  objectFit = 'contain',
  shadow = {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: { r: 0, g: 0, b: 0, a: 0.15 }
  },
  backgroundColor = { r: 255, g: 255, b: 255, a: 0 },
  aspectRatio = '16/9',
  autoConvertColors = true,
  autoplay = false,
  loop = false,
  controls = true,
  muted = false,
  poster = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    connectors: { connect, drag },
    selected,
    hovered
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered
  }));

  // Get the appropriate border color for the current theme
  const borderColor = getThemeColor(border.color, isDark, 'container', autoConvertColors);

  const borderStyle = border.style !== 'none'
    ? `${border.width}px ${border.style} rgba(${Object.values(borderColor)})`
    : 'none';

  const shadowStyle = shadow.enabled
    ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
    : 'none';

  const bgColor = `rgba(${Object.values(backgroundColor)})`;

  const formattedAspectRatio = aspectRatio !== 'auto'
    ? aspectRatio.replace('/', ' / ')
    : 'auto';

  // Determine video source - prefer embedUrl for external videos, fallback to src
  const videoSource = embedUrl || src;
  const isYouTube = embedUrl && (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be'));
  const isExternalEmbed = !!embedUrl;

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';

    // Handle youtu.be links
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    // Handle youtube.com/watch links
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const videoId = urlParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    return url;
  };


	  // Infer MIME type from URL extension for <source> tag and compatibility hints
	  const getMimeFromUrl = (url) => {
	    if (!url) return '';
	    const clean = url.split('?')[0].split('#')[0];
	    const ext = clean.split('.').pop()?.toLowerCase();
	    switch (ext) {
	      case 'mp4': return 'video/mp4';
	      case 'webm': return 'video/webm';
	      case 'ogg':
	      case 'ogv': return 'video/ogg';
	      case 'mov': return 'video/quicktime';
	      case 'mkv': return 'video/x-matroska';
	      default: return '';
	    }
	  };
	  const inferredMime = getMimeFromUrl(src);
	  const [loadError, setLoadError] = React.useState(false);


	  // Match Image component behavior for object-fit/aspect-ratio
	  const needsConstraints = objectFit && objectFit !== 'none';
	  const hasExplicitDimensions = (width && width !== 'auto') || (height && height !== 'auto');
	  const hasAspectRatio = aspectRatio && aspectRatio !== 'auto';

  // Get video styles
  const getVideoStyles = () => {
    const baseStyles = {
      objectFit,
      aspectRatio: formattedAspectRatio,
      borderRadius: `${radius}px`,
      border: borderStyle,
      boxShadow: shadowStyle
    };

    if (needsConstraints && (hasExplicitDimensions || hasAspectRatio)) {
      if (isExternalEmbed) {
        // For external embeds, we ignore objectFit and let the player size within our wrapper
        return {
          ...baseStyles,
          width: '100%',
          height: '100%'
        };
      } else {
        // Native <video> behaves like <img>
        if (objectFit === 'contain') {
          return {
            ...baseStyles,
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto'
          };
        } else {
          return {
            ...baseStyles,
            width: '100%',
            height: '100%'
          };
        }
      }
    } else {
      // Default: responsive width, natural height
      return {
        ...baseStyles,
        width: '100%',
        height: 'auto'
      };
    }
  };

  // Render video content
  const renderVideoContent = () => {
    if (!videoSource) {
      // Show placeholder when no video source is set
      return (
        <div className="w-full h-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto mb-2" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No video selected</p>
            <p className="text-sm">Use settings panel to add a video</p>
          </div>
        </div>
      );
    }

    if (isExternalEmbed) {
      // Render YouTube or other external embeds - NO playback settings in editor mode
      const embedSrc = isYouTube ? getYouTubeEmbedUrl(embedUrl) : embedUrl;

      // In editor mode, disable autoplay for editing experience but test if URL would work
      const editorParams = new URLSearchParams();
      editorParams.set('autoplay', '0'); // Always disabled in editor
      editorParams.set('mute', '1'); // Always muted in editor
      if (isYouTube) {
        editorParams.set('controls', '0'); // Hide controls in editor for cleaner look
        editorParams.set('modestbranding', '1'); // Less YouTube branding
        editorParams.set('rel', '0'); // No related videos
      }

      const finalEmbedUrl = `${embedSrc}${embedSrc.includes('?') ? '&' : '?'}${editorParams.toString()}`;

      // Wrapper to emulate object-fit for iframes reliably
      const containerRatio = aspectRatio && aspectRatio !== 'auto' ? (() => { try { const [w,h] = String(aspectRatio).split('/'); const wn = parseFloat(w); const hn = parseFloat(h); return (wn && hn) ? (wn/hn) : null; } catch { return null; } })() : null;
      const targetRatio = 16/9; // assume YouTube player content ratio

      const wrapperStyle = {
        position: 'relative',
        width: '100%',
        ...(formattedAspectRatio !== 'auto' ? { aspectRatio: formattedAspectRatio } : { minHeight: '315px' }),
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: `${radius}px`,
        border: borderStyle,
        boxShadow: shadowStyle
      };

      let iframeStyle;
      if (objectFit === 'cover' || objectFit === 'fill') {
        // Oversize the iframe to crop and cover the container
        if (containerRatio) {
          const scaleByWidth = containerRatio <= targetRatio; // narrow container
          iframeStyle = scaleByWidth
            ? { width: '100%', height: `${Math.ceil((1 / (containerRatio / targetRatio)) * 100)}%` }
            : { width: `${Math.ceil((containerRatio / targetRatio) * 100)}%`, height: '100%' };
        } else {
          iframeStyle = { width: '100%', height: '100%' };
        }
        iframeStyle = {
          ...iframeStyle,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: 0,
          pointerEvents: 'none'
        };
      } else {
        // contain and default: let full iframe show (letterbox inside player)
        iframeStyle = { width: '100%', height: '100%', border: 0, pointerEvents: 'none' };
      }

      return (
        <div ref={drag} className="relative w-full" style={{ height: height === 'auto' ? 'auto' : height }}>
          <div style={wrapperStyle}>
            <iframe
              src={finalEmbedUrl}
              style={iframeStyle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={alt}
              className="craft-video-iframe"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            />
          </div>
          {(selected || hovered) && (
            <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', zIndex: 2 }} />
          )}
        </div>
      );
    } else {
      // Render local video element
      return (
        <div
          ref={drag}
          className="relative w-full h-full"
          style={{ cursor: 'pointer' }}
        >
          <video
            style={{
              ...getVideoStyles(),
              pointerEvents: 'none' // Disable interaction in editor mode
            }}
            controls={false} // Always disabled in editor mode for cleaner look
            autoPlay={false} // Always disabled in editor mode
            loop={loop}
            muted={true} // Always muted in editor mode
            poster={poster}
            preload="auto"
            playsInline
            className="craft-video"
            onError={() => setLoadError(true)}
          >
            {/* Use <source> with inferred type for better compatibility */}
            {src && <source src={src} type={inferredMime || undefined} />}
            <track kind="captions" />
            {/* Show a hint if load failed */}
            {loadError && <span style={{ display: 'none' }}>Failed to load video</span>}
            Your browser does not support the video tag.
          </video>
          {/* Selection indicator overlay */}
          {(selected || hovered) && (
            <div
              className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                zIndex: 2
              }}
            />
          )}
        </div>
      );
    }
  };

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      ref={connect}
      style={{
        margin: margin.map(m => `${parseInt(m)}px`).join(' '),
        padding: padding.map(p => `${parseInt(p)}px`).join(' '),
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignment === 'left' ? 'flex-start' :
                       alignment === 'right' ? 'flex-end' : 'center',
        width: width,
        height: height,
        position: 'relative',
        ...(needsConstraints && hasExplicitDimensions ? { overflow: 'hidden' } : {})
      }}
      className={`craft-video-container ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
    >
      {renderVideoContent()}
    </Resizer>
  );
};

Video.craft = {
  displayName: 'Video',
  props: {
    src: '',
    embedUrl: '',
    alt: 'Video',
    width: '100%',
    height: 'auto',
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0'],
    radius: 0,
    alignment: 'center',
    border: {
      style: 'none',
      width: 0,
      color: {
        light: { r: 0, g: 0, b: 0, a: 1 },
        dark: { r: 255, g: 255, b: 255, a: 1 }
      }
    },
    objectFit: 'contain',
    shadow: {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.15 }
    },
    backgroundColor: { r: 255, g: 255, b: 255, a: 0 },
    aspectRatio: '16/9',
    autoConvertColors: true,
    autoplay: false,
    loop: false,
    controls: true,
    muted: false,
    poster: ''
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: VideoSettings
  }
};