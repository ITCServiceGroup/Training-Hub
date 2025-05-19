const macAddressTemplate = document.createElement('template');
macAddressTemplate.innerHTML = `
  <style>
    :host {
      display: block; /* Ensure the component takes up space */
      font-family: sans-serif; /* Basic font stack */

      /* Light mode variables */
      --primary-color-light: #2196F3;
      --primary-dark-light: #1976D2;
      --success-color-light: #4CAF50;
      --warning-color-light: #ff9800;
      --error-color-light: #f44336;
      --bg-color-light: #f8f9fa;
      --text-color-light: #2c3e50;
      --border-color-light: #e0e0e0;
      --element-bg-light: #ffffff;
      --explanation-bg-light: #e3f2fd;
      --explanation-border-light: #bbdefb;

      /* Dark mode variables - with enhanced contrast */
      --primary-color-dark: #90CAF9; /* Lighter blue */
      --primary-dark-dark: #BBDEFB; /* Very light blue for better contrast */
      --success-color-dark: #A5D6A7; /* Lighter green */
      --warning-color-dark: #FFCC80; /* Lighter orange */
      --error-color-dark: #EF9A9A; /* Lighter red */
      --bg-color-dark: #1E293B; /* Slate 800 */
      --text-color-dark: #F8FAFC; /* Slate 50 - almost white */
      --border-color-dark: #475569; /* Slate 600 */
      --element-bg-dark: #0F172A; /* Slate 900 - very dark blue */
      --explanation-bg-dark: #1E40AF; /* Blue 800 */
      --explanation-border-dark: #3B82F6; /* Blue 500 */

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
      /* Apply dark mode variables when .dark-mode class is present */
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
      margin: 0; /* Remove margin from container, host handles spacing */
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
      color: var(--primary-dark);
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

    .mac-address-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0px; /* Gap handled by byte margin */
      margin: 20px 0;
      align-items: center;
    }

    .mac-byte {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      font-family: monospace;
      font-weight: 500;
      background-color: var(--bg-color);
      color: var(--text-color);
      margin-right: 5px; /* Spacing between bytes */
      min-width: 30px; /* Ensure consistent width */
      text-align: center;
    }

    .mac-byte:last-child {
        margin-right: 0;
    }

    /* We'll apply hover styles dynamically via JS to set specific colors */
    .mac-byte:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: var(--shadow-sm);
    }

    #macExplanation {
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

    /* Dark mode specific styles for explanation box */
    :host(.dark-mode) #macExplanation {
      color: white; /* Force white text for better contrast in dark mode */
      text-shadow: 0 1px 1px rgba(0,0,0,0.2); /* Add text shadow for better readability */
    }

    #macExplanation strong {
        color: var(--primary-dark);
        font-weight: 600;
    }
  </style>

  <div class="interactive-element">
    <h3>Interactive MAC Address Explorer</h3>
    <p>Hover over each byte of the example MAC address below to learn its purpose:</p>
    <div id="macAddressContainer" class="mac-address-container">
      <!-- MAC bytes will be added by JavaScript -->
    </div>
    <p id="macExplanation">Hover over each byte to learn more about its purpose.</p>
  </div>
`;

class MacAddressExplorerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(macAddressTemplate.content.cloneNode(true));

    this.macContainer = this.shadowRoot.getElementById('macAddressContainer');
    this.explanationElement = this.shadowRoot.getElementById('macExplanation');
    this.interactiveElement = this.shadowRoot.querySelector('.interactive-element');

    // Bind methods
    this.isColorDark = this.isColorDark.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
    this.applyTheme = this.applyTheme.bind(this);

    // Flag to track if we're in the middle of a theme transition
    this.isTransitioning = false;

    // Define byte colors for light and dark modes
    this.colorSchemes = {
      light: {
        oui1: "#4CAF50", // Green
        oui2: "#2196F3", // Blue
        oui3: "#2196F3", // Blue
        nic1: "#FF9800", // Orange
        nic2: "#FF9800", // Orange
        nic3: "#FF9800"  // Orange
      },
      dark: {
        oui1: "#A5D6A7", // Lighter Green with better contrast
        oui2: "#90CAF9", // Lighter Blue with better contrast
        oui3: "#90CAF9", // Lighter Blue with better contrast
        nic1: "#FFCC80", // Lighter Orange with better contrast
        nic2: "#FFCC80", // Lighter Orange with better contrast
        nic3: "#FFCC80"  // Lighter Orange with better contrast
      }
    };

    this.macBytesData = [
        { value: "00", colorKey: "oui1", description: "OUI Byte 1", info: "Indicates Unicast (even LSB) vs Multicast (odd LSB). Part of the Organizationally Unique Identifier assigned by IEEE." },
        { value: "1A", colorKey: "oui2", description: "OUI Byte 2", info: "Part of the OUI (00:1A:2B) identifying the manufacturer (e.g., Cisco Systems)." },
        { value: "2B", colorKey: "oui3", description: "OUI Byte 3", info: "Completes the OUI, uniquely identifying the hardware vendor." },
        { value: "3C", colorKey: "nic1", description: "NIC Byte 1", info: "Start of the Network Interface Controller specific part, assigned by the manufacturer." },
        { value: "4D", colorKey: "nic2", description: "NIC Byte 2", info: "Part of the unique serial number for this specific network interface." },
        { value: "5E", colorKey: "nic3", description: "NIC Byte 3", info: "Completes the unique identifier for this network interface card." }
    ];

    this.defaultExplanation = 'Hover over each byte to learn more about its purpose.';

    // Define CSS variables for light and dark modes
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
    // Check initial theme and apply it
    this.applyTheme();

    // Render the MAC address
    this.renderMacAddress();

    // Set up observer for theme changes
    this.setupThemeObserver();

    // Set up interval to check theme periodically, but with a shorter interval
    // This helps catch theme changes that might be missed by the observer
    this.themeInterval = setInterval(() => {
      this.applyTheme();
    }, 300); // Reduced from 1000ms to 300ms for more responsive updates

    // Log that we're initialized
    console.log('[MAC Explorer] Component initialized');
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

    console.log('[MAC Explorer] Component disconnected and cleaned up');
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

        // Use the class method to check if a color is dark
        const isColorDark = this.isColorDark;

        console.log('Body background color:', bodyBgColor);
        console.log('HTML background color:', htmlBgColor);

        if (isColorDark(bodyBgColor) || isColorDark(htmlBgColor)) {
          isDarkMode = true;
        }
      } catch (e) {
        console.error('Error checking background color:', e);
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

          console.log('Parent body background color:', parentBodyBgColor);
          console.log('Parent HTML background color:', parentHtmlBgColor);

          if (this.isColorDark(parentBodyBgColor) || this.isColorDark(parentHtmlBgColor)) {
            isDarkMode = true;
          }
        }
      } catch (e) {
        console.log('Could not access parent frame due to same-origin policy');
      }
    }

    // DO NOT force dark mode
    // isDarkMode = true;

    console.log('Final dark mode detection result:', isDarkMode);

    // Apply CSS variables directly to the host element
    if (isDarkMode) {
      // Apply dark mode variables
      Object.entries(this.darkModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      // Add dark-mode class for any class-specific styles
      this.classList.add('dark-mode');

      // Also apply to the shadow root elements directly
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

      // Remove any existing theme style
      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add the new style
      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('Applied dark mode');
    } else {
      // Apply light mode variables
      Object.entries(this.lightModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      // Remove dark-mode class
      this.classList.remove('dark-mode');

      // Also apply to the shadow root elements directly
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

      // Remove any existing theme style
      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add the new style
      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('Applied light mode');
    }

    // Re-render with current theme
    this.renderMacAddress();
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
        console.log('[MAC Explorer] Received theme change message:', event.data.theme);
        this.updateTheme(event.data.theme === 'dark');
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  // Method to directly update theme without polling
  updateTheme(isDarkMode) {
    console.log('[MAC Explorer] updateTheme called with isDarkMode:', isDarkMode);

    // Prevent multiple rapid transitions
    if (this.isTransitioning) {
      console.log('[MAC Explorer] Theme transition already in progress, skipping');
      return;
    }

    this.isTransitioning = true;

    // Apply theme immediately with transition
    if (isDarkMode) {
      // Apply dark mode variables
      Object.entries(this.darkModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      // Add dark-mode class for any class-specific styles
      this.classList.add('dark-mode');

      // Also apply to the shadow root elements directly
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

      // Remove any existing theme style
      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add the new style
      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('[MAC Explorer] Applied dark mode via direct update');
    } else {
      // Apply light mode variables
      Object.entries(this.lightModeVars).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });

      // Remove dark-mode class
      this.classList.remove('dark-mode');

      // Also apply to the shadow root elements directly
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

      // Remove any existing theme style
      const existingStyle = this.shadowRoot.querySelector('#theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add the new style
      style.id = 'theme-style';
      this.shadowRoot.appendChild(style);

      console.log('[MAC Explorer] Applied light mode via direct update');
    }

    // Re-render with current theme
    this.renderMacAddress();

    // Reset transition flag after a short delay
    setTimeout(() => {
      this.isTransitioning = false;
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

  renderMacAddress() {
    this.macContainer.innerHTML = ''; // Clear previous content if any

    // Determine theme based on class
    const isDarkMode = this.classList.contains('dark-mode');
    const theme = isDarkMode ? 'dark' : 'light';

    console.log('Rendering MAC address with theme:', theme);

    // Get the current color scheme based on theme
    const colorScheme = this.colorSchemes[theme];

    this.macBytesData.forEach((byteData, index) => {
      const byteElement = document.createElement('div');
      byteElement.className = 'mac-byte';
      byteElement.textContent = byteData.value;

      // Get the appropriate color for the current theme
      const byteColor = colorScheme[byteData.colorKey];

      byteElement.addEventListener('mouseover', () => {
        this.explanationElement.innerHTML = `<strong>${byteData.description}:</strong> ${byteData.info}`;
        byteElement.style.backgroundColor = byteColor;
        byteElement.style.color = 'white';
        byteElement.style.borderColor = byteColor; // Match border
        byteElement.style.fontWeight = 'bold';
        byteElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        byteElement.style.textShadow = '0 1px 1px rgba(0,0,0,0.2)'; // Add text shadow for better readability
      });

      byteElement.addEventListener('mouseout', () => {
        this.explanationElement.innerHTML = this.defaultExplanation;
        byteElement.style.backgroundColor = ''; // Revert to CSS default
        byteElement.style.color = ''; // Revert to CSS default
        byteElement.style.borderColor = ''; // Revert to CSS default
        byteElement.style.fontWeight = '';
        byteElement.style.boxShadow = '';
        byteElement.style.textShadow = '';
      });

      this.macContainer.appendChild(byteElement);
    });

    // Set initial explanation
    this.explanationElement.innerHTML = this.defaultExplanation;
  }
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('mac-address-explorer-simulator', MacAddressExplorerElement);
