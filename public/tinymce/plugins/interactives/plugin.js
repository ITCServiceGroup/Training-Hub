/* global tinymce */

tinymce.PluginManager.add('interactives', (editor, url) => {
  console.log("Loading Interactives Plugin from:", url);

  const openDialog = () => {
    // Fetch elements data from elements.json
    fetch('/interactive-elements/elements.json') // Relative path from the public root
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(elements => {
        // Dynamically create items for the dialog body
        const elementItems = elements.map(el => ({
          type: 'panel', // Use panel for layout flexibility
          items: [
            {
              type: 'htmlpanel', // Display thumbnail and text
              // CORRECTED LINE: Using single quotes for the HTML attribute
              html: `
                <div style="display: flex; align-items: center; padding: 5px; cursor: pointer;" class="interactive-element-item" data-shortcode='[interactive name="${el.name}"]'>
                  <img src="${el.thumbnailUrl || '/path/to/default/thumbnail.png'}" alt="${el.title}" style="width: 50px; height: 50px; margin-right: 10px; border: 1px solid #ccc;">
                  <div>
                    <strong>${el.title}</strong><br>
                    <small>${el.description}</small>
                  </div>
                </div>
              `
            }
          ]
        }));

        // Open the TinyMCE dialog
        editor.windowManager.open({
          title: 'Insert Interactive Element',
          size: 'medium', // Or 'large', 'fullscreen'
          body: {
            type: 'panel',
            items: elementItems // Add the generated items here
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Close'
            }
            // No 'submit' button needed as insertion happens on click
          ],
          onAction: (dialogApi, details) => {
             // This is needed for custom events within the dialog, but we'll handle clicks directly
          },
          // We need to attach click listeners *after* the dialog is rendered
          initialData: {} // Required, even if empty
        });

        // --- Attach click listeners after dialog is open ---
        // TinyMCE dialogs render asynchronously, so we need a slight delay
        // or a more robust way to detect when the content is ready.
        // A simple timeout is often sufficient for this.
        setTimeout(() => {
          const dialogBody = document.querySelector('.tox-dialog__body'); // Find the active dialog body
          if (dialogBody) {
            dialogBody.querySelectorAll('.interactive-element-item').forEach(item => {
              item.addEventListener('click', () => {
                const shortcode = item.getAttribute('data-shortcode');
                if (shortcode) {
                  // Extract the name from the shortcode
                  const nameMatch = shortcode.match(/\[interactive name="([^"]+)"\]/);
                  if (nameMatch && nameMatch[1]) {
                    const name = nameMatch[1];
                    // Insert a placeholder instead of the raw shortcode
                    const placeholder = `<span class="interactive-placeholder" data-interactive-name="${name}" contenteditable="false">[Interactive: ${name}]</span>`;
                    editor.insertContent(placeholder);
                  } else {
                    // Fallback to inserting the raw shortcode if parsing fails
                    editor.insertContent(shortcode);
                  }
                  editor.windowManager.close(); // Close the dialog after insertion
                } else {
                  console.error("Could not retrieve shortcode from clicked item:", item);
                }
              });
            });
          } else {
             console.error("Could not find TinyMCE dialog body to attach listeners.");
          }
        }, 100); // Adjust timeout if needed

      })
      .catch(error => {
        console.error('Error fetching or processing interactive elements:', error);
        editor.notificationManager.open({
          text: 'Error loading interactive elements. Please check the console.',
          type: 'error'
        });
      });
  };

  // Add a button to the toolbar
  editor.ui.registry.addButton('interactives', {
    text: 'Interactives', // Or use an icon: icon: 'embed'
    tooltip: 'Insert Interactive Element',
    onAction: openDialog // Open the dialog when the button is clicked
  });

  // Adds a menu item, which can be used in the menu bar
  editor.ui.registry.addMenuItem('interactives', {
    text: 'Insert Interactive Element',
    icon: 'embed', // Example icon
    onAction: openDialog
  });

  // Return metadata for the plugin
  return {
    getMetadata: () => ({
      name: 'Interactives Plugin',
      url: 'https://example.com/docs/interactives-plugin' // Replace with actual URL if available
    })
  };
});
