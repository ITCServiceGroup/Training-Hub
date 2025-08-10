// Import CSS styles
import { styles } from './styles.js';

// Create and export the template
export const template = document.createElement('template');
template.innerHTML = `
  <style>
    ${styles}
  </style>

  <div class="simulator-container">
    <div class="controls">
      <h2>Traceroute Analyzer</h2>
      <p class="description">Visualize and analyze the network path between your device and a destination server.</p>
      
      <div class="input-group">
        <label for="target-input">Destination Address:</label>
        <input type="text" 
               id="target-input" 
               placeholder="e.g., www.example.com" 
               value="www.example.com"
               title="Enter the domain or IP address to trace">
        <button id="run-button" title="Start the traceroute analysis">Analyze Path</button>
      </div>

      <fieldset id="problem-injection">
        <legend>Network Conditions Simulator</legend>
        <p class="description">Simulate common network issues to understand their impact on connectivity.</p>
        
        <div class="problem-controls">
          <div class="control-group">
            <label title="Simulate network congestion at a specific hop">
              <input type="checkbox" id="inject-latency-cb">
              High Latency at Hop #
              <input type="number"
                     id="latency-hop-num"
                     value="2"
                     min="1"
                     max="10"
                     title="Select which hop will experience high latency"
                     onclick="event.stopPropagation();">
            </label>
          </div>

          <div class="control-group">
            <label title="Simulate packet loss at a specific hop">
              <input type="checkbox" id="inject-loss-cb">
              Packet Loss at Hop #
              <input type="number"
                     id="loss-hop-num"
                     value="3"
                     min="1"
                     max="10"
                     title="Select which hop will experience packet loss"
                     onclick="event.stopPropagation();">
            </label>
          </div>

          <div class="control-group">
            <label title="Simulate destination unreachable at a specific hop">
              <input type="checkbox" id="inject-unreachable-cb">
              Destination Unreachable at Hop #
              <input type="number"
                     id="unreachable-hop-num"
                     value="5"
                     min="1"
                     max="10"
                     title="Select which hop will return destination unreachable"
                     onclick="event.stopPropagation();">
            </label>
          </div>
        </div>
      </fieldset>
    </div>

    <fieldset class="visualization">
      <legend>Traceroute Visualization</legend>
      <div id="vis-container"></div>
      <div id="node-popover"></div>
      <p class="help-text">Click on any node to view detailed information about that hop.</p>
    </fieldset>

    <fieldset class="output">
      <legend>Analysis Results</legend>
      <div id="trace-output-container">
         <div class="trace-message">Click "Analyze Path" to begin the traceroute analysis...</div>
      </div>
      <div id="trace-summary" style="display: none;"></div>
    </fieldset>
  </div>
`;
