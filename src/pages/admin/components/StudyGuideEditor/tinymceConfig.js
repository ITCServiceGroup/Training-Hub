// Base configuration for the TinyMCE editor in StudyGuideEditor
export const baseEditorConfig = {
  menubar: true,
  license_key: 'gpl',
  base_url: '/tinymce',
  external_plugins: {
    // Define the path to the custom plugin JS file relative to the public root
    'interactives': '/tinymce/plugins/interactives/plugin.js',
    'custompreview': '/tinymce/plugins/custompreview/plugin.js',
    'medialibrary': '/tinymce/plugins/medialibrary/plugin.js',
    'imagestyle': '/tinymce/plugins/imagestyle/plugin.js'
  },
  // Color map for color pickers (used by bordercolor button)
  // Format: ['hex_color_without_hash', 'Color Name', ...]
  // Using the original TinyMCE default color palette
  color_map: [
    'BFEDD2', 'Light Green',
    'FBEEB8', 'Light Yellow',
    'F8CAC6', 'Light Red',
    'ECCAFA', 'Light Purple',
    'C2E0F4', 'Light Blue',

    '2DC26B', 'Green',
    'F1C40F', 'Yellow',
    'E03E2D', 'Red',
    'B96AD9', 'Purple',
    '3598DB', 'Blue',

    '169179', 'Dark Turquoise',
    'E67E23', 'Orange',
    'BA372A', 'Dark Red',
    '843FA1', 'Dark Purple',
    '236FA1', 'Dark Blue',

    'ECF0F1', 'Light Gray',
    'CED4D9', 'Medium Gray',
    '95A5A6', 'Gray',
    '7E8C8D', 'Dark Gray',
    '34495E', 'Navy Blue',

    '000000', 'Black',
    'FFFFFF', 'White'
  ],
  color_cols: 5, // Number of columns in the color grid
  custom_colors: true, // Enable custom color picker
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount',
    'interactives', 'custompreview', 'medialibrary', 'image', 'quickbars', 'imagestyle'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | image medialibrary link table interactives | ' +
    'imageoptions rotateleft rotateright bordercolor imagestyle | code custompreview | help',
  // Prevent TinyMCE from filtering out custom elements and attributes
  extended_valid_elements: '*[*]',
  custom_elements: '~custom-element',
  content_style: `
    /* Force TinyMCE to respect inline styles */
    img[style*="border-color"] {
      /* This selector helps TinyMCE recognize that these elements have custom styles */
    }

    /* Dark mode styles */
    body.mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
      color: rgba(255, 255, 255, 0.6);
    }

    /* --- Image Grid Layout Styles (Increased Specificity) --- */
    body .image-grid-wrapper {
      display: grid;
      gap: 1em;
      margin-bottom: 1em;
      padding: 5px;
      border: 1px dashed #e0e0e0;
    }

    body.mce-dark-mode .image-grid-wrapper {
      border-color: #475569;
    }
    body .image-grid-wrapper.align-left {
      grid-template-columns: auto 1fr;
    }
    body .image-grid-wrapper.align-right {
      grid-template-columns: 1fr auto;
    }
    body .image-grid-wrapper.align-center {
      grid-template-columns: 1fr;
    }
    body .image-grid-wrapper.align-center > .image-cell {
      justify-self: center;
      grid-row: 1;
      grid-column: 1;
    }
    body .image-grid-wrapper.align-center > .content-cell {
      grid-row: 2;
      grid-column: 1;
    }
    body .image-grid-wrapper > .grid-cell {
      min-width: 0;
    }
    body .image-grid-wrapper > .image-cell {
      display: flex;
      align-items: flex-start;
    }
    body .image-grid-wrapper.align-right > .image-cell {
      grid-column: 2;
    }
    body .image-grid-wrapper.align-right > .content-cell {
      grid-column: 1;
      grid-row: 1;
    }
    body .image-grid-wrapper > .image-cell > img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    /* --- Image Style Options --- */
    html body .image-grid-wrapper > .image-cell > img.border-thin {
      border-width: 1px !important;
      border-style: solid !important;
      border-color: #e0e0e0 !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-medium {
      border-width: 2px !important;
      border-style: solid !important;
      border-color: #e0e0e0 !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-thick {
      border-width: 4px !important;
      border-style: solid !important;
      border-color: #e0e0e0 !important;
    }

    /* Dark mode border colors */
    html body.mce-dark-mode .image-grid-wrapper > .image-cell > img.border-thin,
    html body.mce-dark-mode .image-grid-wrapper > .image-cell > img.border-medium,
    html body.mce-dark-mode .image-grid-wrapper > .image-cell > img.border-thick {
      border-color: #475569 !important;
    }

    /* Custom border color class - the actual color comes from inline style */
    html body .image-grid-wrapper > .image-cell > img.border-color-custom {
      /* This class just indicates that a custom color is being used */
      /* The actual color is set via inline style */
      border-color: inherit !important;
    }

    /* Ensure inline styles take precedence */
    html body .image-grid-wrapper > .image-cell > img[style*="border-color"] {
      /* The border color will be applied directly via the style attribute */
    }
    /* Border Style Options */
    html body .image-grid-wrapper > .image-cell > img.border-style-solid {
      border-style: solid !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-style-dashed {
      border-style: dashed !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-style-dotted {
      border-style: dotted !important;
    }
    /* Border Color Options */
    html body .image-grid-wrapper > .image-cell > img.border-color-gray {
      border-color: #e0e0e0 !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-color-black {
      border-color: #000000 !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-color-blue {
      border-color: #0f766e !important; /* Changed from blue to teal */
    }
    html body .image-grid-wrapper > .image-cell > img.border-color-red {
      border-color: #dc2626 !important;
    }
    html body .image-grid-wrapper > .image-cell > img.border-color-green {
      border-color: #16a34a !important;
    }

    /* Fallback: Apply solid border style when thickness is present but no style is specified */
    html body .image-grid-wrapper > .image-cell > img.border-thin:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
    html body .image-grid-wrapper > .image-cell > img.border-medium:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
    html body .image-grid-wrapper > .image-cell > img.border-thick:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted) {
      border-style: solid !important;
    }
    html body .image-grid-wrapper > .image-cell > img.rounded-sm {
      border-radius: 4px !important;
    }
    html body .image-grid-wrapper > .image-cell > img.rounded-md {
      border-radius: 8px !important;
    }
    html body .image-grid-wrapper > .image-cell > img.rounded-lg {
      border-radius: 16px !important;
    }
    html body .image-grid-wrapper > .image-cell > img.rounded-full {
      border-radius: 9999px !important;
    }
    /* Additional specific styles for enhanced specificity */
    html body .image-grid-wrapper > .image-cell > img[class*="border-"],
    html body .image-grid-wrapper > .image-cell > img[class*="rounded-"] {
      box-sizing: border-box !important;
      display: block !important;
      max-width: 100% !important;
    }
    /* --- End Image Style Options --- */

    body .image-grid-wrapper > .content-cell {
      min-height: 2em;
      display: block;
      height: 100%;
      padding: 0.25em;
    }
    body .image-grid-wrapper > .content-cell > p {
      margin: 0 0 0.5em 0;
      min-height: 1em;
      white-space: pre-wrap;
    }
    body .image-grid-wrapper > .content-cell[style*="text-align"],
    body .image-grid-wrapper > .content-cell > p[style*="text-align"] {
      display: block;
    }
    body .image-grid-wrapper.reflow-grid {
      opacity: 0.99;
    }
    body .image-grid-wrapper > .content-cell:empty::after {
      content: '';
      display: block;
      min-height: 1em;
      cursor: text;
    }
    body .image-grid-wrapper .editable-container > p {
      margin: 0 0 0.5em 0;
    }
    body .image-grid-wrapper .editable-container > p:last-child {
      margin-bottom: 0;
    }

    /* --- Interactive Element Clearing --- */
    body [id$='-simulator'], body [is$='-simulator'] {
       clear: both;
       display: block;
       margin-top: 1.5em;
       width: 100%;
    }

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

    /* Dark mode styles */
    body.mce-content-body.mce-dark-mode {
      background-color: #1e293b;
      color: #e2e8f0;
    }

    body.mce-content-body.mce-dark-mode h1,
    body.mce-content-body.mce-dark-mode h2,
    body.mce-content-body.mce-dark-mode h3,
    body.mce-content-body.mce-dark-mode h4,
    body.mce-content-body.mce-dark-mode h5,
    body.mce-content-body.mce-dark-mode h6 {
      color: #f1f5f9;
    }

    body.mce-content-body.mce-dark-mode table {
      border-color: #475569;
    }

    body.mce-content-body.mce-dark-mode th,
    body.mce-content-body.mce-dark-mode td {
      border-color: #475569;
    }

    body.mce-content-body.mce-dark-mode th {
      background-color: #334155;
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
  branding: false,
  promotion: false,
  removed_menuitems: 'help',
  verify_html: false,
  element_format: 'html',
  schema: 'html5',
  allow_script_urls: true,
  forced_root_block: 'p',
  keep_styles: true,
  inline_styles: true,
  convert_fonts_to_spans: false,
  entity_encoding: 'raw',
  formats: {
    removeformat: [
      { selector: '*', remove: 'all', split: true, expand: false, block_expand: true, deep: true }
    ]
  },
  content_security_policy: "default-src 'self'; img-src 'self' data: https://scmwpoowjhzawvmiyohz.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';",

  image_advtab: true,
  image_caption: true,
  image_dimensions: true,
  image_title: true,

  resize_img_proportional: true,
  object_resizing: 'img,table',
  resize: true,

  // Updated image toolbar options
  image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | bordercolor | imageoptions imagestyle',

  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  quickbars_image_toolbar: 'alignGridLeft alignGridCenter alignGridRight alignGridNone | rotateleft rotateright | bordercolor | imageoptions imagestyle',

  contextmenu: 'link image imagestyle table'
};
