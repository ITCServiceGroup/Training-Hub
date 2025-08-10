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
  applyProblemInjections(injectLatency, latencyHopNum, injectLoss, lossHopNum, injectUnreachable, unreachableHopNum) {
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
      const hopIndex = unreachableHopNum - 1;
      if (hopIndex >= 0 && hopIndex < this.tracePath.length - 1) {
        // Truncate path at the specified hop
        this.tracePath = this.tracePath.slice(0, hopIndex + 1);
        this.tracePath[hopIndex].latency = -1;
        this.tracePath[hopIndex].injectedProblem = 'unreachable';
        console.log(`[Simulation] Simulating unreachable destination at hop ${unreachableHopNum}`);
      }
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

    // Process all hops except the final marker, but include final hop if it has injected problems
    this.tracePath.forEach((hop, index) => {
      // Skip the final 'Destination Reached' marker unless it has an injected problem
      if (hop.ip === 'Destination Reached' && !hop.injectedProblem) {
        return;
      }
      // Categorize hop by network segment
      let segment = 'backbone';
      if (index === 0) segment = 'local';
      else if (hop.type?.toLowerCase().includes('isp')) segment = 'isp';
      else if (hop.type?.toLowerCase().includes('destination')) segment = 'destination';

      // Track latency and problems
      if (hop.latency === -1 && hop.injectedProblem !== 'unreachable') {
        timeouts++;
        problems.push({
          type: 'timeout',
          hop: index + 1,
          hopData: hop,
          message: this.getTimeoutAnalysis(hop, index + 1)
        });
      } else if (hop.latency !== -1) {
        // Only process latency stats for hops that actually responded
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
      // Note: unreachable hops with latency === -1 are handled separately below

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

  // Generate analysis for unreachable destination with hop-specific details
  getUnreachableAnalysis(hop, hopNumber) {
    let analysisText = `ICMP Destination Unreachable message received at hop ${hopNumber}. The traceroute path terminated at this ${hop.type.toLowerCase()}.`;
    let impactText = "This indicates the packet cannot reach its final destination from this point forward.";

    // Hop-specific analysis based on hop type FIRST, then hop number as fallback
    if (hop.type === 'Local Router' || hopNumber === 1) {
        analysisText = "Network Unreachable (ICMP Code 0) at Local Gateway: Your device cannot reach its configured default gateway or local router. This is the most fundamental connectivity failure - packets cannot even leave your local network segment. This typically indicates layer 2 connectivity issues, DHCP failures, or incorrect network configuration.";
        impactText = "Complete internet connectivity failure. No traffic can leave your local network. All internet services will be inaccessible until local network connectivity is restored.";
    } else if (hop.type?.includes('ISP Router (Local POP)') || (hopNumber <= 3 && hop.type?.includes('ISP'))) {
        analysisText = "Host Unreachable within ISP Local Access Network: Your Internet Service Provider's local Point of Presence (POP) equipment cannot forward traffic toward the destination. This commonly occurs due to ISP routing table corruption, equipment maintenance, or fiber infrastructure issues affecting your local service area.";
        impactText = "Affects connectivity from your location and potentially your entire neighborhood/service area. Other ISP services may still work if they use different routing paths. Some websites may be unreachable while others remain accessible.";
    } else if (hop.type?.includes('ISP Network Router') || (hopNumber <= 5 && hop.type?.includes('ISP'))) {
        analysisText = "Network Unreachable in ISP Regional Network: A regional ISP router cannot route traffic toward the destination network. This often indicates BGP routing failures, upstream peering issues, or regional fiber cuts affecting your ISP's ability to reach certain internet destinations.";
        impactText = "May affect connectivity to specific destination networks or geographic regions. Your ISP may have lost its peering relationship with the network hosting your destination, or upstream routing tables are missing entries for the target network.";
    } else if (hop.type?.includes('Internet Exchange Point') || hop.type?.includes('IXP')) {
        analysisText = "Network Unreachable at Internet Exchange Point: A critical internet interconnection hub cannot route traffic toward the destination. IXPs are major peering points where multiple ISPs and content providers exchange traffic. This could indicate peering disputes, BGP session failures, equipment outages, or routing policy conflicts between participating networks.";
        impactText = "May prevent access to large portions of the internet served by networks peering at this IXP. Alternative routing paths through other IXPs may exist. This type of failure often affects multiple ISPs and destinations simultaneously.";
    } else if (hop.type?.includes('Tier 1 Backbone') || hop.type?.includes('Backbone')) {
        analysisText = "Network Unreachable on Tier 1 Internet Backbone: A major internet backbone provider's core router cannot forward packets toward the destination. This represents a significant failure in the global internet infrastructure, potentially involving submarine cable cuts, major BGP hijacking events, or widespread equipment failures affecting intercontinental connectivity.";
        impactText = "Indicates serious internet infrastructure problems potentially affecting millions of users globally. This level of failure is rare and usually indicates major events like undersea cable damage, large-scale BGP incidents, or nation-state internet filtering. Network operations centers worldwide would be actively investigating.";
    } else if (hop.type?.includes('Destination') || hop.type?.includes('Server') || hop.type?.includes('Edge') || hopNumber >= 7) {
        analysisText = "Destination Network Unreachable: The destination network's edge infrastructure is rejecting ICMP traceroute probes. This is typically an ICMP Port Unreachable (Code 3) or Communication Administratively Prohibited (Code 13) message. Modern security practices recommend blocking ICMP at network perimeters to prevent reconnaissance and DoS attacks.";
        impactText = "CRITICAL: This is often NORMAL security behavior and does NOT indicate service failure. Most firewalls, load balancers, and secure networks are configured to drop ICMP traceroute packets while allowing legitimate traffic. Always test the actual destination service (web browsing, SSH, etc.) to determine if the service is truly unreachable.";
    } else {
        // Fallback for middle hops (likely backbone/transit)
        analysisText = "Network Unreachable in Transit Network: A transit provider or backbone router cannot route traffic toward the destination network. This could indicate routing table issues, equipment failures, or peering problems in the intermediate internet infrastructure.";
        impactText = "May affect connectivity to specific destination networks. Alternative routing paths may exist through different transit providers. The scope of impact depends on how many networks rely on this particular routing path.";
    }

    return {
      title: `ICMP Destination Unreachable at Hop ${hopNumber} (${hop.type} - ${hop.ip})`,
      analysis: analysisText,
      impact: impactText,
      causes: this.getUnreachableCauses(hop.type, hopNumber),
      recommendation: this.getUnreachableRecommendation(hop.type, hopNumber)
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

  getUnreachableCauses(type, hopNumber) {
     if (type === 'Local Router' || hopNumber === 1) {
        return [
            "DHCP service failure - Router unable to assign IP configuration to client devices",
            "Layer 2 connectivity failure - Physical ethernet port damage or Wi-Fi radio malfunction",
            "Incorrect static IP configuration - Wrong IP address, subnet mask, or default gateway settings",
            "Router firmware corruption or hardware failure requiring replacement",
            "Power supply issues or complete router power loss",
            "Network cable damage, loose connections, or ethernet port failure (wired connections)",
            "Wi-Fi authentication failure, incorrect password, or severe signal interference (wireless)"
        ];
    }
    if (type?.includes('ISP Router (Local POP)') || (hopNumber <= 3 && type?.includes('ISP'))) {
        return [
            "Local ISP equipment failure - DSLAM, cable modem termination system (CMTS), or fiber node outages",
            "Physical line issues - Damaged copper pairs, coaxial cables, or fiber optic connections to premises",
            "ISP local routing table corruption - Missing or incorrect routes in access router configurations",
            "Oversubscription issues - Local network capacity exceeded during peak usage periods",
            "BRAS (Broadband Remote Access Server) authentication failures or database issues",
            "Scheduled ISP maintenance on local access infrastructure without customer notification"
        ];
    }
    if (type?.includes('ISP Network Router') || (hopNumber <= 5 && type?.includes('ISP'))) {
        return [
            "BGP routing failures - ISP has lost routes to destination networks due to upstream peering issues",
            "Regional fiber cuts - Physical damage to ISP backbone fiber affecting multiple service areas",
            "ISP core router equipment failures - Hardware malfunctions in regional network infrastructure",
            "Upstream provider peering disputes - Business conflicts affecting traffic exchange agreements",
            "Routing policy misconfigurations - Incorrect prefix filtering or route advertisements",
            "DDoS attacks targeting ISP infrastructure causing protective traffic filtering"
        ];
    }
     if (type?.includes('Exchange Point') || type?.includes('IXP')) {
        return [
            "BGP session instability - Peering sessions between major networks failing due to configuration errors",
            "IXP infrastructure outages - Power failures, cooling system failures, or switch hardware malfunctions",
            "Peering policy conflicts - Commercial disputes between networks affecting route exchange",
            "Physical infrastructure damage - Fiber cuts within IXP facilities or connecting data centers",
            "Route server misconfigurations - Errors in IXP route server policies causing routing loops",
            "Capacity exhaustion - IXP switching capacity exceeded during traffic surges or attacks"
        ];
    }
    if (type?.includes('Backbone') || type?.includes('Tier 1')) {
        return [
            "Submarine cable damage - Undersea cable cuts affecting transcontinental internet connectivity",
            "BGP hijacking incidents - Malicious or accidental route advertisements causing global routing chaos",
            "Tier 1 provider equipment failures - Core router outages affecting global internet backbone",
            "International peering disputes - Political or commercial conflicts between major internet providers",
            "Natural disasters - Earthquakes, hurricanes, or other events damaging critical infrastructure",
            "Nation-state internet filtering - Government-level traffic blocking or censorship policies",
            "Massive coordinated attacks - Large-scale DDoS targeting critical internet infrastructure"
        ];
    }
    if (type?.includes('Destination') || type?.includes('Server') || type?.includes('Edge') || hopNumber >= 7) {
        return [
            "Security policy implementation - Firewalls configured to drop ICMP packets (recommended security practice)",
            "ICMP rate limiting - Edge routers throttling or blocking ICMP to prevent reconnaissance and DoS attacks",
            "Cloud security groups - AWS, Azure, or GCP security rules explicitly denying ICMP traffic types",
            "Load balancer configuration - Application delivery controllers not forwarding ICMP packets to backends",
            "Host-based firewall blocking - Windows Defender, iptables, or pfSense blocking inbound ICMP probes",
            "Network Address Translation issues - NAT gateways not handling ICMP packet translation properly",
            "DDoS protection services - Cloudflare, Akamai, or similar services filtering ICMP as protective measure"
        ];
    }
    // Fallback for transit/middle hops
    return [
        "Routing table corruption - Missing routes to destination networks",
        "Equipment failure - Router or switch hardware malfunctions",
        "Peering issues - Problems with upstream provider connections",
        "Configuration errors - Incorrect routing policies or filters"
    ];
  }

  // Helper methods for recommendations
  getLatencyRecommendation(type, ip) {
     if (type === 'Local Router') {
      return "<ul><li>Try moving closer to the router or using a wired connection if possible</li><li>Restart your router and modem</li><li>Check for router firmware updates</li><li>Reduce the number of connected devices temporarily to test</li></ul>";
    }
    if (type?.includes('ISP')) {
      return `<ul><li>Run tests at different times of day to check for peak-hour patterns</li><li>Restart your modem</li><li>If consistent or severe, contact your ISP with these traceroute results, noting the latency jump at their hop (${ip})</li></ul>`;
    }
     if (type?.includes('Exchange Point')) {
      return "<ul><li>Usually outside of end-user or ISP control</li><li>Latency here often fluctuates</li><li>If persistent and impacting specific services, your ISP might need to investigate peering arrangements, but this is complex</li></ul>";
    }
    if (type?.includes('Backbone')) {
      return "<ul><li>Generally outside direct user/ISP control</li><li>Backbone providers monitor and manage these links</li><li>Persistent high latency might indicate a larger routing issue that network operators need to resolve</li></ul>";
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return "<ul><li>The issue likely lies with the service provider or website owner</li><li>If performance is consistently poor, consider contacting the service's support (if available) or checking their status page</li></ul>";
    }
    // Default fallback
    return "<ul><li>Continue monitoring and document the frequency of latency spikes</li><li>Identify where in the path the latency originates</li></ul>";
  }

  getTimeoutRecommendation(type, ip) {
     if (type === 'Local Router') {
      return "<ul><li>Check physical connections (cables)</li><li>Restart your router/modem and your device</li><li>Try connecting via a different method (Wi-Fi vs. wired)</li><li>If the problem persists, your router may need replacement</li></ul>";
    }
    if (type?.includes('ISP')) {
      return `<ul><li>Check your ISP's status page for reported outages in your area</li><li>Restart your modem</li><li>Contact your ISP support with the traceroute data showing loss at their hop (${ip}) and report the impact on your service</li></ul>`;
    }
     if (type?.includes('Exchange Point')) {
      return "<ul><li>Significant issues at IXPs usually affect many users and are investigated by the involved network operators</li><li>Monitor if the issue resolves</li><li>Persistent problems might require escalation through your ISP</li></ul>";
    }
    if (type?.includes('Backbone')) {
      return "<ul><li>Significant backbone issues are typically addressed quickly by the providers</li><li>Monitor for resolution</li><li>Your ISP may have visibility into major backbone problems</li></ul>";
    }
    if (type?.includes('Destination') || type?.includes('Edge')) {
      return "<ul><li>Check the status page for the service</li><li>Try accessing the service again later</li><li>If persistent, the issue needs to be addressed by the service provider/administrator</li></ul>";
    }
    // Default fallback
    return "<ul><li>Investigate network capacity and hardware health at this hop</li><li>Check for firewall rules blocking probes</li></ul>";
  }

  getUnreachableRecommendation(type, hopNumber) {
     if (type === 'Local Router' || hopNumber === 1) {
        return "<ol><li><strong>Check physical connections:</strong> Verify ethernet cables are secure, try different ports, or check Wi-Fi signal strength and proximity to router.</li><li><strong>Power cycle equipment:</strong> Unplug router/modem for 30 seconds, then reconnect and wait 2-3 minutes for full initialization.</li><li><strong>Verify IP configuration:</strong> Use 'ipconfig /all' (Windows) or 'ifconfig -a' (Linux/Mac) to check if your device has obtained a valid IP address from DHCP.</li><li><strong>Try DHCP renewal:</strong> Use 'ipconfig /release && ipconfig /renew' on Windows or 'sudo dhclient -r && sudo dhclient' on Linux.</li><li><strong>Test with different device:</strong> Connect another device to isolate whether the issue is device-specific or network-wide.</li><li><strong>Factory reset router:</strong> If other solutions fail, factory reset router but document current configuration first.</li></ol>";
    }
    if (type?.includes('ISP Router (Local POP)') || (hopNumber <= 3 && type?.includes('ISP'))) {
        return "<ol><li><strong>Test actual services immediately:</strong> Load websites, check email - traceroute failure may not affect real traffic.</li><li><strong>Check ISP status:</strong> Visit ISP website, social media, or call technical support for outage reports in your area.</li><li><strong>Try different destinations:</strong> Test traceroute to multiple sites (google.com, cloudflare.com, your-isp.com) to determine scope.</li><li><strong>Use alternative DNS:</strong> Switch to 8.8.8.8 or 1.1.1.1 to rule out DNS resolution issues.</li><li><strong>Test from different device/location:</strong> Use mobile hotspot or neighbor's connection to isolate the problem.</li><li><strong>Document and report:</strong> If multiple sites affected, contact ISP with traceroute results and specific error details.</li></ol>";
    }
    if (type?.includes('ISP Network Router') || (hopNumber <= 5 && type?.includes('ISP'))) {
        return "<ol><li><strong>Verify destination service accessibility:</strong> Browse to actual websites/services - routing issues may not affect all traffic.</li><li><strong>Test regional scope:</strong> Try accessing services hosted in different geographic regions to identify affected areas.</li><li><strong>Check ISP network status:</strong> Look for ISP maintenance announcements or regional outage reports.</li><li><strong>Use VPN or proxy:</strong> Test connectivity through different network paths to confirm ISP-specific routing issues.</li><li><strong>Monitor BGP routing:</strong> Check bgpmon.net or similar services for routing anomalies affecting your ISP.</li><li><strong>Contact ISP support:</strong> Provide traceroute data and specify which destination networks are unreachable vs. accessible.</li></ol>";
    }
     if (type?.includes('Exchange Point') || type?.includes('IXP')) {
        return "<ol><li><strong>Test destination services directly:</strong> IXP ICMP filtering rarely affects actual application traffic (HTTP, HTTPS, etc.).</li><li><strong>Check internet health monitoring:</strong> Visit internetpulse.net, bgp.he.net, or similar sites for global routing health reports.</li><li><strong>Try alternative paths:</strong> Use VPN, mobile data, or different ISPs to test if alternate routing works.</li><li><strong>Wait and monitor:</strong> IXP issues often auto-resolve within 15-30 minutes as routing converges on backup paths.</li><li><strong>Check social media:</strong> Major IXPs often announce issues on Twitter or status pages.</li><li><strong>Beyond user control:</strong> Network operators at participating ISPs are likely already investigating and implementing fixes.</li></ol>";
    }
    if (type?.includes('Backbone') || type?.includes('Tier 1')) {
        return "<ol><li><strong>IMMEDIATELY test destination services:</strong> Backbone ICMP filtering is extremely common but rarely affects actual services.</li><li><strong>Check major outage sites:</strong> Visit downdetector.com, internettrafficreport.com, or similar global monitoring services.</li><li><strong>Try mobile/alternate ISP:</strong> Test same destination from mobile network or different ISP to confirm if issue is path-specific.</li><li><strong>Monitor news sources:</strong> Major backbone failures often make technology news (Ars Technica, The Register, etc.).</li><li><strong>Check submarine cable status:</strong> Visit submarinecablemap.com for international connectivity status if accessing overseas services.</li><li><strong>Be patient:</strong> Backbone issues affect millions of users and receive highest priority from global internet operators.</li><li><strong>Only escalate if actual services fail:</strong> Don't report traceroute failures unless destination websites/applications are also inaccessible.</li></ol>";
    }
    if (type?.includes('Destination') || type?.includes('Server') || type?.includes('Edge') || hopNumber >= 7) {
        return "<ol><li><strong>CRITICAL:</strong> This is usually NORMAL security behavior - immediately test the actual destination service (browse website, connect via SSH, etc.).</li><li><strong>If service works normally:</strong> Ignore traceroute failure completely - it's standard ICMP filtering for security.</li><li><strong>Try different traceroute methods:</strong> Use 'traceroute -T' (TCP), 'traceroute -U' (UDP), or online tools that use different probe types.</li><li><strong>Check service status pages:</strong> Look for official service status or social media announcements from the destination organization.</li><li><strong>Test from different locations:</strong> Use online traceroute tools from various global locations to see if issue is regional.</li><li><strong>Only report if service fails:</strong> Contact destination organization ONLY if the actual application/website is also inaccessible.</li><li><strong>Educational note:</strong> Modern security best practices require ICMP blocking at network perimeters - this protects against reconnaissance and DoS attacks.</li></ol>";
    }
    // Fallback for transit/middle hops
    return "<ol><li><strong>Test actual destination services:</strong> Routing issues may not affect application traffic.</li><li><strong>Check for widespread outages:</strong> Use internet monitoring services to verify scope.</li><li><strong>Try alternative network paths:</strong> Test via VPN or mobile data to confirm issue.</li><li><strong>Wait and retry:</strong> Many routing issues resolve automatically within minutes.</li><li><strong>Report only if widespread:</strong> Contact providers only if multiple destinations are affected and actual services are inaccessible.</li></ol>";
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
