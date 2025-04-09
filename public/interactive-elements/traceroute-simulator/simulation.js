// Simulation module for traceroute simulator

export class Simulation {
  constructor() {
    // Initial state
    this.isRunning = false;
    this.currentHop = 0;
    this.tracePath = [];
  }

  // Get a sample path for simulation
  getSamplePath(target) {
    console.log(`[Simulation] Getting sample path for ${target}`);
    // Extended path with more realistic latency and types
    let path = [
      { ip: '192.168.1.1', latency: 1 + Math.random() * 2, type: 'Local Router' },
      { ip: '10.0.5.1', latency: 8 + Math.random() * 5, type: 'ISP Router (Local POP)' },
      { ip: '68.86.85.1', latency: 12 + Math.random() * 8, type: 'ISP Network Router' },
      { ip: '192.205.37.1', latency: 20 + Math.random() * 10, type: 'Internet Exchange Point (IXP)' },
      { ip: '173.194.1.10', latency: 25 + Math.random() * 10, type: 'Tier 1 Backbone Router' },
      { ip: '209.85.248.1', latency: 30 + Math.random() * 12, type: 'Tier 1 Backbone Router' },
      { ip: '72.14.233.1', latency: 35 + Math.random() * 15, type: 'Large Network Edge (e.g., Google)' },
      { ip: '108.170.253.193', latency: 38 + Math.random() * 10, type: 'Destination Network Router' },
      { ip: '142.250.4.15', latency: 40 + Math.random() * 8, type: 'Destination Server Network' },
      { ip: '172.217.160.142', latency: 42 + Math.random() * 5, type: 'Destination Server' },
    ];

    // Add the final 'Destination Reached' marker, using latency similar to the last real hop
    const lastHopLatency = path.length > 0 ? path[path.length - 1].latency : 30;
    path.push({ ip: 'Destination Reached', latency: lastHopLatency + Math.random() * 2 });

    // Round latencies for display
    return path.map(hop => ({ ...hop, latency: Math.round(hop.latency) }));
  }

  // Apply network problem injections
  applyProblemInjections(injectLatency, latencyHopNum, injectLoss, lossHopNum, injectUnreachable) {
    console.log('[Simulation] Applying problem injections...');

    if (injectLatency) {
      const hopIndex = latencyHopNum - 1;
      if (hopIndex >= 0 && hopIndex < this.tracePath.length - 1) {
        this.tracePath[hopIndex].latency = Math.max(200, this.tracePath[hopIndex].latency + 180);
        this.tracePath[hopIndex].injectedProblem = 'latency';
        console.log(`[Simulation] Injected high latency at hop ${hopIndex + 1}`);
      }
    }

    if (injectLoss) {
      const hopIndex = lossHopNum - 1;
      if (hopIndex >= 0 && hopIndex < this.tracePath.length - 1) {
        this.tracePath[hopIndex].latency = -1;
        this.tracePath[hopIndex].injectedProblem = 'loss';
        console.log(`[Simulation] Injected packet loss at hop ${hopIndex + 1}`);
      }
    }

    if (injectUnreachable) {
      const cutOffPoint = Math.max(1, Math.floor(this.tracePath.length / 2));
      this.tracePath = this.tracePath.slice(0, cutOffPoint);
      this.tracePath[this.tracePath.length - 1].latency = -1;
      this.tracePath[this.tracePath.length - 1].injectedProblem = 'unreachable';
      console.log(`[Simulation] Simulating unreachable destination after hop ${cutOffPoint}`);
    }
  }

