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
      min-width: 15px; /* Ensure channels are visible */
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
      font-size: 11px; /* Slightly smaller */
      white-space: pre-line;
      text-align: center;
      line-height: 1.2;
      color: var(--text-color);
    }

    .channel-label {
      position: absolute;
      bottom: 5px; /* Adjusted position */
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: white; /* Label inside channel */
      font-weight: 500;
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
    <h3>Channel Overlap Visualization</h3>
    <div class="wifi-bands">
      <div class="band-selector">
        <button id="band-2.4" class="band-button active">2.4 GHz</button>
        <button id="band-5" class="band-button">5 GHz</button>
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

    this.channelData = {
      '2.4': {
        channels: 11,
        baseFreq: 2412,
        spacing: 5,
        width: 20,
        nonOverlapping: [1, 6, 11]
      },
      '5': {
        // Simplified list for visualization clarity
        channels: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 132, 136, 140, 144, 149, 153, 157, 161, 165],
        baseFreq: 5180, // Base for channel 36
        spacing: 20, // Typical spacing
        width: 20,
        dfsChannels: [52, 56, 60, 64, 100, 104, 108, 112, 116, 132, 136, 140, 144] // Example DFS channels
      }
    };
    this.currentBand = '2.4';
    this.defaultInfoText = 'Select a channel to see overlap and frequency information.';

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
    this.updateChannelDisplay();

    // Check initial theme and apply it
    this.applyTheme();

    // Set up observer for theme changes
    this.setupThemeObserver();

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
    this.channelInfoElement.innerHTML = this.defaultInfoText; // Reset info on band switch
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
    } else { // 5 GHz
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
    }
     this.channelInfoElement.innerHTML = this.defaultInfoText;
  }

  createChannelElement(channelNum, freq, bandData) {
    const channelElement = document.createElement('div');
    channelElement.className = 'channel';
    channelElement.setAttribute('data-channel', channelNum);
    channelElement.setAttribute('data-freq', `${freq} MHz`);

    if (this.currentBand === '2.4') {
        channelElement.style.height = bandData.nonOverlapping.includes(channelNum) ? '180px' : '140px';
        channelElement.style.backgroundColor = bandData.nonOverlapping.includes(channelNum) ? 'var(--success-color)' : 'var(--primary-color)';
    } else { // 5 GHz
        channelElement.style.height = '160px';
        channelElement.style.backgroundColor = bandData.dfsChannels.includes(channelNum) ? 'var(--warning-color)' : 'var(--success-color)';
    }

    const label = document.createElement('div');
    label.className = 'channel-label';
    label.textContent = channelNum;
    channelElement.appendChild(label);

    channelElement.addEventListener('click', (e) => this.showChannelInfo(e.target.closest('.channel')));
    return channelElement;
  }


  showChannelInfo(channelElement) {
    if (!channelElement) return; // Ensure we have the element

    const channel = channelElement.getAttribute('data-channel');
    const freq = channelElement.getAttribute('data-freq');
    const info = this.channelInfoElement;
    const data = this.channelData[this.currentBand];

    // Highlight selected channel
    this.shadowRoot.querySelectorAll('.channel').forEach(ch => ch.style.opacity = '0.7');
    channelElement.style.opacity = '1';


    if (this.currentBand === '2.4') {
      const overlapping = this.getOverlappingChannels2_4(channel);
      info.innerHTML = `<strong>Channel ${channel}</strong> (${freq})<br>Overlaps with: ${overlapping.join(', ')}<br>` +
        (data.nonOverlapping.includes(parseInt(channel)) ?
          '<strong style="color: var(--success-color);">Recommended non-overlapping channel</strong>' : '<span style="color: var(--warning-color);">Causes overlap, not recommended</span>');
    } else { // 5 GHz
      info.innerHTML = `<strong>Channel ${channel}</strong> (${freq})<br>Standard 20MHz width shown.<br>` +
        (data.dfsChannels.includes(parseInt(channel)) ?
          '<strong style="color: var(--warning-color);">DFS channel: Requires radar detection. May cause brief interruptions if radar is detected.</strong>' : '<span style="color: var(--success-color);">Non-DFS channel. Generally preferred for stability.</span>');
    }
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
