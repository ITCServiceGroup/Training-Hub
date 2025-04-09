// Visualization module for traceroute simulator

const SVG_NS = "http://www.w3.org/2000/svg";

export class Visualization {
  constructor(container, popoverElement) {
    this.container = container;
    this.popover = popoverElement;
    this.svgLayer = null; // To hold the SVG element
    this.resizeObserver = null; // To handle container resizing
    this.currentLayout = 'full'; // Track current layout size
    this.packetElement = null; // Persistent packet element
    this._createSvgLayer();
    this._setupResizeObserver();
    this._detectLayout();
  }

  // Detect current layout based on container width
  _detectLayout() {
    const width = this.container.offsetWidth;
    if (width > 1800) {
      this.currentLayout = 'full';
    } else if (width > 1600) {
      this.currentLayout = 'mid';
    } else {
      this.currentLayout = 'small';
    }
  }

  // Check if current hop requires a skip in animation
  _isSkipPoint(hopIndex) {
    if (this.currentLayout === 'full') {
      return false;
    } else if (this.currentLayout === 'mid') {
      return hopIndex === 5; // Skip after Hop 5
    } else { // small layout
      return hopIndex === 2 || hopIndex === 5 || hopIndex === 8; // Skip after Hops 2, 5, and 8
    }
  }

  // Get the next hop index after a skip
  _getNextHopAfterSkip(currentHopIndex) {
    if (this.currentLayout === 'mid') {
      return currentHopIndex === 5 ? 6 : currentHopIndex + 1;
    } else { // small layout
      if (currentHopIndex === 2) return 3;
      if (currentHopIndex === 5) return 6;
      if (currentHopIndex === 8) return 9;
      return currentHopIndex + 1;
    }
  }

  // Create the SVG layer for drawing lines
  _createSvgLayer() {
    // Remove any existing SVG layer
    if (this.svgLayer) {
      this.svgLayer.remove();
    }

    this.svgLayer = document.createElementNS(SVG_NS, "svg");
    this.svgLayer.classList.add('connector-svg-layer');

    // Ensure the container has relative positioning
    this.container.style.position = 'relative';

    // Insert SVG as first child so nodes appear above it
    this.container.insertBefore(this.svgLayer, this.container.firstChild);

    // Set initial size
    this._updateSvgSize();
  }

