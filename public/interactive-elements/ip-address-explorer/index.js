const ipAddressTemplate = document.createElement('template');
ipAddressTemplate.innerHTML = `
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
      --bg-color-light: var(--custom-primary-bg-color, #ffffff);
      --text-color-light: #2c3e50;
      --border-color-light: #e0e0e0;
      --element-bg-light: var(--custom-primary-bg-color, #ffffff);
      --explanation-bg-light: var(--custom-secondary-bg-color, #e3f2fd);
      --explanation-border-light: rgba(0, 0, 0, 0.1);

      /* Dark mode variables */
      --primary-color-dark: #90CAF9;
      --primary-dark-dark: #BBDEFB;
      --success-color-dark: #A5D6A7;
      --warning-color-dark: #FFCC80;
      --error-color-dark: #EF9A9A;
      --bg-color-dark: var(--custom-primary-bg-color, #0F172A);
      --text-color-dark: #F8FAFC;
      --border-color-dark: #475569;
      --element-bg-dark: var(--custom-primary-bg-color, #0F172A);
      --explanation-bg-dark: var(--custom-secondary-bg-color, #1E40AF);
      --explanation-border-dark: rgba(255, 255, 255, 0.2);

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
      --explanation-bg: var(--explanation-bg-light);
      --explanation-border: var(--explanation-border-light);

      --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
      --radius-sm: 4px;
      --radius-md: 8px;
    }

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
      --explanation-bg: var(--explanation-bg-dark);
      --explanation-border: var(--explanation-border-dark);
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

    p {
      margin: 10px 0;
      line-height: 1.6;
    }

    .ip-version-tabs {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }

    .tab-button {
      padding: 10px 20px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      background-color: var(--bg-color);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .tab-button:hover {
      background-color: var(--primary-color);
      color: white;
    }

    .tab-button.active {
      background-color: var(--primary-dark);
      color: white;
      border-color: var(--primary-dark);
    }

    .ip-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0px;
      margin: 20px 0;
      align-items: center;
    }

    .ip-segment {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      font-family: monospace;
      font-weight: 500;
      background-color: var(--bg-color);
      color: var(--text-color);
      margin-right: 5px;
      min-width: 30px;
      text-align: center;
    }

    .ip-segment:last-child {
      margin-right: 0;
    }

    .ip-segment:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: var(--shadow-sm);
    }

    .separator {
      margin: 0 2px;
      font-weight: bold;
      color: var(--text-color);
    }

    #ipExplanation {
      margin-top: 15px;
      padding: 12px 15px;
      background-color: var(--explanation-bg);
      border-radius: var(--radius-sm);
      border: 1px solid var(--explanation-border);
      min-height: 45px;
      font-size: 0.95em;
      line-height: 1.5;
      transition: all 0.3s ease;
      color: var(--text-color);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    :host(.dark-mode) #ipExplanation {
      color: white;
      text-shadow: 0 1px 1px rgba(0,0,0,0.2);
    }

    #ipExplanation strong {
      color: var(--primary-dark);
      font-weight: 600;
    }

    .hidden {
      display: none;
    }

    .ipv6-group {
      padding: 8px 10px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      font-family: monospace;
      font-weight: 500;
      background-color: var(--bg-color);
      color: var(--text-color);
      margin-right: 3px;
      min-width: 50px;
      text-align: center;
      font-size: 0.9em;
    }

    .ipv6-group:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: var(--shadow-sm);
    }
  </style>

  <div class="interactive-element">
    <h3>Interactive IP Address Explorer</h3>
    <p>Explore the structure and components of IPv4 and IPv6 addresses:</p>
    
    <div class="ip-version-tabs">
      <button class="tab-button active" id="ipv4Tab">IPv4</button>
      <button class="tab-button" id="ipv6Tab">IPv6</button>
    </div>

    <div id="ipv4Container">
      <p>Hover over each octet of the IPv4 address below to learn its purpose:</p>
      <div id="ipv4AddressContainer" class="ip-container">
        <!-- IPv4 octets will be added by JavaScript -->
      </div>
    </div>

    <div id="ipv6Container" class="hidden">
      <p>Hover over each group of the IPv6 address below to learn its purpose:</p>
      <div id="ipv6AddressContainer" class="ip-container">
        <!-- IPv6 groups will be added by JavaScript -->
      </div>
    </div>

    <p id="ipExplanation">Select IPv4 or IPv6 above, then hover over address segments to learn more.</p>
  </div>
`;

class IpAddressExplorerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(ipAddressTemplate.content.cloneNode(true));

    // Get DOM elements
    this.ipv4Tab = this.shadowRoot.getElementById('ipv4Tab');
    this.ipv6Tab = this.shadowRoot.getElementById('ipv6Tab');
    this.ipv4Container = this.shadowRoot.getElementById('ipv4Container');
    this.ipv6Container = this.shadowRoot.getElementById('ipv6Container');
    this.ipv4AddressContainer = this.shadowRoot.getElementById('ipv4AddressContainer');
    this.ipv6AddressContainer = this.shadowRoot.getElementById('ipv6AddressContainer');
    this.explanationElement = this.shadowRoot.getElementById('ipExplanation');

    // Bind methods
    this.isColorDark = this.isColorDark.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
    this.applyTheme = this.applyTheme.bind(this);

    this.isTransitioning = false;
    this.currentVersion = 'ipv4';

    // Define color schemes for light and dark modes
    this.colorSchemes = {
      light: {
        network: "#4CAF50",    // Green for network portion
        host: "#2196F3",       // Blue for host portion
        subnet: "#FF9800",     // Orange for subnet
        prefix: "#9C27B0",     // Purple for IPv6 prefix
        interface: "#FF5722"   // Red for interface ID
      },
      dark: {
        network: "#A5D6A7",    // Lighter Green
        host: "#90CAF9",       // Lighter Blue
        subnet: "#FFCC80",     // Lighter Orange
        prefix: "#CE93D8",     // Lighter Purple
        interface: "#FFAB91"   // Lighter Red
      }
    };

    // IPv4 example: 192.168.1.100/24 (Class C private network)
    this.ipv4Data = [
      {
        value: "192",
        colorKey: "network",
        description: "Network Octet 1",
        info: "First octet of Class C private network (192.168.x.x). Identifies this as a private IPv4 address range commonly used in home and office networks."
      },
      {
        value: "168",
        colorKey: "network",
        description: "Network Octet 2",
        info: "Second octet of the private network identifier. Together with 192, this defines the 192.168.0.0/16 private address space reserved by RFC 1918."
      },
      {
        value: "1",
        colorKey: "subnet",
        description: "Subnet Identifier",
        info: "Third octet acting as subnet identifier within the 192.168.0.0/16 network. This creates the 192.168.1.0/24 subnet with 254 usable host addresses."
      },
      {
        value: "100",
        colorKey: "host",
        description: "Host Identifier",
        info: "Fourth octet identifying the specific host within the 192.168.1.0/24 subnet. Valid host addresses range from 1-254 (0 is network, 255 is broadcast)."
      }
    ];

    // IPv6 example: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 (Documentation prefix)
    this.ipv6Data = [
      {
        value: "2001",
        colorKey: "prefix",
        description: "Global Routing Prefix",
        info: "First 16 bits of the global unicast address. 2001:db8::/32 is reserved for documentation and examples (RFC 3849)."
      },
      {
        value: "0db8",
        colorKey: "prefix",
        description: "Global Routing Prefix",
        info: "Continuation of the global routing prefix. This specific prefix (2001:db8::/32) is reserved for documentation purposes only."
      },
      {
        value: "85a3",
        colorKey: "subnet",
        description: "Subnet ID",
        info: "Subnet identifier within the organization's network. Allows for 65,536 different subnets within the /32 prefix allocation."
      },
      {
        value: "0000",
        colorKey: "subnet",
        description: "Subnet ID Extension",
        info: "Additional subnet bits, often zero-padded. The full subnet ID is 32 bits (4 groups), providing extensive subnetting capabilities."
      },
      {
        value: "0000",
        colorKey: "interface",
        description: "Interface ID",
        info: "Start of the 64-bit interface identifier. Can be manually assigned, auto-configured via SLAAC, or derived from MAC address (EUI-64)."
      },
      {
        value: "8a2e",
        colorKey: "interface",
        description: "Interface ID",
        info: "Continuation of the interface identifier. This portion uniquely identifies the specific interface within the subnet."
      },
      {
        value: "0370",
        colorKey: "interface",
        description: "Interface ID",
        info: "Third group of the interface identifier. The full 64-bit interface ID ensures uniqueness within the subnet scope."
      },
      {
        value: "7334",
        colorKey: "interface",
        description: "Interface ID",
        info: "Final group completing the 64-bit interface identifier. Together, these 4 groups provide 2^64 possible interface addresses per subnet."
      }
    ];

    this.defaultExplanation = 'Select IPv4 or IPv6 above, then hover over address segments to learn more.';

    // Theme variables (similar to MAC explorer)
    this.lightModeVars = {
      '--primary-color': 'var(--primary-color-light)',
      '--primary-dark': 'var(--primary-dark-light)',
      '--success-color': 'var(--success-color-light)',
      '--warning-color': 'var(--warning-color-light)',
      '--error-color': 'var(--error-color-light)',
      '--bg-color': 'var(--bg-color-light)',
      '--text-color': 'var(--text-color-light)',
      '--border-color': 'var(--border-color-light)',
      '--element-bg': 'var(--element-bg-light)',
      '--explanation-bg': 'var(--explanation-bg-light)',
      '--explanation-border': 'var(--explanation-border-light)'
    };

    this.darkModeVars = {
      '--primary-color': 'var(--primary-color-dark)',
      '--primary-dark': 'var(--primary-dark-dark)',
      '--success-color': 'var(--success-color-dark)',
      '--warning-color': 'var(--warning-color-dark)',
      '--error-color': 'var(--error-color-dark)',
      '--bg-color': 'var(--bg-color-dark)',
      '--text-color': 'var(--text-color-dark)',
      '--border-color': 'var(--border-color-dark)',
      '--element-bg': 'var(--element-bg-dark)',
      '--explanation-bg': 'var(--explanation-bg-dark)',
      '--explanation-border': 'var(--explanation-border-dark)'
    };
  }

  connectedCallback() {
    // Initialize theme state tracking
    this.currentTheme = null;
    this.themeUpdatePending = false;

    // Check initial theme and apply it
    this.applyTheme();

    // Set up tab event listeners
    this.ipv4Tab.addEventListener('click', () => this.switchToIPv4());
    this.ipv6Tab.addEventListener('click', () => this.switchToIPv6());

    // Render the initial IP address (IPv4)
    this.renderIPAddress();

    // Set up observer for theme changes
    this.setupThemeObserver();

    // Set up interval to check theme periodically
    this.themeInterval = setInterval(() => {
      this.applyTheme();
    }, 2000);

    console.log('[IP Explorer] Component initialized');
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

    console.log('[IP Explorer] Component disconnected and cleaned up');
  }

  switchToIPv4() {
    this.currentVersion = 'ipv4';
    this.ipv4Tab.classList.add('active');
    this.ipv6Tab.classList.remove('active');
    this.ipv4Container.classList.remove('hidden');
    this.ipv6Container.classList.add('hidden');
    this.renderIPAddress();
  }

  switchToIPv6() {
    this.currentVersion = 'ipv6';
    this.ipv6Tab.classList.add('active');
    this.ipv4Tab.classList.remove('active');
    this.ipv6Container.classList.remove('hidden');
    this.ipv4Container.classList.add('hidden');
    this.renderIPAddress();
  }

  renderIPAddress() {
    if (this.currentVersion === 'ipv4') {
      this.renderIPv4();
    } else {
      this.renderIPv6();
    }
  }

  renderIPv4() {
    this.ipv4AddressContainer.innerHTML = '';

    // Determine theme
    const isDarkMode = this.classList.contains('dark-mode');
    const theme = isDarkMode ? 'dark' : 'light';
    const colorScheme = this.colorSchemes[theme];

    this.ipv4Data.forEach((octetData, index) => {
      const octetElement = document.createElement('div');
      octetElement.className = 'ip-segment';
      octetElement.textContent = octetData.value;

      const octetColor = colorScheme[octetData.colorKey];

      // Set initial color styling
      octetElement.style.backgroundColor = octetColor;
      octetElement.style.color = 'white';
      octetElement.style.borderColor = octetColor;
      octetElement.style.fontWeight = 'bold';
      octetElement.style.textShadow = '0 1px 1px rgba(0,0,0,0.2)';

      octetElement.addEventListener('mouseover', () => {
        this.explanationElement.innerHTML = `<strong>${octetData.description}:</strong> ${octetData.info}`;
        // Darken the color on hover
        const darkerColor = this.darkenColor(octetColor, 0.2);
        octetElement.style.backgroundColor = darkerColor;
        octetElement.style.borderColor = darkerColor;
        octetElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      });

      octetElement.addEventListener('mouseout', () => {
        this.explanationElement.innerHTML = this.defaultExplanation;
        // Revert to original color
        octetElement.style.backgroundColor = octetColor;
        octetElement.style.borderColor = octetColor;
        octetElement.style.boxShadow = '';
      });

      this.ipv4AddressContainer.appendChild(octetElement);

      // Add dot separator except after last octet
      if (index < this.ipv4Data.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'separator';
        separator.textContent = '.';
        this.ipv4AddressContainer.appendChild(separator);
      }
    });

    // Add /24 CIDR notation
    const cidrElement = document.createElement('span');
    cidrElement.className = 'separator';
    cidrElement.textContent = '/24';
    cidrElement.style.marginLeft = '5px';
    cidrElement.style.color = 'var(--text-color)';
    cidrElement.style.fontWeight = 'bold';
    this.ipv4AddressContainer.appendChild(cidrElement);

    this.explanationElement.innerHTML = 'Hover over each octet to learn about IPv4 address structure.';
  }

  renderIPv6() {
    this.ipv6AddressContainer.innerHTML = '';

    // Determine theme
    const isDarkMode = this.classList.contains('dark-mode');
    const theme = isDarkMode ? 'dark' : 'light';
    const colorScheme = this.colorSchemes[theme];

    this.ipv6Data.forEach((groupData, index) => {
      const groupElement = document.createElement('div');
      groupElement.className = 'ipv6-group';
      groupElement.textContent = groupData.value;

      const groupColor = colorScheme[groupData.colorKey];

      // Set initial color styling
      groupElement.style.backgroundColor = groupColor;
      groupElement.style.color = 'white';
      groupElement.style.borderColor = groupColor;
      groupElement.style.fontWeight = 'bold';
      groupElement.style.textShadow = '0 1px 1px rgba(0,0,0,0.2)';

      groupElement.addEventListener('mouseover', () => {
        this.explanationElement.innerHTML = `<strong>${groupData.description}:</strong> ${groupData.info}`;
        // Darken the color on hover
        const darkerColor = this.darkenColor(groupColor, 0.2);
        groupElement.style.backgroundColor = darkerColor;
        groupElement.style.borderColor = darkerColor;
        groupElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      });

      groupElement.addEventListener('mouseout', () => {
        this.explanationElement.innerHTML = this.defaultExplanation;
        // Revert to original color
        groupElement.style.backgroundColor = groupColor;
        groupElement.style.borderColor = groupColor;
        groupElement.style.boxShadow = '';
      });

      this.ipv6AddressContainer.appendChild(groupElement);

      // Add colon separator except after last group
      if (index < this.ipv6Data.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'separator';
        separator.textContent = ':';
        this.ipv6AddressContainer.appendChild(separator);
      }
    });

    this.explanationElement.innerHTML = 'Hover over each group to learn about IPv6 address structure.';
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
        console.error('Error checking background color:', e);
      }
    }

    // Method 3: Check parent document if in iframe
    if (!isDarkMode && window !== window.parent) {
      try {
        if (window.parent.document.documentElement.classList.contains('dark') ||
            window.parent.document.body.classList.contains('dark')) {
          isDarkMode = true;
        } else {
          const parentBodyBgColor = getComputedStyle(window.parent.document.body).backgroundColor;
          const parentHtmlBgColor = getComputedStyle(window.parent.document.documentElement).backgroundColor;

          if (this.isColorDark(parentBodyBgColor) || this.isColorDark(parentHtmlBgColor)) {
            isDarkMode = true;
          }
        }
      } catch (e) {
        console.log('Could not access parent frame due to same-origin policy');
      }
    }

    // Only update if theme has actually changed
    const themeChanged = this.currentTheme !== isDarkMode;
    if (!themeChanged) {
      return;
    }

    console.log('IP Explorer - Final dark mode detection result:', isDarkMode);
    this.currentTheme = isDarkMode;

    // Apply CSS variables directly to the host element
    if (isDarkMode) {
      Object.entries(this.darkModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      this.classList.add('dark-mode');

      const style = document.createElement('style');
      style.textContent = `
        :host {
          --primary-color: var(--primary-color-dark) !important;
          --primary-dark: var(--primary-dark-dark) !important;
          --success-color: var(--success-color-dark) !important;
          --warning-color: var(--warning-color-dark) !important;
          --error-color: var(--error-color-dark) !important;
          --bg-color: var(--bg-color-dark) !important;
          --text-color: var(--text-color-dark) !important;
          --border-color: var(--border-color-dark) !important;
          --element-bg: var(--element-bg-dark) !important;
          --explanation-bg: var(--explanation-bg-dark) !important;
          --explanation-border: var(--explanation-border-dark) !important;
        }
      `;

      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('Applied dark mode');
    } else {
      Object.entries(this.lightModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      this.classList.remove('dark-mode');

      const style = document.createElement('style');
      style.textContent = `
        :host {
          --primary-color: var(--primary-color-light) !important;
          --primary-dark: var(--primary-dark-light) !important;
          --success-color: var(--success-color-light) !important;
          --warning-color: var(--warning-color-light) !important;
          --error-color: var(--error-color-light) !important;
          --bg-color: var(--bg-color-light) !important;
          --text-color: var(--text-color-light) !important;
          --border-color: var(--border-color-light) !important;
          --element-bg: var(--element-bg-light) !important;
          --explanation-bg: var(--explanation-bg-light) !important;
          --explanation-border: var(--explanation-border-light) !important;
        }
      `;

      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('Applied light mode');
    }

    // Re-render with current theme
    this.renderIPAddress();
  }

  setupThemeObserver() {
    // Create a MutationObserver to watch for class changes with debouncing
    this.observer = new MutationObserver((mutations) => {
      const relevantMutation = mutations.some(mutation => {
        return mutation.target !== this && !this.themeUpdatePending;
      });

      if (relevantMutation) {
        if (this.themeDebounceTimeout) {
          clearTimeout(this.themeDebounceTimeout);
        }
        this.themeDebounceTimeout = setTimeout(() => {
          this.applyTheme();
        }, 100);
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
        console.log('[IP Explorer] Received theme change message:', event.data.theme);
        this.updateTheme(event.data.theme === 'dark');
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  updateTheme(isDarkMode) {
    console.log('[IP Explorer] updateTheme called with isDarkMode:', isDarkMode);

    if (this.isTransitioning) {
      console.log('[IP Explorer] Theme transition already in progress, skipping');
      return;
    }

    this.isTransitioning = true;
    this.themeUpdatePending = true;

    // Apply theme immediately
    if (isDarkMode) {
      Object.entries(this.darkModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      this.classList.add('dark-mode');

      const style = document.createElement('style');
      style.textContent = `
        :host {
          --primary-color: var(--primary-color-dark) !important;
          --primary-dark: var(--primary-dark-dark) !important;
          --success-color: var(--success-color-dark) !important;
          --warning-color: var(--warning-color-dark) !important;
          --error-color: var(--error-color-dark) !important;
          --bg-color: var(--bg-color-dark) !important;
          --text-color: var(--text-color-dark) !important;
          --border-color: var(--border-color-dark) !important;
          --element-bg: var(--element-bg-dark) !important;
          --explanation-bg: var(--explanation-bg-dark) !important;
          --explanation-border: var(--explanation-border-dark) !important;
        }
      `;

      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('[IP Explorer] Applied dark mode via direct update');
    } else {
      Object.entries(this.lightModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      this.classList.remove('dark-mode');

      const style = document.createElement('style');
      style.textContent = `
        :host {
          --primary-color: var(--primary-color-light) !important;
          --primary-dark: var(--primary-dark-light) !important;
          --success-color: var(--success-color-light) !important;
          --warning-color: var(--warning-color-light) !important;
          --error-color: var(--error-color-light) !important;
          --bg-color: var(--bg-color-light) !important;
          --text-color: var(--text-color-light) !important;
          --border-color: var(--border-color-light) !important;
          --element-bg: var(--element-bg-light) !important;
          --explanation-bg: var(--explanation-bg-light) !important;
          --explanation-border: var(--explanation-border-light) !important;
        }
      `;

      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('[IP Explorer] Applied light mode via direct update');
    }

    // Re-render with current theme
    this.renderIPAddress();

    // Reset transition flags after a short delay
    setTimeout(() => {
      this.isTransitioning = false;
      this.themeUpdatePending = false;
    }, 100);
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
      console.error('Error in isColorDark:', e);
      return false;
    }
  }

  // Helper method to darken a color for hover effect
  darkenColor(color, amount) {
    // Convert hex to RGB if needed
    let r, g, b;

    if (color.startsWith('#')) {
      const hex = color.slice(1);
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    } else {
      return color; // Return original if not hex
    }

    // Darken by reducing each component
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    // Convert back to hex
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('ip-address-explorer-simulator', IpAddressExplorerElement);

console.log('[WebComponent] Custom element "ip-address-explorer-simulator" defined.');
