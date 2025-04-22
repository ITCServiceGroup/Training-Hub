# GrapesJS Integration Plan

## Objective

Evaluate GrapesJS as a potential replacement for the existing TinyMCE-based `StudyGuideEditor` component for creating and editing study guide content.

## Approach

Instead of integrating GrapesJS alongside TinyMCE within the existing component, we will create a completely new, separate component (`ContentEditor`) dedicated to GrapesJS. We will temporarily replace the usage of `StudyGuideEditor` with `ContentEditor` to allow for a clean evaluation environment.

Based on the evaluation, we will either:
1.  Adopt GrapesJS: Remove the old `StudyGuideEditor`, its related utilities/configurations, TinyMCE assets, and TinyMCE dependencies.
2.  Revert to TinyMCE: Remove the new `ContentEditor`, GrapesJS dependencies, and revert the component usage back to `StudyGuideEditor`.

## Implementation Steps

1.  **Install Dependencies:**
    *   Add `grapesjs` to the project: `npm install grapesjs`
    *   Consider adding `grapesjs-preset-webpage` for basic blocks: `npm install grapesjs-preset-webpage` (Optional, can be decided during implementation).

2.  **Create `ContentEditor` Component:**
    *   Create directory: `v2/src/pages/admin/components/ContentEditor/`
    *   Create file: `v2/src/pages/admin/components/ContentEditor/index.jsx`
    *   **Props:** The component should accept props similar to `StudyGuideEditor`:
        *   `initialContent` (string): The full initial HTML content.
        *   `initialTitle` (string): The initial study guide title.
        *   `onSave` (function): Callback function triggered on save. Should receive an object like `{ title: string, content: string }`.
        *   `onCancel` (function): Callback function triggered on cancel.
        *   `onDelete` (function): Callback function triggered on delete.
        *   `isNew` (boolean): Flag indicating if it's a new study guide.
    *   **Structure:**
        *   Include UI elements for Title input, Save, Save & Continue, Cancel, and Delete buttons, mirroring the layout of `StudyGuideEditor`.
        *   Include a dedicated `div` element to serve as the mount point for the GrapesJS editor canvas.
    *   **Initialization:** Use a `useEffect` hook to initialize the GrapesJS editor instance when the component mounts, targeting the dedicated `div`. Ensure proper cleanup (`editor.destroy()`) on component unmount.

3.  **Basic GrapesJS Configuration (within `ContentEditor/index.jsx`):**
    *   **Core:** Initialize GrapesJS. Use `grapesjs-preset-webpage` if installed.
    *   **Storage Manager:**
        *   Configure it to *not* use local storage (`storageManager: { autoload: false, autosave: false, type: null }`).
        *   Load `initialContent` into the editor upon initialization (`editor.setComponents(initialContent)` or potentially using `editor.loadProjectData` if handling CSS/styles separately).
        *   Implement the `onSave` logic: When the save button is clicked, retrieve the full HTML (`editor.getHtml()`) and CSS (`editor.getCss()`), combine them appropriately (e.g., placing CSS in a `<style>` tag within the `<head>`), and call the `onSave` prop with the title and the combined HTML string.
    *   **Asset Manager:** Initially, use the default GrapesJS Asset Manager. Integration with the custom `MediaSelectionModal` can be explored later if the default proves insufficient.
    *   **Preview:** Utilize the built-in GrapesJS preview command (`editor.runCommand('core:preview')`).

4.  **Handle Interactive Elements (`[interactive name="..."]`):**
    *   **Goal:** Represent these shortcodes within the editor and ensure they serialize back correctly.
    *   **Method 1 (Shortcode Placeholder):**
        *   Define a custom GrapesJS component (e.g., `interactive-placeholder`).
        *   Use GrapesJS's parser features or `editor.addComponentsHook` to detect the `[interactive name="..."]` shortcode pattern when loading content and replace it with the custom component instance, storing the `name` attribute.
        *   Render the component visually as a non-editable placeholder (e.g., a styled `div` showing `[Interactive: ${name}]`).
        *   Configure the component's `toHTML` method (or use `editor.getComponentsHook`) to ensure it serializes back to the exact `[interactive name="..."]` shortcode string during the save process (`editor.getHtml()`).
    *   **Method 2 (Direct Rendering - Exploration):**
        *   Investigate if the interactive elements (which seem to be web components or custom elements based on file structure) can be directly registered and rendered within the GrapesJS canvas. This would provide a true WYSIWYG experience for them. This requires understanding how the interactives are initialized and rendered.

5.  **Handle Theming:**
    *   Use the `useTheme` hook from `ThemeContext` within `ContentEditor`.
    *   **Editor UI:** Set the GrapesJS configuration `theme` option based on the context value (`'dark'` or `'light'`). (Note: GrapesJS might require specific theme plugins or configurations).
    *   **Canvas Content:** Load theme-specific styles into the GrapesJS canvas (`editor.Canvas.addStyle(...)` or via configuration). Adapt `v2/public/tinymce/content-dark.css` and `content-light.css` or create new GrapesJS-specific theme stylesheets. Ensure content created (text colors, backgrounds) respects the theme.

