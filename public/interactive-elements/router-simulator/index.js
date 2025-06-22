// Import necessary modules
import { allFloorplans, initializeFloorplanVisuals } from './floorplan.js'; // Import allFloorplans
import { routerSimulatorTemplate } from './template.js';
import * as dragHandlers from './drag-handlers.js';
// No workerComm import needed - We'll handle worker directly
// import * as uiHelpers from './ui-helpers.js'; // ui-helpers functions removed or moved

class RouterSimulatorElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(routerSimulatorTemplate.content.cloneNode(true));

        // Element references
        this.routerPlacement = this.shadowRoot.getElementById("routerPlacement");
        this.router = this.shadowRoot.getElementById("router");
        this.meshExtender = this.shadowRoot.getElementById("meshExtender"); // Extender 1
        this.meshExtenderButton = this.shadowRoot.getElementById("meshExtenderButton"); // Button 1
        this.meshExtender2 = this.shadowRoot.getElementById("meshExtender2"); // Extender 2
        this.meshExtenderButton2 = this.shadowRoot.getElementById("meshExtenderButton2"); // Button 2
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
        // this.signalInfo = this.shadowRoot.getElementById("signalInfo"); // Removed - no longer exists
        this.bluetoothToggle = this.shadowRoot.getElementById("bluetoothToggle");
        this.babyMonitorToggle = this.shadowRoot.getElementById("babyMonitorToggle");
        this.floorplanTabs = this.shadowRoot.querySelector('.floorplan-tabs'); // Add reference for tabs

        // Worker state
        this.worker = null;
        this.isWorkerReady = false;
        this.isWorkerCalculating = false;
        this.pendingWorkerUpdate = false;
        this._rafId = null; // For requestAnimationFrame throttling

        // State variables (keep these)
        this.interferenceElements = {};
        this.isDraggingInterference = null; // Track which interference source is being dragged

        // Extender State (Array)
        this.extenders = [
            { id: 1, placed: false, x: 0, y: 0, strength: 0, dimensions: { width: 60, height: 60 }, element: null, button: null },
            { id: 2, placed: false, x: 0, y: 0, strength: 0, dimensions: { width: 60, height: 60 }, element: null, button: null }
        ];
        this.draggingExtenderId = null; // Track which extender is being dragged (1 or 2)

        // Router State
        this.lastKnownPosition = { x: 0, y: 0 };
        this.routerDimensions = { width: 60, height: 60 };
        this.isDragging = false; // For router dragging
        // this.currentX = 0; // Offset within the dragged element - Not needed with new drag logic
        // this.currentY = 0; // Offset within the dragged element - Not needed with new drag logic
        this.offsetX = 0; // Drag start offset X relative to parent
        this.offsetY = 0; // Drag start offset Y relative to parent

        // Floorplan State
        this.currentFloorplanKey = 'floor1'; // Track current floorplan
        // IMPORTANT: Deep clone floorplanData to avoid mutations affecting the original data
        this.floorplanData = JSON.parse(JSON.stringify(allFloorplans[this.currentFloorplanKey]));

        // Bind methods for event listeners that need 'this' context preserved across calls
        this._boundUpdateCanvasDimensions = this._updateCanvasDimensions.bind(this);
        this._boundResizeObserverCallback = this._resizeObserverCallback.bind(this);
        this._boundHandleWorkerMessage = this._handleWorkerMessage.bind(this); // Bind worker message handler

        // Theme handling methods
        this.applyTheme = this.applyTheme.bind(this);
        this.updateTheme = this.updateTheme.bind(this);
        this.isColorDark = this.isColorDark.bind(this);

        // Flag to track if we're in the middle of a theme transition
        this.isTransitioning = false;

        // Assign elements to state array after constructor
        this.extenders[0].element = this.meshExtender;
        this.extenders[0].button = this.meshExtenderButton;
        this.extenders[1].element = this.meshExtender2;
        this.extenders[1].button = this.meshExtenderButton2;
    }

    connectedCallback() {
        console.log("[Main] RouterSimulatorElement connected");
        // Initialize worker first
        this._initializeWorker();
        // Initialize simulator (will wait for worker ready if needed)
        this._initializeSimulator();
        this._attachEventListeners();

        // Check initial theme and apply it
        this.applyTheme();

        // Set up observer for theme changes
        this.setupThemeObserver();

        // Set up interval to check theme periodically, but with a shorter interval
        // This helps catch theme changes that might be missed by the observer
        this.themeInterval = setInterval(() => {
            this.applyTheme();
        }, 300); // 300ms for more responsive updates

        console.log('[RouterSimulator] Component initialized');
    }

    disconnectedCallback() {
        console.log("[Main] RouterSimulatorElement disconnected");
        this._removeEventListeners();
        // Terminate worker
        if (this.worker) {
            console.log("[Main] Terminating worker...");
            this.worker.terminate();
            this.worker = null;
            this.isWorkerReady = false;
            console.log("[Main] Worker terminated.");
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId); // Cancel any pending animation frame
        }

        // Clean up observer and interval
        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.themeInterval) {
            clearInterval(this.themeInterval);
        }

        // Remove message event listener
        window.removeEventListener('message', this.messageHandler);

        console.log('[RouterSimulator] Component disconnected and cleaned up');
    }

    _attachEventListeners() {
        // Router drag events - Use imported handlers with arrow functions to pass 'this'
        this.router.addEventListener('mousedown', (e) => dragHandlers.startDrag(e, this));
        this.router.addEventListener('touchstart', (e) => dragHandlers.startDrag(e, this), { passive: false });
        // Use document for move/end events to handle dragging outside the element
        document.addEventListener('mousemove', this._handleMoveRouter = (e) => dragHandlers.moveRouter(e, this));
        document.addEventListener('mouseup', this._handleStopDrag = (e) => dragHandlers.stopDrag(e, this));
        document.addEventListener('touchmove', this._handleMoveRouter, { passive: false }); // Re-use bound handler
        document.addEventListener('touchend', this._handleStopDrag); // Re-use bound handler
        document.addEventListener('touchcancel', this._handleStopDrag); // Re-use bound handler

        // Mesh extender drag events - Use imported handlers with arrow functions, passing ID
        this.meshExtender.addEventListener('mousedown', (e) => dragHandlers.startMeshExtenderDrag(e, this, 1));
        this.meshExtender.addEventListener('touchstart', (e) => dragHandlers.startMeshExtenderDrag(e, this, 1), { passive: false });
        this.meshExtender2.addEventListener('mousedown', (e) => dragHandlers.startMeshExtenderDrag(e, this, 2));
        this.meshExtender2.addEventListener('touchstart', (e) => dragHandlers.startMeshExtenderDrag(e, this, 2), { passive: false });

        // Document listeners for move/end - these will use draggingExtenderId set by startDrag
        document.addEventListener('mousemove', this._handleMoveMeshExtender = (e) => dragHandlers.moveMeshExtender(e, this));
        document.addEventListener('mouseup', this._handleStopMeshExtenderDrag = (e) => dragHandlers.stopMeshExtenderDrag(e, this));
        document.addEventListener('touchmove', this._handleMoveMeshExtender, { passive: false }); // Re-use bound handler
        document.addEventListener('touchend', this._handleStopMeshExtenderDrag); // Re-use bound handler
        document.addEventListener('touchcancel', this._handleStopMeshExtenderDrag); // Re-use bound handler

        // Button clicks - Pass extender ID
        this.meshExtenderButton.addEventListener('click', this._toggleMeshExtender.bind(this, 1));
        this.meshExtenderButton2.addEventListener('click', this._toggleMeshExtender.bind(this, 2));
        this.bluetoothToggle.addEventListener('click', this._toggleInterference.bind(this, 'bluetooth'));
        this.babyMonitorToggle.addEventListener('click', this._toggleInterference.bind(this, 'babyMonitor'));
        // Floorplan tab clicks
        if (this.floorplanTabs) {
            this.floorplanTabs.addEventListener('click', this._handleFloorplanChange.bind(this));
        }

        // Resize observer
        this.resizeObserver = new ResizeObserver(this._boundResizeObserverCallback);
        if (this.routerPlacement) {
            this.resizeObserver.observe(this.routerPlacement);
        }
        // Also listen to window resize as a fallback
        window.addEventListener('resize', this._boundUpdateCanvasDimensions);
    }

    _removeEventListeners() {
        // Router drag events - Remove the handlers stored during addEventListener
        // No need to remove listeners on 'this.router' as it's part of the shadow DOM and will be GC'd
        if (this._handleMoveRouter) document.removeEventListener('mousemove', this._handleMoveRouter);
        if (this._handleStopDrag) document.removeEventListener('mouseup', this._handleStopDrag);
        if (this._handleMoveRouter) document.removeEventListener('touchmove', this._handleMoveRouter);
        if (this._handleStopDrag) document.removeEventListener('touchend', this._handleStopDrag);
        if (this._handleStopDrag) document.removeEventListener('touchcancel', this._handleStopDrag);

        // Mesh extender drag events - Remove the handlers stored during addEventListener
        if (this._handleMoveMeshExtender) document.removeEventListener('mousemove', this._handleMoveMeshExtender);
        if (this._handleStopMeshExtenderDrag) document.removeEventListener('mouseup', this._handleStopMeshExtenderDrag);
        if (this._handleMoveMeshExtender) document.removeEventListener('touchmove', this._handleMoveMeshExtender);
        if (this._handleStopMeshExtenderDrag) document.removeEventListener('touchend', this._handleStopMeshExtenderDrag);
        if (this._handleStopMeshExtenderDrag) document.removeEventListener('touchcancel', this._handleStopMeshExtenderDrag);

        // Button clicks - no need to remove if elements are part of shadow DOM

        // Resize observer
        if (this.resizeObserver && this.routerPlacement) {
            this.resizeObserver.unobserve(this.routerPlacement);
            this.resizeObserver = null; // Explicitly nullify
        }
        window.removeEventListener('resize', this._boundUpdateCanvasDimensions);

        // Remove interference drag handlers
        if (this._handleMoveInterference) document.removeEventListener('mousemove', this._handleMoveInterference);
        if (this._handleStopInterference) document.removeEventListener('mouseup', this._handleStopInterference);
        if (this._handleMoveInterference) document.removeEventListener('touchmove', this._handleMoveInterference);
        if (this._handleStopInterference) document.removeEventListener('touchend', this._handleStopInterference);
        if (this._handleStopInterference) document.removeEventListener('touchcancel', this._handleStopInterference);

        // Remove floorplan tab listener
        // No need to remove if floorplanTabs is part of shadow DOM

        // Remove worker listener
        if (this.worker) {
            this.worker.removeEventListener('message', this._boundHandleWorkerMessage);
        }
    }

    // --- Worker Initialization and Communication ---
    _initializeWorker() {
        try {
            // Get the base path from the current page URL
            // This handles both local development and GitHub Pages deployment
            const currentPath = window.location.pathname;

            // Determine the base path for assets
            let basePath = '';

            // Check if we're running locally (localhost) or on GitHub Pages
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Local development - use root path
                basePath = '';
            } else {
                // Production deployment (GitHub Pages)
                // Extract the repository name from the path
                const pathSegments = currentPath.split('/').filter(segment => segment);
                if (pathSegments.length > 0) {
                    // For GitHub Pages, the first segment is typically the repository name
                    // e.g., /Training-Hub/ -> basePath = '/Training-Hub'
                    basePath = '/' + pathSegments[0];
                }
            }

            const workerPath = `${basePath}/interactive-elements/router-simulator/worker.js`;
            console.log(`[Main] Current path: ${currentPath}, Base path: ${basePath}`);
            console.log(`[Main] Initializing worker at path: ${workerPath}`);
            this.worker = new Worker(workerPath);
            this.worker.addEventListener('message', this._boundHandleWorkerMessage);
            this.worker.onerror = (error) => {
                console.error('[Main] Worker Error:', error.message, error);
                this.isWorkerReady = false; // Mark as not ready on error
            };
            console.log("[Main] Worker initialized.");
            // Worker will signal readiness implicitly when first config is sent/processed
        } catch (error) {
            console.error("[Main] Failed to initialize worker:", error);
            // Handle cases where workers are not supported or file not found
        }
    }

    _sendConfigToWorker() {
        if (!this.worker) {
             console.warn("[Main] _sendConfigToWorker: Worker not initialized.");
             return;
        }
         if (!this.signalStrengthCanvas || !this.floorplanData) {
            console.warn("[Main] _sendConfigToWorker: Canvas or floorplan data not ready.");
            return;
        }
        const canvasWidth = this.signalStrengthCanvas.width;
        const canvasHeight = this.signalStrengthCanvas.height;

        if (canvasWidth > 0 && canvasHeight > 0) {
            this.worker.postMessage({
                type: 'updateConfig',
                payload: {
                    floorplanData: this.floorplanData, // Send the current floorplan data
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight
                }
            });
            console.log("[Main] Sent 'updateConfig' to worker.");
            // Assume worker is ready after first successful config send
            if (!this.isWorkerReady) {
                 this.isWorkerReady = true;
                 console.log("[Main] Worker marked as ready. Requesting initial signal calc.");
                 this._requestSignalUpdate(); // Trigger initial calculation now that config is sent
            }
        } else {
             console.warn("[Main] Canvas dimensions are zero, skipping config update.");
        }
    }

     _handleWorkerMessage(e) {
        const { type, payload } = e.data;
        console.log("[Main] Received message from worker:", type);

        if (type === 'signalResult') {
            console.log("[Main] Received 'signalResult'.");
            this.isWorkerCalculating = false;
            // Store the calculated strengths for UI updates (if needed later)
            if (payload.extenderStrengths) {
                 payload.extenderStrengths.forEach(item => {
                     const extender = this.extenders.find(ext => ext.id === item.id);
                     if (extender) {
                         extender.strength = item.strength;
                     }
                 });
            }

            // Draw the received image data
            if (this.signalCtx && payload.imageData) {
                console.log("[Main] Drawing heatmap from worker data...");
                this._drawHeatmap(payload.imageData);
            } else {
                 console.warn("[Main] Canvas context or imageData missing, cannot draw heatmap.");
            }

            // If there was a pending update requested while calculating, trigger it now
            if (this.pendingWorkerUpdate) {
                this.pendingWorkerUpdate = false;
                console.log("[Main] Pending update exists, requesting new calculation.");
                this._requestSignalUpdate();
            }
        } else {
            console.warn("[Main] Received unknown message type from worker:", type);
        }
    }

    _drawHeatmap(imageData) {
        if (!this.signalCtx || !this.signalStrengthCanvas) {
             console.warn("[Main] _drawHeatmap: Canvas context or element missing.");
             return;
        }
        const canvasWidth = this.signalStrengthCanvas.width;
        const canvasHeight = this.signalStrengthCanvas.height;
         if (!canvasWidth || !canvasHeight) {
             console.warn("[Main] _drawHeatmap: Canvas dimensions are zero.");
             return;
         }

        console.log("[Main] _drawHeatmap: Clearing canvas and putting image data.");
        this.signalCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.signalCtx.putImageData(imageData, 0, 0);

        // Apply blur for smoother visualization
        console.log("[Main] _drawHeatmap: Applying blur.");
        this.signalCtx.filter = 'blur(16px)';
        // Use a temporary canvas for blurring to avoid feedback loops if drawing directly
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            console.log("[Main] _drawHeatmap: Using temporary canvas for blur.");
            tempCtx.drawImage(this.signalStrengthCanvas, 0, 0); // Draw current canvas to temp
            this.signalCtx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear original
            this.signalCtx.drawImage(tempCanvas, 0, 0); // Draw blurred image back
        } else {
             console.warn("[Main] _drawHeatmap: Failed to get context for temporary blur canvas.");
             // Fallback if temp canvas fails - draw blurred directly (might flicker)
             this.signalCtx.drawImage(this.signalStrengthCanvas, 0, 0);
        }
        this.signalCtx.filter = 'none'; // Reset filter
        console.log("[Main] _drawHeatmap: Finished drawing.");
    }


    // --- Floorplan Switching ---
    _handleFloorplanChange(event) {
        const clickedButton = event.target.closest('.tab-button');
        if (!clickedButton || !this.floorplanTabs) return;

        const newFloorplanKey = clickedButton.dataset.floorplan;
        if (newFloorplanKey === this.currentFloorplanKey) return; // No change

        // Update state
        this.currentFloorplanKey = newFloorplanKey;
        this.floorplanData = JSON.parse(JSON.stringify(allFloorplans[this.currentFloorplanKey]));

        // Update button active states
        this.floorplanTabs.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.floorplan === newFloorplanKey);
        });

        // Re-initialize visuals for the new floorplan
        // This clears old elements and draws new ones
        this.interferenceElements = initializeFloorplanVisuals(this.shadowRoot, this.floorplanData);

        // Re-attach drag handlers for new interference elements
        this._reAttachInterferenceHandlers();

        // Reset device positions (optional, or could try to maintain relative positions)
        // For simplicity, let's reset to default for the new floorplan
        this._resetDevicePositions();

        console.log(`[Main] Switching floorplan to: ${newFloorplanKey}`);
        // Send new config to worker
        this._sendConfigToWorker(); // This also triggers recalculation if worker becomes ready
        // Explicitly request update for the new floorplan
        this._requestSignalUpdate();

    }

    _reAttachInterferenceHandlers() {
        // Remove old document listeners first to avoid duplicates
        if (this._handleMoveInterference) document.removeEventListener('mousemove', this._handleMoveInterference);
        if (this._handleStopInterference) document.removeEventListener('mouseup', this._handleStopInterference);
        if (this._handleMoveInterference) document.removeEventListener('touchmove', this._handleMoveInterference);
        if (this._handleStopInterference) document.removeEventListener('touchend', this._handleStopInterference);
        if (this._handleStopInterference) document.removeEventListener('touchcancel', this._handleStopInterference);

        // Add listeners to new elements
        this.floorplanData.interferenceSources.forEach(source => {
            const element = this.interferenceElements[source.name];
            if (element) {
                // Ensure visual position matches data
                const visualX = source.x - source.radius;
                const visualY = source.y - source.radius;
                element.style.transform = `translate(${visualX}px, ${visualY}px)`;
                if (source.active) element.classList.add('active'); // Ensure active class is set

                // Add drag event listeners
                element.addEventListener('mousedown', (e) => dragHandlers.startInterferenceDrag(e, this, source.name));
                element.addEventListener('touchstart', (e) => dragHandlers.startInterferenceDrag(e, this, source.name), { passive: false });
            }
        });

        // Re-add document-level handlers
        document.addEventListener('mousemove', this._handleMoveInterference = (e) => dragHandlers.moveInterference(e, this));
        document.addEventListener('mouseup', this._handleStopInterference = (e) => dragHandlers.stopInterferenceDrag(e, this));
        document.addEventListener('touchmove', this._handleMoveInterference, { passive: false });
        document.addEventListener('touchend', this._handleStopInterference);
        document.addEventListener('touchcancel', this._handleStopInterference);

        // Also re-sync button states with the new floorplan's interference data
        this._syncInterferenceButtons();
    }

    _resetDevicePositions() {
        // Reset Router Position (Set to specific location between TV and coffee table)
        // const firstRoom = this.floorplanData.rooms[0]; // Original logic commented out
        let initialX, initialY;
        // if (firstRoom) {
        //     initialX = Math.round(firstRoom.x + (firstRoom.width / 2) - (this.routerDimensions.width / 2));
        //     initialY = Math.round(firstRoom.y + (firstRoom.height / 2) - (this.routerDimensions.height / 2));
        // } else {
        //     initialX = 50; // Fallback
        //     initialY = 50;
        // }
        initialX = 142; // Specific X coordinate
        initialY = 350; // Specific Y coordinate
        this.router.style.transform = `translate(${initialX}px, ${initialY}px)`;
        this.lastKnownPosition = { x: initialX, y: initialY };

        // Reset Mesh Extenders
        this.extenders.forEach(ext => {
            if (ext.placed) {
                const bestPosition = this._findBestMeshExtenderPosition(initialX, initialY, ext.id);
                ext.element.style.transform = `translate(${bestPosition.x}px, ${bestPosition.y}px)`;
                ext.x = bestPosition.x;
                ext.y = bestPosition.y;
            }
        });
    }

    _syncInterferenceButtons() {
        this.floorplanData.interferenceSources.forEach(source => {
            const button = this.shadowRoot.getElementById(source.name + 'Toggle');
            if (button) {
                button.classList.toggle('active', !!source.active);
            }
        });
    }

    _initializeSimulator() {
        // Check for required elements (no worker check needed)
        if (!this.routerPlacement || !this.signalStrengthCanvas || !this.router) {
            console.error('Required elements not found for simulator initialization');
            return;
        }

        // Get initial device dimensions (use offsetWidth/Height for layout dimensions)
        this.routerDimensions.width = this.router.offsetWidth || 60;
        this.routerDimensions.height = this.router.offsetHeight || 60;
        this.extenders.forEach(ext => {
            ext.dimensions.width = ext.element.offsetWidth || 60;
            ext.dimensions.height = ext.element.offsetHeight || 60;
        });

        // Initialize canvas dimensions later, just before first draw
        // this._updateCanvasDimensions();

        // Initialize floorplan visuals using imported function for the current floorplan
        this.interferenceElements = initializeFloorplanVisuals(this.shadowRoot, this.floorplanData);

        // Attach drag handlers for interference sources for the initial floorplan
        this._reAttachInterferenceHandlers(); // Use the new method to attach/sync handlers

        // Set initial router position based on the current floorplan
        this._resetDevicePositions(); // Use the new method

        // Initial styles (keep these)
        this.router.style.cursor = 'grab';
        this.router.style.transition = 'none'; // Disable CSS transition during drag later
        this.extenders.forEach(ext => {
            if (ext.element) {
                ext.element.style.cursor = 'grab';
                ext.element.style.transition = 'none'; // Disable CSS transition
            }
        });

        // Ensure canvas dimensions are set before first calculation
        // Ensure canvas dimensions are set before first calculation
        this._updateCanvasDimensions();

        // Initial signal calculation will be triggered when worker is ready after config is sent via _updateCanvasDimensions
        // this._requestSignalUpdate(); // Don't call directly
    }

    _resizeObserverCallback(entries) {
        for (const entry of entries) {
            if (entry.target === this.routerPlacement) {
                this._updateCanvasDimensions();
            }
        }
    }

    _updateCanvasDimensions() {
        // Removed '!this.worker' check as worker is no longer used
        if (!this.routerPlacement || !this.signalStrengthCanvas) {
            console.warn('Missing elements for canvas dimension update');
            return;
        }
        // Use offsetWidth/Height for layout dimensions
        const containerWidth = this.routerPlacement.offsetWidth;
        const containerHeight = this.routerPlacement.offsetHeight;

        // Check if dimensions are valid before setting
        if (containerWidth > 0 && containerHeight > 0) {
            // Update canvas display size
            this.signalStrengthCanvas.style.width = containerWidth + 'px';
            this.signalStrengthCanvas.style.height = containerHeight + 'px';
            // Update canvas internal resolution
            this.signalStrengthCanvas.width = containerWidth;
            this.signalStrengthCanvas.height = containerHeight;

            console.log(`[Main] Canvas dimensions updated: ${containerWidth}x${containerHeight}`);
            // Send updated config to worker
            this._sendConfigToWorker(); // This handles sending dimensions and floorplan

            // Explicitly request signal update after dimensions change
            this._requestSignalUpdate();

        } else {
            console.warn('[Main] Router placement container has zero dimensions, skipping canvas update.');
        }
    }

    // --- Mesh Extender Toggle ---
    _toggleMeshExtender(extenderId) {
        const extender = this.extenders.find(ext => ext.id === extenderId);
        if (!extender || !extender.element || !extender.button || !this.router) {
            console.warn(`[Main] Extender ${extenderId} or its elements not found.`);
            return;
        }

        extender.placed = !extender.placed;
        extender.element.style.display = extender.placed ? 'block' : 'none';
        extender.button.classList.toggle('active');

        if (extender.placed) {
            // Use lastKnownPosition for router placement
            const bestPosition = this._findBestMeshExtenderPosition(this.lastKnownPosition.x, this.lastKnownPosition.y, extenderId);
            // Use transform for initial placement
            extender.element.style.transform = `translate(${bestPosition.x}px, ${bestPosition.y}px)`;
            extender.x = bestPosition.x;
            extender.y = bestPosition.y;
        }
        console.log(`[Main] Toggled mesh extender ${extenderId}: ${extender.placed}`);
        // Send config and request update
        this._sendConfigToWorker();
        this._requestSignalUpdate();
    }

     _findBestMeshExtenderPosition(routerX, routerY, extenderId) {
        // Example: Place extender 1 in Living Room, extender 2 in Bedroom 1 (if exists)
        let targetRoomName = "Living Room";
        if (extenderId === 2) {
            targetRoomName = this.floorplanData.rooms.some(r => r.name === "Bedroom 1") ? "Bedroom 1" : "Dining Room"; // Fallback to Dining if Bed 1 doesn't exist
        }

        const targetRoom = this.floorplanData.rooms.find(r => r.name === targetRoomName);
        const extender = this.extenders.find(ext => ext.id === extenderId);
        const dimensions = extender ? extender.dimensions : { width: 60, height: 60 }; // Fallback dimensions

        if (targetRoom) {
            let posX = targetRoom.x + Math.round(targetRoom.width * (extenderId === 1 ? 0.66 : 0.5)) - (dimensions.width / 2);
            let posY = targetRoom.y + Math.round(targetRoom.height / 2) - (dimensions.height / 2);
            return { x: posX, y: posY };
        }

        // Fallback if target room not found
        return { x: routerX + (extenderId === 1 ? 200 : -100), y: routerY + (extenderId === 1 ? 0 : 100) };
    }

    // --- Interference Handlers --- (Keep this logic in the main class)
    _toggleInterference(sourceName) {
        const sourceData = this.floorplanData.interferenceSources.find(s => s.name === sourceName);
        if (!sourceData) { return; }

        sourceData.active = !sourceData.active; // Update state in the main thread's copy

        // Toggle button class
        const button = this.shadowRoot.getElementById(sourceName + 'Toggle');
        if (button) { button.classList.toggle("active"); }

        // Toggle interference element class and update position
        const element = this.interferenceElements[sourceName];
        if (element) {
            element.classList.toggle("active");

            // Update position when activated
            if (sourceData.active) {
                const visualX = sourceData.x - sourceData.radius;
                const visualY = sourceData.y - sourceData.radius;
                // Apply transform independently of scale animation
                element.style.transform = `translate(${visualX}px, ${visualY}px)`;
            }
        }
        console.log(`[Main] Toggled interference source '${sourceName}': ${sourceData.active}`);
        // Send updated config to worker, which will trigger recalculation
        this._sendConfigToWorker();
        // Also explicitly request a signal update using the new config
        this._requestSignalUpdate();
    }

    // --- Signal Calculation & Drawing (Now handled via Worker) ---
    _requestSignalUpdate() {
        // Throttle requests using requestAnimationFrame to avoid flooding the worker during drag
        if (this._rafId) {
            // console.log("[Main] RAF request already pending, skipping.");
            return; // Already scheduled
        }

        // console.log("[Main] Scheduling RAF for signal update request.");
        this._rafId = requestAnimationFrame(() => {
            this._rafId = null; // Clear the ID after execution
            // console.log("[Main] RAF triggered.");

            if (!this.worker) {
                 console.warn("[Main] Worker not available for signal update.");
                 return;
            }
            if (!this.isWorkerReady) {
                console.warn("[Main] Worker not ready, queuing update.");
                this.pendingWorkerUpdate = true; // Queue it if worker isn't ready yet
                return;
            }
            if (this.isWorkerCalculating) {
                console.warn("[Main] Worker busy, queuing update.");
                this.pendingWorkerUpdate = true; // Queue it if worker is busy
                return;
            }

            console.log("[Main] Requesting signal calculation from worker.");
            this.isWorkerCalculating = true;
            this.worker.postMessage({
                type: 'calculateSignal',
                payload: {
                    // Pass all necessary state for calculation
                    routerX: this.lastKnownPosition.x,
                    routerY: this.lastKnownPosition.y,
                    routerWidth: this.routerDimensions.width,
                    routerHeight: this.routerDimensions.height,
                    // Send array of extender data
                    extenders: this.extenders.map(ext => ({
                        id: ext.id,
                        x: ext.x,
                        y: ext.y,
                        width: ext.dimensions.width,
                        height: ext.dimensions.height,
                        placed: ext.placed
                    })),
                    // floorplanData is already synced via updateConfig
                    // canvasWidth/Height are already synced via updateConfig
                }
            });
        });
    }

    // _calculateAndDrawSignal method removed (now in worker);

    // --- Signal Info Update --- (REMOVED)
    // _updateSignalInfo() removed

    // --- Calculation & Geometry Helpers (REMOVED - Now in worker.js) ---
    // All calculation helpers (_getColorForStrength, _calculateSignalAtPoint, etc.) are removed from here.

    // Helper method to determine if a color is dark
    isColorDark(color) {
        try {
            if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return false;

            // Check for specific dark colors
            if (color.includes('rgb(30, 41, 59)') || // Slate 800
                color.includes('rgb(15, 23, 42)') || // Slate 900
                color.includes('rgb(17, 24, 39)') || // Gray 900
                color.includes('rgb(31, 41, 55)') || // Gray 800
                color.includes('rgb(3, 7, 18)')) {   // Dark blue/black
                return true;
            }

            // Check for specific light colors
            if (color.includes('rgb(255, 255, 255)') || // White
                color.includes('rgb(248, 250, 252)') || // Slate 50
                color.includes('rgb(249, 250, 251)') || // Gray 50
                color.includes('rgb(243, 244, 246)')) { // Gray 100
                return false;
            }

            let r, g, b;
            if (color.startsWith('rgba')) {
                const rgba = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
                if (rgba) {
                    r = parseInt(rgba[1]);
                    g = parseInt(rgba[2]);
                    b = parseInt(rgba[3]);
                }
            } else if (color.startsWith('rgb')) {
                const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (rgb) {
                    r = parseInt(rgb[1]);
                    g = parseInt(rgb[2]);
                    b = parseInt(rgb[3]);
                }
            }

            if (r !== undefined && g !== undefined && b !== undefined) {
                // Calculate relative luminance
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                return luminance < 128; // If luminance is less than 128, consider it dark
            }
            return false;
        } catch (e) {
            console.error('[RouterSimulator] Error in isColorDark:', e);
            return false;
        }
    }

    setupThemeObserver() {
        // Create a MutationObserver to watch for class changes
        this.observer = new MutationObserver(() => {
            this.applyTheme();
        });

        // Observe the document body and html element for class changes
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        this.observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Listen for direct theme change messages from parent
        this.messageHandler = (event) => {
            if (event.data && event.data.type === 'theme-change') {
                console.log('[RouterSimulator] Received theme change message:', event.data.theme);
                this.updateTheme(event.data.theme === 'dark');
            }
        };
        window.addEventListener('message', this.messageHandler);
    }

    applyTheme() {
        // Try multiple methods to detect dark mode
        let isDarkMode = false;

        // Method 1: Check document classes
        if (document.documentElement.classList.contains('dark') ||
            document.body.classList.contains('dark')) {
            isDarkMode = true;
        }

        // Method 2: Check for dark background color on body or html
        if (!isDarkMode) {
            try {
                const bodyBgColor = getComputedStyle(document.body).backgroundColor;
                const htmlBgColor = getComputedStyle(document.documentElement).backgroundColor;

                if (this.isColorDark(bodyBgColor) || this.isColorDark(htmlBgColor)) {
                    isDarkMode = true;
                }
            } catch (e) {
                console.error('[RouterSimulator] Error checking background color:', e);
            }
        }

        // Method 3: Check parent document if in iframe
        if (!isDarkMode && window !== window.parent) {
            try {
                // Try to access parent document (may fail due to same-origin policy)
                if (window.parent.document.documentElement.classList.contains('dark') ||
                    window.parent.document.body.classList.contains('dark')) {
                    isDarkMode = true;
                } else {
                    // Check parent document background color
                    const parentBodyBgColor = getComputedStyle(window.parent.document.body).backgroundColor;
                    const parentHtmlBgColor = getComputedStyle(window.parent.document.documentElement).backgroundColor;

                    if (this.isColorDark(parentBodyBgColor) || this.isColorDark(parentHtmlBgColor)) {
                        isDarkMode = true;
                    }
                }
            } catch (e) {
                console.log('[RouterSimulator] Could not access parent frame due to same-origin policy');
            }
        }

        console.log('[RouterSimulator] Theme detection result:', isDarkMode ? 'dark' : 'light');

        // Apply the theme
        this.updateTheme(isDarkMode);
    }

    // Method to directly update theme without polling
    updateTheme(isDarkMode) {
        console.log('[RouterSimulator] updateTheme called with isDarkMode:', isDarkMode);

        // Prevent multiple rapid transitions
        if (this.isTransitioning) {
            console.log('[RouterSimulator] Theme transition already in progress, skipping');
            return;
        }

        this.isTransitioning = true;

        // Apply theme class
        if (isDarkMode) {
            this.classList.add('dark-mode');
            console.log('[RouterSimulator] Applied dark mode');
        } else {
            this.classList.remove('dark-mode');
            console.log('[RouterSimulator] Applied light mode');
        }

        // Reset transition flag after a short delay
        setTimeout(() => {
            this.isTransitioning = false;
        }, 100);
    }
}

// Define the custom element
const tagName = 'router-simulator-simulator';
customElements.define(tagName, RouterSimulatorElement);
console.log(`[WebComponent] Custom element "${tagName}" defined.`);
