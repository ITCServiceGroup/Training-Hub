import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { getThemeColor, convertToThemeColor } from '../../../utils/themeColors';
import { ICONS, ICON_NAME_MAP } from '@/components/icons';
import { IconSettings } from './IconSettings';

export const Icon = ({
  iconName = 'star',
  iconColor = {
    light: { r: 92, g: 90, b: 90, a: 1 },
    dark: { r: 229, g: 231, b: 235, a: 1 }
  },
  iconSize = 60, // Size in pixels
  iconAlign = 'center', // left, center, right
  margin = ['0', '0', '0', '0'],
  padding = ['0', '0', '0', '0'],
  autoConvertColors = true,
}) => {
  const {
    connectors: { connect },
    actions: { setProp },
    selected,
    isHovered
  } = useNode((node) => ({
    selected: node.events.selected,
    isHovered: node.events.hovered
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get the icon component
  const IconComponent = ICONS[iconName];

  // Get the current theme color
  const currentIconColor = getThemeColor(iconColor, isDark, 'icon', autoConvertColors);

  // Convert RGBA to CSS color string
  const iconColorString = `rgba(${currentIconColor.r}, ${currentIconColor.g}, ${currentIconColor.b}, ${currentIconColor.a})`;

  // Get justify class based on alignment
  const getJustifyClass = () => {
    switch (iconAlign) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      case 'center':
      default:
        return 'justify-center';
    }
  };

  return (
    <div
      ref={connect}
      className={`icon-component w-full flex items-center ${getJustifyClass()} ${
        enabled && (selected || isHovered) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      style={{
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        cursor: enabled ? 'pointer' : 'default',
      }}
      title={ICON_NAME_MAP[iconName] || "Icon"}
    >
      {IconComponent && (
        <IconComponent
          size={iconSize}
          color={iconColorString}
          style={{
            display: 'block',
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
};

Icon.craft = {
  displayName: 'Icon',
  props: {
    iconName: 'star',
    iconColor: {
      light: { r: 92, g: 90, b: 90, a: 1 },
      dark: { r: 229, g: 231, b: 235, a: 1 }
    },
    iconSize: 60,
    iconAlign: 'center',
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0'],
    autoConvertColors: true,
  },
  related: {
    toolbar: IconSettings,
  },
};
