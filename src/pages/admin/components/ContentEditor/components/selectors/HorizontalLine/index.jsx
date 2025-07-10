import React from 'react';
import { useNode } from '@craftjs/core';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor } from '../../../utils/themeColors';
import { HorizontalLineSettings } from './HorizontalLineSettings';

export const HorizontalLine = ({
  width = 'auto',
  thickness = 2,
  color = {
    light: { r: 156, g: 163, b: 175, a: 1 }, // gray-400
    dark: { r: 107, g: 114, b: 128, a: 1 }   // gray-500
  },
  margin = ['10', '0', '10', '0'],
  alignment = 'center',
  autoConvertColors = true
}) => {
  const {
    connectors: { connect, drag }
  } = useNode();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get theme-appropriate color
  const themeColor = getThemeColor(color, isDark, 'line', autoConvertColors);

  // Calculate alignment styles
  const getAlignmentStyles = () => {
    switch (alignment) {
      case 'left':
        return { justifyContent: 'flex-start' };
      case 'right':
        return { justifyContent: 'flex-end' };
      case 'center':
      default:
        return { justifyContent: 'center' };
    }
  };

  return (
    <div
      ref={(dom) => {
        connect(drag(dom));
      }}
      className="horizontal-line-container"
      style={{
        display: 'flex',
        width: '100%',
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        ...getAlignmentStyles()
      }}
    >
      <div
        className="horizontal-line"
        style={{
          width: width === 'auto' ? '100%' : `${width}px`,
          height: `${thickness}px`,
          backgroundColor: `rgba(${Object.values(themeColor)})`,
          borderRadius: thickness > 4 ? `${thickness / 2}px` : '0px'
        }}
      />
    </div>
  );
};

HorizontalLine.craft = {
  displayName: 'Horizontal Line',
  props: {
    width: 'auto',
    thickness: 2,
    color: {
      light: { r: 156, g: 163, b: 175, a: 1 }, // gray-400
      dark: { r: 107, g: 114, b: 128, a: 1 }   // gray-500
    },
    margin: ['10', '0', '10', '0'],
    alignment: 'center',
    autoConvertColors: true
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
    canMoveOut: () => true
  },
  related: {
    toolbar: HorizontalLineSettings
  }
};
