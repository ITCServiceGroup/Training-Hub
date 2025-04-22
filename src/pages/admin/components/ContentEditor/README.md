# Craft.js Editor

This is a simplified implementation of the Craft.js editor based on the landing example from the Craft.js monorepo.

## Features

- Drag and drop interface for building layouts
- Text and Container components
- Customizable properties for each component
- Toolbar for adding new components
- Settings panel for editing component properties
- Undo/Redo functionality

## Usage

```jsx
import React from 'react';
import CraftEditor from './CraftEditor';

const MyPage = () => {
  return (
    <div className="w-full h-screen">
      <CraftEditor />
    </div>
  );
};

export default MyPage;
```

## Components

### Text

The Text component allows you to add and edit text content. You can customize:

- Font size
- Text alignment
- Font weight
- Text content

### Container

The Container component is used to create layout structures. You can customize:

- Background color
- Padding
- Flex direction
- Border radius

## Extending

To add new components, create a new component in the `components/selectors` directory and add it to the resolver in the main `index.jsx` file.

## Dependencies

- @craftjs/core
- react-contenteditable
- react-icons

## Credits

This implementation is based on the Craft.js landing example: https://github.com/prevwong/craft.js/tree/master/examples/landing
