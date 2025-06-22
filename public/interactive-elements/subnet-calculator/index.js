class SubnetCalculatorElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Create and append template
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                    background: var(--custom-primary-bg-color, var(--bg-color, #ffffff));
                    color: var(--custom-title-color, var(--text-color, #2c3e50));
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

                    /* Light mode defaults using custom properties */
                    --bg-color: var(--custom-primary-bg-color, #ffffff);
                    --text-color: var(--custom-title-color, #2c3e50);
                    --border-color: #e5e7eb;
                    --input-bg: var(--custom-secondary-bg-color, #ffffff);
                    --input-text: var(--custom-title-color, #2c3e50);
                    --button-bg: var(--custom-button-color, #3b82f6);
                    --button-text: #ffffff;
                    --canvas-bg: var(--custom-secondary-bg-color, #f8f9fa);
                }

                :host(.dark-mode) {
                    --bg-color: var(--custom-primary-bg-color, #1e293b);
                    --text-color: var(--custom-title-color, #f1f5f9);
                    --border-color: #334155;
                    --input-bg: var(--custom-secondary-bg-color, #334155);
                    --input-text: var(--custom-title-color, #f1f5f9);
                    --button-bg: var(--custom-button-color, #3b82f6);
                    --button-text: #ffffff;
                    --canvas-bg: var(--custom-secondary-bg-color, #0f172a);
                }

                .calculator-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .input-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr auto;
                    gap: 20px;
                    align-items: end;
                    margin-bottom: 20px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                label {
                    font-weight: 500;
                    color: var(--text-color);
                }

                input {
                    padding: 12px 14px;
                    border: 1px solid var(--border-color, #e5e7eb);
                    border-radius: 6px;
                    background: var(--input-bg, #ffffff);
                    color: var(--input-text, #2c3e50);
                    font-size: 14px;
                    height: 44px;
                    box-sizing: border-box;
                }

                input:focus {
                    outline: none;
                    border-color: var(--custom-button-color, #3b82f6);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                }

                :host(.dark-mode) input {
                    background: var(--input-bg);
                    border: 1px solid var(--border-color);
                    color: var(--input-text);
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                :host(.dark-mode) input:focus {
                    border-color: var(--custom-button-color, #3b82f6);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1);
                    background: var(--custom-secondary-bg-color, #3c4858);
                }

                .visualization-section {
                    position: relative;
                    width: 100%;
                    height: 400px;
                    background: var(--canvas-bg, #f8f9fa);
                    border: 1px solid var(--border-color, #e5e7eb);
                    border-radius: 4px;
                    overflow: hidden;
                }

                canvas {
                    width: 100%;
                    height: 100%;
                }



                .examples-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .examples-header {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 10px;
                }

                .examples-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                .examples-label {
                    font-size: 14px;
                    color: var(--text-color);
                    opacity: 0.8;
                    font-weight: 500;
                    margin-bottom: 5px;
                }

                .example-btn {
                    padding: 10px 14px;
                    background: var(--custom-button-color, #3b82f6);
                    color: white;
                    border: 1px solid var(--custom-button-color, #3b82f6);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: center;
                    min-height: 44px;
                }

                .icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }

                .example-btn:hover {
                    filter: brightness(0.9);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .example-btn:active {
                    transform: translateY(0);
                    filter: brightness(0.8);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .calculate-btn {
                    padding: 0 24px;
                    background: var(--custom-button-color, #3b82f6);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    height: 44px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .calculate-btn:hover {
                    filter: brightness(0.9);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .calculate-btn:active {
                    transform: translateY(0);
                    filter: brightness(0.8);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                /* Dark mode specific styles - example buttons now use button color consistently */

                :host(.dark-mode) .visualization-section {
                    background: var(--canvas-bg);
                    border: 1px solid var(--border-color);
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                }



                /* Responsive adjustments */
                @media (max-width: 800px) {
                    .input-section {
                        grid-template-columns: 1fr;
                        gap: 15px;
                        align-items: stretch;
                    }

                    .examples-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }

                    .example-btn {
                        font-size: 12px;
                        padding: 8px 10px;
                    }

                    .visualization-section {
                        height: 350px;
                    }
                }

                @media (max-width: 500px) {
                    .calculator-container {
                        gap: 15px;
                    }

                    .input-section {
                        grid-template-columns: 1fr;
                        align-items: stretch;
                    }



                    .examples-grid {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .example-btn {
                        font-size: 12px;
                        padding: 8px 12px;
                    }

                    .visualization-section {
                        height: 280px;
                    }

                    .examples-label {
                        font-size: 14px;
                    }
                }
            </style>

            <div class="calculator-container">
                <div class="input-section">
                    <div class="input-group">
                        <label for="ip-address">IP Address</label>
                        <input type="text" id="ip-address" placeholder="192.168.1.0" />
                    </div>
                    <div class="input-group">
                        <label for="subnet-mask">Subnet Mask (CIDR or dotted)</label>
                        <input type="text" id="subnet-mask" placeholder="/24 or 255.255.255.0" />
                    </div>
                    <div class="input-group">
                        <button id="calculate-btn" class="calculate-btn">Calculate Subnet</button>
                    </div>
                </div>

                <div class="examples-header">
                    <div class="examples-label" style="text-align: center; font-size: 16px; font-weight: 600;">Quick Examples - Try These Common Network Configurations:</div>
                    <div class="examples-grid">
                        <button class="example-btn" data-ip="192.168.1.0" data-mask="/24">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                            Home Network (/24)
                        </button>
                        <button class="example-btn" data-ip="10.0.0.0" data-mask="/16">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/></svg>
                            Large Network (/16)
                        </button>
                        <button class="example-btn" data-ip="172.16.0.0" data-mask="/28">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                            Small Subnet (/28)
                        </button>
                        <button class="example-btn" data-ip="203.0.113.0" data-mask="/30">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                            Point-to-Point (/30)
                        </button>
                    </div>
                </div>

                <div class="visualization-section">
                    <canvas id="network-canvas"></canvas>
                </div>

                <div class="learning-section">
                    <h3 style="color: var(--text-color); margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        What You're Learning
                    </h3>
                    <div class="learning-content" style="
                        background: var(--canvas-bg, #f8f9fa);
                        border: 1px solid var(--border-color, #e5e7eb);
                        border-radius: 4px;
                        padding: 15px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        line-height: 1.5;
                        color: var(--text-color);
                    ">
                        <p><strong>Subnet Calculator</strong> helps you understand how IP networks are divided into smaller subnetworks (subnets).</p>
                        <p><strong>Try this:</strong> Change the subnet mask from /24 to /25 and see how it affects the number of available hosts!</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li><strong>Network Address:</strong> The first IP in the subnet (cannot be assigned to devices)</li>
                            <li><strong>Broadcast Address:</strong> The last IP in the subnet (used for network broadcasts)</li>
                            <li><strong>Usable Hosts:</strong> IPs that can be assigned to devices (Total - 2)</li>
                            <li><strong>CIDR Notation:</strong> /24 means 24 bits for network, 8 bits for hosts (256 total addresses)</li>
                        </ul>
                    </div>
                </div>


            </div>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Initialize worker
        this.worker = null;
        this.isWorkerReady = false;

        // Bind methods
        this._handleInput = this._handleInput.bind(this);
        this._handleWorkerMessage = this._handleWorkerMessage.bind(this);
        this._updateCanvas = this._updateCanvas.bind(this);
        this._initializeWorker = this._initializeWorker.bind(this);
        this._handleResize = this._handleResize.bind(this);
        this._updateTheme = this._updateTheme.bind(this);

        // Storage for element references
        this.elements = {};
    }

    connectedCallback() {
        console.log('[SubnetCalculator] Component connected');
        this._initializeElements();
        this._initializeWorker();
        this._attachEventListeners();
        this._initializeCanvas();
        this._setupThemeHandling();

        // Set default values and trigger initial calculation with proper theme detection
        setTimeout(() => {
            this._setDefaultValues();
            this._updateTheme(); // Ensure theme is detected first
            this._handleInput();
        }, 100);
    }

    disconnectedCallback() {
        console.log('[SubnetCalculator] Component disconnected');
        this._removeEventListeners();
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    _initializeElements() {
        // Get references to DOM elements
        ['ip-address', 'subnet-mask', 'calculate-btn', 'network-canvas'].forEach(id => {
            this.elements[id] = this.shadowRoot.getElementById(id);
        });
    }

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

            const workerPath = `${basePath}/interactive-elements/subnet-calculator/worker.js`;
            console.log(`[SubnetCalculator] Current path: ${currentPath}, Base path: ${basePath}`);
            console.log(`[SubnetCalculator] Initializing worker at path: ${workerPath}`);

            this.worker = new Worker(workerPath);
            this.worker.addEventListener('message', this._handleWorkerMessage);
            this.worker.onerror = (error) => {
                console.error('[SubnetCalculator] Worker Error:', error);
                this.isWorkerReady = false;
                this._initializeFallbackCalculation();
            };
            this.isWorkerReady = true;
            console.log('[SubnetCalculator] Worker initialized');
        } catch (error) {
            console.error('[SubnetCalculator] Failed to initialize worker:', error);
            this._initializeFallbackCalculation();
        }
    }

    _initializeFallbackCalculation() {
        // Fallback calculation methods if worker fails
        this.fallbackMode = true;
        console.log('[SubnetCalculator] Using fallback calculation mode');
    }

    _calculateSubnetFallback(ipAddress, subnetMask) {
        try {
            // Basic subnet calculation without worker
            const ipParts = ipAddress.split('.').map(Number);
            let maskParts;

            // Handle CIDR notation
            if (subnetMask.startsWith('/')) {
                const cidr = parseInt(subnetMask.substring(1), 10);
                const mask = ~((1 << (32 - cidr)) - 1) >>> 0;
                maskParts = [
                    (mask >>> 24) & 255,
                    (mask >>> 16) & 255,
                    (mask >>> 8) & 255,
                    mask & 255
                ];
            } else {
                maskParts = subnetMask.split('.').map(Number);
            }

            // Calculate network address
            const networkParts = ipParts.map((ip, i) => ip & maskParts[i]);

            // Calculate broadcast address
            const invMaskParts = maskParts.map(mask => 255 - mask);
            const broadcastParts = networkParts.map((net, i) => net | invMaskParts[i]);

            // Calculate host counts
            const totalHosts = invMaskParts.reduce((acc, inv) => acc * (inv + 1), 1);
            const usableHosts = Math.max(0, totalHosts - 2);

            // Calculate first and last usable
            const firstUsable = totalHosts <= 2 ? networkParts.join('.') :
                networkParts.map((part, i) => i === 3 ? part + 1 : part).join('.');
            const lastUsable = totalHosts <= 2 ? broadcastParts.join('.') :
                broadcastParts.map((part, i) => i === 3 ? part - 1 : part).join('.');

            return {
                'network-address': networkParts.join('.'),
                'broadcast-address': broadcastParts.join('.'),
                'total-hosts': totalHosts.toString(),
                'usable-hosts': usableHosts.toString(),
                'first-usable': firstUsable,
                'last-usable': lastUsable
            };
        } catch (error) {
            console.error('[SubnetCalculator] Fallback calculation error:', error);
            return null;
        }
    }

    _attachEventListeners() {
        // Input event listeners
        this.elements['ip-address']?.addEventListener('input', this._handleInput);
        this.elements['subnet-mask']?.addEventListener('input', this._handleInput);

        // Button event listener
        this.elements['calculate-btn']?.addEventListener('click', this._handleInput);

        // Example button listeners
        this.shadowRoot.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ip = btn.getAttribute('data-ip');
                const mask = btn.getAttribute('data-mask');
                if (this.elements['ip-address'] && this.elements['subnet-mask']) {
                    this.elements['ip-address'].value = ip;
                    this.elements['subnet-mask'].value = mask;
                    this._handleInput();
                }
            });
        });

        // Enter key listeners for inputs
        this.elements['ip-address']?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._handleInput();
        });
        this.elements['subnet-mask']?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._handleInput();
        });



        // Resize observer for canvas
        this.resizeObserver = new ResizeObserver(this._handleResize);
        if (this.elements['network-canvas']) {
            this.resizeObserver.observe(this.elements['network-canvas']);
        }

        // Theme change observer
        this._setupThemeHandling();
    }

    _removeEventListeners() {
        this.elements['ip-address']?.removeEventListener('input', this._handleInput);
        this.elements['subnet-mask']?.removeEventListener('input', this._handleInput);
        this.elements['calculate-btn']?.removeEventListener('click', this._handleInput);
        if (this.worker) {
            this.worker.removeEventListener('message', this._handleWorkerMessage);
        }
    }

    _setDefaultValues() {
        if (this.elements['ip-address'] && !this.elements['ip-address'].value) {
            this.elements['ip-address'].value = '192.168.1.0';
        }
        if (this.elements['subnet-mask'] && !this.elements['subnet-mask'].value) {
            this.elements['subnet-mask'].value = '/24';
        }
    }

    _handleInput() {
        const ipAddress = this.elements['ip-address']?.value;
        const subnetMask = this.elements['subnet-mask']?.value;

        if (ipAddress && subnetMask) {
            if (this.worker && !this.fallbackMode) {
                // Use worker if available
                this.worker.postMessage({
                    type: 'calculate',
                    payload: { ipAddress, subnetMask }
                });
            } else {
                // Use fallback calculation
                const results = this._calculateSubnetFallback(ipAddress, subnetMask);
                if (results) {
                    this._updateCanvas(results);
                } else {
                    this._clearCanvas();
                }
            }
        } else if (ipAddress || subnetMask) {
            // Clear canvas if inputs are incomplete
            this._clearCanvas();
        }
    }

    _handleWorkerMessage(e) {
        const { type, payload } = e.data;

        if (type === 'ready') {
            console.log('[SubnetCalculator] Worker ready:', payload);
            this.isWorkerReady = true;
        } else if (type === 'results') {
            this._updateCanvas(payload);
        } else if (type === 'error') {
            console.error('[SubnetCalculator] Calculation error:', payload);
            this._clearCanvas();
        }
    }

    _clearCanvas() {
        // Clear the canvas
        const canvas = this.elements['network-canvas'];
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    _initializeCanvas() {
        const canvas = this.elements['network-canvas'];
        if (canvas) {
            this._handleResize();
        }
    }

    _handleResize() {
        const canvas = this.elements['network-canvas'];
        if (!canvas) return;

        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set canvas size
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Trigger redraw
        this._handleInput();
    }

    _getCustomColors() {
        // Get computed styles to access CSS custom properties
        const computedStyle = getComputedStyle(this);

        return {
            titleColor: computedStyle.getPropertyValue('--custom-title-color').trim() ||
                       (this.classList.contains('dark-mode') ? '#f1f5f9' : '#2c3e50'),
            buttonColor: computedStyle.getPropertyValue('--custom-button-color').trim() ||
                        (this.classList.contains('dark-mode') ? '#3b82f6' : '#3b82f6'),
            primaryBgColor: computedStyle.getPropertyValue('--custom-primary-bg-color').trim() ||
                           (this.classList.contains('dark-mode') ? '#1e293b' : '#ffffff'),
            secondaryBgColor: computedStyle.getPropertyValue('--custom-secondary-bg-color').trim() ||
                             (this.classList.contains('dark-mode') ? '#0f172a' : '#f8f9fa')
        };
    }

    _updateCanvas(results) {
        const canvas = this.elements['network-canvas'];
        if (!canvas || !results) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw network visualization
        this._drawNetworkVisualization(ctx, canvas, results);
    }

    _drawNetworkVisualization(ctx, canvas, results) {
        const { width, height } = canvas;

        // Check if we're in dark mode and get custom colors
        const isDarkMode = this.classList.contains('dark-mode');
        const customColors = this._getCustomColors();

        // Responsive sizing with better breakpoints
        const isMobile = width < 500;
        const isTablet = width >= 500 && width < 800;
        const padding = isMobile ? 25 : isTablet ? 35 : 50;
        const availableWidth = width - (padding * 2);

        // Responsive font sizes with tablet breakpoint
        const titleSize = isMobile ? 16 : isTablet ? 20 : 24;
        const labelSize = isMobile ? 11 : isTablet ? 13 : 16;
        const valueSize = isMobile ? 9 : isTablet ? 11 : 14;
        const hostCountSize = isMobile ? 12 : isTablet ? 16 : 20;

        // Set up drawing styles
        ctx.font = `${titleSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw title with custom colors
        ctx.fillStyle = customColors.titleColor;
        ctx.font = `bold ${titleSize}px Arial`;
        const titleY = isMobile ? 20 : isTablet ? 28 : 35;
        ctx.fillText('Network Address Space Visualization', width / 2, titleY);

        // Calculate network range
        const totalHosts = parseInt(results['total-hosts']) || 0;
        const usableHosts = parseInt(results['usable-hosts']) || 0;

        if (totalHosts === 0) return;

        // Responsive bar sizing
        const barHeight = isMobile ? 35 : isTablet ? 50 : 60;
        const barY = height / 2 - barHeight / 2;
        const netBcastWidth = isMobile ? 15 : isTablet ? 20 : 30;

        // Add background for the entire address space with custom colors
        ctx.fillStyle = customColors.secondaryBgColor;
        ctx.fillRect(padding, barY, availableWidth, barHeight);
        ctx.strokeStyle = isDarkMode ? '#475569' : '#dee2e6';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, barY, availableWidth, barHeight);

        // Network address (start) - Keep red for reserved addresses
        ctx.fillStyle = isDarkMode ? '#ef4444' : '#dc3545';
        ctx.fillRect(padding, barY, netBcastWidth, barHeight);

        // Network label and address - Better positioning with custom colors
        ctx.fillStyle = customColors.titleColor;
        ctx.font = `bold ${labelSize}px Arial`;
        ctx.textAlign = 'left';
        const networkLabelY = barY - (isMobile ? 30 : isTablet ? 38 : 45);
        const networkValueY = barY - (isMobile ? 18 : isTablet ? 22 : 25);
        ctx.fillText('Network Address', padding, networkLabelY);
        ctx.font = `${valueSize}px monospace`;
        ctx.fillText(results['network-address'], padding, networkValueY);

        // Usable range (middle) - Enhanced
        if (usableHosts > 0) {
            const usableBarWidth = Math.max(netBcastWidth, (availableWidth - netBcastWidth * 2) * (usableHosts / totalHosts));

            // Gradient for usable range with theme-aware colors
            const gradient = ctx.createLinearGradient(padding + netBcastWidth, barY, padding + netBcastWidth + usableBarWidth, barY);
            if (isDarkMode) {
                gradient.addColorStop(0, '#22c55e');
                gradient.addColorStop(1, '#10b981');
            } else {
                gradient.addColorStop(0, '#28a745');
                gradient.addColorStop(1, '#20c997');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(padding + netBcastWidth, barY, usableBarWidth, barHeight);

            // Add pattern/texture to usable range (only if wide enough)
            if (usableBarWidth > 60) {
                ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                for (let i = 0; i < usableBarWidth; i += 20) {
                    ctx.fillRect(padding + netBcastWidth + i, barY, 10, barHeight);
                }
            }

            // Label usable range - Better positioning with theme-aware colors
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            const rangeTextSize = isMobile ? 8 : isTablet ? 12 : 16;
            ctx.font = `bold ${rangeTextSize}px Arial`;
            const minWidthForRangeText = isMobile ? 80 : isTablet ? 100 : 120;
            if (usableBarWidth > minWidthForRangeText) {
                const rangeTextY = barY + (isMobile ? 12 : isTablet ? 16 : 20);
                ctx.fillText('USABLE HOST RANGE', padding + netBcastWidth + usableBarWidth / 2, rangeTextY);
            }
            ctx.font = `bold ${hostCountSize}px Arial`;
            const hostCountY = barY + (isMobile ? 22 : isTablet ? 32 : 40);
            ctx.fillText(`${usableHosts} hosts`, padding + netBcastWidth + usableBarWidth / 2, hostCountY);

            // Draw first and last usable IPs - Better positioning with custom colors
            ctx.fillStyle = customColors.titleColor;
            const ipTextSize = isMobile ? 8 : isTablet ? 10 : 12;
            ctx.font = `${ipTextSize}px Arial`;
            const firstIpY = barY + barHeight + (isMobile ? 12 : isTablet ? 16 : 20);
            const lastIpY = barY + barHeight + (isMobile ? 22 : isTablet ? 28 : 35);
            ctx.fillText(`First: ${results['first-usable']}`, padding + netBcastWidth + usableBarWidth / 2, firstIpY);
            ctx.fillText(`Last: ${results['last-usable']}`, padding + netBcastWidth + usableBarWidth / 2, lastIpY);
        }

        // Broadcast address (end) - Keep red for reserved addresses
        ctx.fillStyle = isDarkMode ? '#ef4444' : '#dc3545';
        ctx.fillRect(width - padding - netBcastWidth, barY, netBcastWidth, barHeight);

        // Broadcast label and address - Better positioning with custom colors
        ctx.fillStyle = customColors.titleColor;
        ctx.font = `bold ${labelSize}px Arial`;
        ctx.textAlign = 'right';
        const broadcastLabelY = barY - (isMobile ? 30 : isTablet ? 38 : 45);
        const broadcastValueY = barY - (isMobile ? 18 : isTablet ? 22 : 25);
        ctx.fillText('Broadcast Address', width - padding, broadcastLabelY);
        ctx.font = `${valueSize}px monospace`;
        ctx.fillText(results['broadcast-address'], width - padding, broadcastValueY);

        // Add legend first - Only on larger screens (desktop only)
        if (width >= 800) {
            this._drawLegend(ctx, width, height, isDarkMode, customColors);
        }

        // Draw subnet information with better styling - Better positioning (below legend) with custom colors
        ctx.textAlign = 'center';
        const totalTextSize = isMobile ? 12 : isTablet ? 16 : 20;
        ctx.font = `bold ${totalTextSize}px Arial`;
        ctx.fillStyle = customColors.titleColor;
        // Adjust Y position based on whether legend is shown
        const hasLegend = width >= 800;
        const totalY = height - (isMobile ? 50 : isTablet ? 65 : hasLegend ? 50 : 80);
        ctx.fillText(`Total Address Space: ${totalHosts} addresses`, width / 2, totalY);

        // Add CIDR notation if available with custom colors
        const subnetMask = this.elements['subnet-mask']?.value;
        if (subnetMask && subnetMask.startsWith('/')) {
            const cidrTextSize = isMobile ? 10 : isTablet ? 13 : 16;
            ctx.font = `${cidrTextSize}px Arial`;
            ctx.fillStyle = customColors.titleColor;
            const cidrY = height - (isMobile ? 38 : isTablet ? 48 : hasLegend ? 30 : 55);
            ctx.fillText(`CIDR: ${subnetMask} (${32 - parseInt(subnetMask.substring(1))} host bits)`, width / 2, cidrY);
        }
    }

    _drawLegend(ctx, width, height, isDarkMode, customColors) {
        const legendY = height - 120;

        // Calculate legend positioning to prevent cutoff with appropriate colors
        const legendItems = [
            { color: isDarkMode ? '#ef4444' : '#dc3545', text: 'Reserved (Network)' },
            { color: isDarkMode ? '#22c55e' : '#28a745', text: 'Usable for Hosts' },
            { color: isDarkMode ? '#ef4444' : '#dc3545', text: 'Reserved (Broadcast)' }
        ];

        // Measure text widths to calculate proper spacing
        ctx.font = '14px Arial';
        const textWidths = legendItems.map(item => ctx.measureText(item.text).width);
        const totalWidth = textWidths.reduce((sum, width) => sum + width + 25, 0) - 5; // 25 = box + spacing, -5 for last item
        const legendStartX = Math.max(20, (width - totalWidth) / 2); // Ensure minimum 20px from edge

        legendItems.forEach((item, index) => {
            const x = legendStartX + textWidths.slice(0, index).reduce((sum, width) => sum + width + 25, 0);

            // Draw color box
            ctx.fillStyle = item.color;
            ctx.fillRect(x, legendY, 15, 15);

            // Draw text with custom colors
            ctx.fillStyle = customColors.titleColor;
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.text, x + 20, legendY + 12);
        });
    }

    _setupThemeHandling() {
        // Create observer for theme changes
        const observer = new MutationObserver(() => {
            this._updateTheme();
        });

        // Observe document root for class changes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initial theme check
        this._updateTheme();
    }

    updateTheme(isDarkMode) {
        // This method can be called by the InteractiveRenderer when theme changes
        this.classList.toggle('dark-mode', isDarkMode);

        // Trigger canvas redraw if we have data
        if (this.elements['ip-address']?.value && this.elements['subnet-mask']?.value) {
            this._handleInput();
        }
    }

    _updateTheme() {
        // Check for dark mode
        const isDark = document.documentElement.classList.contains('dark') ||
                      document.body.classList.contains('dark');

        // Update component theme
        const wasChanged = !this.classList.contains('dark-mode') !== !isDark;
        this.classList.toggle('dark-mode', isDark);

        // Trigger canvas redraw if theme changed and we have data
        if (wasChanged && this.elements['ip-address']?.value && this.elements['subnet-mask']?.value) {
            this._handleInput();
        }
    }
}

// Define the custom element
const tagName = 'subnet-calculator-simulator';
customElements.define(tagName, SubnetCalculatorElement);
console.log(`[WebComponent] Custom element "${tagName}" defined.`);
