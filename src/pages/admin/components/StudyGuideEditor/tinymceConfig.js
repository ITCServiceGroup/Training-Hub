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
    'imageoptions rotateleft rotateright imagestyle | code custompreview | help',
  // Prevent TinyMCE from filtering out custom elements and attributes
  extended_valid_elements: '*[*]',
  custom_elements: '~custom-element',
  content_style: `
    /* --- Image Grid Layout Styles (Increased Specificity) --- */
    body .image-grid-wrapper {
      display: grid;
      gap: 1em;
      margin-bottom: 1em;
      padding: 5px;
      border: 1px dashed #e0e0e0;
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
      border: 1px solid #e0e0e0 !important; 
    }
    html body .image-grid-wrapper > .image-cell > img.border-medium { 
      border: 2px solid #e0e0e0 !important; 
    }
    html body .image-grid-wrapper > .image-cell > img.border-thick { 
      border: 4px solid #e0e0e0 !important; 
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
  image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions imagestyle',

  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  quickbars_image_toolbar: 'alignGridLeft alignGridCenter alignGridRight alignGridNone | rotateleft rotateright | imageoptions imagestyle',

  contextmenu: 'link image imagestyle table'
};
