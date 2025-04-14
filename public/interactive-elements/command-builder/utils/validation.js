// Command structures for different operating systems
const commandStructures = {
    windows: {
        ping: {
            required: ['ping'],
            optional: ['-n'],
            target: true,
            parameterOrder: ['ping', 'target', '-n', 'count']
        },
        tracert: {
            required: ['tracert'],
            optional: ['/h'],
            target: true,
            parameterOrder: ['tracert', '/h', 'count', 'target']
        },
        ipconfig: {
            required: ['ipconfig'],
            optional: ['/all', '/flushdns', '/displaydns'],
            target: false,
            parameterOrder: ['ipconfig', '/all', '/flushdns', '/displaydns']
        },
        nslookup: { // Added nslookup for Windows
             required: ['nslookup', 'myip.opendns.com', 'resolver1.opendns.com'],
             optional: [],
             target: false, // No separate target, arguments are fixed
             parameterOrder: ['nslookup', 'myip.opendns.com', 'resolver1.opendns.com']
        }
        // Removed curl structure for Windows
    },
    mac: {
        ping: {
            required: ['ping'],
            optional: ['-c'],
            target: true,
            parameterOrder: ['ping', '-c', 'count', 'target']
        },
        traceroute: {
            required: ['traceroute'],
            optional: ['-m'],
            target: true,
            parameterOrder: ['traceroute', '-m', 'count', 'target']
        },
        ifconfig: {
            required: ['ifconfig'],
            optional: [],
            target: false,
            parameterOrder: ['ifconfig']
        },
        dscacheutil: {
            required: ['dscacheutil'],
            optional: ['-flushcache'],
            target: false,
            parameterOrder: ['dscacheutil', '-flushcache'] // Note: sudo handled separately
        },
        curl: { // Added curl for Mac
            required: ['curl'],
            optional: [],
            target: true,
            parameterOrder: ['curl', 'target']
        }
    },
    chrome: {
        ping: {
            required: ['ping'],
            optional: ['-c'],
            target: true,
            parameterOrder: ['ping', '-c', 'count', 'target']
        },
        tracepath: {
            required: ['tracepath'],
            optional: ['-m'],
            target: true,
            parameterOrder: ['tracepath', 'target', '-m', 'count']
        },
        ip: {
            required: ['ip', 'addr', 'show'],
            optional: ['detail'], // Added detail as optional
            target: false,
            parameterOrder: ['ip', 'addr', 'show', 'detail']
        }
        // Removed curl structure for ChromeOS
    }
};

