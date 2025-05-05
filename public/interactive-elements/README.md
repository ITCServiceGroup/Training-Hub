# Interactive Elements Library Documentation

## Overview

This document provides detailed instructions for creating and integrating new interactive learning elements (Web Components) into the study guide system. Adhering strictly to these guidelines is crucial for ensuring elements load correctly and function as expected within both the `StudyGuideViewer` and the `ContentEditor`.

The system leverages standard Web Components for reusability and encapsulation (Shadow DOM). Interactive elements can be added to study guides through the ContentEditor, which displays them with their associated icons in the settings sidebar.

## Directory Structure

All interactive elements reside within the `v2/public/interactive-elements/` directory. Each element requires its own folder and specific files:

```
v2/public/interactive-elements/
├── elements.json         # Registry of all available elements
└── your-element-name/    # Folder for your specific element (use kebab-case)
    ├── index.js          # Main JS file defining the Web Component (MUST be named index.js).
    └── icon.png          # Icon image for the ContentEditor (e.g., 64x64px, can be .jpg/.gif too)
    # Note: HTML structure and CSS styles should be embedded within the index.js file's template string.
```

## Creating a New Element (Step-by-Step)

1.  **Choose a Folder Name:**
    *   Select a unique, descriptive name for your element using **kebab-case** (e.g., `wifi-channels`, `circuit-builder`).
    *   This name is critical as it's used for the folder, the shortcode, and deriving the custom element tag name.

2.  **Create Folder:**
    *   Create a new directory inside `v2/public/interactive-elements/` using your chosen name: `v2/public/interactive-elements/your-folder-name/`.

3.  **Create JavaScript File (`index.js`):**
    *   Create a file named exactly `index.js` inside the element's folder. This is the core file defining the Web Component.
    *   **Define the Class:** Create a class that extends `HTMLElement`.
    *   **Define Template:** Create an HTML `<template>` string containing:
        *   A `<style>` tag with all necessary CSS. Shadow DOM (below) scopes these styles.
        *   The HTML structure for your element. Use IDs for elements accessed by JS.
    *   **Constructor & Shadow DOM:** In the class constructor:
        *   Call `super()`.
        *   Attach a Shadow DOM: `this.attachShadow({ mode: 'open' });`
        *   Append the template content: `this.shadowRoot.appendChild(yourElementTemplate.content.cloneNode(true));`
        *   Initialize instance variables.
    *   **`connectedCallback`:** This lifecycle method runs when the element is added to the DOM. Use it to:
        *   Get references to Shadow DOM elements (`this.shadowRoot.getElementById(...)`).
        *   Instantiate internal logic classes (e.g., simulators, visualizers).
        *   Add event listeners *to elements within the Shadow DOM*.
    *   **`disconnectedCallback`:** Use this to clean up (e.g., remove global event listeners added in `connectedCallback` if any, though prefer listeners within the Shadow DOM).
    *   **Encapsulate Logic:** Keep all functionality within the element's class methods.
    *   **Register the Element:** At the very end of the file, define the custom element.
        *   **CRITICAL:** The tag name **MUST** follow the convention: **`{folder-name}-simulator`**. (If a different suffix is needed system-wide, update this documentation and the `StudyGuideViewer`.)
        *   Example:
            ```javascript
            const tagName = 'your-folder-name-simulator'; // Derive from folder name
            customElements.define(tagName, YourElementNameElement);
            console.log(`[WebComponent] Custom element "${tagName}" defined.`); // Helpful log
            ```
    *   **Example Structure:** A simple element might only need `index.js` (e.g., `fiber-fault`). More complex elements might split logic into multiple files using ES modules (e.g., `router-simulator` uses `index.js` and `floorplan.js`) or utilize Web Workers for performance (e.g., `router-simulator` uses `router-signal-worker.js`). Refer to existing elements for patterns.

4.  **Create Icon Image:**
    *   Create an icon image (e.g., 64x64 pixels) for the ContentEditor.
    *   Save it as `icon.png` (or `.jpg`, `.gif`) inside the element's folder.
    *   This icon will be displayed in the ContentEditor's settings sidebar when the interactive element is selected.

5.  **Register in `elements.json`:**
    *   Open `v2/public/interactive-elements/elements.json`.
    *   Add a new JSON object to the array:
        ```json
        {
          "name": "your-folder-name", // MUST match the folder name exactly
          "path": "your-folder-name/", // Relative path
          "title": "Your Element Title", // User-friendly name for the ContentEditor
          "description": "A brief description.",
          "iconUrl": "/interactive-elements/your-folder-name/icon.png" // Path to icon for ContentEditor
        }
        ```
    *   Ensure valid JSON syntax (commas between objects).

