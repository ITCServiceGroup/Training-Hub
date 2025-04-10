(function () {
  'use strict';

  const pluginName = 'imagestyle';

  // Apply border color to image
  const applyBorderColor = function(editor, value) {
    const img = editor.selection.getNode();
    if (img.nodeName !== 'IMG') return;

    // First, ensure we have a border to color
    if (!editor.dom.hasClass(img, 'border-thin') &&
        !editor.dom.hasClass(img, 'border-medium') &&
        !editor.dom.hasClass(img, 'border-thick')) {
        editor.dom.addClass(img, 'border-thin');
    }

    // If no border style is set, add a default solid style
    if (!editor.dom.hasClass(img, 'border-style-solid') &&
        !editor.dom.hasClass(img, 'border-style-dashed') &&
        !editor.dom.hasClass(img, 'border-style-dotted')) {
        editor.dom.addClass(img, 'border-style-solid');
    }

    if (value === 'remove' || value === '') {
      // Remove custom border color inline style
      editor.dom.setStyle(img, 'border-color', null);
      // Remove all border color classes
      editor.dom.removeClass(img, 'border-color-gray border-color-black border-color-blue border-color-red border-color-green border-color-custom');

      // Remove the border color from the style property directly
      img.style.removeProperty('border-color');

      // Also update the data-mce-style attribute which TinyMCE uses internally
      const currentStyle = img.getAttribute('data-mce-style') || '';
      const styleWithoutBorderColor = currentStyle.replace(/border-color:[^;]+;?/g, '');
      img.setAttribute('data-mce-style', styleWithoutBorderColor);
    } else {
      // Remove any existing border color classes
      editor.dom.removeClass(img, 'border-color-gray border-color-black border-color-blue border-color-red border-color-green');

      // Add a custom class to indicate this image has a custom border color
      editor.dom.addClass(img, 'border-color-custom');

      // Set the custom border color as inline style
      editor.dom.setStyle(img, 'border-color', value);

      // Apply the color directly to the element's style
      img.style.setProperty('border-color', value, 'important');

      // Also set the data-mce-style attribute which TinyMCE uses internally
      const currentStyle = img.getAttribute('data-mce-style') || '';
      const styleWithoutBorderColor = currentStyle.replace(/border-color:[^;]+;?/g, '');
      const newStyle = `${styleWithoutBorderColor}border-color: ${value} !important;`;
      img.setAttribute('data-mce-style', newStyle);
    }

    editor.nodeChanged();
  };

  const toggleFormat = function (editor, fmt) {
    const img = editor.selection.getNode();
    if (img.nodeName !== 'IMG') return;

    // Get the image cell parent if it exists
    const imageCell = editor.dom.getParent(img, '.image-cell');
    if (!imageCell) return;

    // Remove all related classes first
    if (fmt.startsWith('border-') && !fmt.startsWith('border-style-') && !fmt.startsWith('border-color-')) {
      editor.dom.removeClass(img, 'border-thin border-medium border-thick');
    } else if (fmt.startsWith('border-style-')) {
      editor.dom.removeClass(img, 'border-style-solid border-style-dashed border-style-dotted');
    } else if (fmt.startsWith('border-color-')) {
      // Remove custom border color inline style
      editor.dom.setStyle(img, 'border-color', null);
      // Remove all border color classes
      editor.dom.removeClass(img, 'border-color-gray border-color-black border-color-blue border-color-red border-color-green border-color-custom');

      // Remove the border color from the style property directly
      img.style.removeProperty('border-color');

      // Also update the data-mce-style attribute which TinyMCE uses internally
      const currentStyle = img.getAttribute('data-mce-style') || '';
      const styleWithoutBorderColor = currentStyle.replace(/border-color:[^;]+;?/g, '');
      img.setAttribute('data-mce-style', styleWithoutBorderColor);

      // Force a redraw of the element
      if (img.parentNode) {
        const parent = img.parentNode;
        const next = img.nextSibling;
        parent.removeChild(img);
        parent.insertBefore(img, next);
      }
    } else if (fmt.startsWith('rounded-')) {
      editor.dom.removeClass(img, 'rounded-sm rounded-md rounded-lg rounded-full');
    }

    // Toggle the new class if it's different from what was removed
    if (editor.dom.hasClass(img, fmt)) {
      editor.dom.removeClass(img, fmt);
    } else {
      editor.dom.addClass(img, fmt);
    }

    editor.nodeChanged();
  };

  // Register a color button for border color using the same approach as forecolor
  const registerBorderColorButton = function(editor) {
    // Register the BorderColor command
    editor.addCommand('BorderColor', function(_, value) {
      applyBorderColor(editor, value);
    });

    // Register the border color split button
    editor.ui.registry.addSplitButton('bordercolor', {
      icon: 'border-width',
      tooltip: 'Border Color',
      presets: 'color',
      select: value => {
        const img = editor.selection.getNode();
        if (img.nodeName !== 'IMG') return false;
        const currentColor = editor.dom.getStyle(img, 'border-color');
        return currentColor === value;
      },
      columns: editor.options.get('color_cols') || 5,
      fetch: (callback) => {
        const colorMap = editor.options.get('color_map');
        callback(colorMap);
      },
      onAction: () => {
        // This is called when the main part of the split button is clicked
        // We'll use the current color or default to black
        const img = editor.selection.getNode();
        if (img.nodeName === 'IMG') {
          const currentColor = editor.dom.getStyle(img, 'border-color') || '#000000';
          editor.execCommand('BorderColor', false, currentColor);
        }
      },
      onItemAction: (_, value) => {
        // This is called when a color is selected from the menu
        if (value === 'custom') {
          // Open the color picker dialog
          editor.execCommand('mceColorPicker', true, {
            callback: function(hexColor) {
              if (hexColor) {
                editor.execCommand('BorderColor', false, hexColor);
              }
            }
          });
        } else if (value === 'remove') {
          // Remove the color
          editor.execCommand('BorderColor', false, 'remove');
        } else {
          // Apply the selected color
          editor.execCommand('BorderColor', false, value);
        }
      },
      onSetup: (api) => {
        // Update button state based on selection
        const nodeChangeHandler = () => {
          const img = editor.selection.getNode();
          const isImage = img.nodeName === 'IMG';
          const hasImageCell = !!editor.dom.getParent(img, '.image-cell');

          // Only enable if we have an image in an image cell
          api.setEnabled(isImage && hasImageCell);
        };

        editor.on('NodeChange', nodeChangeHandler);
        return () => {
          editor.off('NodeChange', nodeChangeHandler);
        };
      }
    });
  };

  const register = function (editor) {
    // Register a custom icon for the border color button
    editor.ui.registry.addIcon('color-swatch', '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/></svg>');

    // Register the border color button
    registerBorderColorButton(editor);

    editor.ui.registry.addMenuButton('imagestyle', {
      icon: 'image-options',
      tooltip: 'Image styles',
      fetch: function (callback) {
        const img = editor.selection.getNode();
        const isImage = img.nodeName === 'IMG';

        const items = isImage ? [
          {
            type: 'nestedmenuitem',
            text: 'Border',
            getSubmenuItems: () => [
              {
                type: 'togglemenuitem',
                text: 'None',
                onAction: () => {
                  const img = editor.selection.getNode();
                  editor.dom.removeClass(img, 'border-thin border-medium border-thick');
                  editor.nodeChanged();
                },
                onSetup: (api) => {
                  api.setActive(!editor.dom.hasClass(img, 'border-thin') &&
                              !editor.dom.hasClass(img, 'border-medium') &&
                              !editor.dom.hasClass(img, 'border-thick'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Thin',
                onAction: () => toggleFormat(editor, 'border-thin'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'border-thin'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Medium',
                onAction: () => toggleFormat(editor, 'border-medium'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'border-medium'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Thick',
                onAction: () => toggleFormat(editor, 'border-thick'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'border-thick'));
                  return () => {};
                }
              }
            ]
          },
          {
            type: 'nestedmenuitem',
            text: 'Border Style',
            getSubmenuItems: () => [
              {
                type: 'togglemenuitem',
                text: 'None',
                onAction: () => {
                  const img = editor.selection.getNode();
                  editor.dom.removeClass(img, 'border-style-solid border-style-dashed border-style-dotted');
                  editor.nodeChanged();
                },
                onSetup: (api) => {
                  api.setActive(!editor.dom.hasClass(img, 'border-style-solid') &&
                              !editor.dom.hasClass(img, 'border-style-dashed') &&
                              !editor.dom.hasClass(img, 'border-style-dotted'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Solid',
                onAction: () => toggleFormat(editor, 'border-style-solid'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'border-style-solid'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Dashed',
                onAction: () => toggleFormat(editor, 'border-style-dashed'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'border-style-dashed'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Dotted',
                onAction: () => toggleFormat(editor, 'border-style-dotted'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'border-style-dotted'));
                  return () => {};
                }
              }
            ]
          },

          {
            type: 'nestedmenuitem',
            text: 'Rounded',
            getSubmenuItems: () => [
              {
                type: 'togglemenuitem',
                text: 'None',
                onAction: () => {
                  const img = editor.selection.getNode();
                  editor.dom.removeClass(img, 'rounded-sm rounded-md rounded-lg rounded-full');
                  editor.nodeChanged();
                },
                onSetup: (api) => {
                  api.setActive(!editor.dom.hasClass(img, 'rounded-sm') &&
                              !editor.dom.hasClass(img, 'rounded-md') &&
                              !editor.dom.hasClass(img, 'rounded-lg') &&
                              !editor.dom.hasClass(img, 'rounded-full'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Small',
                onAction: () => toggleFormat(editor, 'rounded-sm'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'rounded-sm'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Medium',
                onAction: () => toggleFormat(editor, 'rounded-md'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'rounded-md'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Large',
                onAction: () => toggleFormat(editor, 'rounded-lg'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'rounded-lg'));
                  return () => {};
                }
              },
              {
                type: 'togglemenuitem',
                text: 'Full',
                onAction: () => toggleFormat(editor, 'rounded-full'),
                onSetup: (api) => {
                  api.setActive(editor.dom.hasClass(img, 'rounded-full'));
                  return () => {};
                }
              }
            ]
          }
        ] : [];

        callback(items);
      }
    });

    // Add context menu integration
    editor.ui.registry.addContextMenu('imagestyle', {
      update: function (element) {
        return element.nodeName === 'IMG' ? ['imagestyle'] : '';
      }
    });
  };

  tinymce.PluginManager.add(pluginName, function (editor) {
    register(editor);
    return {
      getMetadata: function () {
        return {
          name: 'Image Style',
          url: 'https://example.com/docs/imagestyle'
        };
      }
    };
  });
})();
