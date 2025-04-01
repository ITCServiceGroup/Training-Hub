const macAddressTemplate = document.createElement('template');
macAddressTemplate.innerHTML = `
  <style>
    :host {
      display: block; /* Ensure the component takes up space */
      font-family: sans-serif; /* Basic font stack */
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
      margin: 0; /* Remove margin from container, host handles spacing */
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
      background-color: #e3f2fd;
      border-radius: var(--radius-sm);
      border: 1px solid #bbdefb;
      min-height: 45px;
      font-size: 0.95em;
      line-height: 1.5;
      transition: background-color 0.3s ease;
    }

    #macExplanation strong {
        color: var(--primary-dark);
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

    this.macBytesData = [
        { value: "00", color: "#4CAF50", description: "OUI Byte 1", info: "Indicates Unicast (even LSB) vs Multicast (odd LSB). Part of the Organizationally Unique Identifier assigned by IEEE." },
        { value: "1A", color: "#2196F3", description: "OUI Byte 2", info: "Part of the OUI (00:1A:2B) identifying the manufacturer (e.g., Cisco Systems)." },
        { value: "2B", color: "#2196F3", description: "OUI Byte 3", info: "Completes the OUI, uniquely identifying the hardware vendor." },
        { value: "3C", color: "#FF9800", description: "NIC Byte 1", info: "Start of the Network Interface Controller specific part, assigned by the manufacturer." },
        { value: "4D", color: "#FF9800", description: "NIC Byte 2", info: "Part of the unique serial number for this specific network interface." },
        { value: "5E", color: "#FF9800", description: "NIC Byte 3", info: "Completes the unique identifier for this network interface card." }
    ];

    this.defaultExplanation = 'Hover over each byte to learn more about its purpose.';
  }

  connectedCallback() {
    this.renderMacAddress();
  }

  renderMacAddress() {
    this.macContainer.innerHTML = ''; // Clear previous content if any

    this.macBytesData.forEach((byteData, index) => {
      const byteElement = document.createElement('div');
      byteElement.className = 'mac-byte';
      byteElement.textContent = byteData.value;

      // Add separator visually if needed (could also use ::before in CSS)
      // if (index > 0) {
      //   const separator = document.createElement('span');
      //   separator.textContent = ':';
      //   separator.style.margin = '0 2px';
      //   this.macContainer.appendChild(separator);
      // }

      byteElement.addEventListener('mouseover', () => {
        this.explanationElement.innerHTML = `<strong>${byteData.description}:</strong> ${byteData.info}`;
        byteElement.style.backgroundColor = byteData.color;
        byteElement.style.color = 'white';
        byteElement.style.borderColor = byteData.color; // Match border
      });

      byteElement.addEventListener('mouseout', () => {
        this.explanationElement.innerHTML = this.defaultExplanation;
        byteElement.style.backgroundColor = ''; // Revert to CSS default
        byteElement.style.color = ''; // Revert to CSS default
        byteElement.style.borderColor = ''; // Revert to CSS default
      });

      this.macContainer.appendChild(byteElement);
    });

    // Set initial explanation
    this.explanationElement.innerHTML = this.defaultExplanation;
  }
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('mac-address-explorer-simulator', MacAddressExplorerElement);
