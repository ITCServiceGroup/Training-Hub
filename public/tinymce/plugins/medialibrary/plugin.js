/**
 * Media Library Plugin for TinyMCE
 * Integrates with the custom media library
 */
(function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var openDialog = function (editor) {
    // Set a global flag that the React component can check
    window.openMediaLibraryModal = true;

    // Dispatch a custom event that the React component can listen for
    var event = new CustomEvent('openMediaLibraryModal', { detail: { editor: editor } });
    document.dispatchEvent(event);
  };

  var register = function (editor) {
    editor.addCommand('mceMediaLibrary', function () {
      openDialog(editor);
    });
  };

  var register$1 = function (editor) {
    editor.ui.registry.addIcon('medialibrary', '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm11 10l-3-3-3 3-4-5 2-2 2 2 3-3 4 4v4z" fill="currentColor"/></svg>');

    editor.ui.registry.addButton('medialibrary', {
      icon: 'medialibrary',
      tooltip: 'Insert from Media Library',
      onAction: function () {
        openDialog(editor);
      }
    });

    editor.ui.registry.addMenuItem('medialibrary', {
      icon: 'medialibrary',
      text: 'Media Library',
      onAction: function () {
        openDialog(editor);
      }
    });
  };

  function Plugin () {
    global.add('medialibrary', function (editor) {
      register(editor);
      register$1(editor);

      return {
        getMetadata: function () {
          return {
            name: 'Media Library',
            url: 'https://example.com/docs/medialibrary'
          };
        }
      };
    });
  }

  Plugin();
}());
