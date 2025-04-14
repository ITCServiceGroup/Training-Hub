// HTML template and styles for the Router Simulator component

export const routerSimulatorTemplate = document.createElement('template');
routerSimulatorTemplate.innerHTML = `
  <style>
    /* Base styles with stronger isolation */
    :host {
        display: block !important;
        font-family: Arial, sans-serif !important;
        line-height: 1.6 !important;
        color: #333 !important;
        border: 1px solid #ddd !important;
        border-radius: 5px !important;
        padding: 20px !important;
        background-color: #fff !important;
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
    }

    h3 {
        color: #1976D2;
        margin-top: 0;
        margin-bottom: 15px;
    }

    /* Simulator specific styles from original file */
    .interactive-element {
        /* Styles applied by :host now */
    }

    .router-placement {
        width: 840px !important; /* Force width */
        height: 740px !important; /* Force height */
        position: relative !important;
        border: 1px solid #ccc !important;
        margin: 20px auto !important; /* Centered horizontally */
        background-color: #f5f5f5 !important;
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
        background-color: #2196F3 !important;
        color: white !important;
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
    }

    button:hover {
        background-color: #1976D2;
    }

    /* .controls removed */

    #signalInfo {
        background-color: #e3f2fd;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        font-size: 0.9em;
    }

    /* Floorplan Tabs */
    .floorplan-tabs {
        margin-bottom: 15px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 10px;
    }

    .tab-button {
        padding: 8px 16px;
        background-color: #f0f0f0;
        color: #333;
        border: 1px solid #ccc;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        margin-right: 5px;
        font-size: 0.95em;
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    .tab-button:hover {
        background-color: #e0e0e0;
    }

    .tab-button.active {
        background-color: #fff;
        color: #1976D2;
        border-color: #ccc;
        border-bottom: 1px solid #fff; /* Cover the container border */
        position: relative;
        top: 1px; /* Align with container border */
    }

    .room {
        position: absolute;
        /* border: 2px solid #666; */ /* Border removed, will be drawn separately */
        border: none; /* Explicitly remove border */
        background-color: rgba(200, 200, 200, 0.1);
        pointer-events: none;
        z-index: 1; /* Lower z-index so walls draw on top */
    }

    .room-label {
        position: absolute;
        font-size: 12px;
        color: #333;
        pointer-events: none;
        user-select: none;
        background-color: rgba(255, 255, 255, 0.7);
        padding: 1px 3px;
        border-radius: 2px;
        z-index: 5; /* Increased z-index to be above obstacles */
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
        color: rgba(0, 0, 0, 0.6);
        text-align: center;
    }

    .interference-source {
        position: absolute;
        pointer-events: auto;
        cursor: grab;
        z-index: 3; /* Above rooms, below obstacles */
        opacity: 0; /* Hidden by default */
        transition: opacity 0.3s ease-in-out;
        border: 2px dashed rgba(244, 67, 54, 0);
        border-radius: 50%; /* Ensure it's circular */
        transform: translate(0, 0); /* Initial transform state */
        will-change: transform;
    }

    .interference-source.active {
        opacity: 0.3;
        border-color: rgba(244, 67, 54, 0.8);
    }

    .interference-source:active {
        cursor: grabbing;
    }

    .interference-source.interference-bluetooth.active { /* Match class name */
        /* Changed from blue to purple */
        /* Removed background fill */
        border-color: rgba(156, 39, 176, 0.8); /* Purple */
    }

    .interference-source.interference-babyMonitor.active { /* Match class name */
         /* Removed background fill */
         border-color: rgba(244, 67, 54, 0.8); /* Keep border color from .interference-source.active */
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
        background-color: #E0E0E0;
        color: #424242;
        border: 2px solid #BDBDBD;
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
        background-color: #9E9E9E;
        transition: all 0.3s ease;
        flex-shrink: 0; /* Prevent shrinking */
        margin-right: 5px; /* Add explicit space */
    }

    .interference-button:hover {
        background-color: #EEEEEE;
        border-color: #9E9E9E;
    }

    .interference-button.active {
        background-color: #FBE9E7;
        border-color: #F44336;
        color: #D32F2F;
    }

    .interference-button.active::before {
        background-color: #F44336;
        box-shadow: 0 0 8px rgba(244, 67, 54, 0.5);
    }

    .interference-button.bluetooth.active {
        background-color: #F3E5F5; /* Light Purple */
        border-color: #9C27B0; /* Purple */
        color: #7B1FA2; /* Dark Purple */
    }

    .interference-button.bluetooth.active::before {
        background-color: #9C27B0; /* Purple */
        box-shadow: 0 0 8px rgba(156, 39, 176, 0.5); /* Purple */
    }

    .tooltip {
        margin-top: 10px;
        padding: 8px 12px;
        background-color: #E3F2FD;
        border: 1px solid #BBDEFB;
        border-radius: 4px;
        color: #1976D2;
        font-size: 0.9em;
        line-height: 1.4;
        width: 100%;
        text-align: center;
        box-sizing: border-box; /* Include padding in width */
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
        color: #555;
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
