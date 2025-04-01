# Interactive Elements Library Documentation

## Overview

This document outlines how to create and integrate new interactive learning elements into the study guide system. The system uses standard Web Components to ensure elements are reusable, render inline with study guide content, and maintain style/script isolation via the Shadow DOM.

Authors insert these elements into the TinyMCE editor using a simple shortcode format: `[interactive name="your-element-name"]`. The `StudyGuideViewer` component automatically processes these shortcodes, loads the necessary element definition, and renders the corresponding Web Component.

## Directory Structure

All interactive elements reside within the `v2/public/interactive-elements/` directory. Each element requires its own folder and specific files:

```
v2/public/interactive-elements/
├── elements.json         # Registry of all available elements
└── your-element-name/    # Folder for your specific element (use kebab-case)
    ├── index.js          # Main JS file defining the Web Component (MUST be named index.js).
    └── thumbnail.png     # Preview image for the TinyMCE picker (e.g., 100x100px)
    # (index.html and styles.css are now embedded within the JS file's template)
```

## Creating a New Element (Step-by-Step)

1.  **Choose a Name:**
    *   Select a unique, descriptive name for your element using **kebab-case** (e.g., `wifi-channels`, `circuit-builder`).
    *   This name will be used for the folder and the shortcode (`[interactive name="your-element-name"]`).
    *   The custom HTML tag will be automatically derived as `<your-element-name-simulator>`.

2.  **Create Folder:**
    *   Create a new directory inside `v2/public/interactive-elements/` using your chosen name: `v2/public/interactive-elements/your-element-name/`.

3.  **Create JavaScript File (`index.js`):**
    *   Create a file named exactly `index.js` inside the element's folder. This is the core file where you define the element's behavior and appearance as a Web Component.
    *   **Define the Class:** Create a class that extends `HTMLElement`.
    *   **Define Template:** Inside the class (or outside), create an HTML `<template>` string containing:
        *   A `<style>` tag with all the CSS needed for your element. Using the Shadow DOM (step below) will automatically scope these styles.
        *   The HTML structure for your element (divs, canvases, buttons, etc.). Use IDs for elements that need to be accessed by JavaScript.
    *   **Constructor & Shadow DOM:** In the class constructor, call `super()`, then attach a Shadow DOM in `open` mode and append a clone of your template's content to it:
        ```javascript
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(yourElementTemplate.content.cloneNode(true));
            // Initialize any instance variables here
            this.simulatorInstance = null;
        }
        ```
    *   **`connectedCallback`:** This method is called when the element is added to the DOM. Use it to:
        *   Get references to elements within the Shadow DOM using `this.shadowRoot.getElementById(...)` or `this.shadowRoot.querySelector(...)`.
        *   Instantiate any necessary classes (like the `FiberFaultSimulator` class).
        *   Add event listeners to elements within the Shadow DOM.
    *   **Encapsulate Logic:** Move all JavaScript logic related to the element's functionality into methods within this class.
    *   **Register the Element:** At the very end of the file, define the custom HTML tag. Use the convention `your-element-name-simulator` (or similar suffix if 'simulator' isn't appropriate).
        ```javascript
        // IMPORTANT: Tag name MUST follow the pattern: {folder-name}-simulator
        customElements.define('your-element-name-simulator', YourElementNameElement);
        ```
    *   **Example:** Refer to `v2/public/interactive-elements/fiber-fault/index.js` for a complete example (`FiberFaultElement` class).

4.  **Create Thumbnail (`thumbnail.png`):**
    *   Create a small preview image (e.g., 100x100 pixels) representing your element.
    *   Save it as `thumbnail.png` (or `.jpg`, `.gif`) inside your element's folder (`v2/public/interactive-elements/your-element-name/`).

5.  **Register in `elements.json`:**
    *   Open the main registry file: `v2/public/interactive-elements/elements.json`.
    *   Add a new JSON object to the array for your element, following this structure:
        ```json
        {
          "name": "your-element-name", // Matches folder name, used in shortcode
          "path": "your-element-name/", // Relative path to the element's folder
          "title": "Your Element Title",  // User-friendly name for the TinyMCE picker
          "description": "A brief description of what the element does.",
          "thumbnailUrl": "/interactive-elements/your-element-name/thumbnail.png" // Path to the thumbnail
        }
        ```
    *   Ensure your entry is added correctly within the JSON array (e.g., add a comma after the preceding element if needed).

## Integration Details (How it Works)

1.  **Shortcode Insertion:** The author uses the "Interactives" button in TinyMCE, which reads `elements.json` to display the picker. Selecting an element inserts the corresponding shortcode (e.g., `[interactive name="your-element-name"]`) into the editor content.
2.  **Viewer Processing:** When a study guide is viewed, the `StudyGuideViewer` component receives the full HTML content.
3.  **Tag Replacement:** The `processContentForWebComponents` function finds all `[interactive name="..."]` shortcodes and replaces them with the corresponding custom HTML tags following the convention `<your-element-name-simulator></your-element-name-simulator>`.
4.  **Script Injection:** The `useEffect` hook in `StudyGuideViewer` identifies which unique elements are needed based on the shortcodes found in the *original* content. For each required element, it injects a `<script>` tag pointing to that element's standardized JavaScript definition file (`/interactive-elements/your-element-name/index.js`) into the main viewer iframe's body.
5.  **Component Rendering:** When the browser parses the HTML containing the custom tag (e.g., `<your-element-name-simulator>`) *and* the corresponding `index.js` definition has been loaded and executed via the injected script, the browser automatically calls the Web Component's constructor and `connectedCallback`, rendering the element and running its logic.

## Best Practices

*   **Self-Contained:** Design your element to be as independent as possible. Avoid relying on global variables or styles from the parent page.
*   **Shadow DOM:** Always use the Shadow DOM (`attachShadow({ mode: 'open' })`) to encapsulate your element's internal structure and styles. This is crucial for preventing CSS conflicts.
*   **Clear Naming:** Use descriptive, kebab-case names for folders, files, and the custom element tag.
*   **Performance:** Optimize images and JavaScript for faster loading.
*   **Accessibility:** Ensure your element is accessible (keyboard navigation, ARIA attributes if necessary).
*   **Thumbnail/Description:** Provide a clear thumbnail and concise description for the TinyMCE picker.
