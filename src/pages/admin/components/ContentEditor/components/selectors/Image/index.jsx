import { useNode } from '@craftjs/core';
import { Resizer } from '../Resizer';
import React from 'react';
import { ImageSettings } from './ImageSettings';

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
  objectFit = 'cover',
  shadow = {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: { r: 0, g: 0, b: 0, a: 0.15 }
  },
  backgroundColor = { r: 255, g: 255, b: 255, a: 0 },
  aspectRatio = 'auto'
}) => {
  const {
    connectors: { connect, drag },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // Calculate border style
  const borderStyle = border.style !== 'none'
    ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})`
    : 'none';

  // Calculate shadow style
  const shadowStyle = shadow.enabled
    ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
    : 'none';

  // Calculate background color
  const bgColor = `rgba(${Object.values(backgroundColor)})`;

  // Format aspect ratio correctly
  const formattedAspectRatio = aspectRatio !== 'auto' 
    ? aspectRatio.replace('/', ' / ') // Proper CSS format needs a space around the slash
    : 'auto';

  // Calculate alignment styles for the image
  let alignmentStyles = {};
  if (alignment === 'left') {
    alignmentStyles = { marginRight: 'auto' };
  } else if (alignment === 'center') {
    alignmentStyles = { marginLeft: 'auto', marginRight: 'auto' };
  } else if (alignment === 'right') {
    alignmentStyles = { marginLeft: 'auto' };
  }

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        display: 'block',
        backgroundColor: bgColor,
        overflow: 'hidden'
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          display: 'block',
          maxWidth: '100%',
          height,
          objectFit,
          aspectRatio: formattedAspectRatio,
          borderRadius: `${radius}px`,
          border: borderStyle,
          boxShadow: shadowStyle,
          ...alignmentStyles
        }}
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
      color: { r: 0, g: 0, b: 0, a: 1 }
    },
    objectFit: 'cover',
    shadow: {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.15 }
    },
    backgroundColor: { r: 255, g: 255, b: 255, a: 0 },
    aspectRatio: 'auto'
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
    canMoveOut: () => true
  },
  related: {
    toolbar: ImageSettings
  }
};
