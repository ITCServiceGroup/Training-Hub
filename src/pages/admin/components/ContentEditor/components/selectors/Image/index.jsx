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
    selected,
    hovered
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered
  }));

  const borderStyle = border.style !== 'none'
    ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})`
    : 'none';

  const shadowStyle = shadow.enabled
    ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${Object.values(shadow.color)})`
    : 'none';

  const bgColor = `rgba(${Object.values(backgroundColor)})`;

  const formattedAspectRatio = aspectRatio !== 'auto' 
    ? aspectRatio.replace('/', ' / ')
    : 'auto';

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
        position: 'relative'
      }}
      className={`craft-image-container ${selected ? 'component-selected' : ''} ${hovered ? 'component-hovered' : ''}`}
    >
      <img
        ref={drag}
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit,
          aspectRatio: formattedAspectRatio,
          borderRadius: `${radius}px`,
          border: borderStyle,
          boxShadow: shadowStyle
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
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: ImageSettings
  }
};
