const channelVisualizerTemplate = document.createElement('template');
channelVisualizerTemplate.innerHTML = `
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

    .wifi-bands {
      margin: 15px 0 0 0; /* Adjusted margin */
      background-color: white;
      border-radius: var(--radius-md);
      padding: 0; /* Padding handled by inner elements */
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
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      transform: translateY(-1px);
    }

    .band-button.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
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
      border-bottom: 1px solid #ddd;
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
  }

  connectedCallback() {
    this.bandSelectorButtons.forEach(button => {
      button.addEventListener('click', (e) => this.switchBand(e.target.id.split('-')[1]));
    });
    this.updateChannelDisplay();
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
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('channel-overlap-visualizer-simulator', ChannelOverlapVisualizerElement);
