export const styles = `
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
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
        border: 2px solid #4CAF50;
        border-radius: 4px;
        background: rgba(76, 175, 80, 0.1);
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
        border-right-color: white;
    }

    .tutorial-arrow.right {
        right: -16px;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: white;
    }

    .tutorial-arrow.top {
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: white;
    }

    .tutorial-arrow.bottom {
        bottom: -16px;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: white;
    }

    .completion-message {
        display: none;
        padding: 20px;
        background: #E8F5E9;
        border-radius: 4px;
        margin-top: 20px;
        color: #2E7D32;
        text-align: center;
    }

    :host {
        display: block;
        font-family: Arial, sans-serif;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .container {
        max-width: 800px;
        margin: 0 auto;
    }

    .os-tabs {
        display: flex;
        justify-content: center; /* Added to center the tabs */
        gap: 12px;
        margin-bottom: 24px;
        background: #f1f3f5;
        padding: 6px;
        border-radius: 10px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
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
        color: #495057;
        position: relative;
        overflow: hidden;
    }

    .os-tab:hover:not(.active) {
        background: rgba(0,123,255,0.1);
        color: #007bff;
    }

    .os-tab.active {
        background: #007bff;
        color: white;
        box-shadow: 0 2px 4px rgba(0,123,255,0.2);
    }

    .command-area {
        background: #fff;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid rgba(222, 226, 230, 0.6);
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
        background: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
        border-radius: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        border: 1px solid #dee2e6;
    }

    .command-component {
        padding: 10px 16px;
        background: linear-gradient(to bottom, #ffffff, #f8f9fa);
        border: 1px solid #e9ecef;
        border-radius: 8px;
        cursor: move;
        user-select: none;
        text-align: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        font-size: 14px;
        color: #495057;
        will-change: transform, box-shadow;
    }

    .command-component:hover {
        background: linear-gradient(to bottom, #f8f9fa, #ffffff);
        border-color: #007bff;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,123,255,0.15);
    }

    .command-component:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,123,255,0.1);
    }

    .drop-zone {
        min-height: 64px;
        border: 2px dashed #dee2e6;
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 8px;
        align-items: center;
        background: linear-gradient(to right, rgba(248,249,250,0.8), rgba(255,255,255,0.8));
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        overflow-x: auto;
        scroll-behavior: smooth;
        position: relative;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 123, 255, 0.5) #f1f1f1;
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
        color: #adb5bd;
        font-size: 14px;
        font-style: italic;
    }

    .drop-zone.drag-over {
        border-color: transparent;
        background: linear-gradient(to right, rgba(0,123,255,0.02), rgba(0,123,255,0.04));
    }

    .drop-zone.drag-over::before {
        border-color: #007bff;
        box-shadow: 0 0 0 4px rgba(0,123,255,0.1);
    }

    .drop-zone.dragging {
        border-style: solid;
    }

    .drop-zone::-webkit-scrollbar {
        height: 6px;
    }

    .drop-zone::-webkit-scrollbar-track {
        background: #f8f9fa;
        border-radius: 3px;
    }

    .drop-zone::-webkit-scrollbar-thumb {
        background: rgba(0, 123, 255, 0.3);
        border-radius: 3px;
        transition: background-color 0.3s ease;
    }

    .drop-zone::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 123, 255, 0.5);
    }

    .preview {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 20px;
        margin-top: 24px;
        color: #fff;
        background: linear-gradient(to bottom, #2b2b2b, #1a1a1a);
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
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
        background: linear-gradient(to right, #f8f9fa, #ffffff);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #dee2e6;
        margin: 0 4px;
        font-size: 14px;
        color: #495057;
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
        background: #ffffff;
        border-color: #007bff;
        cursor: grabbing;
        z-index: 1000;
        transform: scale(1.05);
        box-shadow: 0 8px 16px rgba(0,123,255,0.2);
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
        color: #dc3545;
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
        color: #dc3545;
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
        background: linear-gradient(to right, #f8d7da, #ffe6e6);
        border: 1px solid rgba(220, 53, 69, 0.2);
        color: #721c24;
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
    }

    .validation-message.success {
        background: linear-gradient(to right, #d4edda, #e8f5e9);
        border: 1px solid rgba(40, 167, 69, 0.2);
        color: #155724;
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
    }

    .output-preview {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 20px;
        margin-top: 24px;
        color: #fff;
        background: linear-gradient(to bottom, #2b2b2b, #1a1a1a);
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
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
        background: white;
        padding: 24px;
        border-radius: 12px;
        width: 320px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.25),
                  0 4px 12px rgba(0,0,0,0.15),
                  0 0 0 1px rgba(0,0,0,0.05);
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
        box-shadow: 0 16px 48px rgba(0,0,0,0.25),
                  0 8px 24px rgba(0,0,0,0.15),
                  0 0 0 1px rgba(0,0,0,0.05);
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
        border-color: transparent transparent transparent white;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
    }

    .tutorial-arrow.left {
        border-width: 12px 12px 12px 0;
        border-color: transparent white transparent transparent;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
    }

    .tutorial-arrow.top {
        border-width: 0 12px 12px 12px;
        border-color: transparent transparent white transparent;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
    }

    .tutorial-arrow.bottom {
        border-width: 12px 12px 0 12px;
        border-color: white transparent transparent transparent;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
    }

    .tutorial-highlight {
        position: absolute;
        pointer-events: none;
        border-radius: 4px;
        box-shadow: 0 0 0 2px #007bff, 0 0 10px rgba(0,123,255,0.3);
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
        border-bottom: 1px solid #e9ecef;
        background: linear-gradient(to right, #f8f9fa, #ffffff);
    }

    .tutorial-header h3 {
        font-size: 20px;
        font-weight: 600;
        color: #1a365d;
        margin: 0;
        background: linear-gradient(45deg, #1a365d, #2c5282);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .tutorial-button#close-tutorial {
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
        font-size: 20px;
        line-height: 1;
        background: transparent;
        color: #6c757d;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: -8px -12px -8px 0;
    }

    .tutorial-button#close-tutorial:hover {
        background: #f8f9fa;
        color: #343a40;
        transform: rotate(90deg);
    }

    .tutorial-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1a365d;
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
    color: #666;
    white-space: nowrap;
}

    .tutorial-button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        background: #007bff;
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
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .tutorial-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tutorial-button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    .tutorial-button:not(:disabled):hover {
        background: #0056b3;
    }

    .tutorial-button.secondary {
        background: #6c757d;
    }

    .tutorial-button.secondary:hover {
        background: #5a6268;
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
        background: #e9ecef;
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
        background: #fff;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.2s ease;
    }

    .step-indicator.active {
        background: #007bff;
        border-color: #007bff;
        transform: scale(1.2);
    }

    .step-indicator.active::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .step-indicator.completed {
        background: #28a745;
        border-color: #28a745;
    }

    .tutorial-hint {
        position: relative;
        margin-top: 20px;
        padding: 16px 16px 16px 48px;
        background: linear-gradient(to right, #f8f9fa, #ffffff);
        border: 1px solid rgba(0, 123, 255, 0.1);
        border-left: 4px solid #007bff;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.5;
        color: #495057;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: all 0.2s ease;
    }

    .tutorial-hint:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
        background: linear-gradient(45deg, #d4edda, #e8f5e9);
        border: 1px solid rgba(40, 167, 69, 0.2);
        color: #155724;
        border-radius: 8px;
        margin-top: 20px;
        font-weight: 500;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
        background: #f8f9fa;
        border-radius: 12px; /* Matches command-area */
        border: 1px solid rgba(222, 226, 230, 0.6); /* Matches command-area */
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
        background: #ffffff;
        color: #495057;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        opacity: 1;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
    }

    .tutorial-grid .tutorial-button:hover {
        background: #f8f9fa;
        border-color: #007bff;
        color: #007bff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,123,255,0.15);
    }

    .instruction-label {
        font-weight: 600; /* Semi-bold */
        margin-bottom: 8px;
        color: #495057; /* Match tab text color */
        padding-left: 4px; /* Align slightly with tabs/buttons */
        text-align: center; /* Center the text */
    }

    .drop-zone-tutorial-target {
        border-style: solid; /* Change from dashed to solid */
        border-color: #007bff; /* Use highlight color */
        box-shadow: 0 0 8px rgba(0, 123, 255, 0.3); /* Add a subtle glow */
    }

    .placed-component {
        position: relative;
        z-index: 1;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        background: linear-gradient(to right, #f8f9fa, #ffffff);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #dee2e6;
        margin: 0 4px;
        font-size: 14px;
        color: #495057;
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
        background: linear-gradient(to right, #ffffff, #f8f9fa);
        border-color: #007bff;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,123,255,0.15);
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
        border-color: #007bff;
        background: linear-gradient(to right, rgba(0,123,255,0.05), rgba(0,123,255,0.1));
        transform: scale(1.05);
        box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
        z-index: 3;
    }

    .placed-component.preview {
        position: fixed;
        opacity: 1;
        background: #ffffff;
        border: 2px solid #007bff;
        box-shadow: 0 8px 16px rgba(0,123,255,0.2);
        transform: scale(1.05);
        z-index: 1000;
        pointer-events: none;
        transition: opacity 0.15s ease-out, transform 0.15s ease-out;
    }

    .drag-placeholder {
        width: 3px;
        height: 24px;
        background: #007bff;
        border-radius: 2px;
        margin: 0 2px;
        opacity: 0;
        transition: opacity 0.15s ease-out;
        box-shadow: 0 0 8px rgba(0,123,255,0.4);
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
        background: linear-gradient(to right, #ffffff, #f8f9fa);
        border-color: #007bff;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,123,255,0.15);
        z-index: 2;
    }

    .placed-component.dragging {
        opacity: 0.5;
        pointer-events: none;
        transform: scale(0.95);
        transition: none;
        border: 1px dashed #007bff;
        background: rgba(0, 123, 255, 0.05);
    }

    .placed-component.preview {
        position: fixed;
        opacity: 1;
        background: #ffffff;
        border-color: #007bff;
        cursor: grabbing;
        z-index: 1000;
        transform: scale(1.05);
        box-shadow: 0 8px 16px rgba(0,123,255,0.2);
        pointer-events: none;
        transition: none;
    }

    .placed-component.snap-target {
        transform: scale(1.05);
        border-color: #007bff;
        box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
        background: rgba(0, 123, 255, 0.1);
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
        background: #007bff;
        border-radius: 1.5px;
        pointer-events: none;
        position: relative;
        margin: 0 4px;
        opacity: 0;
        box-shadow: 0 0 6px rgba(0, 123, 255, 0.4);
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
        border-right: 1px dashed rgba(0,123,255,0.2);
    }

    .grid-slot:last-child {
        border-right: none;
    }
`;