## Integration Details

### ContentEditor Integration

1. **Element Selection:** Users can add interactive elements through the ContentEditor's sidebar menu.
2. **Settings Display:** When an interactive element is selected in the editor, its settings appear in the right sidebar, displaying the element's icon, title, and description.
3. **Visual Representation:** The interactive element appears as a placeholder in the editor, showing its icon and title.

### StudyGuideViewer Integration

1. **Content Processing:** When viewing a study guide, the `StudyGuideViewer` processes the content containing interactive elements.
2. **Element Identification:** The system identifies interactive elements by their custom tags.
3. **Script Loading:** For each interactive element, the system loads the corresponding JavaScript file from the element's folder.
4. **Component Rendering:** Once the script is loaded, the browser renders the interactive element, calling its constructor and `connectedCallback` methods.

## Best Practices & Conventions

*   **Naming Consistency:** The **folder name**, the `name` property in `elements.json`, and the base part of the custom element tag (`customElements.define('{folder-name}-simulator', ...)` **MUST** all match exactly.
*   **Tag Suffix:** The custom element tag defined in `index.js` **MUST** end with `-simulator` to match the convention used in the system.
*   **Self-Contained:** Elements must encapsulate their HTML, CSS, and JS. Use the Shadow DOM. Avoid global scope pollution.
*   **Standard Filename:** The main JavaScript file **MUST** be named `index.js`.
*   **Lifecycle Methods:** Use `connectedCallback` for setup and `disconnectedCallback` for cleanup.
*   **Performance:** Optimize assets. Keep JS bundles reasonably small.
*   **Accessibility:** Consider keyboard navigation, focus management, and ARIA attributes.
*   **Clear Metadata:** Provide a good `title`, `description`, and `iconUrl` in `elements.json`. The `iconUrl` is used in the ContentEditor settings sidebar to help users identify the interactive element.
*   **Console Logging:** Add informative console logs within your element's JS (e.g., in `connectedCallback`, `define`) to aid debugging, prefixing them like `[WebComponent YourElementName] ...`.
*   **ES Modules:** If you split your element's logic into multiple JavaScript files using `import` and `export` syntax, the main `index.js` file must be loaded as a module. The `StudyGuideViewer` automatically handles this by adding `type="module"` to the injected script tag.
*   **Web Workers for Performance:** For elements involving heavy computations that could block the main UI thread (like real-time simulations), consider offloading the work to a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Create a separate worker script (e.g., `your-worker.js`) in the element's folder and communicate using `postMessage`. Ensure the worker script path is correctly referenced when creating the worker instance in `index.js` (e.g., `new Worker('/interactive-elements/your-folder-name/your-worker.js')`). See the `router-simulator` element for an example implementation using `router-signal-worker.js`.

## Troubleshooting Common Issues

*   **Element Not Loading or Not Appearing in ContentEditor:**
    *   **Check Naming:** Verify the folder name, `elements.json` name, and the tag name defined in `index.js` (including the `-simulator` suffix) are all consistent. This is the most common issue.
    *   **Check `elements.json`:** Ensure the entry exists, paths are correct, and JSON syntax is valid.
    *   **Check `index.js` Path:** Confirm the script path `/interactive-elements/your-folder-name/index.js` is correct and the file exists.
    *   **Check Browser Console:** Look for errors during script loading (404s) or JavaScript errors within your `index.js`.
    *   **Check `customElements.define`:** Ensure this line exists at the end of your `index.js` and uses the correct tag name.
*   **Styling Issues:**
    *   Ensure all styles are within the `<style>` tag inside the template string in `index.js`.
    *   Use the Shadow DOM (`attachShadow({ mode: 'open' })`). Avoid global styles affecting the element.
*   **Functionality Issues:**
    *   Use browser developer tools to inspect the element's Shadow DOM.
    *   Add console logs within your element's methods (`connectedCallback`, event handlers, etc.) to trace execution flow.
    *   Ensure event listeners are correctly added within `connectedCallback` using `this.shadowRoot.querySelector`.
*   **Icon Issues:**
    *   **Missing Icons in ContentEditor:** If your interactive element doesn't show an icon in the ContentEditor settings sidebar, check that you've added the `iconUrl` property in `elements.json` and that the file exists at the specified path.
    *   **Image Dimensions:** For best results, use consistent dimensions for all icons (e.g., 64x64px) to maintain visual consistency in the ContentEditor.
