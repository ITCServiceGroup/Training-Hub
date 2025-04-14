import { styles } from '../styles/styles.js';
import { TUTORIALS } from '../data/tutorials.js';
import { TutorialManager } from '../managers/TutorialManager.js';
import { validateCommandStructure } from '../utils/validation.js';
import { simulateOutput } from '../utils/simulation.js';

export class CommandBuilderElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Store references and state
        this.currentOS = 'windows';
        this.components = [];
        this.tutorials = TUTORIALS;
        this.draggedItem = null; // To keep track of the item being dragged
        this.dragSource = null; // To track if dragging from palette or drop zone
        this.lastDragover = 0; // For debouncing dragover events

        // Create and append styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        this.shadowRoot.appendChild(styleSheet);

        // Create and append template
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="container">
                <p class="instruction-label">Choose your Operating System:</p>
                <div class="os-tabs">
                    <button id="windows-tab" class="os-tab active">Windows</button>
                    <button id="mac-tab" class="os-tab">macOS</button>
                    <button id="chrome-tab" class="os-tab">Chrome OS</button>
                </div>

                <div class="mode-toggle">
                    <p class="instruction-label">Select a Tutorial:</p>
                    <!-- Tutorial grid will be added here dynamically -->
                </div>

                <div class="command-area">
                    <div class="component-palette" id="component-palette">
                        <!-- Components will be added dynamically -->
                    </div>

                    <div class="drop-zone" id="drop-zone">
                        <!-- Drag and drop target -->
                    </div>

                    <div class="preview" id="command-preview">
                        <!-- Command preview will appear here -->
                    </div>

                    <div class="validation-message" id="validation-message">
                        <!-- Validation feedback will appear here -->
                    </div>

                    <div class="output-preview" id="output-preview">
                        <!-- Simulated output will appear here -->
                    </div>
                </div>
            </div>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Store element references
        this.componentPalette = this.shadowRoot.getElementById('component-palette');
        this.dropZone = this.shadowRoot.getElementById('drop-zone');
        this.commandPreview = this.shadowRoot.getElementById('command-preview');
        this.validationMessage = this.shadowRoot.getElementById('validation-message');
        this.outputPreview = this.shadowRoot.getElementById('output-preview');
        // Create tutorial grid container
        this.tutorialGrid = document.createElement('div');
        this.tutorialGrid.className = 'tutorial-grid';
        this.tutorialGrid.style.display = 'none';
        this.shadowRoot.querySelector('.mode-toggle').appendChild(this.tutorialGrid);

        // Initialize tutorial manager
        this.tutorialManager = new TutorialManager(this);

        // Create debounced dragOver handler for reordering
        this.debouncedDragOver = this.debounce((_, x) => {
            if (x !== undefined) {
                this.addPlaceholder(x);
            }
        }, 50).bind(this);

        // Bind methods
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.switchOS = this.switchOS.bind(this);
        this.updateTutorialGrid = this.updateTutorialGrid.bind(this);
        this.handlePlacedComponentDragStart = this.handlePlacedComponentDragStart.bind(this);
        this.handlePlacedComponentDragEnd = this.handlePlacedComponentDragEnd.bind(this);
    }

    // Helper function to get the element to insert before during drag over
    getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.placed-component:not(.dragging)')];

        // Clear any existing snap targets
        draggableElements.forEach(el => {
            el.classList.remove('snap-target');
        });

        if (draggableElements.length === 0) return null;

        // Find the element after which to insert based on horizontal position
        let closestElement = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        // Check each element to find the closest insertion point
        for (const element of draggableElements) {
            const box = element.getBoundingClientRect();
            const containerBox = container.getBoundingClientRect();

            // Calculate horizontal center of the element
            const centerX = box.left + box.width / 2 - containerBox.left;

            // Calculate distance to this element's center
            const distance = Math.abs(x - centerX);

            // If this is closer than our current closest, update
            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = element;
            }
        }

        // Determine if we should insert before or after the closest element
        if (closestElement) {
            const box = closestElement.getBoundingClientRect();
            const containerBox = container.getBoundingClientRect();
            const centerX = box.left + box.width / 2 - containerBox.left;

            // If we're to the left of the center, insert before; otherwise, get the next element
            if (x < centerX) {
                closestElement.classList.add('snap-target');
                return closestElement;
            } else {
                // Find the next element after this one
                const index = draggableElements.indexOf(closestElement);
                if (index < draggableElements.length - 1) {
                    const nextElement = draggableElements[index + 1];
                    nextElement.classList.add('snap-target');
                    return nextElement;
                } else {
                    // We're after the last element, so return null (append to end)
                    return null;
                }
            }
        }

        return null;
    }

    // Create and manage placeholder element
    addPlaceholder(x) {
        // Remove existing placeholder and clear snap targets
        this.removePlaceholder();

        const components = Array.from(this.dropZone.querySelectorAll('.placed-component:not(.dragging)'));
        if (components.length === 0) return;

        // Calculate snap points between components
        const snapPoints = [];
        let lastRight = 0;

        components.forEach((comp, index) => {
            const rect = comp.getBoundingClientRect();
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const left = rect.left - dropZoneRect.left;

            // Add snap point before component
            if (index === 0 || left - lastRight > 10) {
                snapPoints.push({
                    x: left - 5,
                    element: comp,
                    position: 'before'
                });
            }

            lastRight = rect.right - dropZoneRect.left;

            // Add snap point after last component
            if (index === components.length - 1) {
                snapPoints.push({
                    x: lastRight + 5,
                    element: null,
                    position: 'after'
                });
            }
        });

        // Find closest snap point
        const closestPoint = snapPoints.reduce((closest, point) => {
            const distance = Math.abs(point.x - x);
            if (distance < Math.abs(closest.x - x)) {
                return point;
            }
            return closest;
        }, snapPoints[0]);

        // Create and position placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder visible';

        if (closestPoint.position === 'before') {
            this.dropZone.insertBefore(placeholder, closestPoint.element);
        } else {
            this.dropZone.appendChild(placeholder);
        }

        // Update preview position if it exists
        if (this.dragPreview) {
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const previewRect = this.dragPreview.getBoundingClientRect();
            this.dragPreview.style.left = `${dropZoneRect.left + closestPoint.x - previewRect.width / 2}px`;
        }

        // Ensure placeholder is visible
        this.ensureElementVisible(placeholder);
    }

    // Helper method to ensure an element is visible in the scroll container
    ensureElementVisible(element) {
        const container = this.dropZone;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        const targetScroll = (() => {
            if (elementRect.right > containerRect.right) {
                return container.scrollLeft + (elementRect.right - containerRect.right) + 20;
            } else if (elementRect.left < containerRect.left) {
                return container.scrollLeft - (containerRect.left - elementRect.left) - 20;
            }
            return container.scrollLeft;
        })();

        // Smoothly scroll to target position
        const startScroll = container.scrollLeft;
        const distance = targetScroll - startScroll;
        const duration = 300; // ms
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic function
            const easeOut = 1 - Math.pow(1 - progress, 3);

            container.scrollLeft = startScroll + (distance * easeOut);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }

    removePlaceholder() {
        const placeholder = this.dropZone.querySelector('.drag-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        // Remove any shift classes and snap targets
        const components = this.dropZone.querySelectorAll('.placed-component');
        components.forEach(comp => {
            comp.classList.remove('shift-left', 'shift-right', 'snap-target');
        });
    }


    updateTutorialGrid() {
        // Clear existing tutorial buttons
        this.tutorialGrid.innerHTML = '';

        // Get tutorials for current OS
        const osTutorials = this.tutorials[this.currentOS];
        if (!osTutorials) return;

        // Mapping from tutorial key to desired generic label
        const labelMap = {
            ping: "Ping",
            traceroute: "Traceroute",
            tracert: "Traceroute", // Windows uses tracert
            tracepath: "Trace Path", // Chrome OS uses tracepath
            internalIP: "IP Lookup",
            ifconfig: "IP Lookup", // macOS uses ifconfig
            ip: "IP Lookup", // Chrome OS uses ip addr show
            flushDNS: "Flush DNS",
            dscacheutil: "Flush DNS", // macOS uses dscacheutil
            dns: "Manage DNS Cache" // Chrome OS DNS is different
        };

        // Create tutorial buttons
        Object.entries(osTutorials).forEach(([key, tutorial]) => {
            // Create a wrapper for each tutorial entry
            const tutorialWrapper = document.createElement('div');
            tutorialWrapper.className = 'tutorial-entry-wrapper'; // Add a class for potential styling

            const button = document.createElement('button');
            button.className = 'tutorial-button';
            // Use the mapped label, fallback to original name if not found
            button.textContent = labelMap[key] || tutorial.name;
            tutorialWrapper.appendChild(button); // Add main button to wrapper

            // Check if tutorial has sub-options (basic/advanced or internal/external)
            const isTraceroute = key === 'traceroute' || key === 'tracert' || key === 'tracepath';
            const isPing = key === 'ping';
            const isIpLookup = key === 'ipLookup';

            if ((isTraceroute || isPing || isIpLookup) && tutorial.lessons && tutorial.lessons.length > 1) {
                // Create a container for sub-buttons
                const subButtonContainer = document.createElement('div');
                subButtonContainer.className = 'tutorial-sub-buttons';
                subButtonContainer.style.display = 'none'; // Initially hidden

                // Determine labels based on the tutorial type
                let basicLabel, advancedLabel;
                if (isPing) {
                    basicLabel = 'Basic Ping';
                    advancedLabel = 'Advanced Ping';
                } else if (isIpLookup) {
                    basicLabel = 'Internal IP';
                    advancedLabel = 'External IP';
                } else {
                    basicLabel = key === 'tracepath' ? 'Basic Trace Path' : 'Basic Traceroute';
                    advancedLabel = key === 'tracepath' ? 'Advanced Trace Path' : 'Advanced Traceroute';
                }

                // Create Basic button
                const basicButton = document.createElement('button');
                basicButton.className = 'tutorial-button secondary';
                basicButton.textContent = basicLabel;
                basicButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetBuilder();
                    this.tutorialManager.startTutorial(`${this.currentOS}.${key}`, 0);
                });
                subButtonContainer.appendChild(basicButton);

                // Create Advanced button
                const advancedButton = document.createElement('button');
                advancedButton.className = 'tutorial-button secondary';
                advancedButton.textContent = advancedLabel;
                advancedButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetBuilder();
                    this.tutorialManager.startTutorial(`${this.currentOS}.${key}`, 1);
                });
                subButtonContainer.appendChild(advancedButton);

                // Add toggle listener to the main button
                button.addEventListener('click', () => {
                    const isVisible = subButtonContainer.style.display !== 'none';
                    subButtonContainer.style.display = isVisible ? 'none' : 'block';
                });

                tutorialWrapper.appendChild(subButtonContainer);

            } else {
                // Standard behavior for other tutorials
                button.addEventListener('click', () => {
                    this.resetBuilder();
                    this.tutorialManager.startTutorial(`${this.currentOS}.${key}`);
                });
            }

            this.tutorialGrid.appendChild(tutorialWrapper);
        });

        this.tutorialGrid.style.display = 'grid';
    }

    connectedCallback() {
        // Set up drag and drop
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        this.dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));

        // Listen for dragend on the document to catch all drag end events
        document.addEventListener('dragend', this.handlePlacedComponentDragEnd.bind(this));

        // Make sure the drop zone can receive drops
        this.dropZone.setAttribute('aria-dropeffect', 'move');

        // Log when the component is connected
        console.log('[CommandBuilder] Connected and initialized drop zone:', this.dropZone);

        // Set up OS switching
        const osTabs = this.shadowRoot.querySelectorAll('.os-tab');
        osTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const os = tab.id.replace('-tab', '');
                this.switchOS(os);
                osTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateTutorialGrid();
            });
        });

        // Initialize for Windows
        this.initializeComponents('windows');
        this.updateTutorialGrid();

        console.log('[WebComponent CommandBuilder] Component connected and initialized');
    }

    getComponentsForOS(os) {
        const targets = [
            { type: 'argument', value: 'google.com', display: 'google.com' },
            { type: 'argument', value: '8.8.8.8', display: '8.8.8.8' }
        ];

        const numbers = [
            { type: 'argument', value: '15', display: '15' },
            { type: 'argument', value: '50', display: '50' }
        ];

        const components = {
            windows: [
                { type: 'base', value: 'ping', display: 'ping' },
                { type: 'parameter', value: '-n', display: '-n' },
                { type: 'base', value: 'tracert', display: 'tracert' },
                { type: 'parameter', value: '/h', display: '/h' },
                { type: 'base', value: 'ipconfig', display: 'ipconfig' },
                { type: 'parameter', value: '/all', display: '/all' },
                { type: 'parameter', value: '/flushdns', display: '/flushdns' },
                { type: 'parameter', value: '/displaydns', display: '/displaydns' },
                { type: 'base', value: 'nslookup', display: 'nslookup' },
                { type: 'argument', value: 'myip.opendns.com', display: 'myip.opendns.com' },
                { type: 'argument', value: 'resolver1.opendns.com', display: 'resolver1.opendns.com' },
                ...targets,
                ...numbers
            ],
            mac: [
                { type: 'base', value: 'ping', display: 'ping' },
                { type: 'parameter', value: '-c', display: '-c' },
                { type: 'base', value: 'traceroute', display: 'traceroute' },
                { type: 'parameter', value: '-m', display: '-m' },
                { type: 'base', value: 'sudo', display: 'sudo' },
                { type: 'base', value: 'ifconfig', display: 'ifconfig' },
                { type: 'parameter', value: '-a', display: '-a' },
                { type: 'base', value: 'dscacheutil', display: 'dscacheutil' },
                { type: 'parameter', value: '-flushcache', display: '-flushcache' },
                { type: 'base', value: 'curl', display: 'curl' },
                { type: 'argument', value: 'ifconfig.me', display: 'ifconfig.me' },
                ...targets,
                ...numbers
            ],
            chrome: [
                { type: 'base', value: 'ping', display: 'ping' },
                { type: 'parameter', value: '-c', display: '-c' },
                { type: 'base', value: 'tracepath', display: 'tracepath' },
                { type: 'parameter', value: '-m', display: '-m' },
                { type: 'base', value: 'ip', display: 'ip' },
                { type: 'argument', value: 'addr', display: 'addr' },
                { type: 'argument', value: 'show', display: 'show' },
                { type: 'argument', value: 'detail', display: 'detail' },
                ...targets,
                ...numbers
            ]
        };

        return components[os] || components.windows;
    }

    // Debounce helper function
    debounce(func, wait) {
        return (...args) => {
            const now = Date.now();
            if (now - this.lastDragover >= wait) {
                func.apply(this, args);
                this.lastDragover = now;
            }
        };
    }

    // Drag from palette
    handleDragStart(e) {
        this.dragSource = 'palette';
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: e.target.dataset.type,
            value: e.target.dataset.value
        }));
        e.dataTransfer.effectAllowed = 'copy';
    }

    // Drag from drop zone (reordering)
    handlePlacedComponentDragStart(e) {
        // Make sure we're dragging the component, not a child element
        const component = e.target.closest('.placed-component');
        if (!component) {
            console.error('[CommandBuilder] No component found in dragstart event', e.target);
            return;
        }

        // Store drag source and dragged item
        this.dragSource = 'drop-zone';
        this.draggedItem = component;

        // Get initial position
        const rect = this.draggedItem.getBoundingClientRect();

        // Set drag data
        try {
            const data = JSON.stringify({
                type: this.draggedItem.dataset.type,
                value: this.draggedItem.dataset.value
            });
            e.dataTransfer.setData('text/plain', data);
            e.dataTransfer.effectAllowed = 'move';
        } catch (err) {
            console.error('Error setting drag data:', err);
        }

        // Add dragging class to original element
        this.draggedItem.classList.add('dragging');

        // Create a clone for the drag image
        const dragImage = this.draggedItem.cloneNode(true);
        dragImage.style.transform = 'translateY(-1000px)';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '0';
        dragImage.style.left = '0';
        dragImage.style.width = `${rect.width}px`;
        dragImage.style.height = `${rect.height}px`;
        dragImage.style.opacity = '0.8';
        document.body.appendChild(dragImage);

        // Use the clone as the drag image
        e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);

        // Remove the clone after it's been used as a drag image
        setTimeout(() => {
            if (dragImage && dragImage.parentNode) {
                dragImage.parentNode.removeChild(dragImage);
            }
        }, 0);

        console.log('[CommandBuilder] Drag started for component:', this.draggedItem.dataset.value, 'Target:', e.target.tagName);
    }

    // End drag for placed component
    handlePlacedComponentDragEnd(e) {
        e.preventDefault();

        // Make sure we have a valid drag operation
        if (this.dragSource !== 'drop-zone' || !this.draggedItem) {
            console.log('[CommandBuilder] Drag ended but no active drag operation');
            return;
        }

        // Clean up drag states
        this.cleanupDragStates();

        console.log('[CommandBuilder] Drag ended for component:',
            this.draggedItem ? this.draggedItem.dataset.value : 'unknown');
    }

    cleanupDragStates() {
        // Clean up dragged item
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
            this.draggedItem.style.transform = '';
            this.draggedItem.style.transition = '';
            this.draggedItem = null;
        }

        // Clean up drop zone
        this.dropZone.classList.remove('drag-over', 'dragging');

        // Clean up all components
        const components = this.dropZone.querySelectorAll('.placed-component');
        components.forEach(comp => {
            comp.classList.remove('snap-target', 'shift-left', 'shift-right');
            comp.style.transform = '';
            comp.style.transition = '';
        });

        // Remove placeholder
        this.removePlaceholder();

        // Clear drag source
        this.dragSource = null;

        // Force a layout recalculation to ensure clean state
        this.dropZone.offsetHeight;
    }

    // Handle dragging over the drop zone
    handleDragOver(e) {
        e.preventDefault();

        // Get the x position relative to the dropZone
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const x = e.clientX - dropZoneRect.left;

        // Add dragging class to dropZone
        this.dropZone.classList.add('dragging');

        if (this.dragSource === 'drop-zone') {
            e.dataTransfer.dropEffect = 'move';

            // Calculate scroll speed based on distance from edges
            const scrollSpeed = 15;
            const scrollThreshold = 80;
            const leftEdge = x;
            const rightEdge = dropZoneRect.width - x;

            // Smooth scrolling with variable speed
            if (leftEdge < scrollThreshold) {
                const speed = Math.round((1 - leftEdge / scrollThreshold) * scrollSpeed);
                this.dropZone.scrollLeft -= speed;
            } else if (rightEdge < scrollThreshold) {
                const speed = Math.round((1 - rightEdge / scrollThreshold) * scrollSpeed);
                this.dropZone.scrollLeft += speed;
            }

            // Show visual feedback for the drag operation
            const afterElement = this.getDragAfterElement(this.dropZone, x);

            // Log drag over position for debugging
            if (Math.random() < 0.05) { // Only log occasionally to avoid console spam
                console.log('[CommandBuilder] Drag over:', {
                    x,
                    afterElement: afterElement ? afterElement.dataset.value : 'end of list'
                });
            }
        } else {
            e.dataTransfer.dropEffect = 'copy';
        }

        // Prevent text selection during drag
        return false;
    }

    // Handle entering the drop zone
    handleDragEnter(e) {
        e.preventDefault();
        this.dropZone.classList.add('drag-over');

        if (this.dragSource === 'drop-zone') {
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const x = e.clientX - dropZoneRect.left;
            this.addPlaceholder(x);
        }
    }

    // Handle leaving the drop zone
    handleDragLeave(e) {
        e.preventDefault();

        // Get the immediate target and related target
        const target = e.target;
        const relatedTarget = e.relatedTarget;

        // Check if we're actually leaving the drop zone
        const isLeavingDropZone =
            !this.dropZone.contains(relatedTarget) &&
            (target === this.dropZone || !this.dropZone.contains(target));

        if (isLeavingDropZone) {
            // Remove all drag-related classes
            this.dropZone.classList.remove('drag-over', 'dragging');

            // Remove placeholder and snap targets
            this.removePlaceholder();

            // Clean up any remaining transition states
            const components = this.dropZone.querySelectorAll('.placed-component');
            components.forEach(comp => {
                comp.classList.remove('snap-target');
                comp.style.transform = '';
                comp.style.transition = '';
            });

            // Hide preview if it exists
            if (this.dragPreview) {
                this.dragPreview.style.opacity = '0';
            }
        }
    }

    // Handle the drop event
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        this.dropZone.classList.remove('drag-over');
        this.dropZone.classList.remove('dragging');
        let data = null;

        try {
            const transferData = e.dataTransfer.getData('text/plain');
            if (transferData) {
                data = JSON.parse(transferData);
            }
        } catch (err) {
            console.warn('Error parsing drop data:', err);
        }

        console.log('[CommandBuilder] Drop event:', {
            dragSource: this.dragSource,
            draggedItem: this.draggedItem ? this.draggedItem.dataset.value : null,
            data
        });

        // Handle drop from palette
        if (this.dragSource === 'palette' && data) {
            this.addComponent(data);
        }
        // Handle reordering within drop zone
        else if (this.dragSource === 'drop-zone' && this.draggedItem) {
            // Get final position
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const x = e.clientX - dropZoneRect.left;
            const afterElement = this.getDragAfterElement(this.dropZone, x);

            console.log('[CommandBuilder] Reordering:', {
                draggedItem: this.draggedItem.dataset.value,
                afterElement: afterElement ? afterElement.dataset.value : 'end of list'
            });

            // Remove any transition classes
            const allComponents = this.dropZone.querySelectorAll('.placed-component');
            allComponents.forEach(comp => {
                comp.classList.remove('snap-target');
            });

            // Position the dragged item
            if (afterElement == null) {
                this.dropZone.appendChild(this.draggedItem);
            } else if (this.draggedItem !== afterElement) {
                this.dropZone.insertBefore(this.draggedItem, afterElement);
            }

            // Clean up dragged item
            this.draggedItem.classList.remove('dragging');
            this.draggedItem.style.transform = '';
            this.draggedItem.style.transition = '';

            console.log('[CommandBuilder] Component reordered:', this.draggedItem.dataset.value);
        }

        // Clean up
        this.cleanupDragStates();

        // Update preview and validation
        requestAnimationFrame(() => {
            this.updateCommandPreview();
            const logPayload = {
                currentCommand: this.getCurrentCommand(),
                droppedComponent: data?.value
            };
            console.log('[CommandBuilder] Drop completed:', logPayload);
            this.tutorialManager.validateCurrentStep();
        });
    }

    // Add a new component element to the drop zone
    addComponent(componentData) {
        const component = document.createElement('div');
        component.className = 'placed-component';
        component.draggable = true;
        component.setAttribute('draggable', 'true'); // Ensure draggable attribute is set
        component.dataset.value = componentData.value;
        component.dataset.type = componentData.type;

        // Create main content wrapper to prevent text selection during drag
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'component-content';
        contentWrapper.textContent = componentData.value;
        contentWrapper.style.pointerEvents = 'none'; // Ensure content doesn't interfere with drag
        component.appendChild(contentWrapper);

        // Add drag event listeners directly to the component
        component.addEventListener('mousedown', () => {
            component.classList.add('grabbing');
            console.log('[CommandBuilder] Component mousedown:', componentData.value);
        });
        component.addEventListener('mouseup', () => {
            component.classList.remove('grabbing');
            console.log('[CommandBuilder] Component mouseup:', componentData.value);
        });
        component.addEventListener('dragstart', (e) => {
            console.log('[CommandBuilder] Component dragstart:', componentData.value);
            this.handlePlacedComponentDragStart(e);
        });
        component.addEventListener('dragend', (e) => {
            console.log('[CommandBuilder] Component dragend:', componentData.value);
            this.handlePlacedComponentDragEnd(e);
        });

        // Add touch feedback for mobile devices
        component.addEventListener('touchstart', () => {
            component.classList.add('grabbing');
            console.log('[CommandBuilder] Component touchstart:', componentData.value);
        });

        component.addEventListener('touchend', () => {
            component.classList.remove('grabbing');
            console.log('[CommandBuilder] Component touchend:', componentData.value);
        });

        // Create and append remove button
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            component.remove();
            this.updateCommandPreview();
            this.tutorialManager.validateCurrentStep();
        });
        // Make sure the remove button doesn't interfere with dragging
        removeBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            console.log('[CommandBuilder] Remove button mousedown');
        });
        removeBtn.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('[CommandBuilder] Remove button dragstart prevented');
        });
        component.appendChild(removeBtn);

        // Add component to drop zone
        this.dropZone.appendChild(component);

        // Force hardware acceleration for smoother dragging
        requestAnimationFrame(() => {
            component.style.transform = 'translate3d(0,0,0)';
            component.style.willChange = 'transform';

            // Double-check draggable attribute is set
            component.setAttribute('draggable', 'true');

            // Ensure the component is draggable
            component.style.pointerEvents = 'auto';

            // Log component creation
            console.log('[CommandBuilder] Added component:', componentData.value, component);
            console.log('[CommandBuilder] Component draggable:', component.draggable, component.getAttribute('draggable'));
        });

        // Update command preview after adding component
        this.updateCommandPreview();
    }

    updateCommandPreview() {
        const components = Array.from(this.dropZone.querySelectorAll('.placed-component'))
            .map(comp => comp.querySelector('.component-content').textContent.trim());

        this.commandPreview.textContent = components.join(' ');

        if (components.length > 0) {
            const validationResult = validateCommandStructure(components[0], components, this.currentOS);

            this.validationMessage.className = 'validation-message';
            if (validationResult.valid) {
                this.validationMessage.classList.add('success');
                this.validationMessage.textContent = 'Valid command structure';
            } else {
                this.validationMessage.classList.add('error');
                this.validationMessage.textContent = validationResult.message;
            }

            this.outputPreview.textContent = simulateOutput(components, this.currentOS);
        } else {
            this.validationMessage.textContent = '';
            this.outputPreview.textContent = '';
        }
    }

    switchOS(os) {
        this.currentOS = os;
        this.initializeComponents(os);
        this.dropZone.innerHTML = '';
        this.commandPreview.textContent = '';
        this.validationMessage.textContent = '';
        this.outputPreview.textContent = '';
    }

    getCurrentCommand() {
        return Array.from(this.dropZone.querySelectorAll('.placed-component'))
            .map(comp => comp.querySelector('.component-content').textContent.trim());
    }

    initializeComponents(os) {
        // Clear existing components
        while (this.componentPalette.firstChild) {
            this.componentPalette.firstChild.remove();
        }

        // Add new components
        const components = this.getComponentsForOS(os);
        components.forEach(component => {
            const elem = document.createElement('div');
            elem.className = 'command-component';
            elem.draggable = true;
            elem.textContent = component.display;
            elem.dataset.type = component.type;
            elem.dataset.value = component.value;

            elem.addEventListener('dragstart', this.handleDragStart);
            this.componentPalette.appendChild(elem);
        });
    }

    resetBuilder() {
        this.dropZone.innerHTML = '';
        this.commandPreview.textContent = '';
        this.validationMessage.textContent = '';
        this.outputPreview.textContent = '';
    }
}

// Register the custom element
const tagName = 'command-builder-simulator';
customElements.define(tagName, CommandBuilderElement);
console.log(`[WebComponent CommandBuilder] Custom element "${tagName}" defined.`);
