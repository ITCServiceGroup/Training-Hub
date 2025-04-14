// Example responses for simulation
const simulatedResponses = {
    windows: {
        ping: {
            success: (target, count = 4) => 
`Pinging ${target} with 32 bytes of data:
Reply from ${target}: bytes=32 time=45ms TTL=56
Reply from ${target}: bytes=32 time=44ms TTL=56
Reply from ${target}: bytes=32 time=46ms TTL=56
Reply from ${target}: bytes=32 time=45ms TTL=56

Ping statistics for ${target}:
    Packets: Sent = ${count}, Received = ${count}, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 44ms, Maximum = 46ms, Average = 45ms`,
            error: '\nPing request could not find host. Please check the name and try again.\n'
        },
        tracert: {
            success: (target) =>
`
Tracing route to ${target} [8.8.8.8]
over a maximum of 30 hops:

  1     1 ms    <1 ms    <1 ms  router.local [192.168.1.1]
  2    15 ms    14 ms    14 ms  isp-gateway.net [10.10.10.1]
  3    16 ms    15 ms    15 ms  backbone-1.net [172.16.0.1]
  4    45 ms    44 ms    44 ms  ${target} [8.8.8.8]

Trace complete.
`,
            error: '\nUnable to resolve target system name. Please verify the target and try again.\n'
        },
        ipconfig: {
            basic: 
`
Windows IP Configuration

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . . . . . : local
   Link-local IPv6 Address . . . . . . . . : fe80::5c33:12ff:fe91:5ea1%14
   IPv4 Address. . . . . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . . . . : 192.168.1.1

Wireless LAN adapter Wi-Fi:
   Media State . . . . . . . . . . . . . . : Media disconnected`,
            flushdns: 
`
Windows IP Configuration

Successfully flushed the DNS Resolver Cache.`,
            displaydns:
`
Windows IP Configuration

    google.com
    ----------------------------------------
    Record Name . . . . . : google.com
    Record Type . . . . . : 1
    Time To Live . . . . . : 299
    Data Length . . . . . : 4
    Section . . . . . . . : Answer
    A (Host) Record . . . : 172.217.3.206

    ----------------------------------------`
            // nslookup simulation moved out
        },
        nslookup: // Moved nslookup simulation here
`Server:  resolver1.opendns.com
Address:  208.67.222.222

Non-authoritative answer:
Name:    myip.opendns.com
Address: 74.125.224.72`, // Example public IP
    },
    mac: {
        ping: {
            success: (target, count = 4) => 
`
PING ${target} (8.8.8.8): 56 data bytes
64 bytes from ${target}: icmp_seq=0 ttl=56 time=45.123 ms
64 bytes from ${target}: icmp_seq=1 ttl=56 time=44.567 ms
64 bytes from ${target}: icmp_seq=2 ttl=56 time=46.890 ms
64 bytes from ${target}: icmp_seq=3 ttl=56 time=45.234 ms

--- ${target} ping statistics ---
${count} packets transmitted, ${count} packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 44.567/45.453/46.890/0.823 ms
`,
            error: '\nping: Name or service not known\n'
        },
        traceroute: {
            success: (target) =>
`
traceroute to ${target} (8.8.8.8), 64 hops max, 52 byte packets
 1  router.local (192.168.1.1)  1.123 ms  0.897 ms  0.912 ms
 2  isp-gateway (10.10.10.1)    15.443 ms  14.987 ms  14.765 ms
 3  backbone-1 (172.16.0.1)     16.234 ms  15.876 ms  15.654 ms
 4  ${target} (8.8.8.8)         45.234 ms  44.987 ms  44.765 ms
`,
            error: '\ntraceroute: Name or service not known\n'
        },
        ifconfig: {
            basic: 
`en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
    inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
    media: autoselect
    status: active`,
            detailed: 
`lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
    inet 127.0.0.1 netmask 0xff000000
    status: active

en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
    inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
    ether 00:11:22:33:44:55
    media: autoselect
    status: active

en1: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
    inet 10.0.1.100 netmask 0xffffff00 broadcast 10.0.1.255
    ether 00:11:22:33:44:66
    media: autoselect
    status: inactive

fw0: flags=8822<BROADCAST,SMART,SIMPLEX,MULTICAST> mtu 4078
    status: inactive`,
            error: '\nifconfig: Invalid command format. Usage: ifconfig [-a] [interface]\n'
        },
        dscacheutil: {
            flushcache: '', // Successful flush returns nothing
            error: '\ndscacheutil: Invalid command parameters.\nUsage: dscacheutil -flushcache\n'
        },
        curl: { // Added curl simulation for Mac
            success: `74.125.224.72`, // Example public IP
            error: `curl: (6) Could not resolve host: ifconfig.me`
        }
    },
    chrome: {
        ping: {
            success: (target, count = 4) =>
`
PING ${target} (8.8.8.8) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=56 time=45.1 ms
64 bytes from ${target}: icmp_seq=2 ttl=56 time=44.5 ms
64 bytes from ${target}: icmp_seq=3 ttl=56 time=46.8 ms
64 bytes from ${target}: icmp_seq=4 ttl=56 time=45.2 ms

--- ${target} ping statistics ---
${count} packets transmitted, ${count} received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 44.534/45.400/46.890/0.823 ms
`,
            error: '\nping: Name or service not known\n'
        },
        tracepath: {
            success: (target) =>
`
 1?: [LOCALHOST]                                         pmtu 1500
 1:  router.local (192.168.1.1)                           0.989ms 
 2:  isp-gateway.net (10.10.10.1)                       15.443ms 
 3:  backbone-1.net (172.16.0.1)                        16.234ms 
 4:  ${target} (8.8.8.8)                               45.234ms reached
     Resume: pmtu 1500 hops 4 back 4 
`,
            error: '\ntracepath: No address associated with hostname\n'
        },
        ip: {
            basic: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0`,
            detailed: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:11:22:33:44:55 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::211:22ff:fe33:4455/64 scope link
       valid_lft forever preferred_lft forever`,
            error: '\nUsage: ip addr show [detail]\n'
        }
    }
};

