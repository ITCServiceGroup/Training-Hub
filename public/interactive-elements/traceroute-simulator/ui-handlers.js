// UI handlers module for traceroute simulator

export class UiHandlers {
  constructor(container, simulation, visualization) {
    this.container = container;
    this.simulation = simulation;
    this.visualization = visualization;
    this.initializeElements();
  }

  // Get references to UI elements
  initializeElements() {
    this.runButton = this.container.getElementById('run-button');
    this.targetInput = this.container.getElementById('target-input');
    this.outputContainer = this.container.getElementById('trace-output-container');
    this.traceSummary = this.container.getElementById('trace-summary');
    this.injectLatencyCb = this.container.getElementById('inject-latency-cb');
    this.latencyHopNum = this.container.getElementById('latency-hop-num');
    this.injectLossCb = this.container.getElementById('inject-loss-cb');
    this.lossHopNum = this.container.getElementById('loss-hop-num');
    this.injectUnreachableCb = this.container.getElementById('inject-unreachable-cb');
  }

  // Setup event listeners
  setupEventListeners() {
    // Run button click handler
    this.runButton.addEventListener('click', () => this.startTrace());

    // Click outside nodes to hide popover
    this.container.addEventListener('click', (e) => {
      if (!e.target.closest('.node') && !e.target.closest('#node-popover')) {
        this.visualization.hideHopDetails();
      }
    });
  }

  // Start a new trace
  startTrace() {
    if (this.simulation.isSimulationRunning()) {
      // Reset state if already running
      this.simulation.reset();
      this.visualization.reset();
    }

    // Clear previous results
    this.outputContainer.innerHTML = '';
    this.traceSummary.textContent = '';
    this.traceSummary.style.display = 'none';

    // Reset any previous state
    this.simulation.reset();
    this.visualization.reset();

    // Add starting message
    const startMsgDiv = document.createElement('div');
    startMsgDiv.classList.add('trace-message');
    startMsgDiv.textContent = `Tracing route to ${this.targetInput.value || 'destination'}...`;
    this.outputContainer.appendChild(startMsgDiv);

    // Add header row
    this.addHeaderRow();

    // Initialize trace
    const tracePath = this.simulation.initializeTrace(this.targetInput.value);

    // Apply problem injections
    this.simulation.applyProblemInjections(
      this.injectLatencyCb.checked,
      parseInt(this.latencyHopNum.value, 10),
      this.injectLossCb.checked,
      parseInt(this.lossHopNum.value, 10),
      this.injectUnreachableCb.checked
    );

    // Draw initial visualization
    this.visualization.drawInitialPath(tracePath, this.targetInput.value);
    this.visualization.setHopData(tracePath);

    // Start the animation
    this.animateNextHop();
  }

  // Add header row to output
  addHeaderRow() {
    const headerRow = document.createElement('div');
    headerRow.classList.add('trace-row', 'trace-header-row');
    const headers = ['Hop', 'RTT 1', 'RTT 2', 'RTT 3', '', 'Address'];
    const headerClasses = [
      'trace-col-hop',
      'trace-col-time',
      'trace-col-time',
      'trace-col-time',
      'trace-col-sep',
      'trace-col-ip'
    ];

    headers.forEach((text, index) => {
      const headerSpan = document.createElement('span');
      headerSpan.classList.add(headerClasses[index]);
      if (headerClasses[index] !== 'trace-col-sep') {
        headerSpan.textContent = text;
      }
      headerRow.appendChild(headerSpan);
    });

    this.outputContainer.appendChild(headerRow);
  }

  // Create and append a row for hop data
  createHopRow(hopNumber, hopData, responses) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('trace-row');

    // Hop number
    const hopSpan = document.createElement('span');
    hopSpan.classList.add('trace-col-hop');
    hopSpan.textContent = String(hopNumber);
    rowDiv.appendChild(hopSpan);

