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
    let analysisText = `This ${hop.type.toLowerCase()} is showing unusually high latency, ${latencyIncrease}% above expected values.`;

    // Node-specific analysis text
    if (hop.type === 'Local Router') {
      analysisText = "High latency detected at your local router. This is the first hop from your device and usually represents the connection to your home Wi-Fi router or modem.";
    } else if (hop.type?.includes('ISP')) {
      analysisText = `A significant latency increase (${latencyIncrease}% above expected) is observed within your Internet Service Provider's (ISP) network. This often indicates congestion or issues on the links connecting your area to the wider internet.`;
    } else if (hop.type?.includes('Exchange Point')) {
      analysisText = `Increased latency observed at an Internet Exchange Point (IXP). IXPs are major interconnection hubs where different networks exchange traffic.`;
    } else if (hop.type?.includes('Backbone')) {
      analysisText = `Latency increase detected on a Tier 1 Internet Backbone router. These form the high-speed core of the internet.`;
    } else if (hop.type?.includes('Destination') || hop.type?.includes('Edge')) {
       analysisText = `High latency observed within the destination network, close to the target server. This suggests issues within the hosting provider's or target organization's infrastructure.`;
    }
    
    return {
      title: `High Latency Detected at Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      details: `RTT: ${hop.latency}ms (Expected: ~${expectedLatency}ms, Increase: ${latencyIncrease}%)`,
      analysis: analysisText,
      impact: this.getLatencyImpactDescription(hop.latency, hop.type),
      causes: this.getLatencyCauses(hop.type),
      recommendation: this.getLatencyRecommendation(hop.type, hop.ip)
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
    let analysisText = `All probe packets were lost at this ${hop.type.toLowerCase()}.`;
    let impactText = "Connections through this hop will experience packet loss, leading to retransmissions and potential application timeouts.";

    // Node-specific analysis text
    if (hop.type === 'Local Router') {
      analysisText = "Packet loss detected at your local router. Your device is unable to reliably communicate with your primary gateway (router/modem).";
      impactText = "Significant performance issues like slow speeds, dropped connections, inability to load websites or use online services.";
    } else if (hop.type?.includes('ISP')) {
      analysisText = "Packet loss detected within your ISP's network. This indicates instability or equipment issues within the provider's infrastructure serving your connection.";
      impactText = "Intermittent connectivity, slow downloads/uploads, dropped connections, poor quality for real-time applications (VoIP, video calls).";
    } else if (hop.type?.includes('Exchange Point')) {
      analysisText = "Packet loss detected at an Internet Exchange Point (IXP). This suggests instability or problems at a critical network interconnection point.";
      impactText = "Can cause unreliable connections and performance degradation for traffic passing through this IXP, potentially affecting access to a wide range of destinations.";
    } else if (hop.type?.includes('Backbone')) {
      analysisText = "Packet loss occurring on a Tier 1 Internet Backbone router. This points to potential instability in the core internet infrastructure.";
      impactText = "Can cause widespread connectivity problems, affecting reliability and speed for traffic traversing this part of the backbone.";
    } else if (hop.type?.includes('Destination') || hop.type?.includes('Edge')) {
       analysisText = "Packet loss detected near or at the destination network/server. Probes are not reliably reaching the end point or responses are getting lost.";
       impactText = "Unreliable connection to the specific service, errors, slow performance, potential timeouts.";
    }

    return {
      title: `Packet Loss (Timeout) Detected at Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      analysis: analysisText,
      impact: impactText,
      causes: this.getTimeoutCauses(hop.type),
      recommendation: this.getTimeoutRecommendation(hop.type, hop.ip)
    };
  }

  // Generate analysis for unreachable destination
  getUnreachableAnalysis(hop, hopNumber) {
    let analysisText = `Path terminated at the ${hop.type.toLowerCase()}.`;
    let impactText = "No further network path available to reach the destination.";

    // Node-specific analysis text
    if (hop.type === 'Local Router') {
        analysisText = "Unable to reach the local router (default gateway). Your device cannot find the first step out to the internet.";
        impactText = "No internet connectivity.";
    } else if (hop.type?.includes('ISP')) {
        analysisText = "The trace stopped within the ISP network. This could mean a routing failure or that ISP equipment is configured not to respond to trace requests.";
        impactText = "If the destination is truly unreachable, you won't be able to access it. However, sometimes only the trace probes are blocked, and the actual service might still work.";
    } else if (hop.type?.includes('Exchange Point')) {
        analysisText = "Trace stopped at an Internet Exchange Point (IXP). This could indicate a routing issue between networks at the exchange or that the next hop is configured not to respond.";
        impactText = "May prevent access to networks reachable only via this peering point, or it might just be blocking trace probes.";
    } else if (hop.type?.includes('Backbone')) {
        analysisText = "Trace terminated at a Tier 1 Backbone router. This suggests a major routing failure or a policy blocking probes further along the path.";
        impactText = "Could indicate a significant disruption preventing access to large parts of the internet, or simply a probe-blocking policy.";
    } else if (hop.type?.includes('Destination') || hop.type?.includes('Edge')) {
       analysisText = "Trace stopped just before or within the destination network. This often means the final server or a firewall is configured not to respond to traceroute probes (ICMP).";
       impactText = "This is common and *does not necessarily* mean the service itself is down. The target server might just be ignoring the trace.";
    }

    return {
      title: `Destination Unreachable after Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      analysis: analysisText,
      impact: impactText,
      causes: this.getUnreachableCauses(hop.type),
      recommendation: this.getUnreachableRecommendation(hop.type)
    };
  }

  // Helper methods for impact descriptions
  getLatencyImpactDescription(latency, type) {
    if (type === 'Local Router') {
      return "You might experience general sluggishness, slow loading web pages, and inconsistent performance for devices connected to your local network.";
    }
    if (type?.includes('ISP')) {
      return "Slower website loading, buffering during streaming, lag in online games, especially during peak usage hours (evenings, weekends).";
    }
    if (type?.includes('Exchange Point')) {
       return "May cause slower connections to services hosted on networks peering at this IXP, potentially affecting multiple websites or services.";
    }
    if (type?.includes('Backbone')) {
       return "Can lead to slower performance for long-distance connections or accessing internationally hosted services. May affect multiple destinations.";
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
       return "Slow response times specifically from the target service/website, while other sites might be fast.";
    }

    // Default based on latency value if type doesn't match specific cases
    if (latency > 200) return "Severe impact: Users will experience very noticeable delays in all network operations.";
    if (latency > 100) return "Moderate impact: Real-time applications like video calls may be affected.";
    return "Minor impact: Slight delays in network operations may be noticeable.";
  }

  // Helper methods for problem causes
  getLatencyCauses(type) {
    if (type === 'Local Router') {
      return [
        "Wi-Fi interference (distance, obstacles, other networks)",
        "Overloaded router (too many devices, demanding tasks)",
        "Outdated router firmware",
        "Router hardware issue",
        "Problem with the device running the trace"
      ];
    }
    if (type?.includes('ISP')) {
      return [
        "Neighborhood bandwidth saturation ('rush hour' effect)",
        "Oversubscribed ISP capacity in your area",
        "Temporary ISP equipment problems (e.g., local node/DSLAM)",
        "Suboptimal routing within the ISP network",
        "Issues with the line to your premises (DSL/Cable)"
      ];
    }
     if (type?.includes('Exchange Point')) {
      return [
        "Congestion at the IXP during peak times",
        "Issues with the specific peering link your traffic is using",
        "Maintenance or upgrades at the IXP facility"
      ];
    }
    if (type?.includes('Backbone')) {
      return [
        "Congestion on major backbone links (less common but possible)",
        "Suboptimal inter-continental routing paths",
        "Backbone maintenance or equipment issues"
      ];
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return [
        "Overloaded server resources (CPU, RAM, I/O)",
        "Network congestion within the data center",
        "Bandwidth limitations at the hosting provider",
        "Firewall or load balancer processing delays"
      ];
    }
    // Default fallback
    return [
      "Network congestion",
      "Hardware resource constraints",
      "Routing path inefficiencies"
    ];
  }

  getTimeoutCauses(type) {
     if (type === 'Local Router') {
      return [
        "Poor Wi-Fi signal strength or severe interference",
        "Faulty network cable (if wired)",
        "Router hardware failure",
        "Incorrect network configuration on your device"
      ];
    }
    if (type?.includes('ISP')) {
      return [
        "Faulty ISP equipment (local node, routers)",
        "Severe congestion exceeding capacity",
        "Line quality problems (noise, signal issues on DSL/Cable)",
        "Ongoing ISP maintenance or outage"
      ];
    }
     if (type?.includes('Exchange Point')) {
      return [
        "Severe congestion at the IXP",
        "Hardware failure within the IXP infrastructure",
        "Problems with peering links between networks connected at the IXP"
      ];
    }
    if (type?.includes('Backbone')) {
      return [
        "Severe backbone congestion",
        "Backbone equipment failure",
        "Fiber cuts or damage on major routes",
        "Routing instability in the core internet"
      ];
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return [
        "Server is overloaded or unresponsive",
        "Network congestion within the destination data center",
        "Firewall rules blocking some traffic or ICMP responses",
        "Network equipment failure at the destination"
      ];
    }
     // Default fallback
    return [
      "Severe network congestion",
      "Hardware failures",
      "Configuration issues",
      "Firewall blocking probes"
    ];
  }

  getUnreachableCauses(type) {
     if (type === 'Local Router') {
        return [
            "Incorrect network settings on your device (IP address, gateway)",
            "Router is offline or malfunctioning",
            "Network adapter issue on your device"
        ];
    }
    if (type?.includes('ISP')) {
        return [
            "ISP routing failure",
            "Major ISP equipment outage",
            "ISP firewall/ACL blocking traceroute probes (ICMP)"
        ];
    }
     if (type?.includes('Exchange Point')) {
        return [
            "Routing problems between peering networks",
            "Major equipment failure at the IXP",
            "Network policy blocking traceroute probes"
        ];
    }
    if (type?.includes('Backbone')) {
        return [
            "Major backbone routing failure",
            "Significant equipment outage",
            "Security policies on backbone routers blocking probes"
        ];
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return [
        "Firewall rules blocking ICMP (very common security practice)",
        "Server configured not to respond to trace requests",
        "Actual network path failure very close to the destination"
      ];
    }
    // Default fallback
    return [
      "Network outage",
      "Routing configuration errors",
      "Security policies blocking probes (e.g., firewall)"
    ];
  }

  // Helper methods for recommendations
  getLatencyRecommendation(type, ip) {
     if (type === 'Local Router') {
      return "Try moving closer to the router or using a wired connection if possible. Restart your router and modem. Check for router firmware updates. Reduce the number of connected devices temporarily to test.";
    }
    if (type?.includes('ISP')) {
      return `Run tests at different times of day to check for peak-hour patterns. Restart your modem. If consistent or severe, contact your ISP with these traceroute results, noting the latency jump at their hop (${ip}).`;
    }
     if (type?.includes('Exchange Point')) {
      return "Usually outside of end-user or ISP control. Latency here often fluctuates. If persistent and impacting specific services, your ISP might need to investigate peering arrangements, but this is complex.";
    }
    if (type?.includes('Backbone')) {
      return "Generally outside direct user/ISP control. Backbone providers monitor and manage these links. Persistent high latency might indicate a larger routing issue that network operators need to resolve.";
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return "The issue likely lies with the service provider or website owner. If performance is consistently poor, consider contacting the service's support (if available) or checking their status page.";
    }
    // Default fallback
    return "Continue monitoring and document the frequency of latency spikes. Identify where in the path the latency originates.";
  }

  getTimeoutRecommendation(type, ip) {
     if (type === 'Local Router') {
      return "Check physical connections (cables). Restart your router/modem and your device. Try connecting via a different method (Wi-Fi vs. wired). If the problem persists, your router may need replacement.";
    }
    if (type?.includes('ISP')) {
      return `Check your ISP's status page for reported outages in your area. Restart your modem. Contact your ISP support with the traceroute data showing loss at their hop (${ip}) and report the impact on your service.`;
    }
     if (type?.includes('Exchange Point')) {
      return "Significant issues at IXPs usually affect many users and are investigated by the involved network operators. Monitor if the issue resolves. Persistent problems might require escalation through your ISP.";
    }
    if (type?.includes('Backbone')) {
      return "Significant backbone issues are typically addressed quickly by the providers. Monitor for resolution. Your ISP may have visibility into major backbone problems.";
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return "Check the status page for the service. Try accessing the service again later. If persistent, the issue needs to be addressed by the service provider/administrator.";
    }
    // Default fallback
    return "Investigate network capacity and hardware health at this hop. Check for firewall rules blocking probes.";
  }

  getUnreachableRecommendation(type) {
     if (type === 'Local Router') {
        return "Verify your device's network settings (DHCP recommended). Ensure your router is powered on and showing normal status lights. Restart both your device and router.";
    }
    if (type?.includes('ISP')) {
        return "Check ISP outage status. Try accessing the target service/website directly to see if it works despite the trace stopping. If the service is also down, report the issue to your ISP.";
    }
     if (type?.includes('Exchange Point')) {
        return "Try accessing the target service directly. If unreachable, this indicates a significant network issue likely being addressed by network operators.";
    }
    if (type?.includes('Backbone')) {
        return "Check major internet health dashboards (e.g., Downdetector) for widespread issues. Try accessing the target service directly. Report to ISP if service is inaccessible.";
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return "The most important step is to test the actual service directly (e.g., load the website, connect to the game server). If the service works, the 'unreachable' message in the trace can likely be ignored. If the service is also down, the issue lies with the destination provider.";
    }
    // Default fallback
    return "Check for network outages or routing issues along this path. Verify if the destination is expected to respond to ICMP probes.";
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
