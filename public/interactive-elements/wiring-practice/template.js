export const wiringPracticeTemplate = document.createElement('template');

wiringPracticeTemplate.innerHTML = `
<style>
    :host {
        display: block;
        font-family: 'Inter', sans-serif;
        background: var(--custom-primary-bg-color, var(--bg-color, #ffffff));
        color: var(--text-color);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);

        /* Light mode defaults */
        --bg-color: var(--custom-primary-bg-color, #ffffff);
        --title-color: var(--custom-title-color, #2c3e50);
        --text-color: #374151;
        --border-color: #e5e7eb;
        --input-bg: var(--custom-secondary-bg-color, #ffffff);
        --input-text: #6b7280;
        --button-bg: var(--custom-button-color, #3b82f6);
        --button-text: #ffffff;
        --success-color: #22c55e;
        --error-color: #ef4444;
        --connector-bg: #f8fafc;
    }

    :host(.dark-mode) {
        --bg-color: var(--custom-primary-bg-color, #1e293b);
        --title-color: var(--custom-title-color, #f1f5f9);
        --text-color: #d1d5db;
        --border-color: #334155;
        --input-bg: var(--custom-secondary-bg-color, #334155);
        --input-text: #9ca3af;
        --button-bg: var(--custom-button-color, #3b82f6);
        --button-text: #ffffff;
        --connector-bg: #0f172a;
    }

    .container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        max-width: 1400px;
        margin: 0 auto;
    }

    .connector-section {
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
        position: relative;
        min-height: 400px;
    }

    .reference-section-container {
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
    }

    .action-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .connector-type-btn {
        padding: 8px 16px;
        background: var(--button-bg);
        color: var(--button-text);
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .connector-type-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .connector-type-btn.active {
        border-color: var(--button-text);
        box-shadow: 0 0 0 3px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.2);
        transform: translateY(-1px);
        font-weight: 600;
    }

    .wire-palette {
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* Always 2 columns for consistent layout */
        gap: 10px;
        margin-top: 35px; /* Space for title */
        pointer-events: auto; /* Enable interactions on wire buttons */
    }

    .wire {
        padding: 10px;
        border: 2px solid var(--border-color);
        border-radius: 4px;
        cursor: grab;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        background: var(--input-bg);
        color: var(--input-text);
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s;
        position: relative;
        font-size: 12px;
        min-height: 40px;
        justify-content: center;
        text-align: center;
    }

    .wire-main-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .wire-drag-text {
        font-size: 10px;
        opacity: 0;
        font-style: italic;
        transition: opacity 0.2s ease;
        color: var(--input-text);
    }

    .wire:hover .wire-drag-text {
        opacity: 0.7;
    }

    .wire:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .wire.highlight {
        border-color: var(--button-bg);
        background: var(--button-bg);
        color: var(--button-text);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        transform: translateY(-2px);
    }



    .wire-color {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--border-color);
        transition: transform 0.2s, border-color 0.2s;
    }

    .wire:hover .wire-color {
        transform: scale(1.1);
    }

    .wire.highlight .wire-color {
        transform: scale(1.15);
        border-color: var(--button-text);
    }

    .wire.highlight:hover .wire-color {
        transform: scale(1.2);
    }

    .wire.dragging {
        opacity: 0.5;
        cursor: grabbing;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .connector-display {
        width: 100%;
        height: 460px; /* Increased for better bottom padding */
        position: relative;
        border: 2px solid var(--border-color);
        border-radius: 4px;
        background: var(--bg-color);
    }

    .wire-palette-container {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        z-index: 10;
        pointer-events: none; /* Allow canvas interactions to pass through */
    }

    .wire-palette-container h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--title-color);
        text-align: center;
        pointer-events: auto;
        background: var(--bg-color);
        padding: 5px 10px;
        border-radius: 4px;
        display: inline-block;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }

    h3 {
        color: var(--title-color);
        font-weight: 600;
    }

    .connection-point {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--border-color);
        position: absolute;
        transform: translate(-50%, -50%);
        cursor: pointer;
    }

    .connection-point:hover {
        background: var(--button-bg);
    }

    .connection-point.connected {
        background: var(--success-color);
    }

    .connection-point.error {
        background: var(--error-color);
    }

    .scenario-info {
        margin-top: 20px;
        padding: 15px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        color: var(--text-color);
        animation: highlight 2s ease-in-out;
    }

    @keyframes highlight {
        0%, 100% { border-color: var(--border-color); }
        50% { border-color: var(--button-bg); }
    }

    #canvas-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: default;
    }

    #canvas-overlay.can-drop {
        cursor: crosshair;
    }

    .reference-section {
        margin-top: 20px;
        padding: 15px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        color: var(--text-color);
    }

    .wiring-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 14px;
    }

    .wiring-table th, .wiring-table td {
        padding: 8px;
        text-align: left;
        border: 1px solid var(--border-color);
    }

    .wiring-table th {
        background: var(--bg-color);
        font-weight: 600;
    }

    .color-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 6px;
        vertical-align: middle;
        border: 1px solid var(--border-color);
    }

    .striped {
        background: repeating-linear-gradient(
            45deg,
            var(--color1),
            var(--color1) 3px,
            var(--color2) 3px,
            var(--color2) 6px
        );
    }

    #canvas-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        cursor: default;
    }

    /* Intermediate screen sizes - prevent awkward 3+1 layout */
    @media (max-width: 900px) and (min-width: 769px) {
        .wire-palette {
            grid-template-columns: repeat(2, 1fr); /* Force 2x2 grid */
            gap: 12px;
            max-width: 400px; /* Limit width to prevent stretching */
            margin: 35px auto 0; /* Center the grid */
        }

        .wire {
            padding: 10px 8px;
            min-height: 40px;
        }
    }

    @media (max-width: 768px) {
        .container {
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .connector-display {
            height: 460px; /* Increased for better bottom padding on tablet */
        }

        .wire-palette {
            grid-template-columns: repeat(2, 1fr); /* Force 2 columns on mobile */
            gap: 8px;
            margin-top: 25px;
        }

        .wire {
            padding: 8px 6px; /* Reduced padding to save space */
            min-height: 35px; /* Smaller height to fit more content */
            font-size: 10px;
        }

        .wire-color {
            width: 14px; /* Smaller wire color circles */
            height: 14px;
        }

        .wire-palette-container {
            top: 8px;
            left: 8px;
            right: 8px;
        }

        .wire-palette-container h4 {
            font-size: 13px;
            padding: 4px 8px;
        }

        .scenario-info, .reference-section {
            margin-top: 15px;
            padding: 12px;
        }

        .wiring-table {
            font-size: 12px;
        }

        .wiring-table th, .wiring-table td {
            padding: 6px 4px;
        }

        .color-dot {
            width: 10px;
            height: 10px;
        }

        .connection-point {
            width: 14px; /* Larger touch targets */
            height: 14px;
        }
    }

    @media (max-width: 480px) {
        :host {
            padding: 15px;
        }

        .connector-display {
            height: 450px; /* Increased for better bottom padding on phone */
        }

        .wire-palette {
            grid-template-columns: 1fr 1fr; /* Ensure 2 columns even on very small screens */
            gap: 6px;
        }

        .wire {
            padding: 6px 4px; /* Even smaller on very small screens */
            min-height: 30px; /* Smallest height for phones */
            font-size: 9px;
        }

        .wire-color {
            width: 12px; /* Smallest wire color circles */
            height: 12px;
        }

        .action-bar {
            gap: 8px;
        }

        .connector-type-btn {
            padding: 8px 12px;
            font-size: 12px;
        }

        .scenario-info, .reference-section {
            padding: 10px;
        }

        h3 {
            font-size: 16px;
            margin-bottom: 8px;
        }

        .wiring-table {
            font-size: 11px;
        }

        .wiring-table th, .wiring-table td {
            padding: 4px 2px;
        }
    }
</style>

<div class="container">
    <div class="connector-section">
        <div class="action-bar">
            <button id="rj11-btn" class="connector-type-btn active">RJ11</button>
            <button id="rj45-btn" class="connector-type-btn">RJ45</button>
        </div>
        <div class="connector-display">
            <canvas id="canvas-overlay"></canvas>
            <div class="wire-palette-container">
                <h4>Available Wires</h4>
                <div class="wire-palette" id="wire-palette">
                    <!-- Wires will be dynamically added here -->
                </div>
            </div>
        </div>
        <div class="scenario-info">
            <h3 style="margin-top: 0;">Current Scenario</h3>
            <p id="scenario-description">Practice basic RJ11 2-pair connection.</p>
        </div>
    </div>

    <div class="reference-section-container">
        <div class="reference-section">
            <h3 style="margin-top: 0;">Wiring Standard Reference</h3>
            <div id="wiring-reference">
                <!-- Reference table will be dynamically added here -->
            </div>
        </div>
    </div>
</div>
`;