    if (responses.timeout) {
      // Add timeout spans
      for (let i = 0; i < 3; i++) {
        const timeoutSpan = document.createElement('span');
        timeoutSpan.classList.add('trace-col-time');
        timeoutSpan.textContent = '*';
        rowDiv.appendChild(timeoutSpan);
      }

      // Separator
      const sepSpan = document.createElement('span');
      sepSpan.classList.add('trace-col-sep');
      sepSpan.textContent = '│';
      rowDiv.appendChild(sepSpan);

      // Timeout message
      const timeoutMsgSpan = document.createElement('span');
      timeoutMsgSpan.classList.add('trace-col-timeout');
      timeoutMsgSpan.textContent = 'Request timed out.';
      rowDiv.appendChild(timeoutMsgSpan);
    } else {
      // Add response time spans
      responses.times.forEach(time => {
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('trace-col-time');
        timeSpan.textContent = time;
        rowDiv.appendChild(timeSpan);
      });

      // Separator
      const sepSpan = document.createElement('span');
      sepSpan.classList.add('trace-col-sep');
      sepSpan.textContent = '│';
      rowDiv.appendChild(sepSpan);

      // IP address
      const ipSpan = document.createElement('span');
      ipSpan.classList.add('trace-col-ip');
      ipSpan.textContent = hopData.ip;
      rowDiv.appendChild(ipSpan);
    }