export function simulateOutput(components, os = 'windows') {
    if (!components || components.length === 0) return '';
    
    let command = components[0];
    let commandArgs = components.slice(1);
    let requiresSudo = false;

    // Handle sudo prefix specifically for macOS simulation
    if (os === 'mac' && command === 'sudo' && components.length > 1) {
        requiresSudo = true;
        command = components[1]; // The actual command after sudo
        commandArgs = components.slice(2);
        console.log(`[Simulation] Detected sudo. Actual command: ${command}, Args: ${commandArgs.join(' ')}`);
    } else {
         commandArgs = components.slice(1); // Standard args if no sudo
    }


    const osResponses = simulatedResponses[os];
    if (!osResponses) return '\nUnsupported operating system\n';
    
    const commandSimulations = osResponses[command];
     if (!commandSimulations) return `\nCommand '${command}' simulation not found for ${os}\n`;


    switch (command) {
        case 'ping':
            const target = commandArgs.find(c => c.includes('.') || c === 'google.com');
            const countFlag = os === 'windows' ? '-n' : '-c';
            const countIndex = commandArgs.indexOf(countFlag);
            const count = countIndex !== -1 && commandArgs.length > countIndex + 1 ? parseInt(commandArgs[countIndex + 1]) : 4;
            
            return target ? 
                commandSimulations.success(target, count) :
                commandSimulations.error;

        case 'tracert': // Windows
            const tracertTarget = commandArgs.find(c => c.includes('.') || c === 'google.com');
            return tracertTarget ? 
                commandSimulations.success(tracertTarget) :
                commandSimulations.error;

        case 'traceroute': // macOS
            const tracerouteTarget = commandArgs.find(c => c.includes('.') || c === 'google.com');
            return tracerouteTarget ? 
                commandSimulations.success(tracerouteTarget) :
                commandSimulations.error;

        case 'tracepath': // ChromeOS
             try {
                const tracepathTarget = commandArgs.find(c => c.includes('.') || c === 'google.com');
                 console.log('[CommandBuilder Simulation] Simulating tracepath:', {
                    target: tracepathTarget,
                    os,
                    hasResponses: !!commandSimulations
                });
                
                if (!commandSimulations) {
                     console.error('[CommandBuilder Simulation] No tracepath simulation defined for OS:', os);
                     return '\nCommand simulation not available\n';
                 }
                
                 const result = tracepathTarget ? 
                    commandSimulations.success(tracepathTarget) :
                    commandSimulations.error;
                    
                 console.log('[CommandBuilder Simulation] Tracepath result:', {
                     hasTarget: !!tracepathTarget,
                     resultLength: result.length
                 });
                
                 return result;
             } catch (error) {
                 console.error('[CommandBuilder Simulation] Error simulating tracepath:', error);
                 return '\nError simulating command\n';
             }

        case 'ipconfig': // Windows
            if (commandArgs.includes('/flushdns')) {
                return commandSimulations.flushdns;
            } else if (commandArgs.includes('/displaydns')) {
                return commandSimulations.displaydns;
            } else if (commandArgs.includes('/all')) {
                 // Assuming '/all' implies a more detailed view, but we only have 'basic' defined for now.
                 // If a specific detailed simulation is needed, add it to simulatedResponses.
                 return commandSimulations.basic; // Or a future 'detailed' if added
            }
            return commandSimulations.basic;

        case 'nslookup': // Windows External IP
             // Check if the specific arguments for OpenDNS lookup are present
             if (commandArgs.includes('myip.opendns.com') && commandArgs.includes('resolver1.opendns.com')) {
                 return commandSimulations; // Return the predefined nslookup response
             }
             return `\nUsage: nslookup myip.opendns.com resolver1.opendns.com\n`;


        case 'ifconfig': // macOS Internal IP
             try {
                 // The '-a' flag is no longer part of the tutorial, but we keep the simulation logic
                 // just in case. The tutorial now focuses on interpreting the basic output.
                 const showDetailed = commandArgs.includes('-a');
                 return showDetailed ? commandSimulations.detailed : commandSimulations.basic;
             } catch (error) {
                 console.error('[CommandBuilder Simulation] Error in ifconfig:', error);
                 return commandSimulations.error || 'Error executing ifconfig command';
             }

        case 'dscacheutil': // macOS Flush DNS
             try {
                 if (commandArgs.includes('-flushcache')) {
                     return commandSimulations.flushcache; // Returns empty string on success
                 }
                 return commandSimulations.error; // Return error if flag is missing
             } catch (error) {
                 return '\nError executing dscacheutil command\n';
             }

        case 'curl': // macOS External IP
             try {
                 // Check if the *first* argument is exactly 'ifconfig.me'
                 if (commandArgs.length === 1 && commandArgs[0] === 'ifconfig.me') {
                     return commandSimulations.success; // Return the IP address
                 }
                 // Otherwise, return an error or a generic usage message
                 return commandSimulations.error || `\nUsage: curl ifconfig.me\n`;
             } catch (error) {
                 console.error('[CommandBuilder Simulation] Error in curl:', error);
                 return '\nError simulating curl command\n';
             }


        case 'ip': // ChromeOS Internal IP
             try {
                 // Check for 'ip addr show [detail]' structure
                 if (commandArgs.length >= 2 && commandArgs[0] === 'addr' && commandArgs[1] === 'show') {
                     const showDetail = commandArgs.includes('detail');
                     return showDetail ? commandSimulations.detailed : commandSimulations.basic;
                 }
                 return commandSimulations.error || '\nUsage: ip addr show [detail]\n';
             } catch (error) {
                 return '\nError executing ip command\n';
             }

        default:
             console.warn(`[Simulation] No simulation logic found for command: ${command} on OS: ${os}`);
             return `\nCommand simulation for '${command}' not implemented for ${os}.\n`;
    }
}
