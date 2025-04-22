import { useNode } from '@craftjs/core';
import React from 'react';
import classNames from 'classnames';

import { ButtonSettings } from './ButtonSettings';
import { Text } from '../Text';

export const Button = ({
  text = 'Button',
  textComponent = {},
  color = { r: 92, g: 90, b: 90, a: 1 },
  buttonStyle = 'full',
  background = { r: 255, g: 255, b: 255, a: 0.5 },
  margin = ['5', '0', '5', '0'],
}) => {
  const {
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // Determine button styles based on buttonStyle prop
  const buttonBackground = buttonStyle === 'full' 
    ? `rgba(${Object.values(background)})` 
    : 'transparent';
  
  const buttonBorder = buttonStyle === 'outline'
    ? `2px solid rgba(${Object.values(background)})`
    : '2px solid transparent';

  return (
    <button
      ref={(dom) => {
        connect(dom);
      }}
      className={classNames([
        'rounded w-full px-4 py-2',
        {
          'shadow-lg': buttonStyle === 'full',
        },
      ])}
      style={{
        background: buttonBackground,
        border: buttonBorder,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
      }}
    >
      <Text 
        {...Text.craft.props} 
        {...textComponent} 
        text={text} 
        color={color}
        textAlign="center"
      />
    </button>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    background: { r: 255, g: 255, b: 255, a: 0.5 },
    color: { r: 92, g: 90, b: 90, a: 1 },
    buttonStyle: 'full',
    text: 'Button',
    margin: ['5', '0', '5', '0'],
    textComponent: {
      ...Text.craft.props,
      textAlign: 'center',
    },
  },
  related: {
    toolbar: ButtonSettings,
  },
};
