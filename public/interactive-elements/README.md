# Interactive Elements Library Documentation

# Interactive Elements Library Documentation

## Overview

This document provides detailed instructions for creating and integrating new interactive learning elements (Web Components) into the study guide system. Adhering strictly to these guidelines is crucial for ensuring elements load correctly and function as expected within the `StudyGuideViewer`.

The system leverages standard Web Components for reusability and encapsulation (Shadow DOM). Authors insert elements using a shortcode (`[interactive name="element-folder-name"]`), which the viewer component then processes to load and render the appropriate Web Component.

## Directory Structure

All interactive elements reside within the `v2/public/interactive-elements/` directory. Each element requires its own folder and specific files:

```
v2/public/interactive-elements/
├── elements.json         # Registry of all available elements
└── your-element-name/    # Folder for your specific element (use kebab-case)
    ├── index.js          # Main JS file defining the Web Component (MUST be named index.js).
    └── thumbnail.png     # Preview image for the TinyMCE picker (e.g., 100x100px, can be .jpg/.gif too)
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
    *   **Example:** Refer to `v2/public/interactive-elements/router-simulator/index.js` or `v2/public/interactive-elements/fiber-fault/index.js`.

4.  **Create Thumbnail (`thumbnail.png`):**
    *   Create a small preview image (e.g., 100x100 pixels).
    *   Save it as `thumbnail.png` (or `.jpg`, `.gif`) inside the element's folder.

5.  **Register in `elements.json`:**
    *   Open `v2/public/interactive-elements/elements.json`.
    *   Add a new JSON object to the array:
        ```json
        {
          "name": "your-folder-name", // MUST match the folder name exactly
          "path": "your-folder-name/", // Relative path
          "title": "Your Element Title", // User-friendly name for picker
          "description": "A brief description.",
          "thumbnailUrl": "/interactive-elements/your-folder-name/thumbnail.png" // Path to thumbnail
        }
        ```
    *   Ensure valid JSON syntax (commas between objects).

## Integration Details (How it Works - `StudyGuideViewer.jsx`)

1.  **Shortcode Insertion:** Author uses TinyMCE picker (populated from `elements.json`) to insert `[interactive name="your-folder-name"]`.
2.  **Content Processing:** `StudyGuideViewer` receives HTML content.
3.  **Element Identification:** The `useEffect` hook (triggered by `studyGuide.content` changes) parses the *original* content to find all unique `[interactive name="..."]` shortcodes and extracts the `your-folder-name` values.
4.  **Tag Replacement:** The `processContentForWebComponents` function replaces each shortcode `[interactive name="your-folder-name"]` with the corresponding custom HTML tag: `<your-folder-name-simulator></your-folder-name-simulator>`. This processed HTML is set as the `srcDoc` for the viewer's iframe.
5.  **Script Injection Logic (Inside iframe `load` handler):**
    *   For each unique `elementName` (e.g., `your-folder-name`) identified in step 3:
        *   The expected tag name is constructed: `tagName = elementName + '-simulator'`.
        *   It checks if this specific `tagName` is already defined in the *current iframe's context*: `iframeWindow.customElements.get(tagName)`.
        *   **If NOT defined:**
            *   A `<script>` tag is created with `src="/interactive-elements/your-folder-name/index.js"`.
            *   `script.async = false` is set to encourage sequential loading relative to other potential element scripts.
            *   The script is appended to the iframe's `body`.
            *   Crucially, it then waits for the element definition using `iframeWindow.customElements.whenDefined(tagName)`. This ensures the script has fully executed and registered the element before the browser attempts to upgrade instances of the tag.
        *   **If already defined:** The script injection is skipped for this element in this iframe instance.
6.  **Component Rendering:** Once the script defining `your-folder-name-simulator` is loaded and executed, the browser upgrades all instances of `<your-folder-name-simulator>` in the iframe's DOM, calling the element's constructor and `connectedCallback`.

## Best Practices & Conventions

*   **Naming Consistency:** The **folder name**, the `name` property in `elements.json`, the shortcode `[interactive name="..."]`, and the base part of the custom element tag (`customElements.define('{folder-name}-simulator', ...)` **MUST** all match exactly.
*   **Tag Suffix:** The custom element tag defined in `index.js` **MUST** end with `-simulator` to match the convention used in `StudyGuideViewer.jsx`.
*   **Self-Contained:** Elements must encapsulate their HTML, CSS, and JS. Use the Shadow DOM. Avoid global scope pollution.
*   **Standard Filename:** The main JavaScript file **MUST** be named `index.js`.
*   **Lifecycle Methods:** Use `connectedCallback` for setup and `disconnectedCallback` for cleanup.
*   **Performance:** Optimize assets. Keep JS bundles reasonably small.
*   **Accessibility:** Consider keyboard navigation, focus management, and ARIA attributes.
*   **Clear Metadata:** Provide a good `title`, `description`, and `thumbnailUrl` in `elements.json`.
*   **Console Logging:** Add informative console logs within your element's JS (e.g., in `connectedCallback`, `define`) to aid debugging, prefixing them like `[WebComponent YourElementName] ...`.

## Troubleshooting Common Issues

*   **Element Not Loading:**
    *   **Check Naming:** Verify the folder name, `elements.json` name, shortcode name, and the tag name defined in `index.js` (including the `-simulator` suffix) are all consistent. This is the most common issue.
    *   **Check `elements.json`:** Ensure the entry exists, paths are correct, and JSON syntax is valid.
    *   **Check `index.js` Path:** Confirm the script path `/interactive-elements/your-folder-name/index.js` is correct and the file exists.
    *   **Check Browser Console:** Look for errors during script loading (404s) or JavaScript errors within your `index.js`. Check for logs like "Element <...> not defined. Injecting script..." and "Element <...> successfully defined and registered." from `StudyGuideViewer`.
    *   **Check `customElements.define`:** Ensure this line exists at the end of your `index.js` and uses the correct tag name.
*   **Styling Issues:**
    *   Ensure all styles are within the `<style>` tag inside the template string in `index.js`.
    *   Use the Shadow DOM (`attachShadow({ mode: 'open' })`). Avoid global styles affecting the element.
*   **Functionality Issues:**
    *   Use browser developer tools to inspect the element's Shadow DOM.
    *   Add console logs within your element's methods (`connectedCallback`, event handlers, etc.) to trace execution flow.
    *   Ensure event listeners are correctly added within `connectedCallback` using `this.shadowRoot.querySelector`.
