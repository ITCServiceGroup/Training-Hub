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
  }
}) => {
  const {
    connectors: { connect, drag },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // Calculate alignment styles
  let alignmentStyle = {};
  if (alignment === 'left') {
    alignmentStyle = { marginRight: 'auto' };
  } else if (alignment === 'center') {
    alignmentStyle = { marginLeft: 'auto', marginRight: 'auto' };
  } else if (alignment === 'right') {
    alignmentStyle = { marginLeft: 'auto' };
  }

  // Calculate border style
  const borderStyle = border.style !== 'none'
    ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})`
    : 'none';

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        display: 'flex',
        justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          height,
          borderRadius: `${radius}px`,
          border: borderStyle,
          ...alignmentStyle
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
    }
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
