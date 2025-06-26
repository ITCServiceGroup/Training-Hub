const channelVisualizerTemplate = document.createElement('template');
channelVisualizerTemplate.innerHTML = `
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
      --shadow-sm-light: 0 2px 4px rgba(0,0,0,0.05);
      --shadow-md-light: 0 4px 6px rgba(0,0,0,0.1);
      --axis-border-light: #ddd;

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
      --shadow-sm-dark: 0 2px 4px rgba(0,0,0,0.2);
      --shadow-md-dark: 0 4px 8px rgba(0,0,0,0.3);
      --axis-border-dark: #475569;

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
      --shadow-sm: var(--shadow-sm-light);
      --shadow-md: var(--shadow-md-light);
      --axis-border: var(--axis-border-light);
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
      --shadow-sm: var(--shadow-sm-dark);
      --shadow-md: var(--shadow-md-dark);
      --axis-border: var(--axis-border-dark);
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

    .wifi-bands {
      margin: 15px 0 0 0; /* Adjusted margin */
      background-color: var(--element-bg);
      border-radius: var(--radius-md);
      padding: 0; /* Padding handled by inner elements */
      transition: background-color 0.3s ease;
    }

    .band-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .band-button {
      padding: 10px 20px;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      color: var(--text-color);
    }

    .band-button:hover {
      background-color: var(--custom-button-color, var(--primary-color));
      color: white;
      border-color: var(--custom-button-color, var(--primary-color));
      transform: translateY(-1px);
    }

    .band-button.active {
      background-color: var(--custom-button-color, var(--primary-color));
      color: white;
      border-color: var(--custom-button-color, var(--primary-color));
      box-shadow: var(--shadow-sm);
    }

    .bonding-controls {
      background-color: var(--bg-color);
      padding: 15px;
      border-radius: var(--radius-sm);
      margin-bottom: 15px;
      border: 1px solid var(--border-color);
    }

    .control-group {
      margin-bottom: 12px;
    }

    .control-group:last-child {
      margin-bottom: 0;
    }

    .control-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-color);
      font-size: 0.9em;
    }

    .width-selector, .mode-selector {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .width-button, .mode-button {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      background-color: var(--element-bg);
      color: var(--text-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.8em;
      font-weight: 500;
      min-width: 60px;
      text-align: center;
    }

    .width-button:hover, .mode-button:hover {
      background-color: var(--custom-button-color, var(--primary-color));
      color: white;
      border-color: var(--custom-button-color, var(--primary-color));
    }

    .width-button.active, .mode-button.active {
      background-color: var(--custom-button-color, var(--primary-color));
      color: white;
      border-color: var(--custom-button-color, var(--primary-color));
    }

    .width-button:disabled, .mode-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--bg-color);
    }

    .width-button:disabled:hover, .mode-button:disabled:hover {
      background-color: var(--bg-color);
      color: var(--text-color);
      border-color: var(--border-color);
    }

    .wifi-channels {
      position: relative;
      height: 280px;
      background-color: var(--bg-color);
      padding: 25px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .channel-container {
      display: flex;
      height: 220px;
      align-items: flex-end;
      gap: 3px;
      position: relative;
      padding: 0 10px;
    }

    .channel {
      flex: 1;
      background-color: var(--primary-color);
      opacity: 0.7;
      transition: all 0.3s ease;
      position: relative;
      cursor: pointer;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      min-width: 8px; /* Minimum width for visibility */
    }

    .channel:hover {
      opacity: 1;
      transform: translateY(-3px);
    }

    .channel-info {
      margin-top: 20px;
      padding: 15px;
      background-color: var(--bg-color);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      font-size: 0.95em;
      line-height: 1.6;
      min-height: 50px; /* Ensure space for text */
    }

    .channel::before {
      content: attr(data-freq);
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 9px; /* Smaller for 6GHz with many channels */
      white-space: pre-line;
      text-align: center;
      line-height: 1.2;
      color: var(--text-color);
      max-width: 40px;
      overflow: hidden;
    }

    .channel-label {
      position: absolute;
      bottom: 5px; /* Adjusted position */
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px; /* Smaller for better fit */
      color: white; /* Label inside channel */
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5); /* Better readability */
    }

    /* Bonded channel styling */
    .channel.bonded {
      border: 2px solid var(--warning-color);
      box-shadow: 0 0 8px rgba(255, 152, 0, 0.3);
      transition: all 0.4s ease;
      animation: bondedGlow 2s ease-in-out infinite alternate;
    }

    .channel.bonded.primary {
      border-color: var(--success-color);
      box-shadow: 0 0 12px rgba(76, 175, 80, 0.5);
      animation: primaryGlow 2s ease-in-out infinite alternate;
    }

    .channel.bonded.secondary {
      border-color: var(--primary-color);
      box-shadow: 0 0 8px rgba(33, 150, 243, 0.4);
      animation: secondaryGlow 2s ease-in-out infinite alternate;
    }

    @keyframes bondedGlow {
      0% { box-shadow: 0 0 8px rgba(255, 152, 0, 0.3); }
      100% { box-shadow: 0 0 12px rgba(255, 152, 0, 0.6); }
    }

    @keyframes primaryGlow {
      0% { box-shadow: 0 0 12px rgba(76, 175, 80, 0.5); }
      100% { box-shadow: 0 0 16px rgba(76, 175, 80, 0.8); }
    }

    @keyframes secondaryGlow {
      0% { box-shadow: 0 0 8px rgba(33, 150, 243, 0.4); }
      100% { box-shadow: 0 0 12px rgba(33, 150, 243, 0.7); }
    }

    .bonding-connector {
      position: absolute;
      height: 3px;
      background: linear-gradient(90deg, var(--success-color), var(--primary-color));
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      border-radius: 2px;
      opacity: 0.8;
      transition: all 0.3s ease;
      animation: connectorPulse 3s ease-in-out infinite;
    }

    @keyframes connectorPulse {
      0%, 100% { opacity: 0.8; transform: translateY(-50%) scaleY(1); }
      50% { opacity: 1; transform: translateY(-50%) scaleY(1.5); }
    }

    .bonding-group {
      position: absolute;
      border: 2px dashed var(--warning-color);
      border-radius: var(--radius-sm);
      background: rgba(255, 152, 0, 0.1);
      pointer-events: none;
      z-index: 5;
      transition: all 0.5s ease;
      animation: groupFadeIn 0.8s ease-out;
    }

    @keyframes groupFadeIn {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes groupFadeOut {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.8); }
    }

    .bonding-group.width-40 {
      border-color: var(--primary-color);
      background: rgba(33, 150, 243, 0.1);
      animation: groupFadeIn 0.8s ease-out, group40Pulse 4s ease-in-out infinite;
    }

    .bonding-group.width-80 {
      border-color: var(--success-color);
      background: rgba(76, 175, 80, 0.1);
      animation: groupFadeIn 0.8s ease-out, group80Pulse 4s ease-in-out infinite;
    }

    .bonding-group.width-160 {
      border-color: var(--warning-color);
      background: rgba(255, 152, 0, 0.1);
      animation: groupFadeIn 0.8s ease-out, group160Pulse 4s ease-in-out infinite;
    }

    .bonding-group.width-320 {
      border-color: var(--error-color);
      background: rgba(244, 67, 54, 0.1);
      animation: groupFadeIn 0.8s ease-out, group320Pulse 4s ease-in-out infinite;
    }

    @keyframes group40Pulse {
      0%, 100% { border-color: var(--primary-color); background: rgba(33, 150, 243, 0.1); }
      50% { border-color: var(--primary-dark); background: rgba(33, 150, 243, 0.2); }
    }

    @keyframes group80Pulse {
      0%, 100% { border-color: var(--success-color); background: rgba(76, 175, 80, 0.1); }
      50% { border-color: #388e3c; background: rgba(76, 175, 80, 0.2); }
    }

    @keyframes group160Pulse {
      0%, 100% { border-color: var(--warning-color); background: rgba(255, 152, 0, 0.1); }
      50% { border-color: #f57c00; background: rgba(255, 152, 0, 0.2); }
    }

    @keyframes group320Pulse {
      0%, 100% { border-color: var(--error-color); background: rgba(244, 67, 54, 0.1); }
      50% { border-color: #d32f2f; background: rgba(244, 67, 54, 0.2); }
    }

    .channel.selectable-for-bonding {
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .channel.selectable-for-bonding::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, var(--primary-color), var(--success-color));
      border-radius: var(--radius-sm);
      opacity: 0;
      z-index: -1;
      transition: opacity 0.3s ease;
    }

    .channel.selectable-for-bonding:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .channel.selectable-for-bonding:hover::before {
      opacity: 0.3;
      animation: selectableGlow 1s ease-in-out infinite alternate;
    }

    @keyframes selectableGlow {
      0% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }

    /* Educational channel styling for Basic mode */
    .channel.primary-wide-channel {
      position: relative;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .channel.secondary-wide-channel {
      position: relative;
      z-index: 5;
    }

    .channel.unavailable-channel {
      position: relative;
      cursor: not-allowed;
    }

    .width-label {
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .channels-label {
      font-weight: normal;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .secondary-label {
      font-style: italic;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .unavailable-label {
      font-weight: bold;
      text-shadow: none;
    }

    /* Educational panel styling */
    .educational-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background-color: var(--bg-color);
      border: 2px solid var(--primary-color);
      border-radius: var(--radius-md);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      overflow: hidden;
    }

    .panel-header {
      background-color: var(--primary-color);
      color: white;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-header h4 {
      margin: 0;
      font-size: 16px;
    }

    .close-panel {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-panel:hover {
      background-color: rgba(255,255,255,0.2);
      border-radius: 50%;
    }

    .panel-content {
      padding: 15px;
      max-height: 320px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.4;
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .legend-color {
      width: 20px;
      height: 15px;
      margin-right: 10px;
      border-radius: 3px;
      border: 1px solid #ccc;
    }

    .concept-explanation {
      background-color: var(--bg-secondary);
      padding: 10px;
      border-radius: var(--radius-sm);
      margin-bottom: 10px;
      border-left: 4px solid var(--primary-color);
    }

    .channel.selected-for-bonding {
      border: 3px solid var(--warning-color);
      box-shadow: 0 0 12px rgba(255, 152, 0, 0.6);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 12px rgba(255, 152, 0, 0.6); }
      50% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.8); }
      100% { box-shadow: 0 0 12px rgba(255, 152, 0, 0.6); }
    }

    .freq-axis {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 20px;
      border-bottom: 1px solid var(--axis-border);
      transition: border-color 0.3s ease;
    }
  </style>

  <div class="interactive-element">
    <h3>Channel Overlap & Bonding Visualization</h3>
    <div class="wifi-bands">
      <div class="band-selector">
        <button id="band-2.4" class="band-button active">2.4 GHz</button>
        <button id="band-5" class="band-button">5 GHz</button>
        <button id="band-6" class="band-button">6 GHz</button>
      </div>

      <div class="bonding-controls">
        <div class="control-group">
          <label>Channel Bonding:</label>
          <div class="width-selector">
            <button id="width-20" class="width-button active">20 MHz</button>
            <button id="width-40" class="width-button">40 MHz</button>
            <button id="width-80" class="width-button">80 MHz</button>
            <button id="width-160" class="width-button">160 MHz</button>
            <button id="width-320" class="width-button">320 MHz</button>
          </div>
        </div>


      </div>

      <div id="wifiChannels" class="wifi-channels">
        <div class="freq-axis"></div>
        <div class="channel-container">
          <!-- Channels will be added by JavaScript -->
        </div>
      </div>
      <div class="channel-info" id="channelInfo">
        Select a channel to see overlap and frequency information.
      </div>

      <div class="educational-panel" id="educational-panel" style="display: none;">
        <div class="panel-header">
          <h4>Channel Width Guide</h4>
          <button class="close-panel" id="close-panel">×</button>
        </div>
        <div class="panel-content" id="panel-content">
          <!-- Educational content will be populated here -->
        </div>
      </div>
    </div>
  </div>
`;

class ChannelOverlapVisualizerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(channelVisualizerTemplate.content.cloneNode(true));

    this.channelContainer = this.shadowRoot.querySelector('.channel-container');
    this.channelInfoElement = this.shadowRoot.getElementById('channelInfo');
    this.bandSelectorButtons = this.shadowRoot.querySelectorAll('.band-button');

    // Bonding control elements
    this.widthButtons = this.shadowRoot.querySelectorAll('.width-button');

    this.channelData = {
      '2.4': {
        channels: 11,
        baseFreq: 2412,
        spacing: 5,
        width: 20,
        nonOverlapping: [1, 6, 11],
        // Channel bonding support for 2.4GHz (802.11n) - REALITY: Very limited and problematic
        bonding: {
          supportedWidths: [20, 40],
          validCombinations: {
            40: [
              // In reality, only ONE non-overlapping 40MHz channel is possible in most regions
              // This uses channels 3-7 as it's the most centered option
              { primary: 3, secondary: 7, channels: [3, 4, 5, 6, 7] }
              // Note: Some regions might allow channel 11 as primary (channels 7-11)
              // but this would overlap with the 3-7 combination
            ]
          },
          recommendations: {
            40: [
              { primary: 3, secondary: 7, note: "Only viable 40MHz option - uses 66% of 2.4GHz spectrum" }
            ]
          },
          warnings: {
            40: [
              "40MHz in 2.4GHz is highly discouraged in dense environments",
              "Takes up 66% of available 2.4GHz spectrum",
              "Causes significant interference with neighboring networks",
              "Most manufacturers disable this by default",
              "Performance gains often negated by increased interference"
            ]
          }
        }
      },
      '5': {
        // US 5GHz channels - accurate regulatory implementation
        channels: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165],
        baseFreq: 5180, // Base for channel 36
        spacing: 20, // Typical spacing
        width: 20,
        dfsChannels: [52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144], // Accurate DFS channels (UNII-2 and UNII-2e)
        // Channel bonding support for 5GHz (802.11n/ac/ax)
        bonding: {
          supportedWidths: [20, 40, 80, 160],
          validCombinations: {
            40: [
              { primary: 36, secondary: 40, channels: [36, 40] },
              { primary: 44, secondary: 48, channels: [44, 48] },
              { primary: 52, secondary: 56, channels: [52, 56] },
              { primary: 60, secondary: 64, channels: [60, 64] },
              { primary: 100, secondary: 104, channels: [100, 104] },
              { primary: 108, secondary: 112, channels: [108, 112] },
              { primary: 116, secondary: 120, channels: [116, 120] },
              { primary: 124, secondary: 128, channels: [124, 128] },
              { primary: 132, secondary: 136, channels: [132, 136] },
              { primary: 140, secondary: 144, channels: [140, 144] },
              { primary: 149, secondary: 153, channels: [149, 153] },
              { primary: 157, secondary: 161, channels: [157, 161] }
            ],
            80: [
              { primary: 36, secondary: [40, 44, 48], channels: [36, 40, 44, 48] },
              { primary: 52, secondary: [56, 60, 64], channels: [52, 56, 60, 64] },
              { primary: 100, secondary: [104, 108, 112], channels: [100, 104, 108, 112] },
              { primary: 116, secondary: [120, 124, 128], channels: [116, 120, 124, 128] },
              { primary: 132, secondary: [136, 140, 144], channels: [132, 136, 140, 144] },
              { primary: 149, secondary: [153, 157, 161], channels: [149, 153, 157, 161] }
            ],
            160: [
              { primary: 36, secondary: [40, 44, 48, 52, 56, 60, 64], channels: [36, 40, 44, 48, 52, 56, 60, 64] }
              // Note: Channel 100 removed - insufficient spectrum for 160MHz in UNII-2e
              // Channel 149 cannot support 160MHz - only 5 channels available (149-165)
              // Most routers only offer channel 36 for 160MHz, requiring DFS acceptance
            ]
          },
          recommendations: {
            40: [
              { primary: 36, note: "UNII-1 band, no DFS required" },
              { primary: 149, note: "UNII-3 band, no DFS required" }
            ],
            80: [
              { primary: 36, note: "UNII-1 band, no DFS required" },
              { primary: 52, note: "UNII-2 band, DFS required (radar detection)" },
              { primary: 100, note: "UNII-2e band, DFS required (radar detection)" },
              { primary: 116, note: "UNII-2e band, DFS required (radar detection)" },
              { primary: 149, note: "UNII-3 band, no DFS required" }
            ],
            160: [
              { primary: 36, note: "Only viable 160MHz option - spans UNII-1 and UNII-2, DFS required for channels 52-64. Channel 149 cannot support 160MHz due to insufficient spectrum." }
            ]
          }
        }
      },
      '6': {
        // 6 GHz channels (US implementation - representative subset for visualization)
        // Showing every 4th channel for better visualization (20 MHz spacing between displayed channels becomes 80 MHz)
        channels: [1, 9, 17, 25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 105, 113, 121, 129, 137, 145, 153, 161, 169, 177, 185, 193, 201, 209, 217, 225, 233],
        baseFreq: 5955, // Starting frequency for channel 1
        spacing: 20, // 20 MHz spacing between channels
        width: 20, // Standard 20 MHz width
        // U-NII-5 and U-NII-7 bands require AFC for standard power (outdoor use)
        standardPowerChannels: [1, 9, 17, 25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 153, 161, 169, 177, 185, 193, 201, 209, 217, 225, 233],
        // U-NII-6 and U-NII-8 bands (indoor only, no AFC required)
        lowPowerIndoorChannels: [105, 113, 121, 129, 137, 145],
        // All channels support very low power operation
        veryLowPowerChannels: [1, 9, 17, 25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 105, 113, 121, 129, 137, 145, 153, 161, 169, 177, 185, 193, 201, 209, 217, 225, 233],
        // Channel bonding support for 6GHz (802.11ax/be)
        bonding: {
          supportedWidths: [20, 40, 80, 160, 320],
          validCombinations: {
            40: [
              { primary: 1, secondary: 9, channels: [1, 9] },
              { primary: 17, secondary: 25, channels: [17, 25] },
              { primary: 33, secondary: 41, channels: [33, 41] },
              { primary: 49, secondary: 57, channels: [49, 57] },
              { primary: 65, secondary: 73, channels: [65, 73] },
              { primary: 81, secondary: 89, channels: [81, 89] },
              { primary: 97, secondary: 105, channels: [97, 105] },
              { primary: 113, secondary: 121, channels: [113, 121] },
              { primary: 129, secondary: 137, channels: [129, 137] },
              { primary: 145, secondary: 153, channels: [145, 153] },
              { primary: 161, secondary: 169, channels: [161, 169] },
              { primary: 177, secondary: 185, channels: [177, 185] },
              { primary: 193, secondary: 201, channels: [193, 201] },
              { primary: 209, secondary: 217, channels: [209, 217] },
              { primary: 225, secondary: 233, channels: [225, 233] }
            ],
            80: [
              { primary: 1, secondary: [9, 17, 25], channels: [1, 9, 17, 25] },
              { primary: 33, secondary: [41, 49, 57], channels: [33, 41, 49, 57] },
              { primary: 65, secondary: [73, 81, 89], channels: [65, 73, 81, 89] },
              { primary: 97, secondary: [105, 113, 121], channels: [97, 105, 113, 121] },
              { primary: 129, secondary: [137, 145, 153], channels: [129, 137, 145, 153] },
              { primary: 161, secondary: [169, 177, 185], channels: [161, 169, 177, 185] },
              { primary: 193, secondary: [201, 209, 217], channels: [193, 201, 209, 217] },
              // Note: Channel 225 cannot support 80MHz - only 2 channels available (225, 233)
            ],
            160: [
              { primary: 1, secondary: [9, 17, 25, 33, 41, 49, 57], channels: [1, 9, 17, 25, 33, 41, 49, 57] },
              { primary: 65, secondary: [73, 81, 89, 97, 105, 113, 121], channels: [65, 73, 81, 89, 97, 105, 113, 121] },
              { primary: 129, secondary: [137, 145, 153, 161, 169, 177, 185], channels: [129, 137, 145, 153, 161, 169, 177, 185] }
              // Note: Channel 193 removed - insufficient channels for 160MHz (only 6 channels: 193-233)
            ],
            320: [
              { primary: 1, secondary: [9, 17, 25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 105, 113, 121], channels: [1, 9, 17, 25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 105, 113, 121] },
              { primary: 129, secondary: [137, 145, 153, 161, 169, 177, 185, 193, 201, 209, 217, 225, 233], channels: [129, 137, 145, 153, 161, 169, 177, 185, 193, 201, 209, 217, 225, 233] }
            ]
          },
          recommendations: {
            40: [
              { primary: 1, note: "Low Power Indoor (LPI) channels" },
              { primary: 97, note: "Standard Power (SP) channels, AFC required" }
            ],
            80: [
              { primary: 1, note: "Low Power Indoor (LPI) channels" },
              { primary: 97, note: "Standard Power (SP) channels, AFC required" }
            ],
            160: [
              { primary: 1, note: "Low Power Indoor (LPI) channels" },
              { primary: 129, note: "Mixed LPI and SP channels" }
            ],
            320: [
              { primary: 1, note: "Low Power Indoor (LPI) channels, WiFi 7 feature" }
            ]
          }
        }
      }
    };
    this.currentBand = '2.4';
    this.defaultInfoText = 'Select a channel to see overlap and frequency information.';

    // Channel bonding state
    this.currentChannelWidth = 20; // Default to 20MHz
    this.activeBondedGroups = []; // Array of currently bonded channel groups

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

    this.bandSelectorButtons.forEach(button => {
      button.addEventListener('click', (e) => this.switchBand(e.target.id.split('-')[1]));
    });

    // Set up bonding control event listeners
    this.widthButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (!e.target.disabled) {
          this.switchChannelWidth(parseInt(e.target.id.split('-')[1]));
        }
      });
    });



    this.updateChannelDisplay();
    this.updateBondingControls();

    // Set initial active states
    this.shadowRoot.getElementById('width-20').classList.add('active');

    // Check initial theme and apply it
    this.applyTheme();

    // Set up observer for theme changes
    this.setupThemeObserver();

    // Set up resize observer for responsive positioning
    this.setupResizeObserver();

    // Set up educational panel
    this.setupEducationalPanel();

    // Set up interval to check theme periodically with longer interval
    // This is a fallback for cases where the observer might miss changes
    this.themeInterval = setInterval(() => {
      this.applyTheme();
    }, 2000); // Increased to 2 seconds to reduce frequency

    console.log('[ChannelVisualizer] Component initialized');
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

    console.log('[ChannelVisualizer] Component disconnected and cleaned up');
  }

  switchBand(band) {
    if (band === this.currentBand) return;

    this.bandSelectorButtons.forEach(btn => {
      btn.classList.toggle('active', btn.id.includes(band));
    });
    this.currentBand = band;
    this.updateChannelDisplay();
    this.updateBondingControls();
    this.channelInfoElement.innerHTML = this.getDefaultInfoText(); // Show educational info on band switch
  }

  switchChannelWidth(width) {
    if (width === this.currentChannelWidth) return;

    // Check if the width is supported for the current band
    const bandData = this.channelData[this.currentBand];
    if (!bandData.bonding.supportedWidths.includes(width)) {
      return;
    }

    this.currentChannelWidth = width;
    this.widthButtons.forEach(btn => {
      btn.classList.toggle('active', btn.id.includes(width.toString()));
    });

    // Don't reset bonding mode - just update the display
    this.updateChannelDisplay();
    this.channelInfoElement.innerHTML = this.getDefaultInfoText();


  }



  updateBondingControls() {
    const bandData = this.channelData[this.currentBand];
    const supportedWidths = bandData.bonding.supportedWidths;

    // Update width button availability
    this.widthButtons.forEach(btn => {
      const width = parseInt(btn.id.split('-')[1]);
      const isSupported = supportedWidths.includes(width);

      btn.disabled = !isSupported;
      btn.style.display = 'inline-block'; // Always show all width buttons

      // Set active state for current width
      if (width === this.currentChannelWidth) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      // If current width is not supported, switch to 20MHz
      if (!isSupported && width === this.currentChannelWidth) {
        this.currentChannelWidth = 20;
        this.widthButtons.forEach(w => w.classList.remove('active'));
        this.shadowRoot.getElementById('width-20').classList.add('active');
      }
    });


  }

  getDefaultInfoText() {
    return this.getBasicModeInfoText(); // Always show basic mode info
  }

  getBasicModeInfoText() {
    const bandData = this.channelData[this.currentBand];

    if (this.currentChannelWidth === 20) {
      if (this.currentBand === '2.4') {
        return `<strong>📡 WiFi Channel Overlap Visualization</strong><br><br>
          <span style="color: var(--success-color);">🟢 Green channels (1, 6, 11)</span> are non-overlapping and won't interfere with each other.<br>
          <span style="color: var(--primary-color);">🔵 Blue channels</span> overlap and cause interference.<br><br>
          <strong>💡 Learning Goal:</strong> Understand why only 3 channels can be used simultaneously in 2.4GHz.<br><br>
          👆 <em>Click any channel to see detailed overlap information.</em>`;
      } else {
        return `<strong>📡 ${this.currentBand}GHz Channel Layout</strong><br><br>
          Each channel is 20MHz wide with no overlap between adjacent channels.<br><br>
          <strong>💡 Learning Goal:</strong> See how ${this.currentBand}GHz provides more non-interfering channels than 2.4GHz.<br><br>
          👆 <em>Click any channel to see frequency and regulatory details.</em>`;
      }
    } else {
      // For wider channels, provide educational context
      const validCombinations = bandData.bonding.validCombinations[this.currentChannelWidth];
      const numCombinations = validCombinations ? validCombinations.length : 0;

      if (numCombinations === 0) {
        return `<strong>❌ ${this.currentChannelWidth}MHz Not Available</strong><br><br>
          ${this.currentChannelWidth}MHz channels are not supported in the ${this.currentBand}GHz band.<br><br>
          <strong>💡 Why?</strong> The ${this.currentBand}GHz band doesn't have enough contiguous spectrum space for ${this.currentChannelWidth}MHz channels.<br><br>
          🔄 <em>Try a different band or smaller channel width.</em>`;
      } else {
        const channelsPerGroup = this.currentChannelWidth / 20;
        let message = `<strong>📊 ${this.currentChannelWidth}MHz Channel Bonding</strong><br><br>`;

        if (this.currentBand === '2.4' && this.currentChannelWidth === 40) {
          message += `<span style="color: var(--warning-color);">⚠️ <strong>WARNING:</strong> 40MHz in 2.4GHz is problematic!</span><br><br>
            • Only ${numCombinations} viable 40MHz channel (uses channels 3-7)<br>
            • Consumes <strong>48% of entire 2.4GHz spectrum</strong> (40MHz of 83.5MHz total)<br>
            • Causes massive interference in dense environments<br>
            • Most manufacturers disable this by default<br><br>
            <strong>💡 Reality Check:</strong> Performance gains often negated by interference.<br>
            <strong>🎯 Recommendation:</strong> Stick to 20MHz for 2.4GHz networks.<br><br>`;
        } else if (this.currentChannelWidth === 160 && this.currentBand === '5') {
          message += `160MHz in 5GHz has limited options due to regulatory restrictions.<br>
            <strong>Only viable option:</strong> Channel 36 (spans channels 36-64).<br><br>
            <strong>💡 Reality:</strong> Most routers only offer channel 36 for 160MHz.<br>
            <strong>🎯 Note:</strong> Requires DFS support and may switch channels automatically.<br>
            <strong>⚠️ Important:</strong> Channel 149 cannot support 160MHz - insufficient spectrum (only 5 channels: 149-165).<br><br>`;
        } else if (this.currentBand === '5' && (this.currentChannelWidth === 40 || this.currentChannelWidth === 80)) {
          // Check if any channels in current combinations require DFS
          const bandData = this.channelData[this.currentBand];
          const combinations = bandData.bonding.validCombinations[this.currentChannelWidth];
          const hasDfsChannels = combinations.some(combo =>
            combo.channels.some(ch => bandData.dfsChannels.includes(ch))
          );

          if (hasDfsChannels) {
            message += `Each ${this.currentChannelWidth}MHz channel combines ${channelsPerGroup} adjacent 20MHz channels.<br>
              Only ${numCombinations} non-overlapping ${this.currentChannelWidth}MHz option${numCombinations > 1 ? 's' : ''} available.<br><br>
              <strong>💡 Trade-off:</strong> ${channelsPerGroup}x faster speeds, but fewer channel options.<br>
              <strong>⚠️ DFS Note:</strong> Some channels require radar detection and may switch automatically.<br><br>`;
          } else {
            message += `Each ${this.currentChannelWidth}MHz channel combines ${channelsPerGroup} adjacent 20MHz channels.<br>
              Only ${numCombinations} non-overlapping ${this.currentChannelWidth}MHz option${numCombinations > 1 ? 's' : ''} available.<br><br>
              <strong>💡 Trade-off:</strong> ${channelsPerGroup}x faster speeds, but fewer channel options.<br><br>`;
          }
        } else if (this.currentChannelWidth === 320 && this.currentBand === '6') {
          message += `320MHz in 6GHz combines multiple 20MHz channels (WiFi 7 feature).<br>
            First group: 16 channels (1-121), Second group: 14 channels (129-233).<br><br>
            <strong>💡 Note:</strong> Second group has fewer channels due to 7125 MHz regulatory limit.<br>
            <strong>🎯 Reality:</strong> Requires WiFi 7 devices and optimal conditions.<br><br>`;
        } else {
          message += `Each ${this.currentChannelWidth}MHz channel combines ${channelsPerGroup} adjacent 20MHz channels.<br>
            Only ${numCombinations} non-overlapping ${this.currentChannelWidth}MHz option${numCombinations > 1 ? 's' : ''} available.<br><br>
            <strong>💡 Trade-off:</strong> ${channelsPerGroup}x faster speeds, but fewer channel options.<br><br>`;
        }

        message += `👆 <em>Click channels to see bonding details.</em>`;
        return message;
      }
    }
  }

  applyBondingVisualization() {
    // Add fade-out animation to existing elements before clearing
    const existingElements = this.channelContainer.querySelectorAll('.bonding-group, .bonding-connector');
    if (existingElements.length > 0) {
      existingElements.forEach(el => {
        el.style.animation = 'groupFadeOut 0.3s ease-in forwards';
      });

      // Wait for fade-out to complete before clearing
      setTimeout(() => {
        this.channelContainer.querySelectorAll('.bonding-group, .bonding-connector').forEach(el => el.remove());
        // Reset channel styling when clearing bonding
        this.channelContainer.querySelectorAll('.channel').forEach(el => {
          el.classList.remove('bonded', 'primary', 'secondary');
          el.style.backgroundColor = '';
          el.style.color = '';
          el.style.height = '';
        });
        this.applyNewBondingVisualization();
      }, 300);
    } else {
      this.applyNewBondingVisualization();
    }
  }

  applyNewBondingVisualization() {
    if (this.currentChannelWidth === 20) {
      return; // No bonding visualization needed for 20MHz
    }

    const bandData = this.channelData[this.currentBand];
    const validCombinations = bandData.bonding.validCombinations[this.currentChannelWidth];

    if (!validCombinations || validCombinations.length === 0) {
      return;
    }

    // Always use visualize mode
    this.visualizeAllBondingCombinations(validCombinations);
  }

  visualizeAllBondingCombinations(validCombinations) {
    console.log(`*** VISUALIZING ALL BONDING COMBINATIONS ***`, {
      totalCombinations: validCombinations.length,
      combinations: validCombinations.map(c => c.channels)
    });

    // Show all possible bonding combinations for the current width
    validCombinations.forEach((combination, index) => {
      console.log(`Creating bonding group ${index + 1} of ${validCombinations.length}:`, combination.channels);
      this.createBondingGroup(combination, validCombinations.length);

      // Check how many groups exist after each creation
      const groupsAfterCreation = this.channelContainer.querySelectorAll('.bonding-group');
      console.log(`Groups in container after creating group ${index + 1}:`, groupsAfterCreation.length);
    });

    // Style unavailable channels as grey
    this.styleUnavailableChannels(validCombinations);
  }

  styleUnavailableChannels(validCombinations) {
    // Get all channels that are part of valid combinations
    const availableChannels = new Set();
    validCombinations.forEach(combination => {
      combination.channels.forEach(ch => availableChannels.add(ch));
    });

    // Style channels that are not part of any valid combination as grey
    const allChannelElements = this.channelContainer.querySelectorAll('.channel');
    allChannelElements.forEach(el => {
      const channelNum = parseInt(el.getAttribute('data-channel'));
      if (!availableChannels.has(channelNum) && !el.classList.contains('bonded')) {
        // Style as unavailable (grey)
        el.style.backgroundColor = '#cccccc';
        el.style.color = '#666666';
        el.style.height = '80px'; // Shorter height for unavailable
      }
    });
  }

  createBondingGroup(combination, totalGroups = 1) {
    const channels = combination.channels;
    const channelElements = channels.map(ch =>
      this.channelContainer.querySelector(`[data-channel="${ch}"]`)
    ).filter(el => el !== null);

    console.log(`Creating bonding group for ${this.currentChannelWidth}MHz:`, {
      channels: channels,
      foundElements: channelElements.length,
      totalGroups: totalGroups
    });

    if (channelElements.length < 2) {
      return;
    }

    // Sort elements by their actual position in the DOM
    channelElements.sort((a, b) => {
      const aPos = a.offsetLeft;
      const bPos = b.offsetLeft;
      return aPos - bPos;
    });

    // Check if channels are contiguous or if there are gaps
    const channelNumbers = channelElements.map(el => parseInt(el.dataset.channel)).sort((a, b) => a - b);
    const hasGaps = this.hasChannelGaps(channelNumbers);

    console.log(`Gap analysis for channels ${channels.join('-')}:`, {
      channelNumbers: channelNumbers,
      hasGaps: hasGaps
    });

    if (hasGaps) {
      // For non-contiguous channels (like 160MHz), create separate groups for each contiguous segment
      this.createSegmentedBondingGroups(channelElements, totalGroups);
      return;
    }

    const firstElement = channelElements[0];
    const lastElement = channelElements[channelElements.length - 1];

    // Create bonding group background
    const bondingGroup = document.createElement('div');
    bondingGroup.className = `bonding-group width-${this.currentChannelWidth}`;

    // SPECIAL HANDLING FOR 5GHz AND 6GHz 160MHz: Adjust width and positioning to prevent overlap
    let extraWidth = 0;
    let widthAdjustment = 0;

    // Use offset-based positioning for reliable results
    const padding = totalGroups === 1 ? 5 : 1;
    const rightEdge = lastElement.offsetLeft + lastElement.offsetWidth;

    if (this.currentChannelWidth === 160) {
      if (this.currentBand === '5') {
        // For the first group (36-64), make it wider but stop before the gap
        if (channels.includes(36)) {
          extraWidth = 13; // Extend right edge but not too far
        }
        // For the second group (100-116), make it wider and move it further right
        else if (channels.includes(100)) {
          extraWidth = 3; // Extend right edge slightly
          widthAdjustment = 15; // Move the left edge further right to avoid overlap
        }
      } else if (this.currentBand === '6') {
        // 6GHz 160MHz groups - apply similar adjustments for proper alignment
        if (channels.includes(1)) {
          extraWidth = 4; // First group: extend right edge
        } else if (channels.includes(65)) {
          extraWidth = 5; // Second group: moderate extension
          widthAdjustment = 5; // Slight left adjustment
        } else if (channels.includes(129)) {
          extraWidth = 4; // Third group: minimal extension
          widthAdjustment = 11; // More left adjustment
        }
      }
    }

    const left = firstElement.offsetLeft - padding + widthAdjustment;
    const width = rightEdge - firstElement.offsetLeft + (padding * 2) + extraWidth;
    const top = -2; // Start higher to intersect with MHz labels
    const height = 225; // Taller to cover channels and intersect labels

    console.log("*** CORRECTED WIDTH CALCULATION ***", {
      firstLeft: firstElement.offsetLeft,
      lastRight: rightEdge,
      leftWithPadding: left,
      rightWithPadding: rightEdge + padding,
      totalSpan: rightEdge - firstElement.offsetLeft,
      widthWithPadding: width,
      shouldBe: (rightEdge + padding) - left
    });

    console.log(`Original bonding group positioning for channels ${channels.join('-')}:`, {
      firstElement: {
        channel: firstElement.dataset.channel,
        offsetLeft: firstElement.offsetLeft,
        offsetWidth: firstElement.offsetWidth
      },
      lastElement: {
        channel: lastElement.dataset.channel,
        offsetLeft: lastElement.offsetLeft,
        offsetWidth: lastElement.offsetWidth
      },
      calculation: {
        left: left,
        width: width,
        padding: padding,
        rightEdge: rightEdge,
        expectedWidth: rightEdge - firstElement.offsetLeft + (padding * 2)
      }
    });

    // Force styles with !important to override any conflicting CSS
    bondingGroup.style.setProperty('left', `${left}px`, 'important');
    bondingGroup.style.setProperty('top', `${top}px`, 'important');
    bondingGroup.style.setProperty('width', `${width}px`, 'important');
    bondingGroup.style.setProperty('height', `${height}px`, 'important');
    bondingGroup.style.setProperty('position', 'absolute', 'important');

    // Get computed styles after element is added to DOM
    const computedStyles = window.getComputedStyle(bondingGroup);
    console.log(`*** SHADOW DOM BONDING GROUP STYLES ***`, {
      channels: channels.join('-'),
      setLeft: bondingGroup.style.left,
      setWidth: bondingGroup.style.width,
      computedLeft: computedStyles.left,
      computedWidth: computedStyles.width,
      computedPosition: computedStyles.position,
      actualBoundingRect: bondingGroup.getBoundingClientRect()
    });

    // Add channel width label on top of the bonding group
    const widthLabel = document.createElement('div');
    widthLabel.className = 'bonding-width-label';
    widthLabel.textContent = `${this.currentChannelWidth}MHz`;
    widthLabel.style.position = 'absolute';
    widthLabel.style.top = '-25px';
    widthLabel.style.left = '50%';
    widthLabel.style.transform = 'translateX(-50%)';
    widthLabel.style.backgroundColor = '#007bff';
    widthLabel.style.color = 'white';
    widthLabel.style.padding = '4px 12px';
    widthLabel.style.borderRadius = '4px';
    widthLabel.style.fontSize = '12px';
    widthLabel.style.fontWeight = 'bold';
    widthLabel.style.whiteSpace = 'nowrap';
    widthLabel.style.zIndex = '10';

    bondingGroup.appendChild(widthLabel);
    this.channelContainer.appendChild(bondingGroup);

    // Check what bonding groups exist after adding this one
    const allBondingGroups = this.channelContainer.querySelectorAll('.bonding-group');
    console.log(`*** BONDING GROUPS IN CONTAINER ***`, {
      totalGroups: allBondingGroups.length,
      groupDetails: Array.from(allBondingGroups).map(group => ({
        className: group.className,
        left: group.style.left,
        width: group.style.width,
        computedLeft: window.getComputedStyle(group).left,
        computedWidth: window.getComputedStyle(group).width
      }))
    });

    // Mark channels as bonded and style them
    channelElements.forEach((el, index) => {
      el.classList.add('bonded');
      if (index === 0) {
        el.classList.add('primary');
        // Style primary channel as green with full height
        el.style.backgroundColor = '#28a745'; // Green for primary
        el.style.color = 'white';
        el.style.height = '180px'; // Full height for primary
      } else {
        el.classList.add('secondary');
        // Style secondary channels as blue with reduced height
        el.style.backgroundColor = '#007bff'; // Blue for secondary
        el.style.color = 'white';
        el.style.height = '120px'; // Reduced height for secondary
      }
    });

    // Create connectors between channels
    for (let i = 0; i < channelElements.length - 1; i++) {
      this.createBondingConnector(channelElements[i], channelElements[i + 1]);
    }
  }

  createBondingConnector(fromElement, toElement) {
    const connector = document.createElement('div');
    connector.className = 'bonding-connector';

    // Use actual element positions for accurate alignment
    const containerRect = this.channelContainer.getBoundingClientRect();
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    // Calculate position relative to container
    const left = fromRect.right - containerRect.left;
    const width = toRect.left - fromRect.right;
    const top = (fromRect.top - containerRect.top) + (fromRect.height / 2) - 1.5; // Center vertically

    connector.style.left = `${left}px`;
    connector.style.top = `${top}px`;
    connector.style.width = `${width}px`;

    this.channelContainer.appendChild(connector);
  }

  // Method to recalculate positions when layout changes
  recalculateBondingPositions() {
    const bondingGroups = this.channelContainer.querySelectorAll('.bonding-group');
    const connectors = this.channelContainer.querySelectorAll('.bonding-connector');

    // Remove existing visualizations
    bondingGroups.forEach(group => group.remove());
    connectors.forEach(connector => connector.remove());

    // Recreate them with updated positions
    if (this.activeBondedGroups && this.activeBondedGroups.length > 0) {
      this.activeBondedGroups.forEach(group => this.createBondingGroup(group));
    } else if (this.bondingMode === 'visualize') {
      // Reapply visualization mode
      this.applyBondingVisualization();
    }
  }

  hasChannelGaps(channelNumbers) {
    // Check if there are gaps in the channel sequence
    for (let i = 1; i < channelNumbers.length; i++) {
      const gap = channelNumbers[i] - channelNumbers[i - 1];
      // In 5GHz, normal spacing is 4 channels (20MHz apart)
      // A gap larger than 8 indicates non-contiguous segments
      if (gap > 8) {
        return true;
      }
    }
    return false;
  }

  createSegmentedBondingGroups(channelElements, totalGroups) {
    // Group contiguous channels into segments
    const channelsByPosition = channelElements.map(el => ({
      element: el,
      channel: parseInt(el.dataset.channel),
      position: el.offsetLeft
    })).sort((a, b) => a.channel - b.channel);

    const segments = [];
    let currentSegment = [channelsByPosition[0]];

    for (let i = 1; i < channelsByPosition.length; i++) {
      const gap = channelsByPosition[i].channel - channelsByPosition[i - 1].channel;
      if (gap > 8) {
        // Start new segment
        segments.push(currentSegment);
        currentSegment = [channelsByPosition[i]];
      } else {
        // Continue current segment
        currentSegment.push(channelsByPosition[i]);
      }
    }
    segments.push(currentSegment);

    // For 160MHz, add a small delay to ensure elements are fully rendered
    if (this.currentChannelWidth === 160) {
      setTimeout(() => {
        segments.forEach(segment => {
          if (segment.length >= 2) {
            this.createContiguousBondingGroup(segment.map(s => s.element), totalGroups);
          }
        });
      }, 10);
    } else {
      // Create bonding group for each segment immediately for other widths
      segments.forEach(segment => {
        if (segment.length >= 2) {
          this.createContiguousBondingGroup(segment.map(s => s.element), totalGroups);
        }
      });
    }
  }

  createContiguousBondingGroup(channelElements, totalGroups) {
    // Sort elements by their actual position in the DOM
    channelElements.sort((a, b) => {
      const aPos = a.offsetLeft;
      const bPos = b.offsetLeft;
      return aPos - bPos;
    });

    const firstElement = channelElements[0];
    const lastElement = channelElements[channelElements.length - 1];

    // Debug logging for 160MHz issue
    if (this.currentChannelWidth === 160) {
      console.log('160MHz Debug:', {
        channels: channelElements.map(el => el.dataset.channel),
        firstChannel: firstElement.dataset.channel,
        lastChannel: lastElement.dataset.channel,
        firstRect: firstElement.getBoundingClientRect(),
        lastRect: lastElement.getBoundingClientRect()
      });
    }

    // Create bonding group background
    const bondingGroup = document.createElement('div');
    bondingGroup.className = `bonding-group width-${this.currentChannelWidth}`;

    // Simple, direct positioning calculation
    const padding = totalGroups === 1 ? 5 : 1;

    // Get the leftmost position of the first element
    const left = firstElement.offsetLeft - padding;

    // SPECIAL HANDLING FOR 5GHz AND 6GHz 160MHz: Make boxes wider to align properly
    const rightEdge = lastElement.offsetLeft + lastElement.offsetWidth;

    // Debug the band and width values
    console.log('DEBUG BAND/WIDTH CHECK:', {
      currentBand: this.currentBand,
      currentChannelWidth: this.currentChannelWidth,
      bandType: typeof this.currentBand,
      widthType: typeof this.currentChannelWidth,
      bandEquals5GHz: this.currentBand === '5',
      bandEquals6GHz: this.currentBand === '6',
      widthEquals160: this.currentChannelWidth === 160,
      bothMatch5GHz: (this.currentBand === '5' && this.currentChannelWidth === 160),
      bothMatch6GHz: (this.currentBand === '6' && this.currentChannelWidth === 160)
    });

    const extraWidth = ((this.currentBand === '5' || this.currentBand === '6') && this.currentChannelWidth === 160) ? 20 : 0;
    const width = rightEdge - firstElement.offsetLeft + (padding * 2) + extraWidth;

    const top = -10;
    const height = 240;

    console.log(`Bonding group for channels ${channelElements.map(el => el.dataset.channel).join('-')}:`, {
      firstChannel: firstElement.dataset.channel,
      lastChannel: lastElement.dataset.channel,
      firstLeft: firstElement.offsetLeft,
      firstWidth: firstElement.offsetWidth,
      lastLeft: lastElement.offsetLeft,
      lastWidth: lastElement.offsetWidth,
      rightEdge: rightEdge,
      calculatedLeft: left,
      calculatedWidth: width
    });

    // Force styles with !important to override any conflicting CSS
    bondingGroup.style.setProperty('left', `${left}px`, 'important');
    bondingGroup.style.setProperty('top', `${top}px`, 'important');
    bondingGroup.style.setProperty('width', `${width}px`, 'important');
    bondingGroup.style.setProperty('height', `${height}px`, 'important');
    bondingGroup.style.setProperty('position', 'absolute', 'important');

    // Add channel width label on top of the bonding group
    const widthLabel = document.createElement('div');
    widthLabel.className = 'bonding-width-label';
    widthLabel.textContent = `${this.currentChannelWidth}MHz`;
    widthLabel.style.position = 'absolute';
    widthLabel.style.top = '-25px';
    widthLabel.style.left = '50%';
    widthLabel.style.transform = 'translateX(-50%)';
    widthLabel.style.background = 'var(--primary-color)';
    widthLabel.style.color = 'white';
    widthLabel.style.padding = '2px 8px';
    widthLabel.style.borderRadius = '4px';
    widthLabel.style.fontSize = '12px';
    widthLabel.style.fontWeight = 'bold';
    widthLabel.style.whiteSpace = 'nowrap';
    widthLabel.style.zIndex = '1000';

    bondingGroup.appendChild(widthLabel);
    this.channelContainer.appendChild(bondingGroup);

    // Mark channels as bonded and style them
    channelElements.forEach((el, index) => {
      el.classList.add('bonded');
      if (index === 0) {
        el.classList.add('primary');
        // Style primary channel as green with full height
        el.style.height = '180px';
        el.style.backgroundColor = '#4CAF50';
      } else {
        el.classList.add('secondary');
        // Style secondary channels with reduced height
        el.style.height = '120px';
        el.style.backgroundColor = this.getWidthColor(this.currentChannelWidth);
      }
    });

    // Create connectors between channels
    for (let i = 0; i < channelElements.length - 1; i++) {
      this.createBondingConnector(channelElements[i], channelElements[i + 1]);
    }
  }

  getMaxSupportedWidth() {
    const data = this.channelData[this.currentBand];
    return Math.max(...data.bonding.supportedWidths);
  }

  getInterferenceInfo(channels) {
    let interferenceInfo = '';

    if (this.currentBand === '2.4') {
      // Calculate total interference range for 2.4GHz
      const minChannel = Math.min(...channels);
      const maxChannel = Math.max(...channels);
      const interferenceRange = [];

      for (let i = Math.max(1, minChannel - 4); i <= Math.min(11, maxChannel + 4); i++) {
        if (!channels.includes(i)) {
          interferenceRange.push(i);
        }
      }

      if (interferenceRange.length > 0) {
        interferenceInfo = `<br><span style="color: var(--warning-color);">Interference with channels: ${interferenceRange.join(', ')}</span>`;
      }
    } else {
      // For 5GHz and 6GHz, bonded channels don't typically interfere with non-adjacent channels
      const adjacentChannels = this.getAdjacentChannels(channels);
      if (adjacentChannels.length > 0) {
        interferenceInfo = `<br><span style="color: var(--warning-color);">May interfere with adjacent channels: ${adjacentChannels.join(', ')}</span>`;
      }
    }

    return interferenceInfo;
  }

  getAdjacentChannels(channels) {
    const data = this.channelData[this.currentBand];
    const allChannels = Array.isArray(data.channels) ? data.channels : Array.from({length: data.channels}, (_, i) => i + 1);
    const adjacent = [];

    const minChannel = Math.min(...channels);
    const maxChannel = Math.max(...channels);
    const spacing = this.currentBand === '2.4' ? 1 : 4;

    // Check channels before and after the bonded group
    const beforeChannel = minChannel - spacing;
    const afterChannel = maxChannel + spacing;

    if (allChannels.includes(beforeChannel)) {
      adjacent.push(beforeChannel);
    }
    if (allChannels.includes(afterChannel)) {
      adjacent.push(afterChannel);
    }

    return adjacent;
  }

  updateChannelDisplay() {
    this.channelContainer.innerHTML = ''; // Clear existing channels
    const data = this.channelData[this.currentBand];

    if (this.currentBand === '2.4') {
      for (let i = 1; i <= data.channels; i++) {
        const freq = data.baseFreq + (i - 1) * data.spacing;
        const channelElement = this.createChannelElement(i, freq, data);
        this.channelContainer.appendChild(channelElement);
      }
    } else if (this.currentBand === '5') { // 5 GHz
      data.channels.forEach(chNum => {
        // Calculate frequency based on channel number relative to base channel 36
        let freq;
        if (chNum >= 36 && chNum <= 64) {
            freq = 5000 + chNum * 5; // Formula for UNII-1 and UNII-2
        } else if (chNum >= 100 && chNum <= 144) {
            freq = 5000 + chNum * 5; // Formula for UNII-2e
        } else if (chNum >= 149 && chNum <= 165) {
            freq = 5000 + chNum * 5; // Formula for UNII-3
        } else {
            freq = data.baseFreq + (chNum - 36) * data.spacing; // Fallback/approximation
        }

        const channelElement = this.createChannelElement(chNum, freq, data);
        this.channelContainer.appendChild(channelElement);
      });
    } else { // 6 GHz
      data.channels.forEach(chNum => {
        // 6GHz frequency calculation: 5950 + (channel_number * 5) MHz
        const freq = 5950 + (chNum * 5);
        const channelElement = this.createChannelElement(chNum, freq, data);
        this.channelContainer.appendChild(channelElement);
      });
    }

    // Apply bonding visualization after all channels are created
    this.applyBondingVisualization();

    this.channelInfoElement.innerHTML = this.getDefaultInfoText();
  }

  createChannelElement(channelNum, freq, bandData) {
    const channelElement = document.createElement('div');
    channelElement.className = 'channel';
    channelElement.setAttribute('data-channel', channelNum);
    channelElement.setAttribute('data-freq', `${freq} MHz`);

    // Always use standard channel styling (individual channels with bonding outlines)
    this.applyStandardChannelStyling(channelElement, channelNum, bandData);

    const label = document.createElement('div');
    label.className = 'channel-label';
    label.textContent = channelNum;
    channelElement.appendChild(label);

    // Add click handler for showing channel info
    channelElement.addEventListener('click', (e) => this.showChannelInfo(e.target.closest('.channel')));

    return channelElement;
  }

  applyStandardChannelStyling(channelElement, channelNum, bandData) {
    if (this.currentBand === '2.4') {
        channelElement.style.height = bandData.nonOverlapping.includes(channelNum) ? '180px' : '140px';
        channelElement.style.backgroundColor = bandData.nonOverlapping.includes(channelNum) ? 'var(--success-color)' : 'var(--primary-color)';
    } else if (this.currentBand === '5') { // 5 GHz
        channelElement.style.height = '160px';
        channelElement.style.backgroundColor = bandData.dfsChannels.includes(channelNum) ? 'var(--warning-color)' : 'var(--success-color)';
    } else { // 6 GHz
        channelElement.style.height = '170px';
        // Color coding for different power classes (prioritize most restrictive)
        if (bandData.lowPowerIndoorChannels.includes(channelNum)) {
            channelElement.style.backgroundColor = 'var(--success-color)'; // Green for LPI (indoor only)
        } else if (bandData.standardPowerChannels.includes(channelNum)) {
            channelElement.style.backgroundColor = 'var(--warning-color)'; // Orange for AFC required
        } else {
            channelElement.style.backgroundColor = 'var(--primary-color)'; // Blue for other channels
        }
    }
  }

  applyChannelWidthStyling(channelElement, channelNum, bandData) {
    if (this.currentChannelWidth === 20) {
      // For 20MHz, use standard styling (shows overlap concepts)
      this.applyStandardChannelStyling(channelElement, channelNum, bandData);
      return;
    }

    // For wider channels, create educational visualization
    const validCombinations = bandData.bonding.validCombinations[this.currentChannelWidth];
    if (!validCombinations) {
      // If no valid combinations exist, show why
      this.applyUnavailableChannelStyling(channelElement, channelNum, bandData);
      return;
    }

    const relevantCombination = validCombinations.find(combo => combo.channels.includes(channelNum));

    if (relevantCombination) {
      const isPrimary = relevantCombination.primary === channelNum;
      const isSecondary = relevantCombination.channels.includes(channelNum) && !isPrimary;

      if (isPrimary) {
        this.applyPrimaryChannelStyling(channelElement, channelNum, relevantCombination, bandData);
      } else if (isSecondary) {
        this.applySecondaryChannelStyling(channelElement, channelNum, relevantCombination, bandData);
      }
    } else {
      // Channel not part of any valid combination
      this.applyUnavailableChannelStyling(channelElement, channelNum, bandData);
    }
  }

  applyPrimaryChannelStyling(channelElement, channelNum, combination, bandData) {
    // Style as the main channel representing the wide channel
    channelElement.style.height = '180px';
    channelElement.style.backgroundColor = this.getWidthColor(this.currentChannelWidth);
    channelElement.style.border = '3px solid var(--primary-dark)';
    channelElement.style.position = 'relative';
    channelElement.classList.add('primary-wide-channel');

    // Add educational labels
    const widthLabel = document.createElement('div');
    widthLabel.className = 'width-label';
    widthLabel.textContent = `${this.currentChannelWidth}MHz`;
    widthLabel.style.fontSize = '12px';
    widthLabel.style.fontWeight = 'bold';
    widthLabel.style.color = 'white';
    widthLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
    widthLabel.style.marginTop = '5px';
    channelElement.appendChild(widthLabel);

    const channelsLabel = document.createElement('div');
    channelsLabel.className = 'channels-label';
    channelsLabel.textContent = `Ch ${combination.channels.join('+')}`;
    channelsLabel.style.fontSize = '10px';
    channelsLabel.style.color = 'white';
    channelsLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
    channelsLabel.style.marginTop = '2px';
    channelElement.appendChild(channelsLabel);
  }

  applySecondaryChannelStyling(channelElement, channelNum, combination, bandData) {
    // Style as part of the wide channel but secondary
    channelElement.style.height = '120px';
    channelElement.style.backgroundColor = this.getWidthColor(this.currentChannelWidth);
    channelElement.style.opacity = '0.6';
    channelElement.style.border = '2px dashed var(--primary-color)';
    channelElement.classList.add('secondary-wide-channel');

    const label = document.createElement('div');
    label.className = 'secondary-label';
    label.textContent = 'Part of';
    label.style.fontSize = '9px';
    label.style.color = 'white';
    label.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
    label.style.marginTop = '10px';
    channelElement.appendChild(label);

    const primaryLabel = document.createElement('div');
    primaryLabel.textContent = `Ch ${combination.primary}`;
    primaryLabel.style.fontSize = '10px';
    primaryLabel.style.color = 'white';
    primaryLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
    primaryLabel.style.fontWeight = 'bold';
    channelElement.appendChild(primaryLabel);
  }

  applyUnavailableChannelStyling(channelElement, channelNum, bandData) {
    // Style as unavailable for this channel width
    channelElement.style.height = '80px';
    channelElement.style.backgroundColor = '#cccccc';
    channelElement.style.opacity = '0.4';
    channelElement.style.border = '1px solid #999999';
    channelElement.classList.add('unavailable-channel');

    const label = document.createElement('div');
    label.className = 'unavailable-label';
    label.textContent = 'N/A';
    label.style.fontSize = '10px';
    label.style.color = '#666666';
    label.style.marginTop = '10px';
    channelElement.appendChild(label);
  }

  getWidthColor(width) {
    switch(width) {
      case 40: return 'var(--primary-color)';
      case 80: return 'var(--success-color)';
      case 160: return 'var(--warning-color)';
      case 320: return 'var(--error-color)';
      default: return 'var(--primary-color)';
    }
  }


  showChannelInfo(channelElement) {
    if (!channelElement) return; // Ensure we have the element

    const channel = parseInt(channelElement.getAttribute('data-channel'));
    const freq = channelElement.getAttribute('data-freq');
    const info = this.channelInfoElement;
    const data = this.channelData[this.currentBand];

    // Highlight selected channel
    this.shadowRoot.querySelectorAll('.channel').forEach(ch => ch.style.opacity = '0.7');
    channelElement.style.opacity = '1';

    // Show basic channel info with bonding context
    this.showBasicModeChannelInfo(channel, freq, data);
  }

  showBasicModeChannelInfo(channel, freq, data) {
    let content = `<strong>Channel ${channel}</strong><br>Frequency: ${freq}`;

    if (this.currentChannelWidth === 20) {
      // Educational content for 20MHz channels
      if (this.currentBand === '2.4') {
        const isNonOverlapping = data.nonOverlapping.includes(channel);
        if (isNonOverlapping) {
          content += `<br><br><span style="color: var(--success-color);">✅ Non-overlapping channel</span><br>
            This channel won't interfere with other non-overlapping channels (1, 6, 11).`;

          const overlappingChannels = this.getOverlappingChannels(channel, data);
          if (overlappingChannels.length > 0) {
            content += `<br><br><span style="color: var(--warning-color);">⚠️ Overlaps with:</span> ${overlappingChannels.join(', ')}`;
          }
        } else {
          content += `<br><br><span style="color: var(--primary-color);">⚠️ Overlapping channel</span><br>
            This channel will interfere with nearby channels. Use channels 1, 6, or 11 for best performance.`;
        }
      } else {
        // 5GHz or 6GHz
        if (this.currentBand === '5' && data.dfsChannels.includes(channel)) {
          content += `<br><br><span style="color: var(--warning-color);">⚠️ DFS Channel</span><br>
            Requires radar detection. May cause brief disconnections if radar is detected.`;
        } else if (this.currentBand === '6') {
          if (data.lowPowerIndoorChannels.includes(channel)) {
            content += `<br><br><span style="color: var(--success-color);">✅ Low Power Indoor (LPI)</span><br>
              Indoor use only, no coordination required.`;
          } else if (data.standardPowerChannels.includes(channel)) {
            content += `<br><br><span style="color: var(--warning-color);">⚠️ Standard Power</span><br>
              Requires AFC (Automated Frequency Coordination) system.`;
          }
        }
      }
    } else {
      // Educational content for wider channels
      const validCombinations = data.bonding.validCombinations[this.currentChannelWidth];
      const relevantCombination = validCombinations ? validCombinations.find(combo => combo.channels.includes(channel)) : null;

      if (relevantCombination) {
        const isPrimary = relevantCombination.primary === channel;
        content += `<br><br><strong>${this.currentChannelWidth}MHz Channel Group</strong><br>`;

        if (isPrimary) {
          content += `<span style="color: var(--success-color);">✅ Primary Channel</span><br>
            Controls this ${this.currentChannelWidth}MHz group (channels ${relevantCombination.channels.join(', ')})<br>
            <br><strong>Benefits:</strong> ${this.currentChannelWidth / 20}x faster than 20MHz<br>
            <strong>Trade-off:</strong> Uses more spectrum, fewer options available`;
        } else {
          content += `<span style="color: var(--primary-color);">📡 Secondary Channel</span><br>
            Part of ${this.currentChannelWidth}MHz group controlled by channel ${relevantCombination.primary}<br>
            <br>Cannot be used independently when bonding is active.`;
        }
      } else {
        content += `<br><br><span style="color: #666;">❌ Not available for ${this.currentChannelWidth}MHz</span><br>
          This channel cannot be used for ${this.currentChannelWidth}MHz operation in the ${this.currentBand}GHz band.`;
      }
    }

    this.channelInfoElement.innerHTML = content;
  }



  getOverlappingChannels(channel, data) {
    // For 2.4GHz, calculate which channels overlap
    if (this.currentBand === '2.4') {
      const overlapping = [];
      for (let i = 1; i <= data.channels; i++) {
        if (i !== channel && Math.abs(i - channel) < 5) {
          overlapping.push(i);
        }
      }
      return overlapping;
    }
    return []; // 5GHz and 6GHz channels don't overlap in the same way
  }



  getOverlappingChannels2_4(channel) {
    const channelNum = parseInt(channel);
    const overlapping = [];
    // Channels overlap if their center frequencies are within 20MHz (approx 4 channels apart)
    for (let i = Math.max(1, channelNum - 4); i <= Math.min(11, channelNum + 4); i++) {
      if (i !== channelNum) {
        overlapping.push(i);
      }
    }
    return overlapping;
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
      console.error('[ChannelVisualizer] Error in isColorDark:', e);
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
        console.log('[ChannelVisualizer] Received theme change message:', event.data.theme);
        this.updateTheme(event.data.theme === 'dark');
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  setupEducationalPanel() {
    this.educationalPanel = this.shadowRoot.getElementById('educational-panel');
    this.panelContent = this.shadowRoot.getElementById('panel-content');
    const closeButton = this.shadowRoot.getElementById('close-panel');

    closeButton.addEventListener('click', () => {
      this.hideEducationalPanel();
    });


  }



  showEducationalPanel() {
    this.populateEducationalContent();
    this.educationalPanel.style.display = 'block';
  }

  hideEducationalPanel() {
    this.educationalPanel.style.display = 'none';
  }

  populateEducationalContent() {
    const bandData = this.channelData[this.currentBand];
    const validCombinations = bandData.bonding.validCombinations[this.currentChannelWidth];
    const numCombinations = validCombinations ? validCombinations.length : 0;
    const channelsPerGroup = this.currentChannelWidth / 20;

    let content = `
      <div class="concept-explanation">
        <strong>📚 ${this.currentChannelWidth}MHz Channel Bonding</strong><br>`;

    if (this.currentChannelWidth === 160 && this.currentBand === '5') {
      content += `160MHz in 5GHz has only one viable option (channel 36) due to regulatory spectrum limitations. Channel 149 cannot support 160MHz.
      </div>
    `;
    } else if (this.currentChannelWidth === 320 && this.currentBand === '6') {
      content += `320MHz in 6GHz combines multiple 20MHz channels (WiFi 7 feature). First group has 16 channels, second group has 14 channels due to regulatory limits.
      </div>
    `;
    } else {
      content += `Channel bonding combines ${channelsPerGroup} adjacent 20MHz channels to create one ${this.currentChannelWidth}MHz channel.
      </div>
    `;
    }

    if (numCombinations > 0) {
      content += `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${this.getWidthColor(this.currentChannelWidth)}; border: 3px solid var(--primary-dark);"></div>
          <span><strong>Primary Channel</strong> - Controls the entire ${this.currentChannelWidth}MHz group</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${this.getWidthColor(this.currentChannelWidth)}; opacity: 0.6; border: 2px dashed var(--primary-color);"></div>
          <span><strong>Secondary Channels</strong> - Additional spectrum in the group</span>
        </div>
      `;

      if (this.currentBand === '2.4' && this.currentChannelWidth === 40) {
        // Special warning content for 2.4GHz 40MHz
        content += `
          <div class="concept-explanation" style="border-left-color: var(--error-color); background-color: rgba(255, 0, 0, 0.1);">
            <strong>🚨 2.4GHz 40MHz Reality Check:</strong><br>
            • <span style="color: var(--error-color);">Only ONE viable 40MHz channel</span><br>
            • <span style="color: var(--error-color);">Uses 48% of entire 2.4GHz spectrum</span> (40MHz of 83.5MHz total)<br>
            • <span style="color: var(--error-color);">Massive interference in dense areas</span><br>
            • <span style="color: var(--error-color);">Disabled by default on most equipment</span>
          </div>

          <div class="concept-explanation">
            <strong>🎯 Professional Recommendation:</strong><br>
            <strong>DON'T USE 40MHz in 2.4GHz!</strong><br><br>
            • Stick to 20MHz for 2.4GHz networks<br>
            • Use 5GHz or 6GHz for wider channels<br>
            • Performance gains rarely justify the problems
          </div>
        `;
      } else {
        // Normal content for other bands/widths
        content += `
          <div class="concept-explanation">
            <strong>📊 Performance Impact:</strong><br>
            • <span style="color: var(--success-color);">✅ ${channelsPerGroup}x theoretical speed increase</span><br>
            • <span style="color: var(--warning-color);">⚠️ Only ${numCombinations} non-overlapping option${numCombinations > 1 ? 's' : ''}</span><br>
            • <span style="color: var(--error-color);">❌ More interference susceptibility</span>
          </div>

          <div class="concept-explanation">
            <strong>🎯 Real-World Considerations:</strong><br>
            • Wider channels = higher speeds in ideal conditions<br>
            • More interference = potential speed reduction<br>
            • Fewer options = less flexibility for deployment
          </div>

          <div class="concept-explanation">
            <strong>💡 Best Practices:</strong><br>
            • Use 20MHz in dense environments<br>
            • Use 40-80MHz for high-speed applications<br>
            • Avoid 160MHz+ unless absolutely necessary
          </div>
        `;
      }
    } else {
      content += `
        <div class="legend-item">
          <div class="legend-color" style="background-color: #cccccc; opacity: 0.4;"></div>
          <span><strong>Not Available</strong> in ${this.currentBand}GHz band</span>
        </div>

        <div class="concept-explanation">
          <strong>🚫 Why ${this.currentChannelWidth}MHz isn't available:</strong><br>
          The ${this.currentBand}GHz band doesn't have enough contiguous spectrum space for ${this.currentChannelWidth}MHz channels.
        </div>

        <div class="concept-explanation">
          <strong>💡 Alternative Options:</strong><br>
          • Try 5GHz or 6GHz bands for wider channels<br>
          • Use smaller channel widths (20MHz, 40MHz)<br>
          • Consider multiple 20MHz channels instead
        </div>
      `;
    }

    this.panelContent.innerHTML = content;
  }

  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        // Debounce the recalculation to avoid excessive calls
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.recalculateBondingPositions();
        }, 100);
      });

      this.resizeObserver.observe(this.channelContainer);
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.themeInterval) {
      clearInterval(this.themeInterval);
    }
    if (this.themeDebounceTimeout) {
      clearTimeout(this.themeDebounceTimeout);
    }
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
    }
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
        console.error('[ChannelVisualizer] Error checking background color:', e);
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
        console.log('[ChannelVisualizer] Could not access parent frame due to same-origin policy');
      }
    }

    // Only update if theme has actually changed
    const themeChanged = this.currentTheme !== isDarkMode;
    if (themeChanged) {
      console.log('[ChannelVisualizer] Theme detection result:', isDarkMode ? 'dark' : 'light');
      this.currentTheme = isDarkMode;
      this.updateTheme(isDarkMode);
    }
  }

  // Method to directly update theme without polling
  updateTheme(isDarkMode) {
    console.log('[ChannelVisualizer] updateTheme called with isDarkMode:', isDarkMode);

    // Prevent multiple rapid transitions
    if (this.isTransitioning) {
      console.log('[ChannelVisualizer] Theme transition already in progress, skipping');
      return;
    }

    this.isTransitioning = true;
    this.themeUpdatePending = true;

    // Apply theme class
    if (isDarkMode) {
      this.classList.add('dark-mode');
      console.log('[ChannelVisualizer] Applied dark mode');
    } else {
      this.classList.remove('dark-mode');
      console.log('[ChannelVisualizer] Applied light mode');
    }

    // Reset transition flags after a short delay
    setTimeout(() => {
      this.isTransitioning = false;
      this.themeUpdatePending = false;
    }, 100);
  }
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('channel-overlap-visualizer-simulator', ChannelOverlapVisualizerElement);
