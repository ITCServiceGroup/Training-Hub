import { useNode } from '@craftjs/core';
import React from 'react';
import classNames from 'classnames';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor } from '../../../utils/themeColors';

import { ButtonSettings } from './ButtonSettings';
import { Text } from '../Text';

export const Button = ({
  text = 'Button',
  textComponent = {},
  color = {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 255, g: 255, b: 255, a: 1 }
  },
  buttonStyle = 'filled',
  background = {
    light: { r: 13, g: 148, b: 136, a: 1 },
    dark: { r: 56, g: 189, b: 248, a: 1 }
  },
  margin = ['5', '0', '5', '0'],
  padding = ['10', '16', '10', '16'],
  radius = 4,
  size = 'medium',
  fontSize = 16,
  fontWeight = '500',
  borderWidth = 2,
  hoverBackground = {
    light: { r: 11, g: 133, b: 122, a: 1 },
    dark: { r: 45, g: 178, b: 237, a: 1 }
  },
  hoverColor = {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 255, g: 255, b: 255, a: 1 }
  },
}) => {
  const {
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // Calculate size classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[size];

  // Determine button styles based on buttonStyle prop
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const themeBackground = getThemeColor(background, isDark, 'button');
  const themeColor = getThemeColor(color, isDark, 'button');
  const themeHoverBackground = getThemeColor(hoverBackground, isDark, 'button');
  const themeHoverColor = getThemeColor(hoverColor, isDark, 'button');

  const buttonBackground = buttonStyle === 'filled' 
    ? `rgba(${Object.values(themeBackground)})`
    : 'transparent';

  const buttonBorder = buttonStyle === 'outline'
    ? `${borderWidth}px solid rgba(${Object.values(themeBackground)})`
    : 'none';

  // Hover styles
  const hoverStyles = {
    background: `rgba(${Object.values(themeHoverBackground)})`,
    color: `rgba(${Object.values(themeHoverColor)})`,
    borderColor: buttonStyle === 'outline' ? `rgba(${Object.values(themeHoverBackground)})` : 'transparent',
  };

  return (
    <button
      ref={(dom) => {
        connect(dom);
      }}
      className={classNames([
        'w-full transition-all duration-200',
        sizeClasses,
        {
          'shadow-lg hover:shadow-xl': buttonStyle === 'filled',
        },
      ])}
      style={{
        background: buttonBackground,
        border: buttonBorder,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        borderRadius: `${radius}px`,
        fontSize: `${fontSize}px`,
        fontWeight,
        color: `rgba(${Object.values(themeColor)})`,
        '--hover-bg': hoverStyles.background,
        '--hover-color': hoverStyles.color,
        '--hover-border': hoverStyles.borderColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverStyles.background;
        e.currentTarget.style.color = hoverStyles.color;
        e.currentTarget.style.borderColor = hoverStyles.borderColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = buttonBackground;
        e.currentTarget.style.color = `rgba(${Object.values(themeColor)})`;
        e.currentTarget.style.borderColor = buttonStyle === 'outline' ? `rgba(${Object.values(background)})` : 'transparent';
      }}
    >
      {text}
    </button>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    background: {
      light: { r: 13, g: 148, b: 136, a: 1 },
      dark: { r: 56, g: 189, b: 248, a: 1 }
    },
    color: {
      light: { r: 255, g: 255, b: 255, a: 1 },
      dark: { r: 255, g: 255, b: 255, a: 1 }
    },
    hoverBackground: {
      light: { r: 11, g: 133, b: 122, a: 1 },
      dark: { r: 45, g: 178, b: 237, a: 1 }
    },
    hoverColor: {
      light: { r: 255, g: 255, b: 255, a: 1 },
      dark: { r: 255, g: 255, b: 255, a: 1 }
    },
    buttonStyle: 'filled',
    text: 'Button',
    margin: ['5', '0', '5', '0'],
    padding: ['10', '16', '10', '16'],
    radius: 4,
    size: 'medium',
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 2
  },
  related: {
    toolbar: ButtonSettings,
  },
};
