const packetLossTemplate = document.createElement('template');
packetLossTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: sans-serif;

      /* Light mode variables */
      --primary-color-light: #2196F3;
      --primary-dark-light: #1976D2;
      --success-color-light: #4CAF50;
      --warning-color-light: #ff9800;
      --error-color-light: #f44336;
      --bg-color-light: var(--custom-secondary-bg-color, #f8f9fa);
      --text-color-light: #2c3e50;
      --border-color-light: #e0e0e0;
      --element-bg-light: var(--custom-primary-bg-color, #ffffff);
      --diagnosis-bg-light: var(--custom-primary-bg-color, #ffffff);
      --shadow-sm-light: 0 2px 4px rgba(0,0,0,0.05);
      --shadow-md-light: 0 4px 6px rgba(0,0,0,0.1);

      /* Dark mode variables */
      --primary-color-dark: #60a5fa;
      --primary-dark-dark: #3b82f6;
      --success-color-dark: #22c55e;
      --warning-color-dark: #f59e0b;
      --error-color-dark: #ef4444;
      --bg-color-dark: var(--custom-secondary-bg-color, #1e293b);
      --text-color-dark: #f1f5f9;
      --border-color-dark: #334155;
      --element-bg-dark: var(--custom-primary-bg-color, #0f172a);
      --diagnosis-bg-dark: var(--custom-primary-bg-color, #1e293b);
      --shadow-sm-dark: 0 2px 4px rgba(0,0,0,0.2);
      --shadow-md-dark: 0 4px 8px rgba(0,0,0,0.3);

      /* Default to light mode */
      --primary-color: var(--primary-color-light);
      --primary-dark: var(--primary-dark-light);
      --success-color: var(--success-color-light);
      --warning-color: var(--warning-color-light);
      --error-color: var(--error-color-light);
      --bg-color: var(--bg-color-light);
      --text-color: var(--text-color-light);
      --border-color: var(--border-color-light);
      --element-bg: var(--element-bg-light);
      --diagnosis-bg: var(--diagnosis-bg-light);
      --shadow-sm: var(--shadow-sm-light);
      --shadow-md: var(--shadow-md-light);
      --radius-sm: 4px;
      --radius-md: 8px;

      transition: all 0.3s ease;
    }

    /* Dark mode styles */
    :host(.dark-mode) {
      --primary-color: var(--primary-color-dark);
      --primary-dark: var(--primary-dark-dark);
      --success-color: var(--success-color-dark);
      --warning-color: var(--warning-color-dark);
      --error-color: var(--error-color-dark);
      --bg-color: var(--bg-color-dark);
      --text-color: var(--text-color-dark);
      --border-color: var(--border-color-dark);
      --element-bg: var(--element-bg-dark);
      --diagnosis-bg: var(--diagnosis-bg-dark);
      --shadow-sm: var(--shadow-sm-dark);
      --shadow-md: var(--shadow-md-dark);
    }

    .interactive-element {
      background-color: var(--element-bg);
      padding: 25px;
      margin: 0;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      color: var(--text-color);
    }

    .interactive-element:hover {
      box-shadow: var(--shadow-md);
    }

    h3 {
      color: var(--custom-title-color, var(--primary-dark));
      font-size: 1.4em;
      font-weight: 600;
      margin: 0 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid var(--border-color);
    }

    .calculator {
        /* Container for the whole tool */
    }

    .simulation-controls {
      display: flex;
      flex-wrap: wrap; /* Allow wrapping on smaller screens */
      gap: 15px; /* Reduced gap */
      margin-bottom: 20px;
      background-color: var(--bg-color);
      padding: 15px; /* Reduced padding */
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      align-items: flex-end; /* Align items to bottom */
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 5px; /* Reduced gap */
      flex: 1; /* Allow controls to grow */
      min-width: 150px; /* Minimum width for controls */
    }

    .control-group label {
      font-weight: 500;
      font-size: 0.9em;
      color: var(--text-color);
    }

    select, button {
      padding: 8px 12px; /* Adjusted padding */
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      background-color: var(--element-bg);
      color: var(--text-color);
      font-family: inherit; /* Use host font */
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 38px; /* Consistent height */
    }

    select:focus, button:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }

    .primary-button {
      background-color: var(--custom-button-color, var(--primary-color));
      color: white;
      border: none;
      align-self: flex-end; /* Align button itself */
      margin-left: auto; /* Push button to the right if space allows */
    }

    .primary-button:hover {
      background-color: var(--primary-dark);
      filter: brightness(0.9);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .results-container {
      display: grid;
      grid-template-columns: 1fr; /* Default to single column */
      gap: 20px;
      margin: 20px 0;
    }

    /* Use media query for two columns on wider screens */
    @media (min-width: 600px) {
        .results-container {
            grid-template-columns: 1fr 2fr; /* Statistics | Visualization */
        }
    }


    .statistics {
      background-color: var(--bg-color);
      padding: 15px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .statistics h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--primary-dark);
      font-size: 1.1em;
    }

    .statistics ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .statistics li {
      padding: 6px 0; /* Reduced padding */
      border-bottom: 1px solid var(--border-color);
      font-size: 0.9em;
      display: flex;
      justify-content: space-between;
    }

    .statistics li:last-child {
      border-bottom: none;
    }

    .statistics span {
        font-weight: 600;
    }

    .visualization {
      display: flex;
      flex-wrap: wrap;
      gap: 4px; /* Slightly increased gap */
      padding: 15px;
      background-color: var(--bg-color);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      min-height: 100px; /* Ensure it has some height */
      align-content: flex-start; /* Align items to the top */
    }

    .packet {
      width: 18px; /* Smaller packets */
      height: 18px;
      border-radius: 3px; /* Slightly less rounded */
      transition: all 0.3s ease;
      cursor: default; /* No hover effect needed */
      border: 1px solid rgba(0,0,0,0.1); /* Subtle border */
    }

    .packet.success {
      background-color: var(--success-color);
    }

    .packet.lost {
      background-color: var(--error-color);
    }

    /* Removed delayed state for simplicity, can be added back if needed */

    .diagnosis {
      margin-top: 20px;
      padding: 15px;
      background-color: var(--bg-color);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .diagnosis h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--primary-dark);
      font-size: 1.1em;
    }

    .diagnosis p {
      margin: 8px 0;
      padding: 10px;
      border-radius: var(--radius-sm);
      background-color: var(--diagnosis-bg);
      font-size: 0.95em;
      line-height: 1.5;
      border-left: 4px solid transparent; /* For status color */
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .diagnosis p.status-ok { border-left-color: var(--success-color); }
    .diagnosis p.status-warn { border-left-color: var(--warning-color); }
    .diagnosis p.status-error { border-left-color: var(--error-color); }

  </style>

  <div class="interactive-element">
    <h3>Packet Loss Analysis Tool</h3>
    <div class="calculator">
      <div class="simulation-controls">
        <div class="control-group">
          <label for="packetCount">Number of Packets:</label>
          <select id="packetCount">
            <option value="50">50 packets</option>
            <option value="100" selected>100 packets</option>
            <option value="200">200 packets</option>
            <option value="500">500 packets</option>
          </select>
        </div>
        <div class="control-group">
          <label for="networkLoad">Simulated Network Load:</label>
          <select id="networkLoad">
            <option value="low">Low (0-1% loss)</option>
            <option value="medium" selected>Medium (1-3% loss)</option>
            <option value="high">High (3-7% loss)</option>
            <option value="severe">Severe (7-15% loss)</option>
          </select>
        </div>
        <button id="runTestBtn" class="primary-button">Run Test</button>
      </div>

      <div class="results-container">
        <div class="statistics">
          <h4>Test Results:</h4>
          <ul>
            <li>Total Packets: <span id="packetsSent">--</span></li>
            <li>Packets Lost: <span id="packetsLost">--</span></li>
            <li>Loss Percentage: <span id="lossPercentage">--</span></li>
            <li>Average Latency: <span id="avgLatency">--</span> ms</li>
            <li>Jitter: <span id="jitter">--</span> ms</li>
          </ul>
        </div>
        <div class="visualization" id="packetVisual">
          <!-- Packet visualization appears here -->
        </div>
      </div>

      <div class="diagnosis" id="diagnosis">
        <!-- Diagnosis appears here -->
      </div>
    </div>
  </div>
`;

class PacketLossAnalyzerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(packetLossTemplate.content.cloneNode(true));

    // Get references to elements
    this.packetCountSelect = this.shadowRoot.getElementById('packetCount');
    this.networkLoadSelect = this.shadowRoot.getElementById('networkLoad');
    this.runTestBtn = this.shadowRoot.getElementById('runTestBtn');
    this.packetsSentSpan = this.shadowRoot.getElementById('packetsSent');
    this.packetsLostSpan = this.shadowRoot.getElementById('packetsLost');
    this.lossPercentageSpan = this.shadowRoot.getElementById('lossPercentage');
    this.avgLatencySpan = this.shadowRoot.getElementById('avgLatency');
    this.jitterSpan = this.shadowRoot.getElementById('jitter');
    this.packetVisualDiv = this.shadowRoot.getElementById('packetVisual');
    this.diagnosisDiv = this.shadowRoot.getElementById('diagnosis');

    // Bind methods
    this.applyTheme = this.applyTheme.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
    this.isColorDark = this.isColorDark.bind(this);

    // Flag to track if we're in the middle of a theme transition
    this.isTransitioning = false;
  }

  connectedCallback() {
    // Initialize theme state tracking
    this.currentTheme = null;
    this.themeUpdatePending = false;

    this.runTestBtn.addEventListener('click', () => this.simulatePacketLoss());
    // Run initial simulation on load
    this.simulatePacketLoss();

    // Check initial theme and apply it
    this.applyTheme();

    // Set up observer for theme changes
    this.setupThemeObserver();

    // Set up interval to check theme periodically with longer interval
    // This is a fallback for cases where the observer might miss changes
    this.themeInterval = setInterval(() => {
      this.applyTheme();
    }, 2000); // Increased to 2 seconds to reduce frequency

    console.log('[PacketLossAnalyzer] Component initialized');
  }

  disconnectedCallback() {
    // Clean up observer and interval
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.themeInterval) {
      clearInterval(this.themeInterval);
    }

    // Remove message event listener
    window.removeEventListener('message', this.messageHandler);

    console.log('[PacketLossAnalyzer] Component disconnected and cleaned up');
  }

  simulatePacketLoss() {
    const packetCount = parseInt(this.packetCountSelect.value);
    const networkLoad = this.networkLoadSelect.value;

    // Define loss ranges and latency based on network load
    const loadSettings = {
      low:    { lossMin: 0, lossMax: 1, latMin: 10, latMax: 50, jitterMax: 10 },
      medium: { lossMin: 1, lossMax: 3, latMin: 30, latMax: 100, jitterMax: 30 },
      high:   { lossMin: 3, lossMax: 7, latMin: 50, latMax: 200, jitterMax: 50 },
      severe: { lossMin: 7, lossMax: 15, latMin: 100, latMax: 500, jitterMax: 100 }
    };

    const settings = loadSettings[networkLoad];
    // Calculate a random loss rate within the selected range
    const lossRate = (Math.random() * (settings.lossMax - settings.lossMin) + settings.lossMin) / 100;

    let lostPackets = 0;
    const latencies = [];
    const packetStatuses = [];

    for (let i = 0; i < packetCount; i++) {
      if (Math.random() < lossRate) {
        // Packet lost
        lostPackets++;
        packetStatuses.push({ status: 'lost' });
      } else {
        // Packet successful - simulate latency
        const latency = Math.floor(Math.random() * (settings.latMax - settings.latMin) + settings.latMin);
        latencies.push(latency);
        packetStatuses.push({ status: 'success', latency: latency });
      }
    }

    const lossPercentage = (lostPackets / packetCount * 100);
    const avgLatency = latencies.length ? Math.floor(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const jitter = latencies.length > 1 ? Math.floor(this.calculateJitter(latencies)) : 0;

    // Update UI Statistics
    this.packetsSentSpan.textContent = packetCount;
    this.packetsLostSpan.textContent = lostPackets;
    this.lossPercentageSpan.textContent = `${lossPercentage.toFixed(1)}%`;
    this.avgLatencySpan.textContent = avgLatency;
    this.jitterSpan.textContent = jitter;

    // Update Visualization
    this.updateVisualization(packetStatuses);

    // Update Diagnosis
    this.updateDiagnosis(lossPercentage, avgLatency, jitter);
  }

  calculateJitter(latencies) {
    if (latencies.length < 2) return 0;
    let totalVariation = 0;
    for (let i = 1; i < latencies.length; i++) {
      totalVariation += Math.abs(latencies[i] - latencies[i - 1]);
    }
    return totalVariation / (latencies.length - 1);
  }

  updateVisualization(packetStatuses) {
    this.packetVisualDiv.innerHTML = ''; // Clear previous visualization
    packetStatuses.forEach(packetInfo => {
      const packetElement = document.createElement('div');
      packetElement.className = `packet ${packetInfo.status}`;
      packetElement.title = packetInfo.status === 'success' ? `Latency: ${packetInfo.latency}ms` : 'Packet Lost';
      this.packetVisualDiv.appendChild(packetElement);
    });
  }

  updateDiagnosis(lossPercentage, avgLatency, jitter) {
    let diagnosisHTML = '<h4>Network Diagnosis:</h4>';
    let lossStatus = 'ok';
    let latencyStatus = 'ok';
    let jitterStatus = 'ok';

    // Packet Loss Diagnosis
    if (lossPercentage < 1) {
      diagnosisHTML += '<p class="status-ok">✅ Packet loss is negligible. Network appears stable.</p>';
    } else if (lossPercentage < 3) {
      diagnosisHTML += '<p class="status-warn">⚠️ Minor packet loss detected. Acceptable for most uses, but monitor if issues arise.</p>';
      lossStatus = 'warn';
    } else if (lossPercentage < 7) {
      diagnosisHTML += '<p class="status-error">🔴 Moderate packet loss. May impact real-time applications (VoIP, gaming). Investigation recommended.</p>';
      lossStatus = 'error';
    } else {
      diagnosisHTML += '<p class="status-error">⛔ Severe packet loss. Likely to cause significant disruptions. Immediate investigation required.</p>';
      lossStatus = 'error';
    }

    // Latency Diagnosis
    if (avgLatency < 50) {
       // diagnosisHTML += '<p class="status-ok">✅ Average latency is low. Good performance expected.</p>';
    } else if (avgLatency < 150) {
      diagnosisHTML += '<p class="status-warn">⚠️ Average latency is noticeable. May affect sensitive applications.</p>';
      latencyStatus = 'warn';
    } else {
      diagnosisHTML += '<p class="status-error">🔴 High average latency. Expect delays and potential issues with real-time communication.</p>';
      latencyStatus = 'error';
    }

     // Jitter Diagnosis
     if (jitter < 20) {
        // diagnosisHTML += '<p class="status-ok">✅ Jitter is low. Stable connection expected.</p>';
     } else if (jitter < 50) {
       diagnosisHTML += '<p class="status-warn">⚠️ Moderate jitter detected. May cause minor audio/video distortions.</p>';
       jitterStatus = 'warn';
     } else {
       diagnosisHTML += '<p class="status-error">🔴 High jitter detected. Likely to cause poor quality in real-time streams (VoIP, video calls).</p>';
       jitterStatus = 'error';
     }

    this.diagnosisDiv.innerHTML = diagnosisHTML;
  }

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
      console.error('[PacketLossAnalyzer] Error in isColorDark:', e);
      return false;
    }
  }

  setupThemeObserver() {
    // Create a MutationObserver to watch for class changes with debouncing
    this.observer = new MutationObserver((mutations) => {
      // Check if any mutations are relevant (not caused by our own theme updates)
      const relevantMutation = mutations.some(mutation => {
        return mutation.target !== this && !this.themeUpdatePending;
      });

      if (relevantMutation) {
        // Debounce theme updates to prevent rapid successive calls
        if (this.themeDebounceTimeout) {
          clearTimeout(this.themeDebounceTimeout);
        }
        this.themeDebounceTimeout = setTimeout(() => {
          this.applyTheme();
        }, 100); // 100ms debounce
      }
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
        console.log('[PacketLossAnalyzer] Received theme change message:', event.data.theme);
        this.updateTheme(event.data.theme === 'dark');
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  applyTheme() {
    // Prevent multiple simultaneous theme checks
    if (this.themeUpdatePending) {
      return;
    }

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
        console.error('[PacketLossAnalyzer] Error checking background color:', e);
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
        console.log('[PacketLossAnalyzer] Could not access parent frame due to same-origin policy');
      }
    }

    // Only update if theme has actually changed
    const themeChanged = this.currentTheme !== isDarkMode;
    if (themeChanged) {
      console.log('[PacketLossAnalyzer] Theme detection result:', isDarkMode ? 'dark' : 'light');
      this.currentTheme = isDarkMode;
      this.updateTheme(isDarkMode);
    }
  }

  // Method to directly update theme without polling
  updateTheme(isDarkMode) {
    console.log('[PacketLossAnalyzer] updateTheme called with isDarkMode:', isDarkMode);

    // Prevent multiple rapid transitions
    if (this.isTransitioning) {
      console.log('[PacketLossAnalyzer] Theme transition already in progress, skipping');
      return;
    }

    this.isTransitioning = true;
    this.themeUpdatePending = true;

    // Apply theme class
    if (isDarkMode) {
      this.classList.add('dark-mode');
      console.log('[PacketLossAnalyzer] Applied dark mode');
    } else {
      this.classList.remove('dark-mode');
      console.log('[PacketLossAnalyzer] Applied light mode');
    }

    // Reset transition flags after a short delay
    setTimeout(() => {
      this.isTransitioning = false;
      this.themeUpdatePending = false;
    }, 100);
  }
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('packet-loss-analyzer-simulator', PacketLossAnalyzerElement);
