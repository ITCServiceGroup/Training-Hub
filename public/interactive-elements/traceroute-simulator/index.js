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

    console.log('[TracerouteSimulator] Constructor finished');
  }

  connectedCallback() {
    console.log('[TracerouteSimulator] Element connected to DOM');
    // Setup event listeners
    this.uiHandlers.setupEventListeners();
  }

  disconnectedCallback() {
    console.log('[TracerouteSimulator] Element disconnected from DOM');
    // Any cleanup if needed
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
