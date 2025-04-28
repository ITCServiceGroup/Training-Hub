import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import ContentEditable from 'react-contenteditable';

import { TextSettings } from './TextSettings';

export const Text = ({
  fontSize = '15',
  textAlign = 'left',
  fontWeight = '500',
  color = { r: 92, g: 90, b: 90, a: 1 },
  shadow = 0,
  text = 'Text',
  margin = ['0', '0', '0', '0'],
  padding = ['0', '0', '0', '0'],
}) => {
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();
  
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  
  return (
    <ContentEditable
      innerRef={connect}
      html={text} // innerHTML of the editable div
      disabled={!enabled}
      onChange={(e) => {
        setProp((prop) => (prop.text = e.target.value), 500);
      }}
      tagName="h2" // Use a custom HTML tag (uses a div by default)
      style={{
        width: '100%',
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        color: `rgba(${Object.values(color)})`,
        textShadow: `0px 0px 2px rgba(0,0,0,${shadow / 100})`,
        fontSize: `${fontSize}px`,
        fontWeight,
        textAlign,
      }}
    />
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    fontSize: '15',
    textAlign: 'left',
    fontWeight: '500',
    color: { r: 92, g: 90, b: 90, a: 1 },
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0'],
    shadow: 0,
    text: 'Text',
  },
  related: {
    toolbar: TextSettings,
  },
};