// Validation function - refined to handle sudo and check structure more carefully
function validateCommand(components, structure, os, requiresSudo = false) { // Ensure 'os' parameter is present
    if (!components || components.length === 0) {
        return { valid: false, message: 'Command is empty' };
    }

    // Determine the starting index for validation based on whether sudo is required/present
    const startIndex = requiresSudo ? 1 : 0;
    const commandBaseIndex = requiresSudo ? 1 : 0; // Index of the actual command like 'dscacheutil'

    // --- Basic Checks ---
    // If sudo was required, check it's actually the first component
    if (requiresSudo && (components.length === 0 || components[0] !== 'sudo')) {
        return { valid: false, message: `Command requires 'sudo' prefix.` };
    }
    // Check if command exists after potential sudo
    if (components.length <= commandBaseIndex) {
         return { valid: false, message: `Missing command ${requiresSudo ? 'after sudo' : ''}` };
    }
    // Check if the base command matches the structure's required base
    if (components[commandBaseIndex] !== structure.required[0]) {
        return { valid: false, message: `Command must start with ${requiresSudo ? 'sudo ' : ''}'${structure.required[0]}'` };
    }

    // --- Required Components Check (Order Matters) ---
    for (let i = 0; i < structure.required.length; i++) {
        if (components[startIndex + i] !== structure.required[i]) {
            // Allow optional 'detail' for 'ip addr show'
            if (structure.required[0] === 'ip' && i === 3 && structure.optional.includes(components[startIndex + i])) {
                 continue; // Skip if it's an optional component like 'detail'
            }
             return { valid: false, message: `Invalid command structure. Expected sequence starting with '${structure.required.join(' ')}' ${requiresSudo ? 'after sudo' : ''}. Found '${components[startIndex + i]}' instead of '${structure.required[i]}'.` };
        }
    }

    // --- Target Check ---
    const knownParamsAndValues = new Set([
        ...structure.optional,
        '15', '50' // Known counts - add others if needed
    ]);
    let targetFound = false;
    let targetValue = null;
    const expectedComponentsAfterRequired = components.slice(startIndex + structure.required.length);

    for (const comp of expectedComponentsAfterRequired) {
        if (!knownParamsAndValues.has(comp) && isNaN(comp)) { // Potential target is not optional and not a number
             // Exception for curl on Mac: ifconfig.me is the target - Ensure 'os' check is correct
             if (os === 'mac' && structure.required[0] === 'curl' && comp === 'ifconfig.me') {
                 targetFound = true;
                 targetValue = comp;
                 break;
             }
             // General target check (like google.com or 8.8.8.8)
             if (comp === 'google.com' || comp === '8.8.8.8') {
                 targetFound = true;
                 targetValue = comp;
                 break;
             }
             // Could add more sophisticated target validation here if needed
        }
    }

    if (structure.target && !targetFound) {
        return { valid: false, message: 'Command requires a target (e.g., google.com, 8.8.8.8, ifconfig.me)' };
    }

    // --- Parameter Value Checks (e.g., count for -c) ---
    const countParams = ['-n', '-c', '/h', '-m'];
    for (const param of countParams) {
        if (components.includes(param)) {
            const paramIndex = components.indexOf(param);
            const countIndex = paramIndex + 1;
            // Ensure the component immediately after the param exists and is a number
            if (countIndex >= components.length || isNaN(components[countIndex])) {
                return { valid: false, message: `${param} requires a numeric value immediately after it` };
            }
        }
    }

    // --- Unknown/Misplaced Component Check ---
     const allKnownStructureComponents = new Set([
         ...(requiresSudo ? ['sudo'] : []),
         ...structure.required,
         ...structure.optional,
         'google.com', '8.8.8.8', // Common targets
         'ifconfig.me', // curl target
         'myip.opendns.com', 'resolver1.opendns.com', // nslookup arguments
         '15', '50' // Known counts
     ]);

     for (let i = 0; i < components.length; i++) {
         const comp = components[i];
         if (!allKnownStructureComponents.has(comp)) {
             // Is it a value for a count parameter?
             let isValueForCount = false;
             for (const countParam of countParams) {
                 const paramIndex = components.indexOf(countParam);
                 if (paramIndex !== -1 && i === paramIndex + 1 && !isNaN(comp)) {
                     isValueForCount = true;
                     break;
                 }
             }
             // Is it the identified target?
             if (comp === targetValue) {
                 continue; // Skip the target we already found
             }

             if (!isValueForCount) {
                 return { valid: false, message: `Unknown or misplaced component: ${comp}` };
             }
         }
     }


    return { valid: true, message: 'Valid command structure' };
}


export function validateCommandStructure(baseCommand, components, os = 'windows') {
    console.log('[CommandBuilder Validation] Validating command:', {
        baseCommand: components[0], // Log the actual first component
        components,
        os
    });

    const osCommands = commandStructures[os];
    if (!osCommands) {
        console.error('[CommandBuilder Validation] Invalid OS:', os);
        return { valid: false, message: 'Unsupported operating system' };
    }

    let commandToValidate = components;
    let actualBaseCommand = components.length > 0 ? components[0] : null;
    let requiresSudo = false;

    // Handle sudo specifically for macOS
    if (os === 'mac' && actualBaseCommand === 'sudo') {
        if (components.length < 2) {
            return { valid: false, message: 'sudo requires a command to run' };
        }
        actualBaseCommand = components[1]; // The command after sudo
        requiresSudo = true;
        console.log('[CommandBuilder Validation] Detected sudo, actual command:', actualBaseCommand);
    }

    const commandStructure = osCommands[actualBaseCommand];
    if (!commandStructure) {
        console.warn('[CommandBuilder Validation] Unknown command:', {
            baseCommand: actualBaseCommand,
            availableCommands: Object.keys(osCommands)
        });
        // Provide a more specific message if sudo was involved
        if (requiresSudo) {
             return { valid: false, message: `Unknown command to run with sudo: ${actualBaseCommand}` };
        }
        return { valid: false, message: `Unknown command: ${actualBaseCommand}` };
    }

    console.log('[CommandBuilder Validation] Using command structure:', {
        command: actualBaseCommand,
        structure: commandStructure,
        requiresSudo: requiresSudo
    });

    // Pass the *full* component list, os, and sudo requirement for validation - Ensure 'os' is passed
    const result = validateCommand(components, commandStructure, os, requiresSudo);
    console.log('[CommandBuilder Validation] Result:', result);
    return result;
}