  _updateSvgSize() {
    if (!this.svgLayer) return;

    const rect = this.container.getBoundingClientRect();
    this.svgLayer.style.width = `${rect.width}px`;
    this.svgLayer.style.height = `${rect.height}px`;
    this.svgLayer.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  // Setup ResizeObserver to redraw lines on container resize
  _setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateConnectorLines();
    });
    this.resizeObserver.observe(this.container);
  }

  // Cleanup observer when visualization is no longer needed (if applicable)
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // Any other cleanup
  }


  // Create a node element for the visualization
  createNodeElement(title, type, ip) {
    const node = document.createElement('div');
    node.classList.add('node', type);
    // Store IP address as a data attribute for potential future use
    if (ip) {
      node.dataset.ip = ip;
    }
    node.innerHTML = `
      <div>${title}</div>
      <div class="node-latency" style="visibility: hidden;">--- ms</div>
    `;
    // Add click listener for details popup
    node.addEventListener('click', (e) => this.showHopDetails(e.currentTarget));
    return node;
  }

  // Draw the initial network path
  drawInitialPath(tracePath, targetInput) {
    this.container.innerHTML = '';

    // Create SVG layer first
    this._createSvgLayer();

    // Add User Device Node
    const userNode = this.createNodeElement('Your Device', 'user', 'N/A');
    this.container.appendChild(userNode);

    // Add Router/Hop Nodes
    tracePath.forEach((hop, index) => {
      if (hop.ip !== 'Destination Reached') {
        const hopNode = this.createNodeElement(`Hop ${index + 1}`, 'router', hop.ip);
        hopNode.dataset.hopIndex = index;
        this.container.appendChild(hopNode);
      } else {
        // Add Destination Node
        const destNode = this.createNodeElement('Destination', 'destination', targetInput);
        this.container.appendChild(destNode);
      }
    });

    // Delay drawing lines until nodes are fully rendered and positioned
    setTimeout(() => {
      this._updateSvgSize();
      this.updateConnectorLines();
    }, 50);
  }

  // Update the SVG lines connecting the nodes
  updateConnectorLines() {
    if (!this.svgLayer) return;

    // Update SVG size first
    this._updateSvgSize();

    // Clear existing lines
    this.svgLayer.innerHTML = '';

    const nodes = Array.from(this.container.querySelectorAll('.node'));
    if (nodes.length < 2) return;

    // Get container bounds once
    const containerRect = this.container.getBoundingClientRect();

    // Detect layout to handle special cases
    this._detectLayout();

    // Process nodes in pairs
    for (let i = 0; i < nodes.length - 1; i++) {
      const startNode = nodes[i];
      const endNode = nodes[i + 1];

      const startRect = startNode.getBoundingClientRect();
      const endRect = endNode.getBoundingClientRect();

      // Calculate center points
      const startX = startRect.right - containerRect.left;
      const startY = startRect.top - containerRect.top + (startRect.height / 2);
      const endX = endRect.left - containerRect.left;
      const endY = endRect.top - containerRect.top + (endRect.height / 2);

      // Check if nodes are in the same row (within 2px tolerance)
      const inSameRow = Math.abs(startRect.top - endRect.top) <= 2;

      // Special cases for first and last nodes
      const isFirstNode = i === 0;
      const isLastPair = i === nodes.length - 2;

      // Always draw lines, even for row transitions
      if (inSameRow) {
        // Create horizontal line
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.classList.add('connector-line');
        this.svgLayer.appendChild(line);
      } else if (isFirstNode || isLastPair) {
        // Create a path for diagonal connector line for first and last transitions
        const path = document.createElementNS(SVG_NS, 'path');

        // Calculate control points for a curved path
        const midX = (startX + endX) / 2;

        // Create a curved path
        const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

        path.setAttribute('d', d);
        path.classList.add('connector-line');
        this.svgLayer.appendChild(path);
      }
      // No lines for other row transitions
    }

    // Update SVG viewBox to ensure lines are visible
    requestAnimationFrame(() => {
      const box = this.container.getBoundingClientRect();
      this.svgLayer.setAttribute('width', box.width);
      this.svgLayer.setAttribute('height', box.height);
    });
  }


  // Update visualization for a specific hop
  updateNode(hopNumber, hopData) {
    const hopIndex = hopNumber - 1;
    const nodeToUpdate = this.container.querySelector(`.node[data-hop-index="${hopIndex}"]`);

    if (nodeToUpdate) {
      const latencyEl = nodeToUpdate.querySelector('.node-latency');
      latencyEl.style.visibility = 'visible';
      latencyEl.classList.remove('high', 'timeout');
      nodeToUpdate.classList.remove('error');

      if (hopData.latency === -1) {
        latencyEl.textContent = 'Timeout (*)';
        latencyEl.classList.add('timeout');
        nodeToUpdate.classList.add('error');
      } else {
        latencyEl.textContent = `${hopData.latency} ms`;
        if (hopData.injectedProblem === 'latency') {
          latencyEl.classList.add('high');
          nodeToUpdate.classList.add('error');
        }
      }
    }
  }

  // Animate a packet moving between nodes
  animatePacket(targetHopIndex, duration) {
    this._detectLayout(); // Update layout detection

    const nodes = this.container.querySelectorAll('.node');
    if (nodes.length <= targetHopIndex + 1) return;

    const startNode = nodes[targetHopIndex];
    const endNode = nodes[targetHopIndex + 1];

    if (!startNode || !endNode) return;

    // Get the bounds relative to the container
    const containerRect = this.container.getBoundingClientRect();
    const startRect = startNode.getBoundingClientRect();
    const endRect = endNode.getBoundingClientRect();

    // Calculate center positions relative to container
    const startX = startRect.left - containerRect.left + startRect.width / 2;
    const startY = startRect.top - containerRect.top + (startRect.height / 2);
    const endX = endRect.left - containerRect.left + endRect.width / 2;
    const endY = endRect.top - containerRect.top + (endRect.height / 2);

    // Check if nodes are in the same row based on their vertical position
    // Use a larger tolerance to account for minor layout variations
    const inSameRow = Math.abs(startRect.top - endRect.top) <= 10;

    // Check if this is a special case for row transitions in different layouts
    const isRowTransition =
      (this.currentLayout === 'mid' && targetHopIndex === 5) ||
      (this.currentLayout === 'small' && (targetHopIndex === 2 || targetHopIndex === 5 || targetHopIndex === 8));

    // Check if we need to handle a row transition with skip
    if (!inSameRow && this._isSkipPoint(targetHopIndex)) {
      const nextHop = this._getNextHopAfterSkip(targetHopIndex);
      return { skipToHop: nextHop };
    }

    // Create or reuse the packet element
    if (!this.packetElement) {
      this.packetElement = document.createElement('div');
      this.packetElement.classList.add('packet', 'persistent');
      this.packetElement.style.zIndex = '100'; // Ensure packet is above all other elements
      this.packetElement.style.opacity = '1'; // Always visible
      this.packetElement.style.transition = 'none'; // Remove default transitions
      this.packetElement.style.backgroundColor = '#4caf50'; // Ensure color is set
      this.packetElement.style.border = '2px solid #2e7d32'; // Ensure border is set
      this.packetElement.style.borderRadius = '6px'; // Ensure rounded corners
      this.container.appendChild(this.packetElement);
    }

    // Make sure the packet is visible
    this.packetElement.style.opacity = '1';

    // Reset any previous transforms and transitions
    this.packetElement.style.transition = 'none';
    this.packetElement.style.transform = 'none';

    // Position packet at start center
    this.packetElement.style.left = `${startX}px`;
    this.packetElement.style.top = `${startY}px`;

    // Force a reflow to ensure the transition reset takes effect
    void this.packetElement.offsetWidth;

    // For row transitions, use a faster direct movement
    if (isRowTransition) {
      // Set up a quick transition for row transitions
      const transitionDuration = duration / 2;

      // Use direct DOM manipulation for the transition
      setTimeout(() => {
        // Apply transition for smooth movement
        this.packetElement.style.transition = `left ${transitionDuration}ms linear, top ${transitionDuration}ms linear`;

        // Move to end position
        this.packetElement.style.left = `${endX}px`;
        this.packetElement.style.top = `${endY}px`;
      }, 10); // Small delay to ensure the transition is applied

      // Return null to indicate no skip needed
      return null;
    }

    // For normal transitions, animate the packet smoothly
    // Apply the appropriate transition based on whether it's same row or not
    if (inSameRow) {
      // Set up transition for horizontal movement
      this.packetElement.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

      // Start animation in next frame
      requestAnimationFrame(() => {
        // Horizontal movement only
        this.packetElement.style.transform = `translateX(${endX - startX}px)`;
      });
    } else {
      // Set up transition for curved path
      this.packetElement.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), top ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

      // Start animation in next frame
      requestAnimationFrame(() => {
        // Curved path animation
        this.packetElement.style.transform = `translateX(${endX - startX}px)`;
        this.packetElement.style.top = `${endY}px`;
      });
    }

    // Return null to indicate no skip needed
    return null;
  }

  // Show hop details in popover
  showHopDetails(nodeElement) {
    const hopIndex = nodeElement.dataset.hopIndex;
    if (hopIndex === undefined) return;

    const hopData = this.hopData?.[hopIndex];
    if (!hopData || hopData.ip === 'Destination Reached') return;

    let status = 'Normal';
    let note = 'Responded normally.';
    let subsequentHopsOk = false;

    if (hopData.latency === -1) {
      status = 'Timeout';

      for (let i = Number(hopIndex) + 1; i < this.hopData?.length - 1; i++) {
        if (this.hopData[i] && this.hopData[i].injectedProblem !== 'unreachable') {
          subsequentHopsOk = true;
          break;
        }
      }

      const hopType = hopData.type || 'Unknown Router';
      if (hopType.includes('Local')) {
        note = 'Timeout at your local router. Check router/modem.';
      } else if (hopType.includes('ISP')) {
        note = subsequentHopsOk
          ? 'Timeout at ISP router, but trace continued. May be normal for this device or intermittent loss.'
          : 'Consistent timeouts starting at ISP suggest potential connection issue.';
      } else if (hopType.includes('Backbone') || hopType.includes('IXP') || hopType.includes('Edge')) {
        note = subsequentHopsOk
          ? 'Timeout at core internet router is common and often doesn\'t indicate a problem if trace continues.'
          : 'Consistent timeouts starting here suggest a potential network issue further out.';
      } else {
        note = subsequentHopsOk
          ? 'Timeout at this hop near the destination, but trace continued (unlikely in real trace).'
          : 'Timeout near/at destination network suggests a problem reaching the server.';
      }
    } else if (hopData.injectedProblem === 'latency') {
      status = 'High Latency';
      note = 'Response time is significantly higher than expected for this hop.';
    }

    this.popover.innerHTML = `
      <div><strong>Type:</strong> ${hopData.type || 'Unknown'}</div>
      <div><strong>Status:</strong> ${status}</div>
      <div><strong>Note:</strong> ${note}</div>
    `;

    // Get node's position relative to viewport
    const nodeRect = nodeElement.getBoundingClientRect();
    const popoverRect = this.popover.getBoundingClientRect();

    // Calculate position above the node
    let popoverTop = nodeRect.top - popoverRect.height - 10;
    let popoverLeft = nodeRect.left + (nodeRect.width / 2) - (popoverRect.width / 2);

    // Ensure popover stays within viewport
    if (popoverTop < 10) {
      // If not enough space above, show below
      popoverTop = nodeRect.bottom + 10;
      // Adjust arrow to point upward
      this.popover.classList.add('arrow-top');
    } else {
      this.popover.classList.remove('arrow-top');
    }

    // Prevent horizontal overflow
    popoverLeft = Math.max(10, Math.min(popoverLeft, window.innerWidth - popoverRect.width - 10));

    this.popover.style.top = `${popoverTop}px`;
    this.popover.style.left = `${popoverLeft}px`;
    this.popover.classList.add('visible');
  }

  // Hide hop details popover
  hideHopDetails() {
    this.popover.classList.remove('visible');
  }

  // Set hop data for popover details
  setHopData(hopData) {
    this.hopData = hopData;
  }

  // Reset visualization state
  reset() {
    // Reset the persistent packet element if it exists
    if (this.packetElement) {
      // Just reset position and transitions, but don't hide it
      this.packetElement.style.transform = 'none';
      this.packetElement.style.transition = 'none';
      this.packetElement.style.left = '0';
      this.packetElement.style.top = '0';

      // Remove the element from DOM temporarily
      // We'll recreate it on the next animation
      this.packetElement.remove();
      this.packetElement = null;
    }

    // Clear any other remaining packets (just in case)
    const existingPackets = this.container.querySelectorAll('.packet:not(.persistent)');
    existingPackets.forEach(packet => packet.remove());

    // Hide popover if visible
    this.hideHopDetails();

    // Reset node states
    const nodes = this.container.querySelectorAll('.node');
    nodes.forEach(node => {
      const latencyEl = node.querySelector('.node-latency');
      if (latencyEl) {
        latencyEl.style.visibility = 'hidden';
        latencyEl.textContent = '--- ms';
        latencyEl.classList.remove('high', 'timeout');
      }
      node.classList.remove('error');
    });
  }
}
