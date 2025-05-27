export const styles = `
    /* CSS Variables for theming */
    :host {
        /* Light mode variables */
        --text-color-light: #495057;
        --border-color-light: #dee2e6;
        --bg-color-light: var(--custom-primary-bg-color, #ffffff);
        --component-bg-light: var(--custom-secondary-bg-color, #f8f9fa);
        --component-border-light: #e9ecef;
        --component-hover-border-light: #007bff;
        --component-hover-shadow-light: rgba(0,123,255,0.15);
        --primary-color-light: var(--color-primary, #0f766e);
        --primary-color-rgb-light: 15,118,110;
        --primary-hover-light: var(--primary-dark, #0c5e57);
        --secondary-color-light: var(--color-secondary, #7e22ce);
        --secondary-hover-light: #6b1f9e;
        --success-color-light: #28a745;
        --error-color-light: #dc3545;
        --drop-zone-bg-light: var(--custom-secondary-bg-color, rgba(248,249,250,0.8));
        --drop-zone-empty-light: #adb5bd;
        --preview-bg-light: linear-gradient(to bottom, #ffffff, #f8f9fa);
        --preview-color-light: #000;
        --tutorial-bg-light: var(--custom-secondary-bg-color, #ffffff);
        --tutorial-border-light: rgba(0, 0, 0, 0.1);
        --tutorial-shadow-light: rgba(0,0,0,0.15);
        --tutorial-header-bg-light: linear-gradient(to right, #f8f9fa, #ffffff);
        --accent-color-light: var(--custom-button-color, var(--secondary-hover));
        --accent-bg-light: var(--custom-secondary-bg-color, rgba(107, 31, 158, 0.1));

        /* Dark mode variables */
        --text-color-dark: #e2e8f0;
        --border-color-dark: #4a5568;
        --bg-color-dark: var(--custom-primary-bg-color, #1a202c);
        --component-bg-dark: var(--custom-secondary-bg-color, #2d3748);
        --component-border-dark: #4a5568;
        --component-hover-border-dark: #4299e1;
        --component-hover-shadow-dark: rgba(66, 153, 225, 0.3);
        --primary-color-dark: var(--color-primary, #14b8a6);
        --primary-color-rgb-dark: 20,184,166;
        --primary-hover-dark: var(--primary-light, #0f766e);
        --secondary-color-dark: var(--color-secondary, #a855f7);
        --secondary-hover-dark: #9333ea;
        --success-color-dark: #48bb78;
        --error-color-dark: #fc8181;
        --drop-zone-bg-dark: var(--custom-secondary-bg-color, rgba(26, 32, 44, 0.8));
        --drop-zone-empty-dark: #718096;
        --preview-bg-dark: linear-gradient(to bottom, #2b2b2b, #1a1a1a);
        --preview-color-dark: #fff;
        --tutorial-bg-dark: var(--custom-secondary-bg-color, #2d3748);
        --tutorial-border-dark: rgba(255, 255, 255, 0.2);
        --tutorial-shadow-dark: rgba(0,0,0,0.3);
        --tutorial-header-bg-dark: linear-gradient(to right, #1a202c, #2d3748);
        --accent-color-dark: var(--custom-button-color, var(--secondary-hover));
        --accent-bg-dark: var(--custom-secondary-bg-color, rgba(147, 51, 234, 0.1));

        /* Default to light mode */
        --text-color: var(--text-color-light);
        --border-color: var(--border-color-light);
        --bg-color: var(--bg-color-light);
        --component-bg: var(--component-bg-light);
        --component-border: var(--component-border-light);
        --component-hover-border: var(--component-hover-border-light);
        --component-hover-shadow: var(--component-hover-shadow-light);
        --primary-color: var(--primary-color-light);
        --primary-color-rgb: var(--primary-color-rgb-light);
        --primary-hover: var(--primary-hover-light);
        --secondary-color: var(--secondary-color-light);
        --secondary-hover: var(--secondary-hover-light);
        --success-color: var(--success-color-light);
        --error-color: var(--error-color-light);
        --drop-zone-bg: var(--drop-zone-bg-light);
        --drop-zone-empty: var(--drop-zone-empty-light);
        --preview-bg: var(--preview-bg-light);
        --preview-color: var(--preview-color-light);
        --tutorial-bg: var(--tutorial-bg-light);
        --tutorial-border: var(--tutorial-border-light);
        --tutorial-shadow: var(--tutorial-shadow-light);
        --tutorial-header-bg: var(--tutorial-header-bg-light);
        --accent-color: var(--accent-color-light);
        --accent-bg: var(--accent-bg-light);

        /* Transitions for smooth theme switching */
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    /* Dark mode styles */
    :host(.dark-mode) {
        --text-color: var(--text-color-dark);
        --border-color: var(--border-color-dark);
        --bg-color: var(--bg-color-dark);
        --component-bg: var(--component-bg-dark);
        --component-border: var(--component-border-dark);
        --component-hover-border: var(--component-hover-border-dark);
        --component-hover-shadow: var(--component-hover-shadow-dark);
        --primary-color: var(--primary-color-dark);
        --primary-color-rgb: var(--primary-color-rgb-dark);
        --primary-hover: var(--primary-hover-dark);
        --secondary-color: var(--secondary-color-dark);
        --secondary-hover: var(--secondary-hover-dark);
        --success-color: var(--success-color-dark);
        --error-color: var(--error-color-dark);
        --drop-zone-bg: var(--drop-zone-bg-dark);
        --drop-zone-empty: var(--drop-zone-empty-dark);
        --preview-bg: var(--preview-bg-dark);
        --preview-color: var(--preview-color-dark);
        --tutorial-bg: var(--tutorial-bg-dark);
        --tutorial-border: var(--tutorial-border-dark);
        --tutorial-shadow: var(--tutorial-shadow-dark);
        --tutorial-header-bg: var(--tutorial-header-bg-dark);
        --accent-color: var(--accent-color-dark);
        --accent-bg: var(--accent-bg-dark);
    }

    /* Add transition classes */
    /* Cleaned up tutorial overlay: only one definition, no blur, no pointer-events, no background */
    .tutorial-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent !important;
        pointer-events: none !important;
        display: none;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        z-index: 1000;
    }
    .tutorial-overlay.visible {
        opacity: 1;
    }
    .tutorial-panel {
        pointer-events: auto;
        z-index: 1001;
    }

    .tutorial-panel {
        pointer-events: auto;
    }

    .tutorial-panel {
        background: var(--tutorial-bg);
        color: var(--text-color);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--tutorial-shadow);
        max-width: 400px;
        position: absolute;
        opacity: 0;
        transition: all 0.3s ease-in-out;
        pointer-events: auto;
        z-index: 1001;
    }

    .tutorial-panel.animated {
        transition: all 0.3s ease-in-out;
    }

    .tutorial-highlight {
        position: absolute;
        border: 2px solid var(--accent-color);
        border-radius: 4px;
        background: transparent;
        pointer-events: none;
        z-index: 1;
    }

    .tutorial-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border: 8px solid transparent;
    }

    .tutorial-arrow.left {
        left: -16px;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: var(--tutorial-bg);
    }

    .tutorial-arrow.right {
        right: -16px;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: var(--tutorial-bg);
    }

    .tutorial-arrow.top {
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: var(--tutorial-bg);
    }

    .tutorial-arrow.bottom {
        bottom: -16px;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: var(--tutorial-bg);
    }

    .completion-message {
        display: none;
        padding: 20px;
        background: var(--accent-bg);
        border-radius: 4px;
        margin-top: 20px;
        color: var(--accent-color);
        text-align: center;
        border: 1px solid var(--accent-color);
    }

    :host {
        display: block;
        font-family: Arial, sans-serif;
        background: var(--bg-color);
        color: var(--text-color);
        padding: 20px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 15px 0;
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    .container {
        max-width: 800px;
        margin: 0 auto;
        color: var(--text-color);
    }

    h2 {
        font-size: 1.5em;
        color: var(--custom-title-color, var(--text-color));
        margin: 0 0 20px 0;
        text-align: center;
        font-weight: 600;
        transition: color 0.3s ease;
    }

    .os-tabs {
        display: flex;
        justify-content: center; /* Added to center the tabs */
        gap: 12px;
        margin-bottom: 24px;
        background: var(--component-bg);
        padding: 6px;
        border-radius: 10px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        border: 1px solid var(--border-color);
    }

    .os-tab {
        padding: 10px 20px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        font-weight: 500;
        color: var(--custom-title-color, var(--text-color));
        position: relative;
        overflow: hidden;
    }

    .os-tab:hover:not(.active) {
        background: var(--custom-button-color, var(--primary-color));
        color: white;
    }

    .os-tab.active {
        background: var(--custom-button-color, var(--primary-color));
        color: white;
        box-shadow: 0 2px 4px var(--component-hover-shadow);
    }

    .command-area {
        background: var(--component-bg);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: box-shadow 0.3s ease;
    }

    .command-area:hover {
        box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    }

    .component-palette {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
        padding: 20px;
        background: var(--bg-color);
        border-radius: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        border: 1px solid var(--border-color);
    }

    .command-component {
        padding: 10px 16px;
        background: var(--component-bg);
        border: 1px solid var(--component-border);
        border-radius: 8px;
        cursor: move;
        user-select: none;
        text-align: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        font-size: 14px;
        color: var(--text-color);
        will-change: transform, box-shadow;
    }

    .command-component:hover {
        background: var(--component-bg);
        border-color: var(--custom-button-color, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--component-hover-shadow);
    }

    .command-component:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px var(--component-hover-shadow);
    }

    .drop-zone {
        min-height: 64px;
        border: 2px dashed var(--border-color);
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 8px;
        align-items: center;
        background: var(--drop-zone-bg);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        overflow-x: auto;
        scroll-behavior: smooth;
        position: relative;
        scrollbar-width: thin;
        scrollbar-color: var(--primary-color) var(--bg-color);
    }

    .drop-zone::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid transparent;
        border-radius: 12px;
        pointer-events: none;
        transition: all 0.2s ease;
    }

    .drop-zone:empty {
        justify-content: center;
    }

    .drop-zone:empty::after {
        content: 'Drag command components here';
        color: var(--drop-zone-empty);
        font-size: 14px;
        font-style: italic;
    }

    .drop-zone.drag-over {
        border-color: transparent;
        background: linear-gradient(to right, rgba(0,123,255,0.02), rgba(0,123,255,0.04));
    }

    .drop-zone.drag-over::before {
        border-color: var(--custom-button-color, var(--primary-color));
        box-shadow: 0 0 0 4px var(--component-hover-shadow);
    }

    .drop-zone.dragging {
        border-style: solid;
    }

    .drop-zone::-webkit-scrollbar {
        height: 6px;
    }

    .drop-zone::-webkit-scrollbar-track {
        background: var(--bg-color);
        border-radius: 3px;
    }

    .drop-zone::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        opacity: 0.3;
        border-radius: 3px;
        transition: background-color 0.3s ease;
    }

    .drop-zone::-webkit-scrollbar-thumb:hover {
        background: var(--primary-color);
        opacity: 0.5;
    }

    .preview {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 20px;
        margin-top: 24px;
        color: var(--preview-color);
        background: var(--preview-bg);
        border-radius: 10px;
        border: 1px solid var(--border-color);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        white-space: pre-wrap;
    }

    .placed-component {
        position: relative;
        z-index: 1;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        user-select: none;
        -webkit-user-select: none;
        background: var(--component-bg);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid var(--component-border);
        margin: 0 4px;
        font-size: 14px;
        color: var(--text-color);
        cursor: grab;
        width: fit-content;
        min-width: 60px;
        will-change: transform, opacity;
        touch-action: none;
        -webkit-touch-callout: none;
    }

    .placed-component * {
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
    }

    .placed-component .remove-btn {
        pointer-events: auto;
        cursor: pointer;
    }

    .placed-component:active,
    .placed-component.grabbing {
        cursor: grabbing !important;
        transform: scale(1.05);
        z-index: 10;
    }

    .placed-component:active {
        cursor: grabbing;
        transform: translateY(0) scale(0.98);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .placed-component.dragging {
        opacity: 0.3;
        pointer-events: none;
        transform: scale(0.95);
        transition: none;
    }

    .placed-component.preview {
        position: fixed;
        opacity: 1;
        background: var(--component-bg);
        border-color: var(--primary-color);
        cursor: grabbing;
        z-index: 1000;
        transform: scale(1.05);
        box-shadow: 0 8px 16px var(--component-hover-shadow);
        pointer-events: none;
        transition: none;
    }

    .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 12px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(220, 53, 69, 0.1);
        color: var(--error-color);
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        transition: all 0.2s ease;
        opacity: 0.6;
    }

    .placed-component:hover .remove-btn {
        opacity: 1;
    }

    .remove-btn:hover {
        background: rgba(220, 53, 69, 0.2);
        color: var(--error-color);
        transform: scale(1.1);
    }

    .remove-btn:active {
        transform: scale(0.95);
    }

    .validation-message {
        margin-top: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.5;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .validation-message.error {
        background: linear-gradient(to right, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
        border: 1px solid rgba(220, 53, 69, 0.2);
        color: var(--error-color);
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
    }

    .validation-message.success {
        background: var(--accent-bg);
        border: 1px solid var(--accent-color);
        color: var(--accent-color);
        box-shadow: 0 2px 8px var(--accent-bg);
    }

    .output-preview {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 20px;
        margin-top: 24px;
        color: var(--preview-color);
        background: var(--preview-bg);
        border-radius: 10px;
        border: 1px solid var(--border-color);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        white-space: pre-wrap;
    }

    @media (max-width: 600px) {
        .os-tabs {
            flex-direction: column;
        }

        .component-palette {
            grid-template-columns: repeat(2, 1fr);
        }
    }


    .tutorial-panel {
        position: fixed;
        background: var(--tutorial-bg);
        color: var(--text-color);
        padding: 24px;
        border-radius: 12px;
        width: 320px;
        box-shadow: 0 12px 32px var(--tutorial-shadow),
                  0 4px 12px rgba(0,0,0,0.15),
                  0 0 0 1px var(--border-color);
        pointer-events: auto;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        opacity: 0;
        transition: opacity 0.3s ease-out,
                  transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 0.3s ease-out;
        z-index: 1001;
        will-change: transform, opacity;
    }

    .tutorial-panel[style*="opacity: 1"] {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 16px 48px var(--tutorial-shadow),
                  0 8px 24px rgba(0,0,0,0.15),
                  0 0 0 1px var(--border-color);
    }

    .tutorial-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
    }

    .tutorial-arrow::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
    }

    .tutorial-arrow.right {
        border-width: 12px 0 12px 12px;
        border-color: transparent transparent transparent var(--tutorial-bg);
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
    }

    .tutorial-arrow.left {
        border-width: 12px 12px 12px 0;
        border-color: transparent var(--tutorial-bg) transparent transparent;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
    }

    .tutorial-arrow.top {
        border-width: 0 12px 12px 12px;
        border-color: transparent transparent var(--tutorial-bg) transparent;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
    }

    .tutorial-arrow.bottom {
        border-width: 12px 12px 0 12px;
        border-color: var(--tutorial-bg) transparent transparent transparent;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
    }

    .tutorial-highlight {
        position: absolute;
        pointer-events: none;
        border-radius: 4px;
        box-shadow: 0 0 0 2px var(--accent-color), 0 0 10px rgba(0,0,0,0.2);
        z-index: 999;
        opacity: 0;
        animation: highlight-fade 0.3s ease-out forwards;
    }

    @keyframes highlight-fade {
        0% {
            opacity: 0;
            transform: scale(1.1);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }

    .tutorial-panel.animated {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tutorial-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: -24px -24px 20px -24px;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-color);
        background: var(--tutorial-header-bg);
    }

    .tutorial-header h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
    }

    .tutorial-button#close-tutorial {
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
        font-size: 20px;
        line-height: 1;
        background: transparent;
        color: var(--accent-color);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: -8px -12px -8px 0;
    }

    .tutorial-button#close-tutorial:hover {
        background: var(--bg-color);
        color: var(--text-color);
        transform: rotate(90deg);
    }

    .tutorial-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
    }

.tutorial-nav {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    margin-top: 10px;
    position: relative;
}

.auto-progress-note {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8em;
    color: var(--accent-color);
    white-space: nowrap;
}

    .tutorial-button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        background: var(--custom-button-color, var(--primary-color));
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
        font-size: 14px;
        line-height: 1.2;
        letter-spacing: 0.3px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tutorial-button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--component-hover-shadow);
    }

    .tutorial-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tutorial-button:disabled {
        background: var(--border-color);
        cursor: not-allowed;
    }

    .tutorial-button:not(:disabled):hover {
        background: var(--primary-hover);
    }

    .tutorial-button.secondary {
        background: var(--secondary-color);
    }

    .tutorial-button.secondary:hover {
        background: var(--secondary-hover);
    }

    .tutorial-progress {
        display: flex;
        gap: 8px;
        margin: 16px 0;
        justify-content: center;
        align-items: center;
    }

    .step-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--border-color);
        border: 2px solid transparent;
        transition: all 0.3s ease;
        position: relative;
        cursor: pointer;
    }

    .step-indicator:hover {
        transform: scale(1.2);
    }

    .step-indicator::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: var(--component-bg);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.2s ease;
    }

    .step-indicator.active {
        background: var(--accent-color);
        border-color: var(--accent-color);
        transform: scale(1.2);
    }

    .step-indicator.active::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .step-indicator.completed {
        background: var(--accent-color);
        border-color: var(--accent-color);
    }

    .tutorial-hint {
        position: relative;
        margin-top: 20px;
        padding: 16px 16px 16px 48px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-left: 4px solid var(--accent-color);
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-color);
        box-shadow: 0 2px 8px var(--tutorial-shadow);
        transition: all 0.2s ease;
    }

    .tutorial-hint:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--tutorial-shadow);
    }

    .tutorial-hint::before {
        content: '💡';
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 20px;
        opacity: 0.8;
    }

    .completion-message {
        display: none;
        padding: 16px;
        background: var(--accent-bg);
        border: 1px solid var(--accent-color);
        color: var(--accent-color);
        border-radius: 8px;
        margin-top: 20px;
        font-weight: 500;
        text-align: center;
        box-shadow: 0 2px 8px var(--tutorial-shadow);
        animation: message-appear 0.3s ease-out forwards;
    }

    @keyframes message-appear {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .mode-toggle {
        position: relative;
        width: 100%; /* Takes full width of parent */
        box-sizing: border-box; /* Ensure padding and border are included in width */
        margin-bottom: 20px;
        padding: 0 24px 24px 24px; /* Removed top padding */
        background: var(--component-bg);
        border-radius: 12px; /* Matches command-area */
        border: 1px solid var(--border-color); /* Matches command-area */
        box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* Matches command-area */
    }

    .tutorial-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 12px;
        width: 100%;
    }

    .tutorial-grid .tutorial-button {
        width: 100%;
        text-align: center;
        padding: 8px 6px;
        background: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        opacity: 1;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
    }

    .tutorial-grid .tutorial-button:hover {
        background: var(--bg-color);
        border-color: var(--custom-button-color, var(--primary-color));
        color: var(--custom-button-color, var(--primary-color));
        transform: translateY(-2px);
        box-shadow: 0 4px 8px var(--component-hover-shadow);
    }

    .tutorial-entry-wrapper {
        position: relative;
    }

    .tutorial-entry-wrapper .tutorial-sub-buttons {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 10;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        margin-top: 4px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 4px 8px var(--component-hover-shadow);
    }

    .tutorial-entry-wrapper .tutorial-sub-buttons .tutorial-button {
        margin: 0 0 8px 0 !important;
        width: 100%;
    }

    .tutorial-entry-wrapper .tutorial-sub-buttons .tutorial-button:last-child {
        margin-bottom: 0 !important;
    }

    .instruction-label {
        font-weight: 600; /* Semi-bold */
        margin-bottom: 8px;
        color: var(--custom-title-color, var(--primary-color)); /* Use custom title color or primary color */
        padding-left: 4px; /* Align slightly with tabs/buttons */
        text-align: center; /* Center the text */
        transition: color 0.3s ease; /* Smooth color transitions */
    }

    .drop-zone-tutorial-target {
        border-style: solid; /* Change from dashed to solid */
        border-color: var(--custom-button-color, var(--primary-color)); /* Use highlight color */
        box-shadow: 0 0 8px var(--component-hover-shadow); /* Add a subtle glow */
    }

    .placed-component {
        position: relative;
        z-index: 1;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        background: var(--component-bg);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        margin: 0 4px;
        font-size: 14px;
        color: var(--text-color);
        cursor: grab;
        width: fit-content;
        min-width: 60px;
        will-change: transform;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        -webkit-user-drag: element;
        /* Ensure the entire component is draggable */
        pointer-events: auto !important;
    }

    .placed-component * {
        user-select: none;
        -webkit-user-select: none;
    }

    .placed-component .component-content {
        pointer-events: none !important;
        flex-grow: 1;
        margin-right: 8px;
    }

    .placed-component .remove-btn {
        pointer-events: auto;
        cursor: pointer;
        opacity: 0.6;
        margin-left: 8px;
        z-index: 2;
    }

    .placed-component:hover:not(.dragging) {
        background: var(--bg-color);
        border-color: var(--custom-button-color, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--component-hover-shadow);
        z-index: 2;
    }

    .placed-component:active,
    .placed-component.grabbing {
        cursor: grabbing !important;
        transform: scale(1.02);
        z-index: 10;
    }

    .placed-component.dragging {
        opacity: 0.3;
        pointer-events: none;
        transform: scale(0.95);
        transition: none;
    }

    .placed-component.snap-target {
        border-color: var(--custom-button-color, var(--primary-color));
        background: rgba(var(--primary-color-rgb), 0.1);
        transform: scale(1.05);
        box-shadow: 0 0 0 2px var(--component-hover-shadow);
        z-index: 3;
    }

    .placed-component.preview {
        position: fixed;
        opacity: 1;
        background: var(--component-bg);
        border: 2px solid var(--primary-color);
        box-shadow: 0 8px 16px var(--component-hover-shadow);
        transform: scale(1.05);
        z-index: 1000;
        pointer-events: none;
        transition: opacity 0.15s ease-out, transform 0.15s ease-out;
    }

    .drag-placeholder {
        width: 3px;
        height: 24px;
        background: var(--custom-button-color, var(--primary-color));
        border-radius: 2px;
        margin: 0 2px;
        opacity: 0;
        transition: opacity 0.15s ease-out;
        box-shadow: 0 0 8px var(--component-hover-shadow);
    }

    .drag-placeholder.visible {
        opacity: 1;
    }

    @keyframes placeholder-pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
    }

    .placeholder-animate {
        animation: placeholder-pulse 1s ease-in-out infinite;
    }

    .placed-component:hover:not(.dragging) {
        background: var(--bg-color);
        border-color: var(--custom-button-color, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--component-hover-shadow);
        z-index: 2;
    }

    .placed-component.dragging {
        opacity: 0.5;
        pointer-events: none;
        transform: scale(0.95);
        transition: none;
        border: 1px dashed var(--custom-button-color, var(--primary-color));
        background: rgba(var(--primary-color-rgb), 0.05);
    }

    .placed-component.preview {
        position: fixed;
        opacity: 1;
        background: var(--component-bg);
        border-color: var(--custom-button-color, var(--primary-color));
        cursor: grabbing;
        z-index: 1000;
        transform: scale(1.05);
        box-shadow: 0 8px 16px var(--component-hover-shadow);
        pointer-events: none;
        transition: none;
    }

    .placed-component.snap-target {
        transform: scale(1.05);
        border-color: var(--custom-button-color, var(--primary-color));
        box-shadow: 0 0 8px var(--component-hover-shadow);
        background: rgba(var(--primary-color-rgb), 0.1);
        z-index: 5;
    }

    @keyframes placeholder-slide {
        0% {
            transform: scaleY(0.5);
            opacity: 0.5;
        }
        50% {
            transform: scaleY(1);
            opacity: 1;
        }
        100% {
            transform: scaleY(0.5);
            opacity: 0.5;
        }
    }

    .placeholder-animate {
        animation: placeholder-slide 1s ease-in-out infinite;
    }

    .drag-placeholder {
        flex-shrink: 0;
        width: 3px;
        height: 24px;
        background: var(--custom-button-color, var(--primary-color));
        border-radius: 1.5px;
        pointer-events: none;
        position: relative;
        margin: 0 4px;
        opacity: 0;
        box-shadow: 0 0 6px var(--component-hover-shadow);
        transition: opacity 0.15s ease-out;
    }

    .drag-placeholder.visible {
        opacity: 1;
    }

    .drop-zone-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .drop-zone.dragging .drop-zone-grid {
        opacity: 0.5;
    }

    .grid-slot {
        flex: 1;
        border-right: 1px dashed rgba(var(--primary-color-rgb), 0.2);
    }

    .grid-slot:last-child {
        border-right: none;
    }
`;
