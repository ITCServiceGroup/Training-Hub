const packetLossTemplate = document.createElement('template');
packetLossTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: sans-serif;
      --primary-color: #2196F3;
      --primary-dark: #1976D2;
      --success-color: #4CAF50;
      --warning-color: #ff9800;
      --error-color: #f44336;
      --bg-color: #f8f9fa;
      --text-color: #2c3e50;
      --border-color: #e0e0e0;
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
      --radius-sm: 4px;
      --radius-md: 8px;
    }

    .interactive-element {
      background-color: white;
      padding: 25px;
      margin: 0;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.3s ease;
      color: var(--text-color);
    }

    .interactive-element:hover {
      box-shadow: var(--shadow-md);
    }

    h3 {
      color: var(--primary-dark);
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
      background-color: white;
      color: var(--text-color);
      font-family: inherit; /* Use host font */
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 38px; /* Consistent height */
    }

    select:focus, button:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }

    .primary-button {
      background-color: var(--primary-color);
      color: white;
      border: none;
      align-self: flex-end; /* Align button itself */
      margin-left: auto; /* Push button to the right if space allows */
    }

    .primary-button:hover {
      background-color: var(--primary-dark);
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
      background-color: white;
      font-size: 0.95em;
      line-height: 1.5;
      border-left: 4px solid transparent; /* For status color */
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
  }

  connectedCallback() {
    this.runTestBtn.addEventListener('click', () => this.simulatePacketLoss());
    // Run initial simulation on load
    this.simulatePacketLoss();
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
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('packet-loss-analyzer-simulator', PacketLossAnalyzerElement);
