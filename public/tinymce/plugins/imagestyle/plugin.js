(function () {
  'use strict';

  const pluginName = 'imagestyle';
  const toggleFormat = function (editor, fmt) {
    const img = editor.selection.getNode();
    if (img.nodeName !== 'IMG') return;

    // Get the image cell parent if it exists
    const imageCell = editor.dom.getParent(img, '.image-cell');
    if (!imageCell) return;

    // Remove all related classes first
    if (fmt.startsWith('border-')) {
      editor.dom.removeClass(img, 'border-thin border-medium border-thick');
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

  const register = function (editor) {
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
