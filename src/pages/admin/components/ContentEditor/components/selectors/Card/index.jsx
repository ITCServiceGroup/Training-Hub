import { useNode } from '@craftjs/core';
import React from 'react';
import { CardSettings } from './CardSettings';
import { Resizer } from '../Resizer';

// Default props for the Card component
const defaultProps = {
  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  padding: ['16', '16', '16', '16'],
  margin: ['0', '0', '0', '0'],
  shadow: 1,
  radius: 8,
  border: {
    style: 'solid',
    width: 1,
    color: { r: 229, g: 231, b: 235, a: 1 } // gray-200
  },
  width: '100%',
  height: 'auto'
};

// Card component using Resizer
export const Card = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

  const {
    background,
    color,
    padding,
    margin,
    shadow,
    radius,
    border,
    children,
  } = props;

  // Calculate border style
  const borderStyle = border.style !== 'none'
    ? `${border.width}px ${border.style} rgba(${Object.values(border.color)})`
    : 'none';

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        background: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow: shadow === 0
          ? 'none'
          : `0 ${shadow}px ${shadow * 4}px rgba(0, 0, 0, ${0.1 + (shadow * 0.02)})`,
        borderRadius: `${radius}px`,
        border: borderStyle,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '50px',
        position: 'relative'
      }}
      className="craft-card"
    >
      {children}
    </Resizer>
  );
};

Card.craft = {
  displayName: 'Card',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: CardSettings
  },
  custom: {
    isCanvas: true
  }
};
