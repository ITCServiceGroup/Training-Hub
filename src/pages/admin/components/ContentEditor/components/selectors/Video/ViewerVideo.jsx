import React, { useState } from 'react';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor } from '../../../utils/themeColors';

export const ViewerVideo = ({
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldShowIframe, setShouldShowIframe] = useState(false);
  const iframeRef = React.useRef(null);

  // Delay iframe creation slightly to ensure page context is ready
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShowIframe(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);


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

  // Get video styles
  const getVideoStyles = () => {
    const baseStyles = {
      borderRadius: `${radius}px`,
      border: borderStyle,
      boxShadow: shadowStyle,
      objectFit,
      aspectRatio: formattedAspectRatio,
      width: '100%',
      height: '100%'
    };

    return baseStyles;
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
          </div>
        </div>
      );
    }

    if (isExternalEmbed) {
      // Render YouTube or other external embeds
      const embedSrc = isYouTube ? getYouTubeEmbedUrl(embedUrl) : embedUrl;
      
      // Use IDENTICAL logic to editor - build parameters exactly the same way
      const viewerParams = new URLSearchParams();
      viewerParams.set('autoplay', autoplay ? '1' : '0'); // Identical to editor
      viewerParams.set('mute', muted ? '1' : '0'); // Identical to editor
      if (loop && isYouTube) viewerParams.set('loop', '1');
      if (!controls && isYouTube) viewerParams.set('controls', '0');
      if (isYouTube) {
        viewerParams.set('modestbranding', '1'); // Same as editor
        viewerParams.set('rel', '0'); // Same as editor
      }
      
      const finalEmbedUrl = `${embedSrc}${embedSrc.includes('?') ? '&' : '?'}${viewerParams.toString()}`;
      
      console.log('ViewerVideo: Autoplay setting:', autoplay);
      console.log('ViewerVideo: Base URL:', embedSrc);
      console.log('ViewerVideo: Final embed URL:', finalEmbedUrl);

      // Show loading placeholder until iframe is ready
      if (!shouldShowIframe) {
        return (
          <div className="w-full h-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Loading video...</div>
          </div>
        );
      }

      return (
        <iframe
          ref={iframeRef}
          src={finalEmbedUrl}
          style={getVideoStyles()}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={alt}
          className="viewer-video-iframe"
        />
      );
    } else {
      // Render local video element
      return (
        <video
          src={src}
          style={getVideoStyles()}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          poster={poster}
          className="viewer-video"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  return (
    <div
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
        overflow: 'hidden'
      }}
      className="viewer-video-container"
    >
      {renderVideoContent()}
    </div>
  );
};

ViewerVideo.craft = {
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
    canDrag: () => false,
    canDrop: () => false,
    canMoveIn: () => false,
    canMoveOut: () => false
  }
};