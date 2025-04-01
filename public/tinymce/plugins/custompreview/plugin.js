tinymce.PluginManager.add('custompreview', function(editor) {
  editor.ui.registry.addIcon('custompreview', 
    '<svg width="24" height="24" viewBox="0 0 24 24">' +
    '<path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" fill="currentColor"/>' +
    '</svg>'
  );

  editor.ui.registry.addButton('custompreview', {
    icon: 'custompreview',
    tooltip: 'Preview Study Guide',
    onAction: function() {
      editor.execCommand('mceCustomPreview');
    }
  });

  editor.addCommand('mceCustomPreview', function() {
    console.log('Preview command triggered');
    const content = editor.getContent();
    console.log('TinyMCE preview content:', {
      length: content?.length,
      hasBody: content?.includes('<body'),
      hasInteractives: content?.includes('[interactive'),
      hasScripts: content?.includes('<script')
    });
    
    if (editor.windowManager.customPreviewCallback) {
      try {
        console.log('Calling preview callback with content');
        // Get the full HTML document from the editor
        const fullContent = editor.getContent({ format: 'html', get_outer: true });
        editor.windowManager.customPreviewCallback(fullContent);
      } catch (err) {
        console.error('Error in preview callback:', err);
      }
    } else {
      console.warn('Preview callback not found');
    }
  });

  return {
    getMetadata: function() {
      return {
        name: 'Custom Preview',
        url: 'https://example.com/custom-preview'
      };
    }
  };
});
