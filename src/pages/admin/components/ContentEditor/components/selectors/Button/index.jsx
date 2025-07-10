import { useNode } from '@craftjs/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    light: { r: 15, g: 118, b: 110, a: 1 }, // Default to primary color
    dark: { r: 20, g: 184, b: 166, a: 1 }
  },
  margin = ['5', '0', '5', '0'],
  padding = ['10', '16', '10', '16'],
  radius = 4,
  size = 'medium',
  fontSize = 16,
  fontWeight = '500',
  borderWidth = 2,
  hoverBackground = {
    light: { r: 12, g: 94, b: 87, a: 1 }, // Darker primary color for hover
    dark: { r: 17, g: 147, b: 133, a: 1 }
  },
  hoverColor = {
    light: { r: 255, g: 255, b: 255, a: 1 },
    dark: { r: 255, g: 255, b: 255, a: 1 }
  },
  linkType = 'none',
  linkUrl = '',
  linkStudyGuideId = '',
  linkStudyGuideTitle = '',
  linkStudyGuideSectionId = '',
  linkStudyGuideCategoryId = '',
  openInNewTab = true,
  autoConvertColors = true
}) => {
  const navigate = useNavigate();
  const {
    connectors: { connect },
    enabled
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // Check if we're in view mode (CraftRenderer) vs edit mode (ContentEditor)
  // In CraftRenderer, enabled is undefined or false, in ContentEditor it's true
  const isViewMode = enabled !== true;

  // Handle button click for study guide navigation
  const handleStudyGuideNavigation = () => {
    if (linkType === 'study-guide' && linkStudyGuideId) {
      // In view mode, we want to navigate within the same viewer (never open new tab)
      if (isViewMode) {
        // Dispatch a custom event that the StudyGuideViewer can listen to
        const navigationEvent = new CustomEvent('studyGuideNavigation', {
          detail: {
            studyGuideId: linkStudyGuideId,
            sectionId: linkStudyGuideSectionId,
            categoryId: linkStudyGuideCategoryId,
            title: linkStudyGuideTitle
          },
          bubbles: true
        });
        document.dispatchEvent(navigationEvent);
      } else {
        // In edit mode, use normal navigation
        const studyGuideUrl = linkStudyGuideSectionId && linkStudyGuideCategoryId
          ? `/study/${linkStudyGuideSectionId}/${linkStudyGuideCategoryId}/${linkStudyGuideId}`
          : `/study-guide/${linkStudyGuideId}`;

        if (openInNewTab) {
          window.open(studyGuideUrl, '_blank', 'noopener,noreferrer');
        } else {
          navigate(studyGuideUrl);
        }
      }
    } else if (linkType === 'url' && linkUrl) {
      // URL links work the same in both modes
      if (openInNewTab) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = linkUrl;
      }
    }
  };

  // Calculate size-based properties
  const sizeConfig = {
    small: {
      fontSize: Math.max(fontSize * 0.85, 12), // 15% smaller, minimum 12px
      padding: [
        Math.max(parseInt(padding[0]) * 0.7, 6).toString(), // top
        Math.max(parseInt(padding[1]) * 0.8, 12).toString(), // right
        Math.max(parseInt(padding[2]) * 0.7, 6).toString(), // bottom
        Math.max(parseInt(padding[3]) * 0.8, 12).toString(), // left
      ]
    },
    medium: {
      fontSize: fontSize, // use the set fontSize
      padding: padding // use the set padding
    },
    large: {
      fontSize: fontSize * 1.2, // 20% larger
      padding: [
        (parseInt(padding[0]) * 1.4).toString(), // top
        (parseInt(padding[1]) * 1.3).toString(), // right
        (parseInt(padding[2]) * 1.4).toString(), // bottom
        (parseInt(padding[3]) * 1.3).toString(), // left
      ]
    }
  };

  const currentSizeConfig = sizeConfig[size] || sizeConfig.medium;

  // Determine button styles based on buttonStyle prop
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const themeBackground = getThemeColor(background, isDark, 'button', autoConvertColors);
  const themeColor = getThemeColor(color, isDark, 'button', autoConvertColors);
  const themeHoverBackground = getThemeColor(hoverBackground, isDark, 'button', autoConvertColors);
  const themeHoverColor = getThemeColor(hoverColor, isDark, 'button', autoConvertColors);

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
        {
          'shadow-lg hover:shadow-xl': buttonStyle === 'filled',
        },
      ])}
      style={{
        cursor: isViewMode && (linkType === 'url' || linkType === 'study-guide') ? 'pointer' : 'default',
        background: buttonBackground,
        border: buttonBorder,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${currentSizeConfig.padding[0]}px ${currentSizeConfig.padding[1]}px ${currentSizeConfig.padding[2]}px ${currentSizeConfig.padding[3]}px`,
        borderRadius: `${radius}px`,
        fontSize: `${currentSizeConfig.fontSize}px`,
        fontWeight,
        color: `rgba(${Object.values(themeColor)})`,
        '--hover-bg': hoverStyles.background,
        '--hover-color': hoverStyles.color,
        '--hover-border': hoverStyles.borderColor,
      }}
      onClick={(e) => {
        // In edit mode, prevent link activation to allow button selection/editing
        if (!isViewMode) {
          // Always prevent default in edit mode to avoid link activation
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        // Only handle link navigation in view mode
        if (isViewMode && (linkType === 'url' || linkType === 'study-guide')) {
          e.preventDefault();
          handleStudyGuideNavigation();
        }
      }}
      onMouseDown={(e) => {
        // Handle clicks in view mode (when enabled=false)
        if (isViewMode && (linkType === 'url' || linkType === 'study-guide')) {
          e.preventDefault();
          e.stopPropagation();
          handleStudyGuideNavigation();
        }
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
      light: { r: 59, g: 130, b: 246, a: 1 }, // Blue #3b82f6
      dark: { r: 96, g: 165, b: 250, a: 1 } // Lighter blue for dark mode
    },
    color: {
      light: { r: 255, g: 255, b: 255, a: 1 },
      dark: { r: 255, g: 255, b: 255, a: 1 }
    },
    hoverBackground: {
      light: { r: 37, g: 99, b: 235, a: 1 }, // Darker blue for hover #2563eb
      dark: { r: 59, g: 130, b: 246, a: 1 } // Original blue for dark mode hover
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
    borderWidth: 2,
    linkType: 'none',
    linkUrl: '',
    linkStudyGuideId: '',
    linkStudyGuideTitle: '',
    linkStudyGuideSectionId: '',
    linkStudyGuideCategoryId: '',
    openInNewTab: true,
    autoConvertColors: true
  },
  related: {
    toolbar: ButtonSettings,
  },
};
