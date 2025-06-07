import { wiringPracticeTemplate } from './template.js';

class WiringPracticeElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(wiringPracticeTemplate.content.cloneNode(true));

        // Animation frame handling
        this.animationFrameId = null;
        this.needsAnimation = false;
        this.pulsePhase = 0;

        // Initialize scenario text
        this.scenarioText = {
            rj11: "Practice phone wiring: Drag and drop each wire from the palette to its matching connection point. Start with primary line (Green/Red) then secondary line (Black/Yellow).",
            rj45: "Practice phone wiring: Connect primary line using Blue pairs and secondary line using Orange pairs. Match each wire to its correct point."
        };

        // Wiring configurations - positions will be calculated dynamically based on connector position
        // RJ11 for phone service (4-pin configuration)
        // Ordered for mobile display: Green/Black (top row), Red/Yellow (bottom row)
        this.rj11Config = {
            pairs: [
                { name: 'Green (Tip)', color: '#008000', purpose: 'Pin 1', pinNumber: 1, relativeX: -60 },
                { name: 'Black (Tip)', color: '#000000', purpose: 'Pin 3', pinNumber: 3, relativeX: 20 },
                { name: 'Red (Ring)', color: '#FF0000', purpose: 'Pin 2', pinNumber: 2, relativeX: -20 },
                { name: 'Yellow (Ring)', color: '#FFD700', purpose: 'Pin 4', pinNumber: 4, relativeX: 60 }
            ]
        };

        // RJ45 for phone service (using standard pairs) - only 4 interactive pins
        this.rj45Config = {
            pairs: [
                { name: 'Orange/White', color: '#FFA500', stripe: '#FFFFFF', purpose: 'Pin 3', pinNumber: 3, relativeX: -37.5 },
                { name: 'Blue/White', color: '#0000FF', stripe: '#FFFFFF', purpose: 'Pin 4', pinNumber: 4, relativeX: -12.5 },
                { name: 'Blue', color: '#0000FF', purpose: 'Pin 5', pinNumber: 5, relativeX: 12.5 },
                { name: 'Orange', color: '#FFA500', purpose: 'Pin 6', pinNumber: 6, relativeX: 37.5 }
            ]
        };

        // Component state
        this.currentConfig = this.rj11Config;
        this.connections = new Map(); // Stores correct connections
        this.placedWires = new Map(); // Stores all placed wires (correct or not)
        this.isDragging = false;
        this.selectedWire = null;
        this.dragStartPos = null;
        this.currentPos = null;
    }

    connectedCallback() {
        console.log('[WiringPractice] Starting component initialization');

        // Initialize the component with proper timing
        this._initializeElements();

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            this._attachEventListeners();
            this._initializeCanvas();
            this._setupWirePalette();
            this._setupThemeHandling();

            // Set initial state
            this.scenarioDescription.textContent = this.scenarioText.rj11;
            this._updateWiringReference();

            // Start with an intro animation
            this.pulsePhase = 0;
            this._startAnimation();

            // Highlight points initially with a delay to ensure canvas is ready
            setTimeout(() => {
                this.currentConfig.pairs.forEach((pair, index) => {
                    setTimeout(() => {
                        const tempPos = { ...pair.position };
                        this.currentPos = tempPos;
                        this._drawConnector();
                        setTimeout(() => {
                            if (!this.currentPos ||
                                (this.currentPos.x === tempPos.x && this.currentPos.y === tempPos.y)) {
                                this.currentPos = null;
                                this._drawConnector();
                            }
                        }, 500);
                    }, index * 600);
                });
            }, 100);

            console.log('[WiringPractice] Component fully initialized');
        });
    }

    disconnectedCallback() {
        this._removeEventListeners();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this._stopAnimation();
    }

    _initializeElements() {
        this.canvas = this.shadowRoot.getElementById('canvas-overlay');
        this.connectorDisplay = this.shadowRoot.querySelector('.connector-display');
        this.wirePalette = this.shadowRoot.getElementById('wire-palette');
        this.rj11Button = this.shadowRoot.getElementById('rj11-btn');
        this.rj45Button = this.shadowRoot.getElementById('rj45-btn');
        this.scenarioDescription = this.shadowRoot.getElementById('scenario-description');
    }

    _attachEventListeners() {
        console.log('[WiringPractice] Attaching event listeners');

        // Connector type switches
        this.rj11Button.addEventListener('click', () => this._switchConnectorType('rj11'));
        this.rj45Button.addEventListener('click', () => this._switchConnectorType('rj45'));

        // Canvas interactions
        // Ensure canvas is interactive
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.cursor = 'default';

        this.canvas.addEventListener('mousedown', this._handleCanvasMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._handleCanvasMouseMove.bind(this));
        document.addEventListener('mouseup', this._handleMouseUp.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this._handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this));

        // Resize handling
        this.resizeObserver = new ResizeObserver(this._handleResize.bind(this));
        this.resizeObserver.observe(this.connectorDisplay);

        // Theme handling
        window.addEventListener('message', this._handleThemeMessage.bind(this));

        console.log('[WiringPractice] Event listeners attached');
    }

    _removeEventListeners() {
        document.removeEventListener('mouseup', this._handleMouseUp.bind(this));
        window.removeEventListener('message', this._handleThemeMessage.bind(this));
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    _initializeCanvas() {
        console.log('[WiringPractice] Initializing canvas');

        if (!this.canvas || !this.connectorDisplay) {
            console.error('[WiringPractice] Canvas or connector display not found');
            return;
        }

        const rect = this.connectorDisplay.getBoundingClientRect();
        console.log('[WiringPractice] Connector display rect:', rect);

        // Ensure minimum dimensions with better proportions for new layout
        const width = Math.max(rect.width, 500);
        const height = Math.max(rect.height, 400);

        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            console.error('[WiringPractice] Failed to get canvas context');
            return;
        }

        console.log('[WiringPractice] Canvas initialized with dimensions:', width, 'x', height);
        this._drawConnector();
    }

    _setupWirePalette() {
        this._updateWiringReference(); // Update reference diagram first
        this.wirePalette.innerHTML = ''; // Clear existing wires

        // Define custom wire order based on connector type
        const isRJ11 = this.currentConfig === this.rj11Config;
        let wireOrder;

        if (isRJ11) {
            // RJ11 layout: Red, Black, Green, Yellow (top-left, top-right, bottom-left, bottom-right)
            wireOrder = ['Red (Ring)', 'Black (Tip)', 'Green (Tip)', 'Yellow (Ring)'];
        } else {
            // RJ45 layout: Blue/White, Blue, Orange/White, Orange (top-left, top-right, bottom-left, bottom-right)
            wireOrder = ['Blue/White', 'Blue', 'Orange/White', 'Orange'];
        }

        // Create wires in the specified order
        wireOrder.forEach(wireName => {
            const pair = this.currentConfig.pairs.find(p => p.name === wireName);
            if (!pair) return; // Skip if wire not found

            const wireEl = document.createElement('div');
            wireEl.className = 'wire';
            wireEl.dataset.wire = pair.name;

            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'wire-color';
            colorSwatch.style.background = pair.color;
            if (pair.stripe) {
                colorSwatch.style.background = `repeating-linear-gradient(45deg,
                    ${pair.color},
                    ${pair.color} 4px,
                    ${pair.stripe} 4px,
                    ${pair.stripe} 8px
                )`;
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = pair.name;

            // Create main content container (color + text on same line)
            const mainContent = document.createElement('div');
            mainContent.className = 'wire-main-content';
            mainContent.appendChild(colorSwatch);
            mainContent.appendChild(nameSpan);

            // Create hover drag text (appears below on hover)
            const dragText = document.createElement('div');
            dragText.className = 'wire-drag-text';
            dragText.textContent = 'Drag me';

            wireEl.appendChild(mainContent);
            wireEl.appendChild(dragText);
            this.wirePalette.appendChild(wireEl);

            // Wire drag events
            wireEl.addEventListener('mousedown', (e) => this._handleWireSelect(e, pair));
            wireEl.addEventListener('touchstart', (e) => this._handleWireSelect(e, pair));
        });
    }

    _handleWireSelect(e, wire) {
        e.preventDefault();
        e.stopPropagation();

        console.log('[WiringPractice] Wire selected:', wire.name);

        const target = e.currentTarget;

        // Visual feedback for wire selection
        target.classList.add('dragging');
        this.selectedWire = wire;
        this.isDragging = true;

        // Set start position from the bottom edge of wire button for seamless connection
        const canvasRect = this.canvas.getBoundingClientRect();
        const wireRect = target.getBoundingClientRect();

        this.dragStartPos = {
            x: wireRect.left + wireRect.width / 2 - canvasRect.left,
            y: wireRect.bottom - canvasRect.top + 1 // Use bottom edge + 1px for seamless connection
        };

        // Ensure drag starts within canvas bounds
        this.dragStartPos.x = Math.max(10, Math.min(this.dragStartPos.x, this.canvas.width - 10));
        this.dragStartPos.y = Math.max(10, Math.min(this.dragStartPos.y, this.canvas.height - 10));

        this.currentPos = { ...this.dragStartPos };
        document.body.style.cursor = 'grabbing';

        console.log('[WiringPractice] Drag start position:', this.dragStartPos);

        // Show instructional feedback
        this._showFeedback(`Connect ${wire.name} to matching pin`, false, true);
        this._drawConnector();

        // Reset styles when drag ends
        const resetDragState = () => {
            console.log('[WiringPractice] Resetting drag state');
            target.classList.remove('dragging');
            document.body.style.cursor = '';
            document.removeEventListener('mouseup', resetDragState);
            document.removeEventListener('touchend', resetDragState);
        };

        document.addEventListener('mouseup', resetDragState);
        document.addEventListener('touchend', resetDragState);
    }

    _handleCanvasMouseDown(e) {
        console.log('[WiringPractice] Canvas mouse down');
        // This method can be used for future canvas-specific interactions
        // For now, wire selection is handled by the wire elements themselves
    }

    _handleTouchStart(e) {
        console.log('[WiringPractice] Canvas touch start');
        // This method can be used for future canvas-specific touch interactions
        // For now, wire selection is handled by the wire elements themselves
    }

    _handleCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Check for nearby connection points
        const nearbyPoint = this.currentConfig.pairs.find(pair => 
            Math.hypot(pair.position.x - mousePos.x, pair.position.y - mousePos.y) < 15
        );

        // Update cursor and snap to connection point if nearby
        if (nearbyPoint) {
            this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'pointer';
            if (this.isDragging) {
                this.currentPos = { ...nearbyPoint.position };
                console.log('[WiringPractice] Snapping to connection point:', nearbyPoint.name);
            } else {
                // Highlight corresponding wire in palette when hovering over a point
                this._highlightWireInPalette(nearbyPoint.name);
            }
        } else {
            this.canvas.style.cursor = this.isDragging ? 'grab' : 'default';
            if (this.isDragging) {
                this.currentPos = mousePos;
            }
            // Remove highlight when not hovering over a point
            this._highlightWireInPalette(null);
        }

        if (!this.isDragging) return;
        this._drawConnector();
    }

    _handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchPos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };

        // Check for nearby connection points and snap to them
        const nearbyPoint = this.currentConfig.pairs.find(pair => 
            Math.hypot(pair.position.x - touchPos.x, pair.position.y - touchPos.y) < 25
        );

        this.currentPos = nearbyPoint ? { ...nearbyPoint.position } : touchPos;
        this._drawConnector();
    }

    _handleMouseUp() {
        if (!this.isDragging) return;
        this._checkConnection();
        this.isDragging = false;
        this.selectedWire = null;
        this._drawConnector();
    }

    _handleTouchEnd() {
        this._handleMouseUp();
    }

    _getConnectorCenterY() {
        const isMobile = this.canvas.width <= 768;
        const connectorY = isMobile ? 280 : 300;
        const connectorHeight = 100;
        return connectorY + connectorHeight / 2;
    }

    _checkConnection() {
        if (!this.selectedWire || !this.currentPos) return;

        // Check active pins first
        const targetPoint = this.currentConfig.pairs.find(pair =>
            Math.hypot(pair.position.x - this.currentPos.x, pair.position.y - this.currentPos.y) < 20
        );

        // For RJ45, also check inactive pins (with same tolerance as active pins)
        let inactivePin = null;
        if (this.currentConfig === this.rj45Config && this.allRJ45Pins && !targetPoint) {
            // Use the same Y position as the active pins (connectorCenterY from drawing)
            const connectorCenterY = this._getConnectorCenterY();
            inactivePin = this.allRJ45Pins.find(pin =>
                !pin.active && Math.hypot(pin.x - this.currentPos.x, connectorCenterY - this.currentPos.y) < 20
            );
        }

        if (targetPoint) {
            // Store the placed wire regardless of correctness
            this.placedWires.set(this.selectedWire.name, {
                position: targetPoint.position,
                targetPin: targetPoint.name,
                wire: this.selectedWire,
                isCorrect: targetPoint.name === this.selectedWire.name
            });

            if (targetPoint.name === this.selectedWire.name) {
                // Correct connection
                this.connections.set(this.selectedWire.name, targetPoint.position);
                this._showFeedback('Correct connection!', true);
                this._checkCompletion();
            } else {
                // Wrong connection - but wire still stays in place
                this._showFeedback('Wrong connection. Try again!', false);
            }
        } else if (inactivePin) {
            // Connection to inactive pin - show dashed red line and error message
            const connectorCenterY = this._getConnectorCenterY();
            this.placedWires.set(this.selectedWire.name, {
                position: { x: inactivePin.x, y: connectorCenterY },
                targetPin: inactivePin.name,
                wire: this.selectedWire,
                isCorrect: false,
                isInactive: true
            });
            this._showFeedback(`Wrong connection. Pin ${inactivePin.pinNumber} is not used for phone service.`, false);
        }
    }

    _checkCompletion() {
        const allConnected = this.currentConfig.pairs.every(pair => 
            this.connections.has(pair.name)
        );

        if (allConnected) {
            const message = this.currentConfig === this.rj11Config
                ? 'Great job! You\'ve correctly wired the RJ11 phone jack!'
                : 'Excellent! You\'ve successfully wired the phone lines using RJ45!';
            this._showFeedback(message, true, true);
        }
    }

    _showFeedback(message, isSuccess, isCompletion = false) {
        // Check if feedback element exists, if not create it
        let feedbackEl = this.shadowRoot.getElementById('feedback-message');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'feedback-message';
            feedbackEl.style.cssText = `
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                padding: 6px 12px;
                border-radius: 4px;
                font-weight: 500;
                font-size: 12px;
                line-height: 1.3;
                max-width: 200px;
                text-align: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
            `;
            this.connectorDisplay.appendChild(feedbackEl);
        }

        // Style based on message type
        if (isCompletion) {
            feedbackEl.style.background = '#10b981';
        } else {
            feedbackEl.style.background = isSuccess ? '#10b981' : '#ef4444';
        }
        feedbackEl.style.color = '#ffffff';
        
        // Show message
        feedbackEl.textContent = message;
        feedbackEl.style.opacity = '1';

        // Hide after delay (longer for completion messages)
        setTimeout(() => {
            feedbackEl.style.opacity = '0';
        }, isCompletion ? 5000 : 2000);
    }

    _isPointHovered(point) {
        if (!this.currentPos) return false;
        return Math.hypot(point.x - this.currentPos.x, point.y - this.currentPos.y) < 15;
    }

    _startAnimation() {
        if (!this.needsAnimation) {
            this.needsAnimation = true;
            this._animate();
        }
    }

    _stopAnimation() {
        this.needsAnimation = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    _animate() {
        if (!this.needsAnimation) return;

        this.pulsePhase += 0.05; // Control animation speed
        this._drawConnector();
        this.animationFrameId = requestAnimationFrame(() => this._animate());
    }

    _drawConnector() {
        if (!this.ctx) return;

        const isRJ11 = this.currentConfig === this.rj11Config;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate pulsing animation
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;

        // Find nearby point for snapping visual (including inactive pins for RJ45)
        let nearbyPoint = null;
        if (this.isDragging && this.currentPos) {
            // Check active pins first
            nearbyPoint = this.currentConfig.pairs.find(pair =>
                Math.hypot(pair.position.x - this.currentPos.x, pair.position.y - this.currentPos.y) < 15
            );

            // For RJ45, also check inactive pins for visual feedback
            if (!nearbyPoint && this.currentConfig === this.rj45Config && this.allRJ45Pins) {
                const connectorCenterY = this._getConnectorCenterY();
                const inactivePin = this.allRJ45Pins.find(pin =>
                    !pin.active && Math.hypot(pin.x - this.currentPos.x, connectorCenterY - this.currentPos.y) < 15
                );
                if (inactivePin) {
                    nearbyPoint = {
                        name: inactivePin.name,
                        position: { x: inactivePin.x, y: connectorCenterY },
                        isInactive: true
                    };
                }
            }
        }

        // Draw background area for connector section - positioned lower in canvas
        // Responsive positioning to avoid overlap with wire buttons
        const isMobile = this.canvas.width <= 768;
        const bgX = 50;
        const bgY = isMobile ? 220 : 240; // Lower on mobile/tablet to avoid wire button overlap
        const bgWidth = this.canvas.width - 100;
        const bgHeight = 200;

        this.ctx.fillStyle = this.classList.contains('dark-mode') ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.8)';
        this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        this.ctx.strokeStyle = this.classList.contains('dark-mode') ? '#334155' : '#e2e8f0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);

        // Draw realistic connector housing
        const connectorWidth = isRJ11 ? 200 : 240;
        const connectorHeight = isRJ11 ? 100 : 100;
        const connectorX = (this.canvas.width - connectorWidth) / 2;
        const connectorY = isMobile ? 280 : 300; // Lower positioning for mobile/tablet
        const connectorCenterX = connectorX + connectorWidth / 2;
        const connectorCenterY = connectorY + connectorHeight / 2;

        this.ctx.fillStyle = '#d1d5db';
        this.ctx.strokeStyle = this.classList.contains('dark-mode') ? '#475569' : '#94a3b8';
        this.ctx.lineWidth = 2;

        if (isRJ11) {
            // RJ11 - bigger phone jack shape
            this.ctx.fillRect(connectorX, connectorY, connectorWidth, connectorHeight);
            this.ctx.strokeRect(connectorX, connectorY, connectorWidth, connectorHeight);

            // RJ11 clip
            this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#334155' : '#e2e8f0';
            this.ctx.fillRect(connectorX - 5, connectorY + 15, 5, connectorHeight - 30);

            // RJ11 internal cavity
            this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#1e293b' : '#f8fafc';
            this.ctx.fillRect(connectorX + 15, connectorY + 20, connectorWidth - 30, connectorHeight - 40);
            this.ctx.strokeRect(connectorX + 15, connectorY + 20, connectorWidth - 30, connectorHeight - 40);
        } else {
            // RJ45 - wider ethernet jack shape with beveled edges
            this.ctx.fillRect(connectorX, connectorY, connectorWidth, connectorHeight);
            this.ctx.strokeRect(connectorX, connectorY, connectorWidth, connectorHeight);

            // RJ45 clip (larger)
            this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#334155' : '#e2e8f0';
            this.ctx.fillRect(connectorX - 6, connectorY + 15, 6, connectorHeight - 30);

            // RJ45 internal cavity (wider opening)
            this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#1e293b' : '#f8fafc';
            this.ctx.fillRect(connectorX + 15, connectorY + 20, connectorWidth - 30, connectorHeight - 40);
            this.ctx.strokeRect(connectorX + 15, connectorY + 20, connectorWidth - 30, connectorHeight - 40);

            // Store all 8 pin positions for RJ45 (4 active, 4 inactive)
            this.allRJ45Pins = [
                { pinNumber: 1, x: connectorCenterX - 87.5, active: false, name: 'Pin 1 (Unused)' },
                { pinNumber: 2, x: connectorCenterX - 62.5, active: false, name: 'Pin 2 (Unused)' },
                { pinNumber: 3, x: connectorCenterX - 37.5, active: true, name: 'Orange/White' },
                { pinNumber: 4, x: connectorCenterX - 12.5, active: true, name: 'Blue/White' },
                { pinNumber: 5, x: connectorCenterX + 12.5, active: true, name: 'Blue' },
                { pinNumber: 6, x: connectorCenterX + 37.5, active: true, name: 'Orange' },
                { pinNumber: 7, x: connectorCenterX + 62.5, active: false, name: 'Pin 7 (Unused)' },
                { pinNumber: 8, x: connectorCenterX + 87.5, active: false, name: 'Pin 8 (Unused)' }
            ];

            // Draw all 8 pins identically for RJ45
            this.allRJ45Pins.forEach(pin => {
                // Pin number label above the connection point
                this.ctx.font = 'bold 12px Inter';
                this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#f1f5f9' : '#2c3e50';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${pin.pinNumber}`, pin.x, connectorCenterY - 10);

                // Purpose label below the connection point (for all pins)
                this.ctx.font = '10px Inter';
                this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#94a3b8' : '#64748b';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`Pin ${pin.pinNumber}`, pin.x, connectorCenterY + 25);

                // Check if this inactive pin is being snapped to
                const isSnapping = nearbyPoint && nearbyPoint.isInactive &&
                    Math.abs(nearbyPoint.position.x - pin.x) < 5;

                // Draw snap indicator for inactive pins too
                if (isSnapping && !pin.active) {
                    this.ctx.beginPath();
                    this.ctx.arc(pin.x, connectorCenterY, 12 * pulseScale, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ef444680'; // Semi-transparent red for inactive pins
                    this.ctx.fill();
                    this.ctx.closePath();
                }

                // Draw connection point (all pins look identical)
                this.ctx.beginPath();
                this.ctx.arc(pin.x, connectorCenterY, 6, 0, Math.PI * 2);

                // Color based on state
                if (isSnapping && !pin.active) {
                    this.ctx.fillStyle = '#ef4444'; // Red when snapping to inactive pin
                } else {
                    this.ctx.fillStyle = '#64748b'; // Default gray for all pins
                }

                this.ctx.fill();
                this.ctx.strokeStyle = this.classList.contains('dark-mode') ? '#475569' : '#94a3b8';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.closePath();
            });

            // RJ45 beveled corners for more realistic look
            this.ctx.fillStyle = '#b8bcc8';
            this.ctx.beginPath();
            this.ctx.moveTo(connectorX, connectorY);
            this.ctx.lineTo(connectorX + 10, connectorY);
            this.ctx.lineTo(connectorX, connectorY + 10);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.moveTo(connectorX + connectorWidth, connectorY);
            this.ctx.lineTo(connectorX + connectorWidth - 10, connectorY);
            this.ctx.lineTo(connectorX + connectorWidth, connectorY + 10);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Draw title with better positioning
        this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#f1f5f9' : '#2c3e50';
        this.ctx.font = 'bold 18px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            isRJ11 ? 'RJ11 Phone Jack' : 'RJ45 Phone Configuration',
            this.canvas.width / 2, isMobile ? 260 : 280 // Adjust title position based on connector position
        );

        // Draw pin labels and connection points with better spacing and clarity
        this.currentConfig.pairs.forEach(pair => {
            // Calculate actual pin position inside the connector
            const pinX = connectorCenterX + pair.relativeX;
            const pinY = connectorCenterY;

            // Store calculated position for interaction
            pair.position = { x: pinX, y: pinY };

            // Pin number label above the connection point (inside connector)
            this.ctx.font = 'bold 12px Inter';
            this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#f1f5f9' : '#2c3e50';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${pair.pinNumber}`, pinX, pinY - 10);

            // Purpose label below the connection point (outside connector)
            this.ctx.font = '10px Inter';
            this.ctx.fillStyle = this.classList.contains('dark-mode') ? '#94a3b8' : '#64748b';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(pair.purpose, pinX, pinY + 25);

            // Connection point with snap indicator
            const isConnected = this.connections.has(pair.name);
            const isSnapping = nearbyPoint && nearbyPoint.name === pair.name;

            if (isSnapping) {
                // Draw snap indicator ring with animation
                this.ctx.beginPath();
                this.ctx.arc(pinX, pinY, 12 * pulseScale, 0, Math.PI * 2);
                this.ctx.fillStyle = '#3b82f680'; // Semi-transparent blue
                this.ctx.fill();
                this.ctx.closePath();
            } else if (!isConnected) {
                // Draw subtle highlight for unconnected points
                this.ctx.beginPath();
                this.ctx.arc(pinX, pinY, 10, 0, Math.PI * 2);
                this.ctx.fillStyle = '#64748b20'; // Very transparent gray
                this.ctx.fill();
                this.ctx.closePath();
            }

            // Draw connection point with pulse for unconnected points
            this.ctx.beginPath();
            const pointRadius = isConnected ? 6 : 6 * (isSnapping ? pulseScale : 1);
            this.ctx.arc(pinX, pinY, pointRadius, 0, Math.PI * 2);

            // Point color based on state
            if (isConnected) {
                this.ctx.fillStyle = '#22c55e'; // Connected - green
            } else if (isSnapping) {
                this.ctx.fillStyle = '#3b82f6'; // Snapping - blue
            } else if (this._isPointHovered({ x: pinX, y: pinY })) {
                this.ctx.fillStyle = '#3b82f6'; // Hovered - blue
            } else {
                this.ctx.fillStyle = '#64748b'; // Default - gray
            }

            this.ctx.fill();

            // Add glowing effect for unconnected points
            if (!isConnected) {
                this.ctx.strokeStyle = this.ctx.fillStyle;
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.3;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            } else {
                this.ctx.stroke();
            }

            this.ctx.closePath();

            // Check if animation is needed
            if (!this.connections.has(pair.name) || this.isDragging) {
                this._startAnimation();
            } else if (this.currentConfig.pairs.every(p => this.connections.has(p.name)) && !this.isDragging) {
                this._stopAnimation();
            }
        });

        // Draw active wire being dragged
        if (this.isDragging && this.selectedWire && this.dragStartPos && this.currentPos) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStartPos.x, this.dragStartPos.y);
            this.ctx.lineTo(this.currentPos.x, this.currentPos.y);
            this.ctx.strokeStyle = this.selectedWire.color;
            this.ctx.lineWidth = 3;

            // Use dashed line for striped wires (Orange/White and Blue/White)
            if (this.selectedWire.stripe) {
                this.ctx.setLineDash([6, 3]); // Dashed pattern for striped wires
            } else {
                this.ctx.setLineDash([]); // Solid line for solid color wires
            }

            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.setLineDash([]); // Reset line dash
        }

        // Draw all placed wires (correct, incorrect, and inactive pin connections)
        this.placedWires.forEach((placement) => {
            const startPos = this._getWireStartPosition(placement.wire);
            if (startPos) {
                this.ctx.beginPath();
                this.ctx.moveTo(startPos.x, startPos.y);
                this.ctx.lineTo(placement.position.x, placement.position.y);

                // Use different styling for correct vs incorrect vs inactive connections
                if (placement.isCorrect) {
                    this.ctx.strokeStyle = placement.wire.color;
                    this.ctx.lineWidth = 4;

                    // Use dashed line for striped wires even when correct
                    if (placement.wire.stripe) {
                        this.ctx.setLineDash([6, 3]); // Dashed pattern for striped wires
                    } else {
                        this.ctx.setLineDash([]); // Solid line for solid color wires
                    }
                } else if (placement.isInactive) {
                    this.ctx.strokeStyle = '#ef4444'; // Red for inactive pin
                    this.ctx.lineWidth = 3;
                    this.ctx.setLineDash([8, 4]); // Longer dashes for inactive pins
                } else {
                    this.ctx.strokeStyle = '#ef4444'; // Red for incorrect
                    this.ctx.lineWidth = 3;
                    this.ctx.setLineDash([5, 5]); // Dashed line for incorrect
                }

                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.setLineDash([]); // Reset line dash
            }
        });
    }

    _switchConnectorType(type) {
        this.currentConfig = type === 'rj11' ? this.rj11Config : this.rj45Config;
        this.rj11Button.classList.toggle('active', type === 'rj11');
        this.rj45Button.classList.toggle('active', type === 'rj45');
        this._resetConnections();
        
        this.scenarioDescription.textContent = type === 'rj11' 
            ? this.scenarioText.rj11
            : this.scenarioText.rj45;
    }

    _resetConnections() {
        this.connections.clear();
        this.placedWires.clear(); // Also clear placed wires
        this._setupWirePalette();
        this._updateWiringReference(); // Update reference table
        this._startAnimation();
        this._drawConnector();
        
        // Clear any existing feedback
        const feedbackEl = this.shadowRoot.getElementById('feedback-message');
        if (feedbackEl) {
            feedbackEl.style.opacity = '0';
        }

        // Add reset button if it doesn't exist
        let resetBtn = this.shadowRoot.getElementById('reset-btn');
        if (!resetBtn) {
            resetBtn = document.createElement('button');
            resetBtn.id = 'reset-btn';
            resetBtn.className = 'connector-type-btn';
            resetBtn.textContent = 'Reset Connections';
            resetBtn.style.marginLeft = 'auto';
            resetBtn.addEventListener('click', () => this._resetConnections());
            this.shadowRoot.querySelector('.action-bar').appendChild(resetBtn);
        }
    }

    _handleResize() {
        const rect = this.connectorDisplay.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this._drawConnector();
    }

    _setupThemeHandling() {
        const observer = new MutationObserver(() => this._updateTheme());
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        this._updateTheme();
    }

    _handleThemeMessage(event) {
        if (event.data && event.data.type === 'theme-change') {
            this.updateTheme(event.data.theme === 'dark');
        }
    }

    _updateWiringReference() {
        const referenceSection = this.shadowRoot.getElementById('wiring-reference');
        if (!referenceSection) return;

        const isRJ11 = this.currentConfig === this.rj11Config;
        
        // Create reference table
        const table = document.createElement('table');
        table.className = 'wiring-table';
        
        // Table headers
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Pin</th>
                <th>Wire Color</th>
                <th>Function</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        
        if (isRJ11) {
            // RJ11 wiring reference
            tbody.innerHTML = `
                <tr>
                    <td>1</td>
                    <td><span class="color-dot" style="background: #008000;"></span>Green (Tip)</td>
                    <td>Primary Line - Tip (+)</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td><span class="color-dot" style="background: #FF0000;"></span>Red (Ring)</td>
                    <td>Primary Line - Ring (-)</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td><span class="color-dot" style="background: #000000;"></span>Black (Tip)</td>
                    <td>Second Line - Tip (+)</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td><span class="color-dot" style="background: #FFD700;"></span>Yellow (Ring)</td>
                    <td>Second Line - Ring (-)</td>
                </tr>
                <tr class="info-row">
                    <td colspan="3" style="text-align: center; font-style: italic; background: var(--input-bg);">
                        Note: RJ11 uses the middle 4 pins for 2-line phone service. Tip (+) and Ring (-) pairs carry the voice signals.
                    </td>
                </tr>
            `;
        } else {
            // RJ45 phone wiring reference
            tbody.innerHTML = `
                <tr>
                    <td>3</td>
                    <td>
                        <span class="color-dot striped" style="--color1: #FFA500; --color2: #FFFFFF;"></span>
                        Orange/White
                    </td>
                    <td>Second Line - Tip (+)</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td>
                        <span class="color-dot striped" style="--color1: #0000FF; --color2: #FFFFFF;"></span>
                        Blue/White
                    </td>
                    <td>Primary Line - Tip (+)</td>
                </tr>
                <tr>
                    <td>5</td>
                    <td><span class="color-dot" style="background: #0000FF;"></span>Blue</td>
                    <td>Primary Line - Ring (-)</td>
                </tr>
                <tr>
                    <td>6</td>
                    <td><span class="color-dot" style="background: #FFA500;"></span>Orange</td>
                    <td>Second Line - Ring (-)</td>
                </tr>
                <tr class="info-row">
                    <td colspan="3" style="text-align: center; font-style: italic; background: var(--input-bg);">
                        Note: When using RJ45 for phone service, only the Blue pair (pins 4,5) and Orange pair (pins 3,6) are used.
                        The remaining pins are not connected for basic phone service.
                    </td>
                </tr>
            `;
        }
        
        table.appendChild(tbody);
        
        // Clear and update reference section
        referenceSection.innerHTML = '';
        referenceSection.appendChild(table);
    }

    updateTheme(isDarkMode) {
        this.classList.toggle('dark-mode', isDarkMode);
        this._drawConnector();
    }

    _updateTheme() {
        const isDark = document.documentElement.classList.contains('dark') ||
                      document.body.classList.contains('dark');
        this.updateTheme(isDark);
    }

    _highlightWireInPalette(wireName) {
        // Remove highlight from all wires
        this.wirePalette.querySelectorAll('.wire').forEach(wire => {
            wire.classList.remove('highlight');
            wire.style.transform = '';
        });

        if (wireName) {
            // Add highlight to matching wire
            const wireEl = this.wirePalette.querySelector(`[data-wire="${wireName}"]`);
            if (wireEl && !this.connections.has(wireName)) {
                wireEl.classList.add('highlight');
                wireEl.style.transform = 'translateY(-2px) scale(1.02)';
            }
        }
    }

    _getWireStartPosition(wire) {
        // Get the position from the wire palette area (top of canvas)
        const wireEl = this.wirePalette.querySelector(`[data-wire="${wire.name}"]`);
        if (wireEl) {
            const canvasRect = this.canvas.getBoundingClientRect();
            const wireRect = wireEl.getBoundingClientRect();

            return {
                x: wireRect.left + wireRect.width / 2 - canvasRect.left,
                y: wireRect.bottom - canvasRect.top + 1 // Use bottom edge + 1px for seamless connection
            };
        }
        // Fallback to calculated position
        return { x: this.canvas.width / 2, y: 50 };
    }
}

// Define the custom element
const tagName = 'wiring-practice-simulator';
customElements.define(tagName, WiringPracticeElement);
console.log(`[WebComponent] Custom element "${tagName}" defined.`);
