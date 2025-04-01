const routerSimulatorTemplate = document.createElement('template');
routerSimulatorTemplate.innerHTML = `
  <style>
    /* Base styles */
    :host {
        display: block;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 20px;
        background-color: #fff;
        margin: 15px 0;
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
        width: 840px; /* Increased width + 40px padding */
        height: 740px; /* Increased height + 40px padding */
        position: relative;
        border: 1px solid #ccc;
        margin: 20px auto; /* Centered horizontally */
        background-color: #f5f5f5;
        /* overflow: hidden; Removed as it might interfere */
    }

    .router {
        position: absolute;
        z-index: 10;
        cursor: grab;
        width: 60px; /* Increased size */
        height: 60px; /* Increased size */
        user-select: none;
        touch-action: none;
        will-change: left, top;
        left: 0;
        top: 0;
        transition: left 0.05s ease-out, top 0.05s ease-out;
        pointer-events: auto;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
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
        will-change: left, top;
        left: 0;
        top: 0;
        transition: left 0.05s ease-out, top 0.05s ease-out;
        pointer-events: auto;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
    }


    .signal-strength {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }

    button { /* General button style within component */
        padding: 8px 16px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 5px;
        font-size: 1em; /* Ensure consistent font size */
    }

    button:hover {
        background-color: #1976D2;
    }

    .controls { /* Shared controls class */
        margin: 10px 0;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    #signalInfo {
        background-color: #e3f2fd;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        font-size: 0.9em;
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
        pointer-events: none;
        z-index: 3; /* Above rooms, below obstacles */
        opacity: 0; /* Hidden by default */
        transition: all 0.3s ease-in-out;
        border: 2px dashed rgba(244, 67, 54, 0);
        animation: none;
        border-radius: 50%; /* Ensure it's circular */
    }

    .interference-source.active {
        opacity: 0.3;
        border-color: rgba(244, 67, 54, 0.8);
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.3;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.5;
        }
        100% {
            transform: scale(1);
            opacity: 0.3;
        }
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
      <div id="signalInfo">Signal Strength at Router: 100% | Mesh Extender: Not Placed</div>
      <div class="controls">
          <button id="meshExtenderButton" class="interference-button">Add Mesh Extender</button>
          <div class="tooltip">Place a mesh extender to boost WiFi coverage. Signal strength depends on router's signal at extender location.</div>
      </div>
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
          <canvas id="signalStrength" class="signal-strength"></canvas>
          <div id="floorplan"></div>
          <div id="wallContainer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;"></div> <!-- Container for unique walls -->
          <div id="fixedObstacles"></div>
          <div id="interferenceSources"></div>
      </div>
      <div class="interference-buttons">
          <button id="bluetoothToggle" class="interference-button bluetooth">Bluetooth Soundbar</button>
          <button id="babyMonitorToggle" class="interference-button">Baby Monitor</button>
          <div class="tooltip">Toggle interference sources to see their impact on WiFi signal</div>
      </div>
      <p id="placementAdvice">Drag the router to test different positions in this home layout. The heatmap shows signal strength considering walls, appliances, and active interference sources.</p>
  </div>
`; // Closing backtick for the main template literal

class RouterSimulatorElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(routerSimulatorTemplate.content.cloneNode(true));

        // Element references
        this.routerPlacement = this.shadowRoot.getElementById("routerPlacement");
        this.router = this.shadowRoot.getElementById("router");
        this.meshExtender = this.shadowRoot.getElementById("meshExtender");
        this.meshExtenderButton = this.shadowRoot.getElementById("meshExtenderButton");
        this.signalStrengthCanvas = this.shadowRoot.getElementById("signalStrength");
        // Initialize canvas context with error handling
        if (this.signalStrengthCanvas) {
            const ctx = this.signalStrengthCanvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) {
                console.error('Could not get 2D context from canvas');
                return;
            }
            this.signalCtx = ctx;
        } else {
            console.error('Signal strength canvas not found');
        }
        this.floorplanContainer = this.shadowRoot.getElementById("floorplan");
        this.wallContainer = this.shadowRoot.getElementById("wallContainer");
        this.fixedObstaclesContainer = this.shadowRoot.getElementById("fixedObstacles");
        this.interferenceContainer = this.shadowRoot.getElementById("interferenceSources");
        this.signalInfo = this.shadowRoot.getElementById("signalInfo");
        this.bluetoothToggle = this.shadowRoot.getElementById("bluetoothToggle");
        this.babyMonitorToggle = this.shadowRoot.getElementById("babyMonitorToggle");

        // State variables
        this.interferenceElements = {};
        this.meshExtenderPlaced = false;
        this.isMeshExtenderDragging = false;
        this.meshExtenderDimensions = { width: 60, height: 60 };
        this.meshExtenderLastPosition = { x: 0, y: 0 };
        this.meshExtenderStrength = 0;
        this.lastKnownPosition = { x: 0, y: 0 };
        this.routerDimensions = { width: 60, height: 60 };
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;

        // Floorplan Data (Consider moving to a separate config if it gets large)
        this.padding = 20;
        this.floorplanData = {
            rooms: [
                { name: "Living Room", x: 40 + this.padding, y: 40 + this.padding, width: 400, height: 300, zoneAttenuation: 0.1, externalWalls: ["north", "west"] },
                { name: "Kitchen", x: 440 + this.padding, y: 40 + this.padding, width: 300, height: 240, zoneAttenuation: 0.4, externalWalls: ["north", "east"] },
                { name: "Dining Room", x: 440 + this.padding, y: 280 + this.padding, width: 300, height: 200, zoneAttenuation: 0.1, externalWalls: ["east"] },
                { name: "Bedroom 1", x: 40 + this.padding, y: 340 + this.padding, width: 240, height: 240, zoneAttenuation: 0.05, externalWalls: ["west"] },
                { name: "Bedroom 2", x: 280 + this.padding, y: 340 + this.padding, width: 240, height: 240, zoneAttenuation: 0.05 },
                { name: "Bedroom 3", x: 520 + this.padding, y: 480 + this.padding, width: 220, height: 220, zoneAttenuation: 0.05, externalWalls: ["east", "south"] },
                { name: "Bathroom 1", x: 40 + this.padding, y: 580 + this.padding, width: 240, height: 120, zoneAttenuation: 0.4, externalWalls: ["west", "south"] },
                { name: "Bathroom 2", x: 280 + this.padding, y: 580 + this.padding, width: 240, height: 120, zoneAttenuation: 0.4, externalWalls: ["south"] }
            ],
            fixedObstacles: [
                { type: "refrigerator", x: 441 + this.padding, y: 41 + this.padding, width: 50, height: 40, attenuation: 0.8 },
                { type: "washer", x: 450 + this.padding, y: 370 + this.padding, width: 40, height: 40, attenuation: 0.7 },
                { type: "dryer", x: 450 + this.padding, y: 415 + this.padding, width: 40, height: 40, attenuation: 0.7 },
                { type: "mirror", room: "Bathroom 1", x: (40 + this.padding) + (240 / 2) - (60 / 2), y: (580 + this.padding) + 5, width: 60, height: 10, attenuation: 0.5 },
                { type: "mirror", room: "Bathroom 2", x: (280 + this.padding) + (240 / 2) - (60 / 2), y: (580 + this.padding) + 5, width: 60, height: 10, attenuation: 0.5 },
                { type: "cabinet", x: 441 + this.padding, y: 44 + this.padding, width: 50, height: 236, attenuation: 0.6 }
            ],
            interferenceSources: [
                { name: "bluetooth", room: "Living Room", x: 200 + this.padding, y: 200 + this.padding, radius: 80, attenuation: 0.5, active: false },
                { name: "babyMonitor", room: "Bedroom 2", x: 400 + this.padding, y: 400 + this.padding, radius: 100, attenuation: 0.3, active: false }
            ]
        };

        // Bind methods for event listeners
        this._boundMoveRouter = this._moveRouter.bind(this);
        this._boundStopDrag = this._stopDrag.bind(this);
        this._boundMoveMeshExtender = this._moveMeshExtender.bind(this);
        this._boundStopMeshExtenderDrag = this._stopMeshExtenderDrag.bind(this);
        this._boundUpdateCanvasDimensions = this._updateCanvasDimensions.bind(this);
        this._boundResizeObserverCallback = this._resizeObserverCallback.bind(this);
    }

    connectedCallback() {
        console.log("RouterSimulatorElement connected");
        this._initializeSimulator();
        this._attachEventListeners();
    }

    disconnectedCallback() {
        console.log("RouterSimulatorElement disconnected");
        this._removeEventListeners();
    }

    _attachEventListeners() {
        // Router drag events
        this.router.addEventListener('mousedown', this._startDrag.bind(this));
        this.router.addEventListener('touchstart', this._startDrag.bind(this), { passive: false });
        // Use document for move/end events to handle dragging outside the element
        document.addEventListener('mousemove', this._boundMoveRouter);
        document.addEventListener('mouseup', this._boundStopDrag);
        document.addEventListener('touchmove', this._boundMoveRouter, { passive: false });
        document.addEventListener('touchend', this._boundStopDrag);
        document.addEventListener('touchcancel', this._boundStopDrag);

        // Mesh extender drag events
        this.meshExtender.addEventListener('mousedown', this._startMeshExtenderDrag.bind(this));
        this.meshExtender.addEventListener('touchstart', this._startMeshExtenderDrag.bind(this), { passive: false });
        document.addEventListener('mousemove', this._boundMoveMeshExtender);
        document.addEventListener('mouseup', this._boundStopMeshExtenderDrag);
        document.addEventListener('touchmove', this._boundMoveMeshExtender, { passive: false });
        document.addEventListener('touchend', this._boundStopMeshExtenderDrag);
        document.addEventListener('touchcancel', this._boundStopMeshExtenderDrag);

        // Button clicks
        this.meshExtenderButton.addEventListener('click', this._toggleMeshExtender.bind(this));
        this.bluetoothToggle.addEventListener('click', this._toggleInterference.bind(this, 'bluetooth'));
        this.babyMonitorToggle.addEventListener('click', this._toggleInterference.bind(this, 'babyMonitor'));

        // Resize observer
        this.resizeObserver = new ResizeObserver(this._boundResizeObserverCallback);
        if (this.routerPlacement) {
            this.resizeObserver.observe(this.routerPlacement);
        }
        // Also listen to window resize as a fallback
        window.addEventListener('resize', this._boundUpdateCanvasDimensions);
    }

    _removeEventListeners() {
        // Router drag events
        // No need to remove listeners on 'this.router' as it's part of the shadow DOM and will be GC'd
        document.removeEventListener('mousemove', this._boundMoveRouter);
        document.removeEventListener('mouseup', this._boundStopDrag);
        document.removeEventListener('touchmove', this._boundMoveRouter);
        document.removeEventListener('touchend', this._boundStopDrag);
        document.removeEventListener('touchcancel', this._boundStopDrag);

        // Mesh extender drag events
        document.removeEventListener('mousemove', this._boundMoveMeshExtender);
        document.removeEventListener('mouseup', this._boundStopMeshExtenderDrag);
        document.removeEventListener('touchmove', this._boundMoveMeshExtender);
        document.removeEventListener('touchend', this._boundStopMeshExtenderDrag);
        document.removeEventListener('touchcancel', this._boundStopMeshExtenderDrag);

        // Button clicks - no need to remove if elements are part of shadow DOM

        // Resize observer
        if (this.resizeObserver && this.routerPlacement) {
            this.resizeObserver.unobserve(this.routerPlacement);
        }
        this.resizeObserver = null;
        window.removeEventListener('resize', this._boundUpdateCanvasDimensions);
    }

    _initializeSimulator() {
        if (!this.routerPlacement || !this.signalStrengthCanvas || !this.router) {
            console.error('Required elements not found for simulator initialization');
            return;
        }

        // Get initial router dimensions
        const rect = this.router.getBoundingClientRect();
        this.routerDimensions.width = rect.width || 60;
        this.routerDimensions.height = rect.height || 60;

        // Initialize canvas with correct dimensions and clear
        this._updateCanvasDimensions();
        if (this.signalCtx) {
            this.signalCtx.clearRect(0, 0, this.signalStrengthCanvas.width, this.signalStrengthCanvas.height);
        }

        // Initialize floorplan
        this._initializeFloorplan();

        // Set initial router position in Living Room
        const initialLivingRoom = this.floorplanData.rooms.find(r => r.name === "Living Room");
        if (initialLivingRoom) {
            const centerX = Math.round(initialLivingRoom.x + (initialLivingRoom.width / 2) - (this.routerDimensions.width / 2));
            const centerY = Math.round(initialLivingRoom.y + (initialLivingRoom.height / 2) - (this.routerDimensions.height / 2));
            this.router.style.transition = 'none'; // Disable transition for initial placement
            this._updateRouterPosition(centerX, centerY);
            // Force reflow before re-enabling transition
            this.router.offsetHeight;
            requestAnimationFrame(() => {
                this.router.style.transition = 'left 0.05s ease-out, top 0.05s ease-out';
            });
        } else {
            this._updateRouterPosition(50, 50); // Fallback position
        }

        // Initial styles
        this.router.style.cursor = 'grab';
        if (this.meshExtender) this.meshExtender.style.cursor = 'grab';

        // Initial signal update
        this._updateSignalStrength();
        this._updateSignalInfo();
    }

    _resizeObserverCallback(entries) {
        for (const entry of entries) {
            if (entry.target === this.routerPlacement) {
                this._updateCanvasDimensions();
            }
        }
    }

    _updateCanvasDimensions() {
        if (!this.routerPlacement || !this.signalStrengthCanvas) {
            console.warn('Missing elements for canvas dimension update');
            return;
        }
        // Use clientWidth/Height as it reflects the actual rendered size
        const containerWidth = this.routerPlacement.clientWidth;
        const containerHeight = this.routerPlacement.clientHeight;

        // Check if dimensions are valid before setting
        if (containerWidth > 0 && containerHeight > 0) {
            this.signalStrengthCanvas.style.width = containerWidth + 'px';
            this.signalStrengthCanvas.style.height = containerHeight + 'px';
            this.signalStrengthCanvas.width = containerWidth;
            this.signalStrengthCanvas.height = containerHeight;

            // Force a redraw of the signal visualization
            requestAnimationFrame(() => {
                this._updateSignalStrength();
            });
        } else {
            console.warn('Router placement container has zero dimensions.');
        }
    }


    // --- Drag Handlers ---
    _startDrag(e) {
        // Prevent default only for touch to avoid scrolling
        if (e.type === 'touchstart') e.preventDefault();

        this.isDragging = true;
        const rect = this.router.getBoundingClientRect();
        if (e.type === 'mousedown') {
            this.currentX = e.clientX - rect.left;
            this.currentY = e.clientY - rect.top;
        } else { // touchstart
            this.currentX = e.touches[0].clientX - rect.left;
            this.currentY = e.touches[0].clientY - rect.top;
        }
        this.router.style.cursor = 'grabbing';
    }

    _moveRouter(e) {
        if (!this.isDragging || !this.router || !this.routerPlacement) return;
        // Prevent default only for touch to avoid scrolling
        if (e.type === 'touchmove') e.preventDefault();

        const rect = this.routerPlacement.getBoundingClientRect();
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const newX = clientX - rect.left - this.currentX;
        const newY = clientY - rect.top - this.currentY;

        this._updateRouterPosition(newX, newY);
    }

    _stopDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.router.style.cursor = 'grab';
    }

    _updateRouterPosition(x, y) {
        if (!this.router || !this.routerPlacement) return;

        x = Math.round(Math.max(0, Math.min(x, this.routerPlacement.offsetWidth - this.routerDimensions.width)));
        y = Math.round(Math.max(0, Math.min(y, this.routerPlacement.offsetHeight - this.routerDimensions.height)));

        this.lastKnownPosition = { x, y };
        this.router.style.left = x + 'px';
        this.router.style.top = y + 'px';

        requestAnimationFrame(() => {
            this._updateSignalStrength();
            this._updateSignalInfo();
        });
    }

    // --- Mesh Extender Handlers ---
    _toggleMeshExtender() {
        if (!this.meshExtender || !this.meshExtenderButton) return;

        this.meshExtenderPlaced = !this.meshExtenderPlaced;
        this.meshExtender.style.display = this.meshExtenderPlaced ? 'block' : 'none';
        this.meshExtenderButton.classList.toggle('active');

        if (this.meshExtenderPlaced) {
            const routerX = parseFloat(this.router.style.left) || 0;
            const routerY = parseFloat(this.router.style.top) || 0;
            const bestPosition = this._findBestMeshExtenderPosition(routerX, routerY);
            this._updateMeshExtenderPosition(bestPosition.x, bestPosition.y);
        }

        this._updateSignalStrength();
        this._updateSignalInfo();
    }

     _findBestMeshExtenderPosition(routerX, routerY) {
        const livingRoom = this.floorplanData.rooms.find(r => r.name === "Living Room");
        if (livingRoom) {
            return {
                x: livingRoom.x + Math.round(livingRoom.width * 0.66) - (this.meshExtenderDimensions.width / 2),
                y: livingRoom.y + Math.round(livingRoom.height / 2) - (this.meshExtenderDimensions.height / 2)
            };
        }
        return { x: routerX + 200, y: routerY }; // Fallback
    }

    _startMeshExtenderDrag(e) {
        if (!this.meshExtenderPlaced) return;
        if (e.type === 'touchstart') e.preventDefault();

        this.isMeshExtenderDragging = true;
        const rect = this.meshExtender.getBoundingClientRect();
        if (e.type === 'mousedown') {
            this.currentX = e.clientX - rect.left;
            this.currentY = e.clientY - rect.top;
        } else {
            this.currentX = e.touches[0].clientX - rect.left;
            this.currentY = e.touches[0].clientY - rect.top;
        }
        this.meshExtender.style.cursor = 'grabbing';
    }

    _moveMeshExtender(e) {
        if (!this.isMeshExtenderDragging || !this.meshExtender || !this.routerPlacement) return;
        if (e.type === 'touchmove') e.preventDefault();

        const rect = this.routerPlacement.getBoundingClientRect();
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const newX = clientX - rect.left - this.currentX;
        const newY = clientY - rect.top - this.currentY;

        this._updateMeshExtenderPosition(newX, newY);
    }

    _stopMeshExtenderDrag() {
        if (!this.isMeshExtenderDragging) return;
        this.isMeshExtenderDragging = false;
        if (this.meshExtender) {
            this.meshExtender.style.cursor = 'grab';
        }
    }

    _updateMeshExtenderPosition(x, y) {
        if (!this.meshExtender || !this.routerPlacement) return;

        x = Math.round(Math.max(0, Math.min(x, this.routerPlacement.offsetWidth - this.meshExtenderDimensions.width)));
        y = Math.round(Math.max(0, Math.min(y, this.routerPlacement.offsetHeight - this.meshExtenderDimensions.height)));

        this.meshExtenderLastPosition = { x, y };
        this.meshExtender.style.left = x + 'px';
        this.meshExtender.style.top = y + 'px';

        requestAnimationFrame(() => {
            this._updateSignalStrength();
            this._updateSignalInfo();
        });
    }

    // --- Interference Handlers ---
    _toggleInterference(sourceName) {
        const sourceData = this.floorplanData.interferenceSources.find(s => s.name === sourceName);
        if (!sourceData) return;

        sourceData.active = !sourceData.active;

        // Toggle button class
        const button = this.shadowRoot.getElementById(sourceName + 'Toggle');
        if (button) button.classList.toggle("active");

        // Toggle interference element class
        if (this.interferenceElements[sourceName]) {
            this.interferenceElements[sourceName].classList.toggle("active");
        }

        this._updateSignalStrength();
        this._updateSignalInfo();
    }


    // --- Floorplan Initialization ---
    _initializeFloorplan() {
        const wallThickness = 2;
        const wallColor = "#666";

        // Clear previous elements
        if (this.floorplanContainer) this.floorplanContainer.innerHTML = '';
        if (this.wallContainer) this.wallContainer.innerHTML = '';
        if (this.fixedObstaclesContainer) this.fixedObstaclesContainer.innerHTML = '';
        if (this.interferenceContainer) this.interferenceContainer.innerHTML = '';
        this.interferenceElements = {}; // Clear references

        const uniqueWallSegments = new Set();

        // Calculate Unique Wall Segments & Add Rooms/Labels
        this.floorplanData.rooms.forEach(room => {
            const x1 = room.x;
            const y1 = room.y;
            const x2 = room.x + room.width;
            const y2 = room.y + room.height;

            uniqueWallSegments.add('h-' + x1 + '-' + x2 + '-' + y1);
            uniqueWallSegments.add('h-' + x1 + '-' + x2 + '-' + y2);
            uniqueWallSegments.add('v-' + x1 + '-' + y1 + '-' + y2);
            uniqueWallSegments.add('v-' + x2 + '-' + y1 + '-' + y2);

            if (this.floorplanContainer) {
                const roomElement = document.createElement("div");
                roomElement.className = "room";
                roomElement.style.left = room.x + "px";
                roomElement.style.top = room.y + "px";
                roomElement.style.width = room.width + "px";
                roomElement.style.height = room.height + "px";

                const label = document.createElement("div");
                label.className = "room-label";
                label.textContent = room.name;
                let labelLeft = room.x + 5;
                let labelTop = room.y + 5;
                if (room.name === "Kitchen") { // Adjust Kitchen label
                    labelLeft = room.x + 55;
                    labelTop = room.y + 5;
                }
                label.style.left = labelLeft + "px";
                label.style.top = labelTop + "px";

                this.floorplanContainer.appendChild(roomElement);
                this.floorplanContainer.appendChild(label);
            }
        });

        // Add Laundry Room Label (Logic specific to this layout)
        const diningRoom = this.floorplanData.rooms.find(r => r.name === "Dining Room");
        const bedroom2 = this.floorplanData.rooms.find(r => r.name === "Bedroom 2");
        if (diningRoom && bedroom2 && this.floorplanContainer) {
             const overlapX = Math.max(diningRoom.x, bedroom2.x);
             const overlapY = Math.max(diningRoom.y, bedroom2.y);
             // ... (rest of overlap calculation)
             const laundryLabel = document.createElement("div");
             laundryLabel.className = "room-label";
             laundryLabel.textContent = "Laundry";
             laundryLabel.style.left = (overlapX + 5) + "px";
             laundryLabel.style.top = (overlapY + 5) + "px";
             this.floorplanContainer.appendChild(laundryLabel);
        }


        // Draw Unique Walls
        if (this.wallContainer) {
            uniqueWallSegments.forEach(segmentKey => {
                const parts = segmentKey.split('-');
                const type = parts[0];
                const x1 = parseInt(parts[1]);
                const y1_or_x2 = parseInt(parts[2]);
                const y2_or_y1 = parseInt(parts[3]);

                const wallElement = document.createElement("div");
                wallElement.style.position = "absolute";
                wallElement.style.backgroundColor = wallColor;

                if (type === 'h') { // Horizontal
                    const x2 = y1_or_x2;
                    const y = y2_or_y1;
                    wallElement.style.left = x1 + "px";
                    wallElement.style.top = (y - wallThickness / 2) + "px";
                    wallElement.style.width = (x2 - x1) + "px";
                    wallElement.style.height = wallThickness + "px";
                } else { // Vertical
                    const y1 = y1_or_x2;
                    const y2 = y2_or_y1;
                    const x = x1;
                    wallElement.style.left = (x - wallThickness / 2) + "px";
                    wallElement.style.top = y1 + "px";
                    wallElement.style.width = wallThickness + "px";
                    wallElement.style.height = (y2 - y1) + "px";
                }
                this.wallContainer.appendChild(wallElement);
            });
        }

        // Add fixed obstacles
        if (this.fixedObstaclesContainer) {
            this.floorplanData.fixedObstacles.forEach(obstacle => {
                const element = document.createElement("div");
                element.className = "fixed-obstacle";
                element.style.left = obstacle.x + "px";
                element.style.top = obstacle.y + "px";
                element.style.width = obstacle.width + "px";
                element.style.height = obstacle.height + "px";
                element.style.backgroundColor = this._getObstacleColor(obstacle.type);
                element.title = obstacle.type;
                if (obstacle.type === 'washer') element.textContent = 'W';
                else if (obstacle.type === 'dryer') element.textContent = 'D';
                if (obstacle.type === 'refrigerator') element.style.zIndex = '5';
                this.fixedObstaclesContainer.appendChild(element);
            });
        }

        // Add interference sources and store references
        if (this.interferenceContainer) {
            this.floorplanData.interferenceSources.forEach(source => {
                const element = document.createElement("div");
                // Use a more specific class name for easier selection
                element.className = 'interference-source interference-' + source.name;
                element.style.left = (source.x - source.radius) + "px";
                element.style.top = (source.y - source.radius) + "px";
                element.style.width = (source.radius * 2) + "px";
                element.style.height = (source.radius * 2) + "px";
                // element.style.borderRadius = "50%"; // Handled by CSS
                if (source.active) {
                    element.classList.add("active");
                }
                this.interferenceContainer.appendChild(element);
                this.interferenceElements[source.name] = element; // Store reference
            });
        }
    }

    _getObstacleColor(type) {
        switch(type) {
            case "refrigerator": return "#90A4AE";
            case "washer": case "dryer": return "#78909C";
            case "mirror": return "rgba(200, 200, 200, 0.8)";
            case "cabinet": return "#8D6E63";
            default: return "#BDBDBD";
        }
    }

    // --- Signal Calculation & Drawing ---

    _updateSignalStrength() {
        if (!this.routerPlacement || !this.signalCtx || !this.signalStrengthCanvas || !this.router) {
            console.warn('Missing required elements for signal update');
            return;
        }

        try {
            const routerX = parseFloat(this.router.style.left) || 0;
            const routerY = parseFloat(this.router.style.top) || 0;
            const meshX = parseFloat(this.meshExtender.style.left) || 0;
            const meshY = parseFloat(this.meshExtender.style.top) || 0;

            const routerWidth = this.router.offsetWidth || 60;
            const routerHeight = this.router.offsetHeight || 60;
            const meshWidth = this.meshExtender.offsetWidth || 60;
            const meshHeight = this.meshExtender.offsetHeight || 60;

            const routerCenterX = Math.floor(routerX + (routerWidth / 2));
            const routerCenterY = Math.floor(routerY + (routerHeight / 2));
            const meshCenterX = Math.floor(meshX + (meshWidth / 2));
            const meshCenterY = Math.floor(meshY + (meshHeight / 2));

            if (!Number.isFinite(routerCenterX) || !Number.isFinite(routerCenterY)) {
                console.warn('Invalid router position:', { routerCenterX, routerCenterY });
                return;
            }

            const canvasWidth = this.signalStrengthCanvas.width;
            const canvasHeight = this.signalStrengthCanvas.height;
            if (!canvasWidth || !canvasHeight || canvasWidth <= 0 || canvasHeight <= 0) {
                console.warn('Invalid canvas dimensions for signal update:', canvasWidth, canvasHeight);
                // Attempt to resize/reinitialize if dimensions are bad
                this._updateCanvasDimensions();
                // Check again after attempting resize
                if (this.signalStrengthCanvas.width <= 0 || this.signalStrengthCanvas.height <= 0) {
                    console.error('Canvas dimensions still invalid after resize attempt.');
                    return;
                }
                // If resize worked, use the new dimensions
                // Note: This might cause a flicker or delay, consider a loading state
                // For simplicity, we'll just proceed with the potentially updated dimensions
            }


            this.signalCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            const imageData = this.signalCtx.createImageData(canvasWidth, canvasHeight);
            const data = imageData.data;

            for (let y = 0; y < canvasHeight; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    const strength = this.meshExtenderPlaced ?
                        this._calculateCombinedSignalStrength(x, y, routerCenterX, routerCenterY, meshCenterX, meshCenterY) :
                        this._calculateSignalAtPoint(x, y, routerCenterX, routerCenterY);
                    const color = this._getColorForStrength(strength);
                    const alpha = Math.floor(strength * 0.6 * 255); // Adjusted alpha

                    const i = (y * canvasWidth + x) * 4;
                    data[i] = color.r;
                    data[i + 1] = color.g;
                    data[i + 2] = color.b;
                    data[i + 3] = alpha;
                }
            }
            this.signalCtx.putImageData(imageData, 0, 0);

            // Apply Blur
            this.signalCtx.filter = 'blur(16px)';
            // Use temporary canvas for blur to avoid feedback loop
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasWidth;
            tempCanvas.height = canvasHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.signalStrengthCanvas, 0, 0);
            this.signalCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            this.signalCtx.drawImage(tempCanvas, 0, 0);
            this.signalCtx.filter = 'none'; // Reset filter

        } catch (error) {
            console.error('Error updating signal strength:', error);
        }
    }

    _updateSignalInfo() {
        if (!this.router || !this.signalInfo) return;
        if (!this.router.offsetWidth || !this.router.offsetHeight) return;

        const routerLeft = parseFloat(this.router.style.left) || 0;
        const routerTop = parseFloat(this.router.style.top) || 0;
        if (isNaN(routerLeft) || isNaN(routerTop)) return;

        const routerX = routerLeft + (this.router.offsetWidth / 2);
        const routerY = routerTop + (this.router.offsetHeight / 2);

        const strengthAtRouter = this._calculateSignalAtPoint(routerX, routerY, routerX, routerY);
        const signalPercent = Math.round(Math.max(0, Math.min(1, strengthAtRouter)) * 100);
        let infoText = 'Signal Strength at Router: ' + signalPercent + '%';

        if (this.meshExtenderPlaced && this.meshExtender) {
            const meshLeft = parseFloat(this.meshExtender.style.left) || 0;
            const meshTop = parseFloat(this.meshExtender.style.top) || 0;
            const meshX = meshLeft + (this.meshExtender.offsetWidth / 2);
            const meshY = meshTop + (this.meshExtender.offsetHeight / 2);

            this.meshExtenderStrength = this._calculateSignalAtPoint(meshX, meshY, routerX, routerY);
            const meshInputPercent = Math.round(this.meshExtenderStrength * 100);
            const boostFactor = this._getMeshBoostFactor(this.meshExtenderStrength);
            const outputPercent = Math.round(boostFactor * 100);

            infoText += ' | Mesh Extender Input: ' + meshInputPercent + '% | Output: ' + outputPercent + '%';
        } else {
            infoText += " | Mesh Extender: Not Placed";
        }

        this.signalInfo.textContent = infoText;
    }

    _getColorForStrength(strength) {
        const green = { r: 76, g: 175, b: 80 };
        const blue = { r: 33, g: 150, b: 243 };
        const yellow = { r: 255, g: 193, b: 7 };
        const red = { r: 244, g: 67, b: 54 };
        let r, g, b;

        if (strength >= 0.6) { // Green to Blue
            const t = (strength - 0.6) / 0.4;
            r = Math.round(blue.r + (green.r - blue.r) * t);
            g = Math.round(blue.g + (green.g - blue.g) * t);
            b = Math.round(blue.b + (green.b - blue.b) * t);
        } else if (strength >= 0.3) { // Blue to Yellow
            const t = (strength - 0.3) / 0.3;
            r = Math.round(yellow.r + (blue.r - yellow.r) * t);
            g = Math.round(yellow.g + (blue.g - yellow.g) * t);
            b = Math.round(yellow.b + (blue.b - yellow.b) * t);
        } else { // Yellow to Red
            const t = strength / 0.3;
            r = Math.round(red.r + (yellow.r - red.r) * t);
            g = Math.round(red.g + (yellow.g - red.g) * t);
            b = Math.round(red.b + (yellow.b - red.b) * t);
        }
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return { r, g, b };
    }

    _calculateSignalAtPoint(x, y, sourceX, sourceY) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(sourceX) || !Number.isFinite(sourceY)) {
            return 0;
        }
        if (!this.signalStrengthCanvas || this.signalStrengthCanvas.width <= 0 || this.signalStrengthCanvas.height <= 0) {
             console.warn("Canvas not ready for signal calculation");
             return 0; // Cannot calculate without valid canvas dimensions
        }


        let sourceInterferencePenalty = 1.0;
        for (const source of this.floorplanData.interferenceSources) {
            if (source.active) {
                const distToInterference = Math.sqrt(Math.pow(sourceX - source.x, 2) + Math.pow(sourceY - source.y, 2));
                if (distToInterference <= source.radius) {
                    const proximityFactor = distToInterference / source.radius;
                    const basePenaltyFactor = Math.pow(proximityFactor, 1.5);
                    const signalMultiplier = 0.25 + (1 - 0.25) * basePenaltyFactor;
                    sourceInterferencePenalty *= signalMultiplier;
                }
            }
        }

        const dx = x - sourceX;
        const dy = y - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxRadius = Math.min(this.signalStrengthCanvas.width, this.signalStrengthCanvas.height) * 0.5 * 5;

        let strength = Math.pow(Math.max(0, 1 - (distance / maxRadius)), 2) * sourceInterferencePenalty;

        let totalAttenuation = this._calculateAttenuation(x, y, sourceX, sourceY);

        // Apply interference sources at the target point
        for (const source of this.floorplanData.interferenceSources) {
            if (source.active) {
                const distToSource = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                if (distToSource <= source.radius) {
                    const interferenceStrength = 1 - (distToSource / source.radius);
                    totalAttenuation += source.attenuation * interferenceStrength;
                }
                // Check line of sight pass-through
                if (distToSource > source.radius && this._lineSegmentIntersectsCircle(sourceX, sourceY, x, y, source.x, source.y, source.radius)) {
                    totalAttenuation += source.attenuation * 0.75; // Reduced factor for pass-through
                }
            }
        }


        strength *= Math.max(0, 1 - totalAttenuation);
        return Math.max(0, Math.min(1, strength));
    }

    _calculateCombinedSignalStrength(x, y, routerX, routerY, meshX, meshY) {
        const routerSignal = this._calculateSignalAtPoint(x, y, routerX, routerY);
        if (!this.meshExtenderPlaced) return routerSignal;

        // Calculate mesh extender's received signal (using the same function)
        this.meshExtenderStrength = this._calculateSignalAtPoint(meshX, meshY, routerX, routerY);

        const MESH_MIN_INPUT_THRESHOLD = 0.05;
        if (this.meshExtenderStrength < MESH_MIN_INPUT_THRESHOLD) {
            return routerSignal; // Mesh doesn't work if input is too low
        }

        const boostFactor = this._getMeshBoostFactor(this.meshExtenderStrength);
        const MESH_EFFECTIVE_RANGE = 1.2;
        const maxRange = Math.min(this.signalStrengthCanvas.width, this.signalStrengthCanvas.height) * 0.5 * 5 * MESH_EFFECTIVE_RANGE;

        const dx = x - meshX;
        const dy = y - meshY;
        const distanceFromMesh = Math.sqrt(dx * dx + dy * dy);

        // Calculate mesh signal strength based on distance from mesh
        let meshSignal = boostFactor * Math.pow(Math.max(0, 1 - (distanceFromMesh / maxRange)), 2);

        // Apply attenuation factors from mesh to point
        const meshAttenuation = this._calculateAttenuation(x, y, meshX, meshY);

         // Apply interference sources at the target point (relative to mesh signal)
        for (const source of this.floorplanData.interferenceSources) {
            if (source.active) {
                const distToSource = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                if (distToSource <= source.radius) {
                    const interferenceStrength = 1 - (distToSource / source.radius);
                    // Attenuate the mesh signal if the point is in an interference zone
                    meshSignal *= Math.max(0, 1 - (source.attenuation * interferenceStrength));
                }
                 // Check line of sight pass-through from mesh
                if (distToSource > source.radius && this._lineSegmentIntersectsCircle(meshX, meshY, x, y, source.x, source.y, source.radius)) {
                     meshSignal *= Math.max(0, 1 - (source.attenuation * 0.75)); // Reduced factor
                }
            }
        }


        meshSignal *= Math.max(0, 1 - meshAttenuation);

        return Math.max(routerSignal, meshSignal); // Return the stronger signal
    }

    _getMeshBoostFactor(inputSignal) {
        const MESH_MIN_INPUT_THRESHOLD = 0.05;
        if (inputSignal < MESH_MIN_INPUT_THRESHOLD) return 0;

        const getScaledBoost = (minOutput, maxOutput, input, minInput, maxInput) => {
            const scale = (input - minInput) / (maxInput - minInput);
            return minOutput + (maxOutput - minOutput) * Math.min(1, Math.max(0, scale));
        };

        if (inputSignal <= 0.15) return getScaledBoost(0.30, 0.40, inputSignal, 0.05, 0.15);
        if (inputSignal <= 0.30) return getScaledBoost(0.41, 0.60, inputSignal, 0.16, 0.30);
        if (inputSignal <= 0.50) return getScaledBoost(0.61, 0.80, inputSignal, 0.31, 0.50);
        return 1.0; // Max boost above 50% input
    }

    _calculateAttenuation(x, y, sourceX, sourceY) {
        let totalAttenuation = 0;

        if (this._checkExternalWallsInPath(sourceX, sourceY, x, y, this.floorplanData.rooms)) {
            totalAttenuation += 0.65; // High attenuation for external walls
        }

        for (const room of this.floorplanData.rooms) {
            const pointInRoom = x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height;
            const sourceInRoom = sourceX >= room.x && sourceX <= room.x + room.width && sourceY >= room.y && sourceY <= room.y + room.height;

            if (pointInRoom !== sourceInRoom) {
                // Check if the line segment actually intersects an internal wall segment
                // This requires more complex geometry checks, simplified for now
                totalAttenuation += 0.08; // Simplified: Assume crossing boundary = internal wall
            }

            if (pointInRoom) {
                totalAttenuation += room.zoneAttenuation;
            }
        }

        for (const obstacle of this.floorplanData.fixedObstacles) {
            if (this._lineIntersectsRect(sourceX, sourceY, x, y, obstacle.x, obstacle.y, obstacle.x + obstacle.width, obstacle.y + obstacle.height)) {
                totalAttenuation += obstacle.attenuation;
            }
        }

        // Interference attenuation is handled separately in _calculateSignalAtPoint and _calculateCombinedSignalStrength

        return totalAttenuation;
    }


    // --- Geometry Helper Functions ---
    _lineIntersectsRect(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
        // Basic bounding box check
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
        if (maxX < rx1 || minX > rx2 || maxY < ry1 || minY > ry2) return false;

        // Check intersections with rectangle sides
        return (
            this._doLinesIntersect(x1, y1, x2, y2, rx1, ry1, rx2, ry1) || // Top
            this._doLinesIntersect(x1, y1, x2, y2, rx1, ry2, rx2, ry2) || // Bottom
            this._doLinesIntersect(x1, y1, x2, y2, rx1, ry1, rx1, ry2) || // Left
            this._doLinesIntersect(x1, y1, x2, y2, rx2, ry1, rx2, ry2)    // Right
        );
    }

    _doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x4 - x3) * (y1 - y2) - (x1 - x2) * (y4 - y3);
        if (denom === 0) return false; // Parallel or collinear
        const ua = ((x4 - x3) * (y1 - y3) - (x1 - x3) * (y4 - y3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (x1 - x3) * (y2 - y1)) / denom;
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    _checkExternalWallsInPath(x1, y1, x2, y2, rooms) {
        for (const room of rooms) {
            if (room.externalWalls && this._isExternalWallIntersection(x1, y1, x2, y2, room)) {
                return true;
            }
        }
        return false;
    }

    _isExternalWallIntersection(x1, y1, x2, y2, room) {
        if (!room || !room.externalWalls) return false;
        for (const wall of room.externalWalls) {
            let wallStart, wallEnd;
            switch (wall) {
                case "north": wallStart = { x: room.x, y: room.y }; wallEnd = { x: room.x + room.width, y: room.y }; break;
                case "south": wallStart = { x: room.x, y: room.y + room.height }; wallEnd = { x: room.x + room.width, y: room.y + room.height }; break;
                case "west": wallStart = { x: room.x, y: room.y }; wallEnd = { x: room.x, y: room.y + room.height }; break;
                case "east": wallStart = { x: room.x + room.width, y: room.y }; wallEnd = { x: room.x + room.width, y: room.y + room.height }; break;
                default: continue;
            }
            if (this._doLinesIntersect(x1, y1, x2, y2, wallStart.x, wallStart.y, wallEnd.x, wallEnd.y)) {
                return true;
            }
        }
        return false;
    }

    _lineSegmentIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const fx = x1 - cx;
        const fy = y1 - cy;
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - r * r;
        let discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return false;

        discriminant = Math.sqrt(discriminant);
        const t1 = (-b - discriminant) / (2 * a);
        const t2 = (-b + discriminant) / (2 * a);

        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) return true;

        const distSq1 = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy);
        const distSq2 = (x2 - cx) * (x2 - cx) + (y2 - cy) * (y2 - cy);
        if (distSq1 <= r * r && distSq2 <= r * r) return true; // Segment fully inside

        return false;
    }
}

// Define the custom element
const tagName = 'router-simulator-simulator';
customElements.define(tagName, RouterSimulatorElement);
console.log(`[WebComponent] Custom element "${tagName}" defined.`);
