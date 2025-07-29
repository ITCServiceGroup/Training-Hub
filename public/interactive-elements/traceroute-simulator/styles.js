// Export the styles as a string to be used in the template
export const styles = `
  /* Modern styles with a professional networking theme */
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    border-radius: 12px;
    margin: 15px 0;
    padding: 20px;

    /* Light mode variables */
    --bg-color-light: var(--custom-primary-bg-color, #ffffff);
    --border-color-light: #e0e4e8;
    --text-color-light: #2c3e50;
    --text-secondary-light: #5d6d7e;
    --fieldset-bg-light: var(--custom-secondary-bg-color, #f8fafc);
    --output-bg-light: var(--custom-secondary-bg-color, #f8fafc);
    --node-bg-light: #ffffff;
    --connector-color-light: #78909c;
    --primary-color-light: var(--color-primary, #0f766e);
    --primary-hover-light: var(--primary-dark, #0c5e57);
    --node-user-bg-light: #e3f2fd;
    --node-user-border-light: #2196f3;
    --node-router-bg-light: #e8f5e9;
    --node-router-border-light: #4caf50;
    --node-destination-bg-light: #f3e5f5;
    --node-destination-border-light: #9c27b0;
    --node-error-bg-light: #ffebee;
    --node-error-border-light: #f44336;
    --node-latency-color-light: #37474f;
    --node-ip-color-light: #546e7a;
    --popover-bg-light: #34495e;
    --popover-text-light: #ffffff;
    --checkbox-border-light: #bdc3c7;
    --checkbox-checked-light: #3498db;

    /* Dark mode variables */
    --bg-color-dark: var(--custom-primary-bg-color, #1e293b);
    --border-color-dark: #334155;
    --text-color-dark: #f1f5f9;
    --text-secondary-dark: #cbd5e1;
    --fieldset-bg-dark: var(--custom-secondary-bg-color, #0f172a);
    --output-bg-dark: var(--custom-secondary-bg-color, #0f172a);
    --node-bg-dark: #1e293b;
    --connector-color-dark: #94a3b8;
    --primary-color-dark: var(--color-primary, #14b8a6);
    --primary-hover-dark: var(--primary-light, #0f766e);
    --node-user-bg-dark: #1e3a8a;
    --node-user-border-dark: #3b82f6;
    --node-router-bg-dark: #14532d;
    --node-router-border-dark: #22c55e;
    --node-destination-bg-dark: #581c87;
    --node-destination-border-dark: #a855f7;
    --node-error-bg-dark: #7f1d1d;
    --node-error-border-dark: #ef4444;
    --node-latency-color-dark: #e2e8f0;
    --node-ip-color-dark: #cbd5e1;
    --popover-bg-dark: #0f172a;
    --popover-text-dark: #f1f5f9;
    --checkbox-border-dark: #475569;
    --checkbox-checked-dark: #60a5fa;

    /* Default to light mode */
    --bg-color: var(--bg-color-light);
    --border-color: var(--border-color-light);
    --text-color: var(--text-color-light);
    --text-secondary: var(--text-secondary-light);
    --fieldset-bg: var(--fieldset-bg-light);
    --output-bg: var(--output-bg-light);
    --node-bg: var(--node-bg-light);
    --connector-color: var(--connector-color-light);
    --primary-color: var(--primary-color-light);
    --primary-hover: var(--primary-hover-light);
    --node-user-bg: var(--node-user-bg-light);
    --node-user-border: var(--node-user-border-light);
    --node-router-bg: var(--node-router-bg-light);
    --node-router-border: var(--node-router-border-light);
    --node-destination-bg: var(--node-destination-bg-light);
    --node-destination-border: var(--node-destination-border-light);
    --node-error-bg: var(--node-error-bg-light);
    --node-error-border: var(--node-error-border-light);
    --node-latency-color: var(--node-latency-color-light);
    --node-ip-color: var(--node-ip-color-light);
    --popover-bg: var(--popover-bg-light);
    --popover-text: var(--popover-text-light);
    --checkbox-border: var(--checkbox-border-light);
    --checkbox-checked: var(--checkbox-checked-light);

    /* Apply base styles */
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: var(--text-color);
    transition: all 0.3s ease;
  }

  /* Dark mode styles */
  :host(.dark-mode) {
    --bg-color: var(--bg-color-dark);
    --border-color: var(--border-color-dark);
    --text-color: var(--text-color-dark);
    --text-secondary: var(--text-secondary-dark);
    --fieldset-bg: var(--fieldset-bg-dark);
    --output-bg: var(--output-bg-dark);
    --node-bg: var(--node-bg-dark);
    --connector-color: var(--connector-color-dark);
    --primary-color: var(--primary-color-dark);
    --primary-hover: var(--primary-hover-dark);
    --node-user-bg: var(--node-user-bg-dark);
    --node-user-border: var(--node-user-border-dark);
    --node-router-bg: var(--node-router-bg-dark);
    --node-router-border: var(--node-router-border-dark);
    --node-destination-bg: var(--node-destination-bg-dark);
    --node-destination-border: var(--node-destination-border-dark);
    --node-error-bg: var(--node-error-bg-dark);
    --node-error-border: var(--node-error-border-dark);
    --node-latency-color: var(--node-latency-color-dark);
    --node-ip-color: var(--node-ip-color-dark);
    --popover-bg: var(--popover-bg-dark);
    --popover-text: var(--popover-text-dark);
    --checkbox-border: var(--checkbox-border-dark);
    --checkbox-checked: var(--checkbox-checked-dark);
  }

  /* Simulator container */
  .simulator-container {
    width: 100%;
    box-sizing: border-box;
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h2 {
    font-size: 1.5em;
    color: var(--custom-title-color, var(--text-color));
    margin: 0 0 10px 0;
  }

  .description {
    color: var(--text-secondary);
    font-size: 0.95em;
    margin: 0 0 15px 0;
    line-height: 1.4;
  }

  .controls, .output, .visualization {
    margin-bottom: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  .problem-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 10px;
    align-items: center;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .control-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 6px;
  }

  .control-group input[type="number"] {
    width: 40px;
    padding: 3px 6px;
    margin: 0 0 0 5px;
    text-align: center;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: border-color 0.2s, background-color 0.3s, color 0.3s;
  }

  .control-group label:hover {
    color: var(--primary-color);
  }

  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--checkbox-border);
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
  }

  input[type="checkbox"]:checked {
    background-color: var(--checkbox-checked);
    border-color: var(--checkbox-checked);
  }

  input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 14px;
    top: -1px;
    left: 2px;
  }

  input[type="checkbox"]:hover {
    border-color: var(--primary-color);
  }

  [title] {
    position: relative;
    cursor: help;
  }

  [title]:hover::before {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    background-color: var(--popover-bg);
    color: var(--popover-text);
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 100;
    margin-bottom: 5px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  [title]:hover::after {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: var(--popover-bg) transparent transparent transparent;
    transition: border-color 0.3s ease;
  }

  .help-text {
    color: var(--text-secondary);
    font-size: 0.9em;
    margin: 10px 0 0 0;
    text-align: center;
    font-style: italic;
    transition: color 0.3s ease;
  }

  input[type="text"] {
    padding: 8px 12px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    width: 250px;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s, color 0.3s;
    margin-right: 10px;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  input[type="text"]:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    outline: none;
  }

  button {
    background-color: var(--custom-button-color, var(--primary-color));
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer !important;
    transition: background-color 0.2s, transform 0.1s;
    font-size: 14px;
  }

  button:hover {
    filter: brightness(0.9);
  }

  button:active {
    transform: translateY(1px);
  }

  label {
    font-size: 14px;
    font-weight: 500;
    margin-right: 8px;
    color: var(--text-color);
  }

  fieldset {
    border: 2px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
    background-color: var(--fieldset-bg);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  fieldset legend {
    font-weight: 600;
    color: var(--custom-title-color, var(--text-color));
    padding: 0 8px;
  }

  input[type="number"] {
    width: 50px;
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin: 0 8px;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  #trace-output-container {
    background-color: var(--output-bg);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    max-height: 300px;
    overflow: auto;
    font-family: 'Consolas', 'DejaVu Sans Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-color);
  }

  .trace-row {
    display: grid;
    grid-template-columns: 35px repeat(3, 65px) 20px auto;
    gap: 5px;
    white-space: pre;
    align-items: baseline;
  }

  .trace-row span {
    text-align: left;
  }

  .trace-col-hop { grid-column: 1; text-align: right; padding-right: 5px; }
  .trace-col-time { grid-column: span 1; }
  .trace-col-sep { grid-column: 5; text-align: center; color: #94a3b8; }
  .trace-col-ip { grid-column: 6; }
  .trace-col-timeout { grid-column: 2 / -1; }
  .trace-message { margin: 5px 0; }
  .trace-header-row {
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 5px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 5px;
  }

  fieldset {
    border: 2px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    background-color: var(--fieldset-bg);
    width: 100%;
    box-sizing: border-box;
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  fieldset legend {
    font-weight: 600;
    color: var(--custom-title-color, var(--text-color));
    padding: 0 8px;
    font-size: 1.1em;
  }

  fieldset.visualization {
    min-height: 120px;
    position: relative;
    transition: all 0.3s ease-in-out;
    overflow: visible; /* Allow popovers to extend outside */
  }

  @media (max-width: 1024px) {
    .visualization {
      min-height: 280px; /* Accommodate two rows */
    }
  }

  @media (max-width: 768px) {
    .visualization {
      min-height: 480px; /* Accommodate four rows */
    }
  }

  #vis-container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 45px;
    padding: 20px 35px;
    width: 100%;
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    align-items: center;
    min-height: 120px;
    background: var(--bg-color);
    box-sizing: border-box;
  }

  /* Medium screens (e.g. tablets) */
  @media (max-width: 1350px) {
    #vis-container {
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: repeat(2, auto);
      gap: 60px 35px;
      padding: 30px 25px;
    }

    .visualization {
      padding: 35px 20px;
    }
  }

  /* Small screens (e.g. mobile) */
  @media (max-width: 768px) {
    #vis-container {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(4, auto);
      gap: 60px 25px;
      padding: 25px 15px;
    }

    .visualization {
      padding: 30px 15px;
    }
  }

  .node {
    border: 2px solid;
    border-radius: 6px;
    padding: 5px 8px;
    text-align: center;
    width: 100%;
    max-width: 60px;
    aspect-ratio: 1;
    font-size: 0.8em;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.3s, border-color 0.3s, color 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2px;
    cursor: pointer;
    user-select: none;
    justify-self: center;
    color: var(--text-color);
  }

  @media (max-width: 1024px) {
    .node {
      max-width: 55px;
      font-size: 0.75em;
    }
  }

  @media (max-width: 768px) {
    .node {
      max-width: 50px;
      font-size: 0.7em;
    }
  }

  .node:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .node.user { background-color: var(--node-user-bg); border-color: var(--node-user-border); }
  .node.router { background-color: var(--node-router-bg); border-color: var(--node-router-border); }
  .node.destination { background-color: var(--node-destination-bg); border-color: var(--node-destination-border); }
  .node.error { background-color: var(--node-error-bg); border-color: var(--node-error-border); }

  .node.error {
    animation: errorPulse 2s infinite;
  }

  @keyframes errorPulse {
    0% { border-color: var(--node-error-border); }
    50% { border-color: #ff8a80; }
    100% { border-color: var(--node-error-border); }
  }

  .node-ip {
    font-size: 0.75em;
    color: var(--node-ip-color);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
  }

  .node-latency {
    font-size: 0.8em;
    font-weight: 600;
    color: var(--node-latency-color);
    margin-top: 2px;
    transition: color 0.3s;
    padding: 2px;
  }

  .node-latency.high { color: #f57c00; }
  .node-latency.timeout { color: #d32f2f; }

  .connector-svg-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 1;
  }

  .connector-line {
    stroke: var(--connector-color);
    stroke-width: 2;
    stroke-dasharray: 8 4;
    stroke-linecap: round;
    animation: dashOffset 1.5s linear infinite;
    opacity: 1;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
  }

  @keyframes dashOffset {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -12; }
  }

  /* Ensure nodes appear above connector lines */
  .node {
    z-index: 2;
    position: relative;
    background-color: var(--node-bg);
  }

  .visualization {
    position: relative;
    overflow: visible;
  }

  .packet {
    position: absolute;
    width: 24px;
    height: 12px;
    margin-left: -12px;
    margin-top: -6px;
    background-color: var(--node-router-border);
    border: 2px solid var(--node-router-border);
    border-radius: 6px;
    z-index: 10;
    transition: opacity 0.2s ease, transform 0.5s ease-in-out, background-color 0.3s ease, border-color 0.3s ease;
    opacity: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    will-change: transform, opacity;
  }

  .packet.moving {
    opacity: 1;
  }

  .packet.persistent {
    opacity: 1; /* Always visible */
  }

  #node-popover {
    position: fixed; /* Use fixed positioning to ensure visibility */
    background-color: var(--popover-bg);
    color: var(--popover-text);
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 0.9em;
    z-index: 1000; /* Increased z-index */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s, background-color 0.3s, color 0.3s;
    white-space: nowrap;
    pointer-events: none;
    max-width: 300px; /* Prevent extremely wide popovers */
    word-wrap: break-word; /* Allow text to wrap if needed */
  }

  #node-popover.visible {
    opacity: 1;
    visibility: visible;
  }

  /* Arrow styling for popover */
  #node-popover::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    transition: border-color 0.3s;
  }

  /* Default arrow (pointing down) */
  #node-popover:not(.arrow-top)::after {
    top: 100%;
    border-color: var(--popover-bg) transparent transparent transparent;
  }

  /* Arrow pointing up when popover is below the node */
  #node-popover.arrow-top::after {
    bottom: 100%;
    border-color: transparent transparent var(--popover-bg) transparent;
  }

  #node-popover div {
    margin-bottom: 4px;
  }

  #node-popover div:last-child {
    margin-bottom: 0;
  }

  #trace-summary {
    margin-top: 15px;
    padding: 20px;
    background-color: var(--bg-color);
    border-radius: 8px;
    font-size: 0.95em;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    width: 90%;
    max-width: 800px;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .analysis-section {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }

  .analysis-section h4 {
    background: var(--fieldset-bg);
    margin: 0;
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
    font-weight: 600;
  }

  .analysis-content {
    padding: 15px;
    color: var(--text-color);
  }

  .analysis-content p {
    margin: 8px 0;
    line-height: 1.5;
  }

  .analysis-content ul {
    margin: 8px 0;
    padding-left: 25px;
    list-style-type: disc;
  }

  .analysis-content li {
    margin: 4px 0;
    line-height: 1.4;
  }

  .problem-analysis {
    border: 1px solid var(--border-color);
    border-radius: 6px;
    margin: 10px 0;
    overflow: hidden;
  }

  .problem-header {
    background: var(--fieldset-bg);
    padding: 10px 15px;
    font-weight: 600;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);
  }

  .problem-details {
    padding: 15px;
    background: var(--bg-color);
  }

  .problem-details p {
    margin: 8px 0;
    line-height: 1.5;
  }

  .problem-details ul {
    margin: 8px 0;
    padding-left: 25px;
    list-style-type: circle;
  }

  .problem-details li {
    margin: 4px 0;
    line-height: 1.4;
    color: var(--text-secondary);
  }

  .problem-details strong {
    color: var(--text-color);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    :host { padding: 15px; }
    input[type="text"] { width: 100%; margin-bottom: 10px; }
    button { width: 100%; }
    fieldset { padding: 10px; }
    .visualization { padding: 15px; }
    .node { min-width: 60px; padding: 4px 6px; }

    /* Adjust trace row grid and hide RTT 3 column */
    .trace-row {
      grid-template-columns: 35px repeat(2, 65px) 20px auto; /* Remove 3rd RTT column width */
    }
    .trace-header-row span:nth-child(4), /* Hide RTT 3 header */
    .trace-row span:nth-child(4) {       /* Hide RTT 3 value */
      display: none;
    }
    /* Reassign separator and IP columns */
    .trace-col-sep { grid-column: 4; }
    .trace-col-ip { grid-column: 5; }

    /* Reduce font size in results table */
    #trace-output-container { font-size: 12px; }
  }
`;
