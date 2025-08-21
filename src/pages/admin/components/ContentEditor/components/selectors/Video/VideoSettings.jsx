import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { FaVideo, FaChevronDown, FaPlay } from 'react-icons/fa';
import { MediaLibrarySelector } from '../Image/MediaLibrarySelector';
import ColorPicker from '../../../../../../../components/common/ColorPicker';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor, ensureThemeColors, initializeComponentThemeColors, createAutoConvertHandler } from '../../../utils/themeColors';

export const VideoSettings = () => {
  const { actions, id } = useNode((node) => ({
    id: node.id,
  }));
  const { actions: editorActions } = useEditor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Toggle sections
  const [showVideoSource, setShowVideoSource] = useState(true);
  const [showVideoDisplay, setShowVideoDisplay] = useState(true);
  const [showVideoPlayback, setShowVideoPlayback] = useState(true);
  const [showBorderEffects, setShowBorderEffects] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);

  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  // Initialize theme colors for existing components when first loaded
  useEffect(() => {
    initializeComponentThemeColors(editorActions, id, isDark, 'VIDEO');
  }, [editorActions, id, isDark]);

  const {
    src,
    embedUrl,
    alt,
    width,
    height,
    radius,
    alignment,
    border,
    objectFit,
    margin,
    padding,
    shadow,
    aspectRatio,
    autoConvertColors,
    autoplay,
    loop,
    controls,
    muted,
    poster,
  } = useNode((node) => {
    const props = node.data.props || {};
    return {
      src: props.src || '',
      embedUrl: props.embedUrl || '',
      alt: props.alt || 'Video',
      width: props.width || '100%',
      height: props.height || 'auto',
      radius: props.radius || 0,
      alignment: props.alignment || 'center',
      border: props.border || {
        style: 'none',
        width: 0,
        color: {
          light: { r: 0, g: 0, b: 0, a: 1 },
          dark: { r: 255, g: 255, b: 255, a: 1 }
        },
      },
      objectFit: props.objectFit || 'contain',
      margin: props.margin || ['0', '0', '0', '0'],
      padding: props.padding || ['0', '0', '0', '0'],
      shadow: props.shadow || {
        enabled: false,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: { r: 0, g: 0, b: 0, a: 0.15 },
      },
      aspectRatio: props.aspectRatio || '16/9',
      autoConvertColors: props.autoConvertColors !== undefined ? props.autoConvertColors : true,
      autoplay: props.autoplay || false,
      loop: props.loop || false,
      controls: props.controls !== undefined ? props.controls : true,
      muted: props.muted || false,
      poster: props.poster || '',
    };
  });

  const handleMediaSelect = (item) => {
    if (item.mime_type?.startsWith('video/')) {
      actions.setProp((props) => {
        props.src = item.public_url;
        props.embedUrl = ''; // Clear embed URL when selecting from library
        props.alt = item.alt_text || item.file_name;
      });
    }
  };


	  // For external embeds (YouTube/Vimeo/etc.), object-fit is not applicable
	  const isExternalEmbed = !!embedUrl;

  return (
    <div className="video-settings" style={{ '--input-height': '30px' }}>
      {/* Video Source Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showVideoSource ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowVideoSource(!showVideoSource)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Video Source
          </label>
          <FaChevronDown
            className={`transition-transform ${showVideoSource ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showVideoSource && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube or External URL
              </label>
              <input
                type="text"
                value={embedUrl}
                onChange={(e) => actions.setProp((props) => {
                  props.embedUrl = e.target.value;
                  if (e.target.value) props.src = ''; // Clear local src when setting embed URL
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                style={{ height: 'var(--input-height, 30px)' }}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports YouTube, Vimeo, and other embed URLs
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>OR</span>
              <div className="flex-1 border-t border-gray-200 dark:border-slate-600"></div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Media Library Video
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={src}
                  onChange={(e) => actions.setProp((props) => {
                    props.src = e.target.value;
                    if (e.target.value) props.embedUrl = ''; // Clear embed URL when setting local src
                  })}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                  style={{ height: 'var(--input-height, 30px)' }}
                  placeholder="Direct video file URL"
                />
                <button
                  onClick={() => setIsMediaLibraryOpen(true)}
                  className="px-3 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-1 h-[30px]"
                  style={{ height: 'var(--input-height, 30px)' }}
                >
                  <FaVideo size={14} />
                  <span className="text-sm">Browse</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                Alt Text / Description
                <span className="text-gray-400 text-[10px]">(for accessibility)</span>
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => actions.setProp((props) => { props.alt = e.target.value; })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                placeholder="Describe the video content for screen readers"
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Playback Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showVideoPlayback ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowVideoPlayback(!showVideoPlayback)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Video Playback
          </label>
          <FaChevronDown
            className={`transition-transform ${showVideoPlayback ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showVideoPlayback && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={autoplay}
                  onChange={(e) => actions.setProp((props) => { props.autoplay = e.target.checked; })}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="autoplay" className="text-xs text-gray-700 dark:text-gray-300">
                  Autoplay
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="loop"
                  checked={loop}
                  onChange={(e) => actions.setProp((props) => { props.loop = e.target.checked; })}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="loop" className="text-xs text-gray-700 dark:text-gray-300">
                  Loop
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="controls"
                  checked={controls}
                  onChange={(e) => actions.setProp((props) => { props.controls = e.target.checked; })}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="controls" className="text-xs text-gray-700 dark:text-gray-300">
                  Show Controls
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="muted"
                  checked={muted}
                  onChange={(e) => actions.setProp((props) => { props.muted = e.target.checked; })}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="muted" className="text-xs text-gray-700 dark:text-gray-300">
                  Muted
                </label>
              </div>
            </div>


            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poster Image URL (Thumbnail)
              </label>
              <input
                type="text"
                value={poster}
                onChange={(e) => actions.setProp((props) => { props.poster = e.target.value; })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Image shown before video plays
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Display Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showVideoDisplay ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowVideoDisplay(!showVideoDisplay)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Video Display
          </label>
          <FaChevronDown
            className={`transition-transform ${showVideoDisplay ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showVideoDisplay && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Object Fit
              </label>
              {isExternalEmbed ? (
                <div className="text-[11px] p-2 rounded bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                  For embedded videos (e.g., YouTube), object fit is not supported. The player controls its own layout.
                </div>
              ) : (
                <div className="flex gap-1">
                  {['cover', 'contain', 'fill', 'none'].map((fit) => (
                    <button
                      key={fit}
                      className={`flex-1 px-1 py-0.5 text-xs rounded capitalize ${
                        objectFit === fit
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                      } ${isExternalEmbed ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => actions.setProp((props) => { if (!isExternalEmbed) props.objectFit = fit; })}
                      disabled={isExternalEmbed}
                      style={{ fontSize: '10px' }}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aspect Ratio
              </label>
              <div className="flex space-x-1">
                {['auto', '16/9', '4/3', '1/1', '21/9'].map((ratio) => (
                  <button
                    key={ratio}
                    className={`px-2 py-1 text-xs rounded ${
                      aspectRatio === ratio
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => actions.setProp((props) => { props.aspectRatio = ratio; })}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dimensions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width</label>
                  <input
                    type="text"
                    value={width}
                    onChange={(e) => actions.setProp((props) => { props.width = e.target.value; })}
                    onBlur={(e) => {
                      let value = e.target.value;
                      if (value && !isNaN(value) && !value.includes('px') && !value.includes('%') && value !== 'auto') {
                        value = value + 'px';
                        actions.setProp((props) => { props.width = value; });
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    placeholder="100%, 300px"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => actions.setProp((props) => { props.height = e.target.value; })}
                    onBlur={(e) => {
                      let value = e.target.value;
                      if (value && !isNaN(value) && !value.includes('px') && !value.includes('%') && value !== 'auto') {
                        value = value + 'px';
                        actions.setProp((props) => { props.height = value; });
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                    placeholder="auto, 200px"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignment
              </label>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    alignment === 'left'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.alignment = 'left'; })}
                >
                  Left
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    alignment === 'center'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.alignment = 'center'; })}
                >
                  Center
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${
                    alignment === 'right'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                  }`}
                  onClick={() => actions.setProp((props) => { props.alignment = 'right'; })}
                >
                  Right
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacing Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showSpacing ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowSpacing(!showSpacing)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Video Spacing
          </label>
          <FaChevronDown
            className={`transition-transform ${showSpacing ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showSpacing && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Video Margin */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Video Margin
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Bottom', 'Left', 'Right'].map((label, index) => {
                  const marginIndex = index === 1 ? 2 : index === 2 ? 3 : index === 3 ? 1 : 0;
                  return (
                    <div key={label}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{label}</label>
                      <input
                        type="number"
                        value={margin[marginIndex] === '' || margin[marginIndex] === '0' ? '' : parseInt(margin[marginIndex])}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const newMargin = [...margin];
                          newMargin[marginIndex] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                          actions.setProp((props) => { props.margin = newMargin; });
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0' || e.target.value === 0) {
                            e.target.value = '';
                          }
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Padding */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Video Padding
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['Top', 'Bottom', 'Left', 'Right'].map((label, index) => {
                  const paddingIndex = index === 1 ? 2 : index === 2 ? 3 : index === 3 ? 1 : 0;
                  return (
                    <div key={label}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{label}</label>
                      <input
                        type="number"
                        value={padding[paddingIndex] === '' || padding[paddingIndex] === '0' ? '' : parseInt(padding[paddingIndex])}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const newPadding = [...padding];
                          newPadding[paddingIndex] = e.target.value === '' ? '0' : String(parseInt(e.target.value) || 0);
                          actions.setProp((props) => { props.padding = newPadding; });
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0' || e.target.value === 0) {
                            e.target.value = '';
                          }
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Border & Effects Section */}
      <div className="mb-4 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center cursor-pointer px-2 py-3 ${showBorderEffects ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'}`}
          onClick={() => setShowBorderEffects(!showBorderEffects)}
        >
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
            Border & Effects
          </label>
          <FaChevronDown
            className={`transition-transform ${showBorderEffects ? 'rotate-180' : ''}`}
            size={12}
          />
        </div>

        {showBorderEffects && (
          <div className="space-y-3 px-1 py-3 bg-white dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
            {/* Auto Convert Colors Toggle */}
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConvertColorsVideo"
                  checked={autoConvertColors}
                  onChange={(e) => createAutoConvertHandler(actions, isDark, 'VIDEO')(e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="autoConvertColorsVideo" className="text-xs text-gray-700 dark:text-gray-300">
                  Auto convert colors between light and dark mode
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Border Style
              </label>
              <div className="flex space-x-1">
                {['none', 'solid', 'dashed', 'dotted'].map((style) => (
                  <button
                    key={style}
                    className={`px-2 py-1 text-xs rounded capitalize ${
                      border.style === style
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                    }`}
                    onClick={() => actions.setProp((props) => {
                      props.border = { ...props.border, style };
                    })}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {border.style !== 'none' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Border Width
                  </label>
                  <div className="flex items-center">
                    <div className="w-3/4 flex items-center">
                      <input
                        type="range"
                        value={border.width}
                        min={0}
                        max={10}
                        onChange={(e) => actions.setProp((props) => {
                          props.border.width = parseInt(e.target.value);
                        })}
                        className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                      />
                    </div>
                    <div className="w-1/4 flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={border.width}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 0 && value <= 10) {
                            actions.setProp((props) => {
                              props.border.width = value;
                            });
                          }
                        }}
                        className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                        aria-label="Border width in pixels"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Border Color {isDark ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="flex items-center">
                    <ColorPicker
                      color={getThemeColor(border.color, isDark, 'container', autoConvertColors)}
                      onChange={(newColor) => {
                        actions.setProp((props) => {
                          if (!props.border.color) {
                            props.border.color = {
                              light: { r: 0, g: 0, b: 0, a: 1 },
                              dark: { r: 255, g: 255, b: 255, a: 1 }
                            };
                          }

                          if ('r' in props.border.color) {
                            const oldColor = { ...props.border.color };
                            props.border.color = {
                              light: oldColor,
                              dark: convertToThemeColor(oldColor, true, 'container')
                            };
                          }

                          if (!props.border.color.light) {
                            props.border.color.light = { r: 0, g: 0, b: 0, a: 1 };
                          }
                          if (!props.border.color.dark) {
                            props.border.color.dark = { r: 255, g: 255, b: 255, a: 1 };
                          }

                          const currentTheme = isDark ? 'dark' : 'light';
                          const oppositeTheme = isDark ? 'light' : 'dark';

                          if (props.autoConvertColors) {
                            const oppositeColor = convertToThemeColor(newColor, !isDark, 'container');
                            props.border.color = {
                              ...props.border.color,
                              [currentTheme]: newColor,
                              [oppositeTheme]: oppositeColor
                            };
                          } else {
                            props.border.color = {
                              ...props.border.color,
                              [currentTheme]: newColor
                            };
                          }
                        });
                      }}
                      componentType="container"
                    />
                  </div>

                  {!autoConvertColors && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Border Color {!isDark ? '(Dark Mode)' : '(Light Mode)'}
                      </label>
                      <div className="flex items-center">
                        <ColorPicker
                          color={(() => {
                            try {
                              const oppositeTheme = isDark ? 'light' : 'dark';
                              return border.color[oppositeTheme] || { r: 0, g: 0, b: 0, a: 1 };
                            } catch (e) {
                              return { r: 0, g: 0, b: 0, a: 1 };
                            }
                          })()}
                          onChange={(newColor) => {
                            actions.setProp((props) => {
                              const oppositeTheme = isDark ? 'light' : 'dark';

                              if (!props.border.color) {
                                props.border.color = {
                                  light: { r: 0, g: 0, b: 0, a: 1 },
                                  dark: { r: 255, g: 255, b: 255, a: 1 }
                                };
                              }

                              props.border.color = {
                                ...props.border.color,
                                [oppositeTheme]: newColor
                              };
                            });
                          }}
                          componentType="container"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Border Radius
              </label>
              <div className="flex items-center">
                <div className="w-3/4 flex items-center">
                  <input
                    type="range"
                    value={radius}
                    min={0}
                    max={50}
                    onChange={(e) => actions.setProp((props) => { props.radius = parseInt(e.target.value); })}
                    className="w-full mr-2 accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                  />
                </div>
                <div className="w-1/4 flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={radius}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 0 && value <= 50) {
                        actions.setProp((props) => { props.radius = value; });
                      }
                    }}
                    className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    aria-label="Border radius in pixels"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  id="enableShadow"
                  checked={shadow.enabled}
                  onChange={(e) => actions.setProp((props) => {
                    props.shadow.enabled = e.target.checked;
                  })}
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                />
                <label
                  htmlFor="enableShadow"
                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer leading-none pt-1"
                >
                  Enable Shadow
                </label>
              </div>
              {shadow.enabled && (
                <div className="space-y-2 pl-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X Offset</label>
                      <input
                        type="number"
                        value={shadow.x}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow.x = parseInt(e.target.value);
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y Offset</label>
                      <input
                        type="number"
                        value={shadow.y}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow.y = parseInt(e.target.value);
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Blur</label>
                      <input
                        type="number"
                        value={shadow.blur}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow.blur = parseInt(e.target.value);
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Spread</label>
                      <input
                        type="number"
                        value={shadow.spread}
                        onChange={(e) => actions.setProp((props) => {
                          props.shadow.spread = parseInt(e.target.value);
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Shadow Color</label>
                    <div className="flex items-center">
                      <ColorPicker
                        color={shadow.color}
                        onChange={(newColor) => actions.setProp((props) => {
                          props.shadow.color = newColor;
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      <MediaLibrarySelector
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
        currentImageSrc={src}
      />
    </div>
  );
};