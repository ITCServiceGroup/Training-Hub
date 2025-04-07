// Base configuration for the TinyMCE editor in StudyGuideEditor
export const baseEditorConfig = {
  menubar: true,
  license_key: 'gpl',
  base_url: '/tinymce',
  external_plugins: {
    // Define the path to the custom plugin JS file relative to the public root
    'interactives': '/tinymce/plugins/interactives/plugin.js',
    'custompreview': '/tinymce/plugins/custompreview/plugin.js',
    'medialibrary': '/tinymce/plugins/medialibrary/plugin.js'
  },
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', // Removed autoresize
    'interactives', 'custompreview', 'medialibrary', 'image', 'quickbars' // Removed imagetools
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | image medialibrary link table interactives | ' +
    'imageoptions rotateleft rotateright | code custompreview | help',
  // Prevent TinyMCE from filtering out custom elements and attributes, allow all attributes for flexibility
  extended_valid_elements: '*[*]', // Allow any element with any attribute
  custom_elements: '~custom-element', // Allow custom elements (prefix with ~ if needed)
  content_style: `
    /* --- Image Grid Layout Styles (Increased Specificity) --- */
    body .image-grid-wrapper { /* Added body prefix */
      display: grid; /* REMOVED !important */
      gap: 1em; /* Spacing between image and text */
      margin-bottom: 1em; /* Space below the grid */
      padding: 5px; /* Optional: Add padding for visual separation */
      border: 1px dashed #e0e0e0; /* Border for visual aid during editing */
    }
    body .image-grid-wrapper.align-left { /* Added body prefix */
      grid-template-columns: auto 1fr; /* Image takes auto width, text takes rest */
    }
    body .image-grid-wrapper.align-right { /* Added body prefix */
      grid-template-columns: 1fr auto; /* Text takes first column, image takes auto width */
    }
    body .image-grid-wrapper.align-center { /* Added body prefix */
      grid-template-columns: 1fr; /* Single column for centered image */
      /* REMOVED: justify-items: center; */ /* Don't center all items */
    }
    body .image-grid-wrapper.align-center > .image-cell { /* Added body prefix */
      justify-self: center; /* Center only the image cell */
      grid-row: 1; /* Ensure image cell is in the first row */
      grid-column: 1; /* Ensure image cell is in the first column */
    }
    body .image-grid-wrapper.align-center > .content-cell { /* Added body prefix */
      grid-row: 2; /* Place content cell in the second row */
      grid-column: 1; /* Ensure content cell spans the column */
    }
    body .image-grid-wrapper > .grid-cell { /* Added body prefix */
      /* Cells take up the defined grid area */
      min-width: 0; /* Prevent overflow issues in flex/grid children */
    }
    body .image-grid-wrapper > .image-cell { /* Added body prefix */
       /* Styles specific to the image cell if needed */
       display: flex; /* Use flex to help center if needed */
       align-items: flex-start; /* Align image to top */
    }
     body .image-grid-wrapper.align-right > .image-cell { /* Added body prefix */
       grid-column: 2; /* Ensure image is in the second column for right align */
     }
     body .image-grid-wrapper.align-right > .content-cell { /* Added body prefix */
       grid-column: 1; /* Ensure content is in the first column for right align */
       grid-row: 1; /* Ensure content stays in the first row */
     }
    body .image-grid-wrapper > .image-cell > img { /* Added body prefix */
      max-width: 100%; /* Image scales within its cell */
      height: auto;
      display: block; /* Remove extra space below image */
    }
    body .image-grid-wrapper > .content-cell { /* Added body prefix */
      /* Styles specific to the content cell if needed */
      min-height: 2em; /* Ensure there's always space to click and edit */
      display: block; /* Ensure it's a block element */
      height: 100%; /* Take full height of the grid cell */
      padding: 0.25em;
    }
    /* Style paragraphs in content cell */
    body .image-grid-wrapper > .content-cell > p {
      margin: 0 0 0.5em 0;
      min-height: 1em;
      white-space: pre-wrap;
    }
    /* Honor text alignment styles */
    body .image-grid-wrapper > .content-cell[style*="text-align"],
    body .image-grid-wrapper > .content-cell > p[style*="text-align"] {
      display: block;
    }
    /* Add a special class to force reflow when changing alignment */
    body .image-grid-wrapper.reflow-grid {
      opacity: 0.99;
    }
    /* Make sure the content cell is always editable */
    body .image-grid-wrapper > .content-cell:empty::after {
      content: '';
      display: block;
      min-height: 1em;
      cursor: text;
    }
    /* Ensure paragraphs in content cell are properly contained */
    body .image-grid-wrapper .editable-container > p {
      margin: 0 0 0.5em 0; /* Reduce bottom margin */
    }
    body .image-grid-wrapper .editable-container > p:last-child {
      margin-bottom: 0; /* Remove bottom margin from last paragraph */
    }
    /* --- End Image Grid Layout Styles --- */

    /* --- Interactive Element Clearing (Increased Specificity) --- */
    /* Use a more specific selector if possible, but this targets elements ending with -simulator */
    /* Consider adding a common class to all interactive elements if this is too broad */
    body [id$='-simulator'], body [is$='-simulator'] { /* Added body prefix */
       clear: both; /* Clear floats from elements *before* the grid wrapper */
       display: block; /* REMOVED !important */
       margin-top: 1.5em; /* Add space above the simulator */
       width: 100%; /* Ensure it takes full width */
    }
    /* --- End Interactive Element Clearing --- */

    /* Base styles for the placeholder */
    .interactive-placeholder {
      display: inline-block;
      background-color: #f0f7ff;
      border: 1px solid #bbd6ff;
      border-radius: 4px;
      padding: 4px 8px;
      margin: 2px 0;
      font-family: monospace;
      cursor: pointer;
      user-select: none;
    }
    @import url('/fonts/inter.css');
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
      max-width: 100%;
      min-height: 100%;
      outline: none;
      line-height: 1.5;
    }
    img, table {
      max-width: 100%;
      height: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td, th {
      word-break: break-word;
      padding: 8px;
      border: 1px solid #e5e7eb;
    }
    p { margin: 0 0 1em 0; white-space: pre-wrap; }
    p:last-child { margin-bottom: 0; }
  `,
  // Core settings only
  branding: false,
  promotion: false,
  removed_menuitems: 'help',
  verify_html: false,
  element_format: 'html',
  schema: 'html5',
  allow_script_urls: true,
  // Preserve line breaks
  forced_root_block: 'p',
  keep_styles: true,
  entity_encoding: 'raw',
  // Ensure empty paragraphs are preserved
  formats: {
    removeformat: [
      { selector: '*', remove: 'all', split: true, expand: false, block_expand: true, deep: true }
    ]
  },
  content_security_policy: "default-src 'self'; img-src 'self' data: https://scmwpoowjhzawvmiyohz.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';",

  // Image editing options
  image_advtab: true, // Advanced image options
  image_caption: true, // Enable image captions
  image_dimensions: true, // Show dimensions in image dialog
  image_title: true, // Enable image title field

  // Image resizing options
  resize_img_proportional: true, // Maintain aspect ratio when resizing
  object_resizing: 'img,table', // Allow resizing of images and tables
  resize: true, // Enable editor resizing

  // Image toolbar options
  image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',

  // Custom image toolbar buttons
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  // Use the NEW custom buttons for the image quickbar
  quickbars_image_toolbar: 'alignGridLeft alignGridCenter alignGridRight alignGridNone | rotateleft rotateright | imageoptions',

  // Enable contextmenu for images
  contextmenu: 'link image table' // Keep standard context menu
};
