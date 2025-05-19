// HTML template and styles for the Router Simulator component

export const routerSimulatorTemplate = document.createElement('template');
routerSimulatorTemplate.innerHTML = `
  <style>
    /* Base styles with stronger isolation */
    :host {
        /* Light mode variables */
        --text-color-light: #333;
        --border-color-light: #ddd;
        --bg-color-light: #fff;
        --heading-color-light: #1976D2;
        --router-placement-bg-light: #f5f5f5;
        --router-placement-border-light: #ccc;
        --tooltip-bg-light: #E3F2FD;
        --tooltip-border-light: #BBDEFB;
        --tooltip-color-light: #1976D2;
        --tab-active-bg-light: #fff;
        --tab-active-color-light: #1976D2;
        --tab-inactive-bg-light: #f0f0f0;
        --tab-inactive-color-light: #333;
        --tab-border-light: #ccc;
        --room-bg-light: rgba(200, 200, 200, 0.1);
        --room-label-bg-light: rgba(255, 255, 255, 0.7);
        --room-label-color-light: #333;
        --obstacle-color-light: rgba(0, 0, 0, 0.6);
        --button-primary-bg-light: #2196F3;
        --button-primary-color-light: white;
        --button-hover-bg-light: #1976D2;
        --interference-button-bg-light: #E0E0E0;
        --interference-button-color-light: #424242;
        --interference-button-border-light: #BDBDBD;
        --interference-button-indicator-light: #9E9E9E;
        --interference-button-hover-bg-light: #EEEEEE;
        --interference-button-hover-border-light: #9E9E9E;
        --placement-advice-color-light: #555;

        /* Dark mode variables */
        --text-color-dark: #f1f5f9;
        --border-color-dark: #334155;
        --bg-color-dark: #0f172a;
        --heading-color-dark: #60a5fa;
        --router-placement-bg-dark: #1e293b;
        --router-placement-border-dark: #475569;
        --tooltip-bg-dark: #1e3a8a;
        --tooltip-border-dark: #3b82f6;
        --tooltip-color-dark: #e0f2fe;
        --tab-active-bg-dark: #1e293b;
        --tab-active-color-dark: #60a5fa;
        --tab-inactive-bg-dark: #0f172a;
        --tab-inactive-color-dark: #cbd5e1;
        --tab-border-dark: #475569;
        --room-bg-dark: rgba(30, 41, 59, 0.3);
        --room-label-bg-dark: rgba(15, 23, 42, 0.7);
        --room-label-color-dark: #cbd5e1;
        --obstacle-color-dark: rgba(241, 245, 249, 0.6);
        --button-primary-bg-dark: #3b82f6;
        --button-primary-color-dark: white;
        --button-hover-bg-dark: #2563eb;
        --interference-button-bg-dark: #1e293b;
        --interference-button-color-dark: #cbd5e1;
        --interference-button-border-dark: #475569;
        --interference-button-indicator-dark: #64748b;
        --interference-button-hover-bg-dark: #334155;
        --interference-button-hover-border-dark: #64748b;
        --placement-advice-color-dark: #cbd5e1;

        /* Default to light mode */
        --text-color: var(--text-color-light);
        --border-color: var(--border-color-light);
        --bg-color: var(--bg-color-light);
        --heading-color: var(--heading-color-light);
        --router-placement-bg: var(--router-placement-bg-light);
        --router-placement-border: var(--router-placement-border-light);
        --tooltip-bg: var(--tooltip-bg-light);
        --tooltip-border: var(--tooltip-border-light);
        --tooltip-color: var(--tooltip-color-light);
        --tab-active-bg: var(--tab-active-bg-light);
        --tab-active-color: var(--tab-active-color-light);
        --tab-inactive-bg: var(--tab-inactive-bg-light);
        --tab-inactive-color: var(--tab-inactive-color-light);
        --tab-border: var(--tab-border-light);
        --room-bg: var(--room-bg-light);
        --room-label-bg: var(--room-label-bg-light);
        --room-label-color: var(--room-label-color-light);
        --obstacle-color: var(--obstacle-color-light);
        --button-primary-bg: var(--button-primary-bg-light);
        --button-primary-color: var(--button-primary-color-light);
        --button-hover-bg: var(--button-hover-bg-light);
        --interference-button-bg: var(--interference-button-bg-light);
        --interference-button-color: var(--interference-button-color-light);
        --interference-button-border: var(--interference-button-border-light);
        --interference-button-indicator: var(--interference-button-indicator-light);
        --interference-button-hover-bg: var(--interference-button-hover-bg-light);
        --interference-button-hover-border: var(--interference-button-hover-border-light);
        --placement-advice-color: var(--placement-advice-color-light);

        /* Base styles */
        display: block !important;
        font-family: Arial, sans-serif !important;
        line-height: 1.6 !important;
        color: var(--text-color) !important;
        border: 1px solid var(--border-color) !important;
        border-radius: 5px !important;
        padding: 20px !important;
        background-color: var(--bg-color) !important;
        /* Force center alignment and fixed size */
        margin: 15px auto !important;
        width: 880px !important; /* 840px + 40px padding */
        box-sizing: border-box !important;
        /* Prevent external styles from affecting layout */
        position: relative !important;
        contain: content !important;
        /* Additional isolation */
        text-align: left !important;
        clear: both !important;
        /* Transition for theme changes */
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }

    /* Dark mode styles */
    :host(.dark-mode) {
        --text-color: var(--text-color-dark);
        --border-color: var(--border-color-dark);
        --bg-color: var(--bg-color-dark);
        --heading-color: var(--heading-color-dark);
        --router-placement-bg: var(--router-placement-bg-dark);
        --router-placement-border: var(--router-placement-border-dark);
        --tooltip-bg: var(--tooltip-bg-dark);
        --tooltip-border: var(--tooltip-border-dark);
        --tooltip-color: var(--tooltip-color-dark);
        --tab-active-bg: var(--tab-active-bg-dark);
        --tab-active-color: var(--tab-active-color-dark);
        --tab-inactive-bg: var(--tab-inactive-bg-dark);
        --tab-inactive-color: var(--tab-inactive-color-dark);
        --tab-border: var(--tab-border-dark);
        --room-bg: var(--room-bg-dark);
        --room-label-bg: var(--room-label-bg-dark);
        --room-label-color: var(--room-label-color-dark);
        --obstacle-color: var(--obstacle-color-dark);
        --button-primary-bg: var(--button-primary-bg-dark);
        --button-primary-color: var(--button-primary-color-dark);
        --button-hover-bg: var(--button-hover-bg-dark);
        --interference-button-bg: var(--interference-button-bg-dark);
        --interference-button-color: var(--interference-button-color-dark);
        --interference-button-border: var(--interference-button-border-dark);
        --interference-button-indicator: var(--interference-button-indicator-dark);
        --interference-button-hover-bg: var(--interference-button-hover-bg-dark);
        --interference-button-hover-border: var(--interference-button-hover-border-dark);
        --placement-advice-color: var(--placement-advice-color-dark);
    }

    h3 {
        color: var(--heading-color);
        margin-top: 0;
        margin-bottom: 15px;
        transition: color 0.3s ease;
    }

    /* Simulator specific styles from original file */
    .interactive-element {
        /* Styles applied by :host now */
    }

    .router-placement {
        width: 840px !important; /* Force width */
        height: 740px !important; /* Force height */
        position: relative !important;
        border: 1px solid var(--router-placement-border) !important;
        margin: 20px auto !important; /* Centered horizontally */
        background-color: var(--router-placement-bg) !important;
        /* Ensure proper positioning context */
        transform: translateZ(0) !important;
        /* Prevent overflow issues */
        overflow: visible !important;
        /* Ensure proper stacking context */
        isolation: isolate !important;
        /* Prevent external padding/margin from affecting layout */
        box-sizing: border-box !important;
        /* Force dimensions */
        min-width: 840px !important;
        min-height: 740px !important;
        max-width: 840px !important;
        max-height: 740px !important;
        /* Transition for theme changes */
        transition: background-color 0.3s ease, border-color 0.3s ease !important;
    }

    .router {
        position: absolute;
        z-index: 10;
        cursor: grab;
        width: 60px; /* Increased size */
        height: 60px; /* Increased size */
        user-select: none;
        touch-action: none;
        /* Use transform for positioning, remove left/top/transition */
        /* will-change: left, top; */
        /* left: 0; */
        /* top: 0; */
        /* transition: left 0.05s ease-out, top 0.05s ease-out; */
        will-change: transform;
        pointer-events: auto;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0); /* Initial transform */
    }

    .router:active, .mesh-extender:active {
        cursor: grabbing;
    }

    .mesh-extender {
        position: absolute;
        z-index: 10;
        cursor: grab;
        width: 60px;
        height: 60px;
        user-select: none;
        touch-action: none;
         /* Use transform for positioning, remove left/top/transition */
        /* will-change: left, top; */
        /* left: 0; */
        /* top: 0; */
        /* transition: left 0.05s ease-out, top 0.05s ease-out; */
        will-change: transform;
        pointer-events: auto;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0); /* Initial transform */
    }


    .signal-strength {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 1 !important;
        /* Ensure proper rendering */
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
        /* Force dimensions to match container */
        min-width: 100% !important;
        min-height: 100% !important;
    }

        /* Stronger button isolation */
    :host button,
    .interference-button,
    .tab-button {
        all: initial !important; /* Reset all properties */
        font-family: Arial, sans-serif !important;
        padding: 8px 16px !important;
        background-color: var(--button-primary-bg) !important;
        color: var(--button-primary-color) !important;
        border: none !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        margin: 5px !important;
        font-size: 1em !important;
        display: inline-block !important;
        text-align: center !important;
        line-height: 1.6 !important;
        /* Prevent inheritance */
        box-sizing: border-box !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }

    button:hover {
        background-color: var(--button-hover-bg);
    }

    /* .controls removed */

    #signalInfo {
        background-color: var(--tooltip-bg);
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        font-size: 0.9em;
        color: var(--tooltip-color);
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Floorplan Tabs */
    .floorplan-tabs {
        margin-bottom: 15px;
        border-bottom: 1px solid var(--tab-border);
        padding-bottom: 10px;
        transition: border-color 0.3s ease;
    }

    .tab-button {
        padding: 8px 16px;
        background-color: var(--tab-inactive-bg);
        color: var(--tab-inactive-color);
        border: 1px solid var(--tab-border);
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        margin-right: 5px;
        font-size: 0.95em;
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    .tab-button:hover {
        background-color: var(--interference-button-hover-bg);
    }

    .tab-button.active {
        background-color: var(--tab-active-bg);
        color: var(--tab-active-color);
        border-color: var(--tab-border);
        border-bottom: 1px solid var(--tab-active-bg); /* Cover the container border */
        position: relative;
        top: 1px; /* Align with container border */
    }

    .room {
        position: absolute;
        /* border: 2px solid #666; */ /* Border removed, will be drawn separately */
        border: none; /* Explicitly remove border */
        background-color: var(--room-bg);
        pointer-events: none;
        z-index: 1; /* Lower z-index so walls draw on top */
        transition: background-color 0.3s ease;
    }

    .room-label {
        position: absolute;
        font-size: 12px;
        color: var(--room-label-color);
        pointer-events: none;
        user-select: none;
        background-color: var(--room-label-bg);
        padding: 1px 3px;
        border-radius: 2px;
        z-index: 5; /* Increased z-index to be above obstacles */
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .fixed-obstacle {
        position: absolute;
        pointer-events: none;
        z-index: 4; /* Above rooms */
        /* Added styles for W/D labels */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: var(--obstacle-color);
        text-align: center;
        transition: color 0.3s ease;
    }

    .interference-source {
        position: absolute;
        pointer-events: auto;
        cursor: grab;
        z-index: 3; /* Above rooms, below obstacles */
        opacity: 0; /* Hidden by default */
        transition: opacity 0.3s ease-in-out, border-color 0.3s ease-in-out, border-width 0.3s ease-in-out;
        border: 3px dashed rgba(244, 67, 54, 0);
        border-radius: 50%; /* Ensure it's circular */
        transform: translate(0, 0); /* Initial transform state */
        will-change: transform;
    }

    .interference-source.active {
        opacity: 0.5; /* Increased from 0.3 to 0.5 */
        border-color: rgba(255, 87, 34, 1); /* Brighter orange-red */
        border-width: 3px; /* Thicker border */
    }

    .interference-source:active {
        cursor: grabbing;
    }

    .interference-source.interference-bluetooth.active { /* Match class name */
        /* Changed to a brighter purple */
        border-color: rgba(186, 104, 200, 1); /* Brighter purple */
        box-shadow: 0 0 10px rgba(186, 104, 200, 0.6); /* Add glow effect */
    }

    .interference-source.interference-babyMonitor.active { /* Match class name */
        border-color: rgba(255, 87, 34, 1); /* Brighter orange-red */
        box-shadow: 0 0 10px rgba(255, 87, 34, 0.6); /* Add glow effect */
    }

    .interference-buttons {
        margin: 10px 0;
        display: flex;
        gap: 10px;
        flex-wrap: wrap; /* Allow wrapping */
        justify-content: space-between; /* Push mesh button to the right */
        align-items: center; /* Vertically align items */
    }

    .interference-buttons > div { /* Simple way to group left buttons */
        display: flex;
        gap: 10px;
    }

    .interference-button {
        padding: 10px 20px;
        background-color: var(--interference-button-bg);
        color: var(--interference-button-color);
        border: 2px solid var(--interference-button-border);
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9em; /* Slightly smaller font */
    }

    .interference-button::before {
        content: '';
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--interference-button-indicator);
        transition: all 0.3s ease;
        flex-shrink: 0; /* Prevent shrinking */
        margin-right: 5px; /* Add explicit space */
    }

    .interference-button:hover {
        background-color: var(--interference-button-hover-bg);
        border-color: var(--interference-button-hover-border);
    }

    .interference-button.active {
        background-color: #FFF3E0; /* Lighter orange background */
        border-color: #FF5722; /* Brighter orange-red */
        color: #E64A19; /* Darker orange-red for text */
    }

    .interference-button.active::before {
        background-color: #FF5722; /* Brighter orange-red */
        box-shadow: 0 0 8px rgba(255, 87, 34, 0.7); /* Stronger glow */
    }

    .interference-button.bluetooth.active {
        background-color: #F3E5F5; /* Light Purple */
        border-color: #BA68C8; /* Brighter purple */
        color: #8E24AA; /* Darker purple for text */
    }

    .interference-button.bluetooth.active::before {
        background-color: #BA68C8; /* Brighter purple */
        box-shadow: 0 0 8px rgba(186, 104, 200, 0.7); /* Stronger purple glow */
    }

    .tooltip {
        margin-top: 10px;
        padding: 8px 12px;
        background-color: var(--tooltip-bg);
        border: 1px solid var(--tooltip-border);
        border-radius: 4px;
        color: var(--tooltip-color);
        font-size: 0.9em;
        line-height: 1.4;
        width: 100%;
        text-align: center;
        box-sizing: border-box; /* Include padding in width */
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    .tooltip::before {
        content: '💡 ';
        width: auto; /* Override 100% width if set previously */
        text-align: left; /* Align text left */
        margin-top: 5px; /* Add space below buttons */
    }

    .tooltips-container {
        margin-top: 10px; /* Space above tooltips */
        display: flex;
        flex-direction: column; /* Stack tooltips */
        gap: 8px; /* Space between tooltips */
    }


    #placementAdvice {
        margin-top: 15px;
        font-size: 0.9em;
        color: var(--placement-advice-color);
        transition: color 0.3s ease;
    }

    /* Ensure SVG icons scale correctly */
    .router, .mesh-extender {
        overflow: visible; /* Allow parts outside viewBox if needed */
    }

  </style>
  <div class="interactive-element">
       <h3>Router Placement Simulator</h3>
       <div class="floorplan-tabs">
           <button class="tab-button active" data-floorplan="floor1">Floorplan 1</button>
           <!-- Floor 2 button removed -->
       </div>
       <!-- .controls div removed -->
       <div class="router-placement" id="routerPlacement">
          <svg id="router" class="router" draggable="true" viewBox="0 0 64 64">
              <rect x="4" y="24" width="56" height="16" rx="4" fill="#64B5F6"/>
              <line x1="16" y1="20" x2="16" y2="12" stroke="#333" stroke-width="3" stroke-linecap="round"/>
              <line x1="32" y1="20" x2="32" y2="8" stroke="#333" stroke-width="3" stroke-linecap="round"/>
              <line x1="48" y1="20" x2="48" y2="12" stroke="#333" stroke-width="3" stroke-linecap="round"/>
              <circle cx="12" cy="32" r="3" fill="#1976D2"/>
              <circle cx="22" cy="32" r="3" fill="#1976D2"/>
              <circle cx="32" cy="32" r="3" fill="#1976D2"/>
              <circle cx="42" cy="32" r="3" fill="#1976D2"/>
              <circle cx="52" cy="32" r="3" fill="#1976D2"/>
          </svg>
          <svg id="meshExtender" class="mesh-extender" style="display: none;" viewBox="0 0 64 64">
              <!-- Main body - rounded square -->
              <rect x="8" y="20" width="48" height="24" rx="6" fill="#81D4FA"/>
              <!-- Curved arrow indicating signal boost -->
              <path d="M 16,18 A 20,20 0 0 1 48,18" stroke="#2196F3" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M 20,14 A 24,24 0 0 1 44,14" stroke="#2196F3" stroke-width="3" fill="none" stroke-linecap="round"/>
              <!-- Signal indicators -->
              <circle cx="20" cy="32" r="2.5" fill="#0D47A1"/>
              <circle cx="32" cy="32" r="2.5" fill="#0D47A1"/>
              <circle cx="44" cy="32" r="2.5" fill="#0D47A1"/>
              <!-- Small feet/stands -->
              <rect x="16" y="44" width="8" height="2" rx="1" fill="#333"/>
              <rect x="40" y="44" width="8" height="2" rx="1" fill="#333"/>
          </svg>
          <svg id="meshExtender2" class="mesh-extender" style="display: none;" viewBox="0 0 64 64">
              <!-- Identical SVG content as meshExtender -->
              <rect x="8" y="20" width="48" height="24" rx="6" fill="#81D4FA"/>
              <path d="M 16,18 A 20,20 0 0 1 48,18" stroke="#2196F3" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M 20,14 A 24,24 0 0 1 44,14" stroke="#2196F3" stroke-width="3" fill="none" stroke-linecap="round"/>
              <circle cx="20" cy="32" r="2.5" fill="#0D47A1"/>
              <circle cx="32" cy="32" r="2.5" fill="#0D47A1"/>
              <circle cx="44" cy="32" r="2.5" fill="#0D47A1"/>
              <rect x="16" y="44" width="8" height="2" rx="1" fill="#333"/>
              <rect x="40" y="44" width="8" height="2" rx="1" fill="#333"/>
          </svg>
          <canvas id="signalStrength" class="signal-strength"></canvas>
          <div id="floorplan"></div>
          <div id="wallContainer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;"></div> <!-- Container for unique walls -->
          <div id="furniture" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3;"></div> <!-- Container for furniture -->
          <div id="fixedObstacles"></div>
          <div id="interferenceSources"></div>
      </div>
      <div class="interference-buttons">
          <div> <!-- Group left buttons -->
              <button id="bluetoothToggle" class="interference-button bluetooth">Bluetooth Soundbar</button>
               <button id="babyMonitorToggle" class="interference-button">Baby Monitor</button>
           </div>
           <div> <!-- Group extender buttons -->
               <button id="meshExtenderButton" class="interference-button">Add Mesh Extender 1</button>
               <button id="meshExtenderButton2" class="interference-button">Add Mesh Extender 2</button>
           </div>
           <!-- Tooltips moved below -->
       </div>
       <div class="tooltips-container">
           <div class="tooltip">Toggle interference sources (Bluetooth, Baby Monitor) to see their impact on WiFi signal.</div>
           <div class="tooltip">Place a mesh extender to boost WiFi coverage. Signal strength depends on the router's signal strength at the extender's location.</div>
      </div>
      <p id="placementAdvice">Drag the router to test different positions in this home layout. The heatmap shows signal strength considering walls, appliances, and active interference sources.</p>
  </div>
`;
