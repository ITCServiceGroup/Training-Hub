// Web Worker for Subnet Calculator

console.log('[Worker] Subnet Calculator worker initializing...');

// --- Helper Functions ---

function isValidIpAddress(ip) {
    if (!ip) return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every(part => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
    });
}

function isValidSubnetMask(mask) {
    if (!mask) return false;

    // Handle CIDR notation
    if (mask.startsWith('/')) {
        const cidr = parseInt(mask.substring(1), 10);
        return !isNaN(cidr) && cidr >= 0 && cidr <= 32;
    }

    // Handle decimal notation
    if (!isValidIpAddress(mask)) return false;

    // Convert to binary and check if it's a valid mask
    const binary = mask.split('.')
        .map(num => parseInt(num, 10).toString(2).padStart(8, '0'))
        .join('');

    // Valid subnet masks must have continuous 1s followed by continuous 0s
    return /^1+0*$/.test(binary);
}

function ipToInt32(ip) {
    return ip.split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function int32ToIp(int32) {
    return [
        (int32 >>> 24) & 255,
        (int32 >>> 16) & 255,
        (int32 >>> 8) & 255,
        int32 & 255
    ].join('.');
}

function cidrToSubnetMask(cidr) {
    const mask = ~((1 << (32 - cidr)) - 1) >>> 0;
    return int32ToIp(mask);
}

function subnetMaskToCidr(mask) {
    if (mask.startsWith('/')) {
        return parseInt(mask.substring(1), 10);
    }
    const binary = mask.split('.')
        .map(num => parseInt(num, 10).toString(2).padStart(8, '0'))
        .join('');
    return binary.split('0')[0].length;
}

function calculateSubnet(ipAddress, subnetMask) {
    // Convert inputs to workable formats
    const ipInt = ipToInt32(ipAddress);
    const maskInt = ipToInt32(subnetMask);
    const invMaskInt = ~maskInt >>> 0;

    // Calculate basic network information
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | invMaskInt) >>> 0;
    const totalHosts = invMaskInt + 1;
    const usableHosts = Math.max(0, totalHosts - 2);

    // Calculate first and last usable addresses
    const firstUsableInt = totalHosts <= 2 ? networkInt : networkInt + 1;
    const lastUsableInt = totalHosts <= 2 ? broadcastInt : broadcastInt - 1;

    // Convert everything back to IP address strings
    return {
        'network-address': int32ToIp(networkInt),
        'broadcast-address': int32ToIp(broadcastInt),
        'total-hosts': totalHosts.toString(),
        'usable-hosts': usableHosts.toString(),
        'first-usable': int32ToIp(firstUsableInt),
        'last-usable': int32ToIp(lastUsableInt),
        networkInt,
        broadcastInt,
        maskInt
    };
}

function generateVisualizationData(results) {
    const { networkInt, broadcastInt } = results;
    const totalAddresses = broadcastInt - networkInt + 1;

    return {
        totalAddresses,
        networkAddress: networkInt,
        broadcastAddress: broadcastInt,
        // Add more visualization-specific data as needed
    };
}

// --- Main Worker Logic ---

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'test') {
        // Respond to test message
        self.postMessage({
            type: 'ready',
            payload: 'Worker is ready'
        });
        return;
    }

    if (type === 'calculate') {
        const { ipAddress, subnetMask } = payload;

        // Validate inputs
        if (!isValidIpAddress(ipAddress)) {
            self.postMessage({
                type: 'error',
                payload: 'Invalid IP address format'
            });
            return;
        }

        // Convert CIDR to subnet mask if needed
        let normalizedMask = subnetMask;
        if (subnetMask.startsWith('/')) {
            normalizedMask = cidrToSubnetMask(parseInt(subnetMask.substring(1), 10));
        }

        if (!isValidSubnetMask(normalizedMask)) {
            self.postMessage({
                type: 'error',
                payload: 'Invalid subnet mask format'
            });
            return;
        }

        try {
            // Calculate subnet information
            const results = calculateSubnet(ipAddress, normalizedMask);

            // Generate visualization data
            const visualData = generateVisualizationData(results);

            // Send results back to main thread
            self.postMessage({
                type: 'results',
                payload: {
                    ...results,
                    visualData
                }
            });

        } catch (error) {
            console.error('[Worker] Calculation error:', error);
            self.postMessage({
                type: 'error',
                payload: 'Error calculating subnet information'
            });
        }
    }
};

// Handle worker errors
self.onerror = function(error) {
    console.error('[Worker] Unhandled error:', error);
    self.postMessage({
        type: 'error',
        payload: 'Internal worker error'
    });
};

console.log('[Worker] Subnet Calculator worker initialized');
