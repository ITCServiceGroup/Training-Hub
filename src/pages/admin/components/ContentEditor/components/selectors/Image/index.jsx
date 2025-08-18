import { useNode } from '@craftjs/core';
import { Resizer } from '../Resizer';
import React from 'react';
import { ImageSettings } from './ImageSettings';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor } from '../../../utils/themeColors';

export const Image = ({
  src = 'https://placehold.co/300x200',
  alt = 'Image',
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
  objectFit = 'none',
  shadow = {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: { r: 0, g: 0, b: 0, a: 0.15 }
  },
  backgroundColor = { r: 255, g: 255, b: 255, a: 0 },
  aspectRatio = 'auto',
  autoConvertColors = true
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

  // Determine if we need to constrain the image for object-fit to work
  const needsConstraints = objectFit && objectFit !== 'none';
  const hasExplicitDimensions = (width && width !== 'auto') || (height && height !== 'auto');
  const hasAspectRatio = aspectRatio && aspectRatio !== 'auto';

  // Calculate image styles based on object-fit requirements
  const getImageStyles = () => {
    const baseStyles = {
      objectFit,
      aspectRatio: formattedAspectRatio,
      borderRadius: `${radius}px`,
      border: borderStyle,
      boxShadow: shadowStyle
    };

    if (needsConstraints && (hasExplicitDimensions || hasAspectRatio)) {
      // For contain, we want the image to size naturally within the container
      // For cover and fill, we want the image to fill the container completely
      if (objectFit === 'contain') {
        return {
          ...baseStyles,
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto'
        };
      } else {
        // For cover, fill, etc. - image should fill the container
        return {
          ...baseStyles,
          width: '100%',
          height: '100%'
        };
      }
    } else {
      // Default behavior - let image size naturally but with container limits
      return {
        ...baseStyles,
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto'
      };
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
        // Ensure container has proper dimensions for object-fit
        ...(needsConstraints && hasExplicitDimensions ? { overflow: 'hidden' } : {})
      }}
      className={`craft-image-container ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
    >
      <img
        ref={drag}
        src={src}
        alt={alt}
        style={getImageStyles()}
        className="craft-image"
      />
    </Resizer>
  );
};

Image.craft = {
  displayName: 'Image',
  props: {
    src: 'https://placehold.co/300x200',
    alt: 'Image',
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
    objectFit: 'none',
    shadow: {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.15 }
    },
    backgroundColor: { r: 255, g: 255, b: 255, a: 0 },
    aspectRatio: 'auto',
    autoConvertColors: true
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: ImageSettings
  }
};
