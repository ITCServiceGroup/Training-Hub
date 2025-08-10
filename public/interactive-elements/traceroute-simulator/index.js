import { template } from './template.js';
import { Visualization } from './visualization.js';
import { Simulation } from './simulation.js';
import { UiHandlers } from './ui-handlers.js';

class TracerouteSimulatorElement extends HTMLElement {
  constructor() {
    super();
    console.log('[TracerouteSimulator] Constructor started');

    // Attach Shadow DOM
    this.attachShadow({ mode: 'open' });

    // Append the template content
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize the simulator components
    this.simulation = new Simulation();
    this.visualization = new Visualization(
      this.shadowRoot.getElementById('vis-container'),
      this.shadowRoot.getElementById('node-popover')
    );
    this.uiHandlers = new UiHandlers(this.shadowRoot, this.simulation, this.visualization);

    // Bind methods
    this.applyTheme = this.applyTheme.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
    this.isColorDark = this.isColorDark.bind(this);

    // Flag to track if we're in the middle of a theme transition
    this.isTransitioning = false;

    console.log('[TracerouteSimulator] Constructor finished');
  }

  connectedCallback() {
    console.log('[TracerouteSimulator] Element connected to DOM');

    // Initialize theme state tracking
    this.currentTheme = null;
    this.themeUpdatePending = false;

    // Setup event listeners
    this.uiHandlers.setupEventListeners();

    // Check initial theme and apply it
    this.applyTheme();

    // Set up observer for theme changes
    this.setupThemeObserver();

    // Set up interval to check theme periodically with longer interval
    // This is a fallback for cases where the observer might miss changes
    this.themeInterval = setInterval(() => {
      this.applyTheme();
    }, 2000); // Increased to 2 seconds to reduce frequency

    console.log('[TracerouteSimulator] Component initialized');
  }

  disconnectedCallback() {
    console.log('[TracerouteSimulator] Element disconnected from DOM');

    // Clean up observer and interval
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.themeInterval) {
      clearInterval(this.themeInterval);
    }

    // Remove message event listener
    window.removeEventListener('message', this.messageHandler);

    console.log('[TracerouteSimulator] Component disconnected and cleaned up');
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
      console.error('[TracerouteSimulator] Error in isColorDark:', e);
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
        console.log('[TracerouteSimulator] Received theme change message:', event.data.theme);
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
        console.error('[TracerouteSimulator] Error checking background color:', e);
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
        console.log('[TracerouteSimulator] Could not access parent frame due to same-origin policy');
      }
    }

    // Only update if theme has actually changed
    const themeChanged = this.currentTheme !== isDarkMode;
    if (themeChanged) {
      console.log('[TracerouteSimulator] Theme detection result:', isDarkMode ? 'dark' : 'light');
      this.currentTheme = isDarkMode;
      this.updateTheme(isDarkMode);
    }
  }

  // Method to directly update theme without polling
  updateTheme(isDarkMode) {
    console.log('[TracerouteSimulator] updateTheme called with isDarkMode:', isDarkMode);

    // Prevent multiple rapid transitions
    if (this.isTransitioning) {
      console.log('[TracerouteSimulator] Theme transition already in progress, skipping');
      return;
    }

    this.isTransitioning = true;
    this.themeUpdatePending = true;

    // Apply theme class
    if (isDarkMode) {
      this.classList.add('dark-mode');
      console.log('[TracerouteSimulator] Applied dark mode');
    } else {
      this.classList.remove('dark-mode');
      console.log('[TracerouteSimulator] Applied light mode');
    }

    // Extract theme colors from parent document and inject into shadow DOM
    this.injectThemeColors(isDarkMode);

    // Reset transition flags after a short delay
    setTimeout(() => {
      this.isTransitioning = false;
      this.themeUpdatePending = false;
    }, 100);
  }

  // Extract theme colors from parent document and inject into shadow DOM
  injectThemeColors(isDarkMode) {
    try {
      // Get computed styles from a representative element in the parent document
      let targetDoc = document;
      
      // If we're in an iframe, try to access parent document
      if (window !== window.parent) {
        try {
          targetDoc = window.parent.document;
        } catch (e) {
          console.log('[TracerouteSimulator] Could not access parent document, using current document');
        }
      }

      // Get the primary color from CSS variables in parent document
      const rootStyles = getComputedStyle(targetDoc.documentElement);
      const primaryColor = rootStyles.getPropertyValue('--color-primary').trim() ||
                          rootStyles.getPropertyValue('--primary').trim() ||
                          (isDarkMode ? '#14b8a6' : '#0f766e'); // fallback colors

      const primaryDark = rootStyles.getPropertyValue('--primary-dark').trim() ||
                         rootStyles.getPropertyValue('--color-primary-dark').trim() ||
                         (isDarkMode ? '#0f766e' : '#0c5e57'); // fallback colors

      // Create or update a style element in shadow DOM to override CSS variables
      let themeStyleEl = this.shadowRoot.querySelector('#theme-colors');
      if (!themeStyleEl) {
        themeStyleEl = document.createElement('style');
        themeStyleEl.id = 'theme-colors';
        this.shadowRoot.appendChild(themeStyleEl);
      }

      themeStyleEl.textContent = `
        :host {
          --color-primary: ${primaryColor} !important;
          --primary-dark: ${primaryDark} !important;
        }
        :host(.dark-mode) {
          --primary-color: ${primaryColor} !important;
          --primary-hover: ${primaryDark} !important;
        }
        :host(:not(.dark-mode)) {
          --primary-color: ${primaryColor} !important;
          --primary-hover: ${primaryDark} !important;
        }
      `;

      console.log('[TracerouteSimulator] Injected theme colors:', { primaryColor, primaryDark, isDarkMode });
    } catch (error) {
      console.error('[TracerouteSimulator] Error injecting theme colors:', error);
    }
  }
}

// Define the custom element with the expected tag name
const tagName = 'traceroute-simulator-simulator';  // This matches the original element name
if (!customElements.get(tagName)) {
  customElements.define(tagName, TracerouteSimulatorElement);
  console.log(`[TracerouteSimulator] Custom element "${tagName}" defined`);
} else {
  console.log(`[TracerouteSimulator] Custom element "${tagName}" already defined`);
}
