// Export the styles as a string to be used in the template
export const styles = `
  /* Modern styles with a professional networking theme */
  :host {
    display: block;
    background: #ffffff;
    border: 1px solid #e0e4e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 20px;
    margin: 15px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    border-radius: 12px;
    color: #2c3e50;
  }

  h2 {
    font-size: 1.5em;
    color: #2c3e50;
    margin: 0 0 10px 0;
  }

  .description {
    color: #5d6d7e;
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
    border: 1px solid #bdc3c7;
  }

  .control-group label:hover {
    color: #3498db;
  }

  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #bdc3c7;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
  }

  input[type="checkbox"]:checked {
    background-color: #3498db;
    border-color: #3498db;
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
    border-color: #3498db;
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
    background-color: #34495e;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 100;
    margin-bottom: 5px;
  }

  [title]:hover::after {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #34495e transparent transparent transparent;
  }

  .help-text {
    color: #7f8c8d;
    font-size: 0.9em;
    margin: 10px 0 0 0;
    text-align: center;
    font-style: italic;
  }

  input[type="text"] {
    padding: 8px 12px;
    border: 2px solid #e0e4e8;
    border-radius: 6px;
    font-size: 14px;
    width: 250px;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-right: 10px;
  }

  input[type="text"]:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    outline: none;
  }

  button {
    background-color: #3498db;
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
    background-color: #2980b9;
  }

  button:active {
    transform: translateY(1px);
  }

  label {
    font-size: 14px;
    font-weight: 500;
    margin-right: 8px;
    color: #34495e;
  }

  fieldset {
    border: 2px solid #e0e4e8;
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
    background-color: #f8fafc;
  }

  fieldset legend {
    font-weight: 600;
    color: #34495e;
    padding: 0 8px;
  }

  input[type="number"] {
    width: 50px;
    padding: 4px 8px;
    border: 1px solid #e0e4e8;
    border-radius: 4px;
    margin: 0 8px;
  }

  #trace-output-container {
    background-color: #f8fafc;
    border: 2px solid #e0e4e8;
    border-radius: 8px;
    padding: 15px;
    max-height: 300px;
    overflow: auto;
    font-family: 'Consolas', 'DejaVu Sans Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
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
    color: #34495e;
    margin-bottom: 5px;
    border-bottom: 1px solid #e0e4e8;
    padding-bottom: 5px;
  }

  fieldset {
    border: 2px solid #e0e4e8;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    background-color: #f8fafc;
    width: 100%;
    box-sizing: border-box;
  }

  fieldset legend {
    font-weight: 600;
    color: #34495e;
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
    background: #ffffff;
    box-sizing: border-box;
  }

  /* Medium screens (e.g. tablets) */
  @media (max-width: 1024px) {
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
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2px;
    cursor: pointer;
    user-select: none;
    justify-self: center;
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

  .node.user { background-color: #e3f2fd; border-color: #2196f3; }
  .node.router { background-color: #e8f5e9; border-color: #4caf50; }
  .node.destination { background-color: #f3e5f5; border-color: #9c27b0; }
  .node.error { background-color: #ffebee; border-color: #f44336; }

  .node.error {
    animation: errorPulse 2s infinite;
  }

  @keyframes errorPulse {
    0% { border-color: #f44336; }
    50% { border-color: #ff8a80; }
    100% { border-color: #f44336; }
  }

  .node-ip {
    font-size: 0.75em;
    color: #546e7a;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
  }

  .node-latency {
    font-size: 0.8em;
    font-weight: 600;
    color: #37474f;
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
    stroke: #78909c;
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
    background-color: #ffffff;
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
    background-color: #4caf50;
    border: 2px solid #2e7d32;
    border-radius: 6px;
    z-index: 10;
    transition: opacity 0.2s ease, transform 0.5s ease-in-out;
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
    background-color: #34495e;
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 0.9em;
    z-index: 1000; /* Increased z-index */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
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
  }

  /* Default arrow (pointing down) */
  #node-popover:not(.arrow-top)::after {
    top: 100%;
    border-color: #34495e transparent transparent transparent;
  }

  /* Arrow pointing up when popover is below the node */
  #node-popover.arrow-top::after {
    bottom: 100%;
    border-color: transparent transparent #34495e transparent;
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
    background-color: #ffffff;
    border-radius: 8px;
    font-size: 0.95em;
    color: #2c3e50;
    border: 1px solid #e0e4e8;
    width: 90%;
    max-width: 800px;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .analysis-section {
    background: #fff;
    border: 1px solid #e0e4e8;
    border-radius: 8px;
    overflow: hidden;
  }

  .analysis-section h4 {
    background: #f8fafc;
    margin: 0;
    padding: 12px 15px;
    border-bottom: 1px solid #e0e4e8;
    color: #2c3e50;
    font-weight: 600;
  }

  .analysis-content {
    padding: 15px;
    color: #34495e;
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
    border: 1px solid #e0e4e8;
    border-radius: 6px;
    margin: 10px 0;
    overflow: hidden;
  }

  .problem-header {
    background: #f8fafc;
    padding: 10px 15px;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 1px solid #e0e4e8;
  }

  .problem-details {
    padding: 15px;
    background: white;
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
    color: #4a5568;
  }

  .problem-details strong {
    color: #2c3e50;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    :host { padding: 15px; }
    input[type="text"] { width: 100%; margin-bottom: 10px; }
    button { width: 100%; }
    fieldset { padding: 10px; }
    .visualization { padding: 15px; }
    .node { min-width: 60px; padding: 4px 6px; }
  }
`;
