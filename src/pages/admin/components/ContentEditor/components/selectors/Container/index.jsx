import React from 'react';
import { useEditor } from '@craftjs/core';
import { ContainerSettings } from './ContainerSettings';
import { Resizer } from '../Resizer';

// Default props for the Container component
const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100%',
  height: 'auto'
};

// Container component directly using Resizer
export const Container = (props) => {
  // Merge default props with provided props
  props = {
    ...defaultProps,
    ...props,
  };

  // Get query via useEditor for the localStorage logic
  const { query } = useEditor((_, query) => {
    return {
      query: query
    }
  });

  // Get the node ID from the current node in the editor state
  // This is used for localStorage persistence
  const id = props.id || 'default';

  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    background,
    color,
    padding,
    margin,
    shadow,
    radius,
    children,
  } = props;

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        justifyContent,
        flexDirection,
        alignItems,
        background: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow: shadow === 0 ? 'none' : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === 'yes' ? 1 : 'unset',
        boxSizing: 'border-box',
        display: 'flex',
        minHeight: '50px',
        position: 'relative'
      }}
      onResize={(width, height) => {
        try {
          // Get the parent study guide ID
          const studyGuideId = query.getState().options.studyGuideId || 'default';
          const storageKey = `container_${studyGuideId}_${id}`;

          // Store the dimensions in localStorage
          localStorage.setItem(storageKey, JSON.stringify({ width, height }));

          // Only log in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log(`Saved dimensions for container ${id}:`, { width, height });
          }
        } catch (error) {
          console.error('Error saving container dimensions:', error);
        }
      }}
    >
      {children}
    </Resizer>
  );
};

Container.craft = {
  displayName: 'Container',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {
    toolbar: ContainerSettings
  },
  custom: {
    isCanvas: true
  }
};

Container.displayName = 'Container';