  // Calculate statistics and analyze the trace
  calculateStats() {
    let avgLatency = 0;
    let timeouts = 0;
    let highLatencyHops = 0;
    let networkSegments = {
      local: { count: 0, latency: 0 },
      isp: { count: 0, latency: 0 },
      backbone: { count: 0, latency: 0 },
      destination: { count: 0, latency: 0 }
    };
    let problems = [];

    // Process all hops except the final marker
    this.tracePath.slice(0, -1).forEach((hop, index) => {
      // Categorize hop by network segment
      let segment = 'backbone';
      if (index === 0) segment = 'local';
      else if (hop.type?.toLowerCase().includes('isp')) segment = 'isp';
      else if (hop.type?.toLowerCase().includes('destination')) segment = 'destination';

      // Track latency and problems
      if (hop.latency === -1) {
        timeouts++;
        problems.push({
          type: 'timeout',
          hop: index + 1,
          hopData: hop,
          message: this.getTimeoutAnalysis(hop, index + 1)
        });
      } else {
        avgLatency += hop.latency;
        networkSegments[segment].latency += hop.latency;
        networkSegments[segment].count++;

        if (hop.injectedProblem === 'latency') {
          highLatencyHops++;
          problems.push({
            type: 'latency',
            hop: index + 1,
            hopData: hop,
            message: this.getLatencyAnalysis(hop, index + 1)
          });
        }
      }

      // Check for unreachable
      if (hop.injectedProblem === 'unreachable') {
        problems.push({
          type: 'unreachable',
          hop: index + 1,
          hopData: hop,
          message: this.getUnreachableAnalysis(hop, index + 1)
        });
      }
    });

    // Calculate averages
    Object.keys(networkSegments).forEach(segment => {
      if (networkSegments[segment].count > 0) {
        networkSegments[segment].avgLatency = 
          Math.round(networkSegments[segment].latency / networkSegments[segment].count);
      }
    });

    const validHops = this.tracePath.length - timeouts - 1;
    avgLatency = validHops > 0 ? avgLatency / validHops : 0;

    return {
      totalHops: this.tracePath.length - 1,
      avgLatency: Math.round(avgLatency),
      timeouts,
      highLatencyHops,
      networkSegments,
      problems,
      path: this.getPathAnalysis()
    };
  }

  // Generate detailed path analysis
  getPathAnalysis() {
    const segments = [];
    let currentSegment = null;

    this.tracePath.forEach((hop, index) => {
      if (hop.type && hop.type !== currentSegment?.type) {
        currentSegment = {
          type: hop.type,
          startHop: index + 1,
          hops: [hop]
        };
        segments.push(currentSegment);
      } else if (currentSegment) {
        currentSegment.hops.push(hop);
      }
    });

    return segments;
  }

  // Generate analysis for latency issues
  getLatencyAnalysis(hop, hopNumber) {
    const expectedLatency = this.getExpectedLatency(hop.type);
    const latencyIncrease = Math.round((hop.latency / expectedLatency) * 100 - 100);
    
    return {
      title: `High Latency Detected at Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      details: `RTT: ${hop.latency}ms (Expected: ~${expectedLatency}ms)`,
      analysis: `This ${hop.type.toLowerCase()} is showing unusually high latency, ${latencyIncrease}% above expected values.`,
      impact: this.getLatencyImpactDescription(hop.latency),
      causes: this.getLatencyCauses(hop.type),
      recommendation: this.getLatencyRecommendation(hop.type)
    };
  }

  // Get expected latency based on hop type
  getExpectedLatency(type) {
    const baselines = {
      'Local Router': 5,
      'ISP Router (Local POP)': 15,
      'ISP Network Router': 25,
      'Internet Exchange Point (IXP)': 30,
      'Tier 1 Backbone Router': 40,
      'Large Network Edge': 45,
      'Destination Network Router': 50,
      'Destination Server Network': 55,
      'Destination Server': 60
    };
    return baselines[type] || 30;
  }

  // Generate analysis for timeout issues
  getTimeoutAnalysis(hop, hopNumber) {
    return {
      title: `Packet Loss Detected at Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      analysis: `All probe packets were lost at this ${hop.type.toLowerCase()}.`,
      impact: "Connections through this hop will experience packet loss, leading to retransmissions and potential application timeouts.",
      causes: this.getTimeoutCauses(hop.type),
      recommendation: this.getTimeoutRecommendation(hop.type)
    };
  }