    return rowDiv;
  }

  // Animate next hop in the trace
  animateNextHop() {
    if (this.simulation.isTraceComplete()) {
      this.onTraceComplete();
      return;
    }

    const hopData = this.simulation.getHopData(this.simulation.getCurrentHop());
    const hopNumber = this.simulation.getCurrentHop() + 1;

    // Animate packet
    const animationDuration = 500;
    const animationResult = this.visualization.animatePacket(
      this.simulation.getCurrentHop(),
      animationDuration
    );

    // Check if we need to skip to a new hop
    if (animationResult && animationResult.skipToHop !== undefined) {
      const currentHop = this.simulation.getCurrentHop();
      const skipToHop = animationResult.skipToHop;

      // Process the current hop first
      const currentHopData = this.simulation.getHopData(currentHop);
      if (currentHopData && currentHopData.ip !== 'Destination Reached') {
        const responses = this.simulation.simulateHopResponses(currentHopData);
        const rowDiv = this.createHopRow(currentHop + 1, currentHopData, responses);
        this.outputContainer.appendChild(rowDiv);
        this.visualization.updateNode(currentHop + 1, currentHopData);
        this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
      }

      // Process any intermediate hops
      for (let i = currentHop + 1; i < skipToHop; i++) {
        const skipHopData = this.simulation.getHopData(i);
        if (skipHopData && skipHopData.ip !== 'Destination Reached') {
          const responses = this.simulation.simulateHopResponses(skipHopData);
          const rowDiv = this.createHopRow(i + 1, skipHopData, responses);
          this.outputContainer.appendChild(rowDiv);
          this.visualization.updateNode(i + 1, skipHopData);
          this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
        }
      }

      // Update simulation state to new position
      this.simulation.setCurrentHop(skipToHop);

      // Continue simulation after a short delay
      setTimeout(() => {
        this.animateNextHop();
      }, 100);
      return;
    }

    // Normal animation delay
    const responseDelay = Math.max(
      animationDuration + 100,
      hopData.latency > 0 ? hopData.latency + 50 : 1000
    );

    setTimeout(() => {
      // Update visualization
      this.visualization.updateNode(hopNumber, hopData);

      // Skip destination reached marker
      if (hopData.ip === 'Destination Reached') {
        this.simulation.incrementHop();
        this.animateNextHop();
        return;
      }

      // Simulate responses
      const responses = this.simulation.simulateHopResponses(hopData);

      // Create and append row
      const rowDiv = this.createHopRow(hopNumber, hopData, responses);
      this.outputContainer.appendChild(rowDiv);
      this.outputContainer.scrollTop = this.outputContainer.scrollHeight;

      // Continue or stop based on conditions
      this.simulation.incrementHop();
      if (hopData.injectedProblem !== 'unreachable') {
        this.animateNextHop();
      } else {
        this.onUnreachableDestination(hopNumber, hopData);
      }
    }, responseDelay);
  }

  // Handle trace completion
  onTraceComplete() {
    const stats = this.simulation.calculateStats();
    this.displayDetailedAnalysis(stats);
    this.simulation.reset();
  }

  // Handle unreachable destination
  onUnreachableDestination(hopNumber, hopData) {
    const stats = this.simulation.calculateStats();
    this.displayDetailedAnalysis(stats);
    this.simulation.reset();
  }

  // Display detailed analysis
  displayDetailedAnalysis(stats) {
    // Clear previous summary
    this.traceSummary.innerHTML = '';
    this.traceSummary.style.display = 'block';

    // Create overview section
    const overviewSection = this.createAnalysisSection('Traceroute Overview');
    const segments = this.formatPathSegments(stats.networkSegments);
    overviewSection.innerHTML = `
      <div class="analysis-content">
        <p>Total Hops: ${stats.totalHops}</p>
        <p>Path Segments:</p>
        <ul>
          ${segments.map(seg => `<li>${seg}</li>`).join('')}
        </ul>
      </div>
    `;
    this.traceSummary.appendChild(overviewSection);

    // Create performance section
    const perfSection = this.createAnalysisSection('Network Performance');
    perfSection.innerHTML = `
      <div class="analysis-content">
        <p>Average RTT: ${stats.avgLatency}ms ${this.getRttAssessment(stats.avgLatency)}</p>
        <p>Packet Loss: ${stats.timeouts} hops affected</p>
        <p>High Latency: ${stats.highLatencyHops} hops affected</p>
      </div>
    `;
    this.traceSummary.appendChild(perfSection);

    // Display problems if any exist
    if (stats.problems.length > 0) {
      const problemsSection = this.createAnalysisSection('Issues Detected');
      stats.problems.forEach(problem => {
        const problemDiv = document.createElement('div');
        problemDiv.classList.add('problem-analysis');
        problemDiv.innerHTML = this.formatProblemAnalysis(problem.message);
        problemsSection.appendChild(problemDiv);
      });
      this.traceSummary.appendChild(problemsSection);
    }

    // Apply styles
    this.applyAnalysisStyles();
  }

  // Create a section for analysis
  createAnalysisSection(title) {
    const section = document.createElement('div');
    section.classList.add('analysis-section');
    const header = document.createElement('h4');
    header.textContent = title;
    section.appendChild(header);
    return section;
  }

  // Format path segments information
  formatPathSegments(segments) {
    const results = [];
    if (segments.local.count > 0) {
      results.push(`Local Network: ${segments.local.count} hops (avg ${segments.local.avgLatency}ms)`);
    }
    if (segments.isp.count > 0) {
      results.push(`ISP Network: ${segments.isp.count} hops (avg ${segments.isp.avgLatency}ms)`);
    }
    if (segments.backbone.count > 0) {
      results.push(`Internet Backbone: ${segments.backbone.count} hops (avg ${segments.backbone.avgLatency}ms)`);
    }
    if (segments.destination.count > 0) {
      results.push(`Destination Network: ${segments.destination.count} hops (avg ${segments.destination.avgLatency}ms)`);
    }
    return results;
  }

  // Format problem analysis
  formatProblemAnalysis(message) {
    return `
      <div class="problem-header">${message.title}</div>
      <div class="problem-details">
        ${message.details ? `<p>${message.details}</p>` : ''}
        <p><strong>Analysis:</strong> ${message.analysis}</p>
        <p><strong>Impact:</strong> ${message.impact}</p>
        <p><strong>Possible Causes:</strong></p>
        <ul>
          ${message.causes.map(cause => `<li>${cause}</li>`).join('')}
        </ul>
        <p><strong>Recommendation:</strong> ${message.recommendation}</p>
      </div>
    `;
  }

  // Get RTT assessment
  getRttAssessment(avgLatency) {
    if (avgLatency < 50) return '(Excellent)';
    if (avgLatency < 100) return '(Good)';
    if (avgLatency < 200) return '(Fair)';
    return '(Poor)';
  }

  // Apply styles to analysis sections
  applyAnalysisStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .analysis-section {
        margin-bottom: 20px;
        padding: 15px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .analysis-section h4 {
        margin: 0 0 10px 0;
        color: var(--text-color);
        font-size: 1.1em;
        font-weight: 600;
      }
      .analysis-content {
        color: var(--text-color);
        font-size: 0.95em;
        line-height: 1.5;
      }
      .analysis-content ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      .problem-analysis {
        margin: 10px 0;
        border: 1px solid var(--border-color);
        border-radius: 4px;
      }
      .problem-header {
        padding: 8px 12px;
        background: var(--fieldset-bg);
        border-bottom: 1px solid var(--border-color);
        font-weight: 600;
        color: var(--text-color);
      }
      .problem-details {
        padding: 12px;
        background: var(--bg-color);
        color: var(--text-color);
      }
      .problem-details p {
        margin: 8px 0;
      }
      .problem-details ul {
        margin: 5px 0;
        padding-left: 25px;
      }
    `;
    this.container.appendChild(style);
  }
}