6.  **Handle HTML Structure Preservation:**
    *   **Requirement:** Ensure that existing `<style>` tags (potentially containing theme overrides or custom CSS) and `<script>` tags within the `initialContent`'s `<head>` or `<body>` are preserved and included in the final HTML output when saving.
    *   **Verification:** Test loading content with existing styles/scripts and check the output of `editor.getHtml()`.
    *   **Mitigation (if needed):** If GrapesJS strips or modifies these, implement logic to:
        *   Extract `<style>` and `<script>` tags from `initialContent` before loading into GrapesJS.
        *   Re-inject these extracted tags into the correct positions (`<head>`, `<body>`) in the HTML string generated by `editor.getHtml()` before calling `onSave`.

7.  **Replace `StudyGuideEditor` Usage:**
    *   Identify parent component(s) currently rendering `<StudyGuideEditor>`. (Requires code search/analysis - likely within admin pages).
    *   Modify these parent components:
        *   Change the import from `StudyGuideEditor` to `ContentEditor`.
        *   Render `<ContentEditor ... />` instead of `<StudyGuideEditor ... />`, passing the same props.

8.  **Evaluation and Cleanup:**
    *   Thoroughly test the `ContentEditor` functionality, focusing on:
        *   Content creation and editing experience.
        *   Image handling.
        *   Interactive element handling (placeholder or direct rendering).
        *   Theming consistency.
        *   Saving and loading content, ensuring data integrity and preservation of structure.
        *   Preview functionality.
    *   **Decision:** Based on the evaluation, decide whether to keep GrapesJS or revert to TinyMCE.
    *   **Cleanup:** Perform the corresponding cleanup steps outlined in the "Approach" section.

## Key Considerations / Risks

*   **Interactives Handling:** Accurately parsing, representing, and serializing the shortcodes (or achieving direct rendering) is critical.
*   **HTML Structure Preservation:** Ensuring existing styles and scripts aren't lost during the editing/saving process is vital for maintaining study guide integrity.
*   **Theming:** Achieving consistent theme application both in the editor UI and the rendered content canvas might require careful configuration or custom CSS.
*   **Feature Parity:** While some TinyMCE custom features (like the image grid) are deemed unnecessary, ensure GrapesJS provides adequate replacements for essential functionality (like basic image alignment, text formatting, etc.).

## Progress & Issues Log

*   **Initial Setup:** Created `ContentEditor` component, installed `grapesjs` and `grapesjs-preset-webpage` via npm, replaced `StudyGuideEditor` usage in `v2/src/pages/admin/StudyGuides.jsx`.
*   **Attempt 1 (npm imports):** Used standard npm imports in `ContentEditor`. Initially failed, but worked after clearing Vite cache (`node_modules/.vite`) and restarting the dev server. **Outcome:** Editor loaded correctly, but user preferred a local file setup for more control.
*   **Attempt 2 (Local Pre-built Files):**
    *   Copied `grapes.min.js`, `grapes.min.css`, `grapesjs-preset-webpage.min.js` (downloaded from unpkg) to `v2/public/grapesjs/`.
    *   Loaded these via `<script>`/`<link>` tags in `v2/index.html`.
    *   Modified `ContentEditor` to use `window.grapesjs` and specified preset plugin `['gjs-preset-webpage']`.
    *   **Outcome:** Failed. Console showed "Plugin gjs-preset-webpage not found" and CSP error for Font Awesome CDN.
*   **Attempt 3 (Local Pre-built + Explicit Plugin Load):**
    *   Same as Attempt 2, but explicitly called `editor.plugins.add('gjs-preset-webpage')` after `grapesjs.init`.
    *   **Outcome:** Failed. Same errors persisted.
*   **Attempt 4 (Local Pre-built + Disable Preset Icons):**
    *   Same as Attempt 3, but added `usePluginIcons: false` to `pluginsOpts` for the preset.
    *   **Outcome:** Failed. Same errors persisted.
*   **Attempt 5 (Build from Source - Blocked):**
    *   User downloaded source code zip (`grapesjs-0.22.6.zip`).
    *   `npm install` in root failed (`ERESOLVE`).
    *   `npm install --legacy-peer-deps` in root succeeded.
    *   `npm run build` / `pnpm build` in root failed (requires `pnpm`).
    *   Installed `pnpm` globally (`npm install -g pnpm`).
    *   `pnpm build` in root failed (missing dependencies `documentation`, `webpack` for sub-packages).
    *   Attempted build within `packages/core`: `npm install --legacy-peer-deps` failed (`EUNSUPPORTEDPROTOCOL` for `workspace:`).
    *   **Outcome:** Building from source proved problematic due to workspace/dependency setup.
*   **Attempt 6 (Local Pre-built + setTimeout):**
    *   Reverted to using the pre-built files from Attempt 2 (verified present in `v2/public/grapesjs/`).
    *   Ensured `index.html` loads local CSS/JS files correctly.
    *   Modified `ContentEditor` to use `window.grapesjs`, specify preset `['gjs-preset-webpage']`, keep `usePluginIcons: false`, and **wrap `window.grapesjs.init(...)` in `setTimeout(..., 0)`**.
    *   **Outcome:** Pending test. This is the current approach.