  // Generate analysis for unreachable destination
  getUnreachableAnalysis(hop, hopNumber) {
    return {
      title: `Destination Unreachable after Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      analysis: `Path terminated at the ${hop.type.toLowerCase()}.`,
      impact: "No further network path available to reach the destination.",
      causes: this.getUnreachableCauses(hop.type),
      recommendation: this.getUnreachableRecommendation(hop.type)
    };
  }

  // Helper methods for impact descriptions
  getLatencyImpactDescription(latency) {
    if (latency > 200) return "Severe impact: Users will experience very noticeable delays in all network operations.";
    if (latency > 100) return "Moderate impact: Real-time applications like video calls may be affected.";
    return "Minor impact: Slight delays in network operations may be noticeable.";
  }

  // Helper methods for problem causes
  getLatencyCauses(type) {
    const commonCauses = [
      "Network congestion during peak hours",
      "Hardware resource constraints",
      "Routing path inefficiencies"
    ];
    
    if (type.includes('ISP')) {
      return [...commonCauses, "ISP bandwidth throttling", "Last-mile congestion"];
    }
    if (type.includes('Backbone')) {
      return [...commonCauses, "Inter-region routing delays", "Backbone maintenance"];
    }
    return commonCauses;
  }

  getTimeoutCauses(type) {
    const commonCauses = [
      "Severe network congestion",
      "Hardware failures",
      "Configuration issues"
    ];

    if (type.includes('Exchange')) {
      return [...commonCauses, "Peering issues between networks", "Exchange point congestion"];
    }
    return commonCauses;
  }

  getUnreachableCauses(type) {
    if (type.includes('Edge') || type.includes('Destination')) {
      return [
        "Firewall blocking ICMP traffic",
        "Access Control Lists (ACLs)",
        "Network segment isolation"
      ];
    }
    return [
      "Network outage",
      "Routing configuration errors",
      "Security policies"
    ];
  }

  // Helper methods for recommendations
  getLatencyRecommendation(type) {
    if (type.includes('ISP')) {
      return "Monitor the pattern of high latency and consider reporting to ISP if persistent.";
    }
    if (type.includes('Backbone')) {
      return "This may indicate a larger network issue requiring attention from backbone providers.";
    }
    return "Continue monitoring and document the frequency of latency spikes.";
  }

  getTimeoutRecommendation(type) {
    if (type.includes('Exchange')) {
      return "This critical interconnection point requires immediate investigation by network operators.";
    }
    return "Investigate network capacity and hardware health at this hop.";
  }

  getUnreachableRecommendation(type) {
    if (type.includes('Edge') || type.includes('Destination')) {
      return "Verify ICMP/traceroute is allowed by destination network policies.";
    }
    return "Check for network outages or routing issues along this path.";
  }

  // Simulate response times for a hop
  simulateHopResponses(hopData) {
    if (hopData.latency === -1) {
      return {
        times: ['*', '*', '*'],
        timeout: true
      };
    }

    const times = [
      Math.max(1, hopData.latency - Math.random() * 5),
      Math.max(1, hopData.latency + Math.random() * 3),
      Math.max(1, hopData.latency)
    ].map(t => Math.round(t));

    return {
      times: times.map(t => `${t} ms`),
      timeout: false
    };
  }

  // Initialize a new trace
  initializeTrace(target) {
    this.isRunning = true;
    this.currentHop = 0;
    this.tracePath = this.getSamplePath(target);
    return this.tracePath;
  }

  // Reset the simulation
  reset() {
    // Save current path for cleanup
    const currentPath = [...this.tracePath];
    
    // Reset state
    this.isRunning = false;
    this.currentHop = 0;
    this.tracePath = [];
    
    // Cleanup any problem injections from previous run
    currentPath.forEach(hop => {
      if (hop.injectedProblem) {
        delete hop.injectedProblem;
      }
      if (hop.latency === -1) {
        hop.latency = 30; // Reset to reasonable default
      }
    });
    
    return true;
  }

  // Get path data
  getPath() {
    return this.tracePath;
  }

  // Check if simulation is running
  isSimulationRunning() {
    return this.isRunning;
  }

  // Get current hop
  getCurrentHop() {
    return this.currentHop;
  }

  // Set current hop position
  setCurrentHop(hopIndex) {
    if (hopIndex >= 0 && hopIndex < this.tracePath.length) {
      this.currentHop = hopIndex;
    }
    return this.currentHop;
  }

  // Increment hop counter
  incrementHop() {
    if (this.currentHop < this.tracePath.length) {
      this.currentHop++;
    }
    return this.currentHop;
  }

  // Check if trace is complete
  isTraceComplete() {
    return this.currentHop >= this.tracePath.length;
  }

  // Get hop data
  getHopData(hopIndex) {
    return this.tracePath[hopIndex];
  }
}
