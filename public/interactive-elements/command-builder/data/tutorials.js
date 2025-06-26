export const TUTORIALS = {
    windows: {
        ping: {
            name: "Windows Ping Commands",
            lessons: [
                {
                    title: "Basic Ping",
                    steps: [
                        {
                            instruction: "Let's start with a basic ping command. Add the 'ping' command, drag it into the command box below.",
                            requiredComponents: ["ping"],
                            hint: "The ping command tests if a network destination is reachable.",
                            targetElement: "ping",
                            position: "right"
                        },
                        {
                            instruction: "Now add the destination IP address (8.8.8.8), drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8"],
                            hint: "8.8.8.8 is Google's DNS server - a reliable test destination. (Note: `8.8.8.8` and `google.com` are often interchangeable for testing connectivity.)",
                            targetElement: "8.8.8.8",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great job! You've learned how to test basic connectivity."
                },
                {
                    title: "Advanced Ping Options",
                    steps: [
                        {
                            instruction: "Start with the ping command again, drag it into the command box below.",
                            requiredComponents: ["ping"],
                            hint: "We'll add more options to the basic ping command.",
                            targetElement: "ping",
                            position: "right"
                        },
                        {
                            instruction: "Add the destination (8.8.8.8), drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8"],
                            hint: "We'll use Google's DNS server again. (Note: `8.8.8.8` and `google.com` are often interchangeable for testing connectivity.)",
                            targetElement: "8.8.8.8",
                            position: "right"
                        },
                        {
                            instruction: "Add the count parameter (-n) to specify number of pings, drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8", "-n"],
                            hint: "The -n parameter lets you control how many pings to send. (Parameter order can sometimes vary, e.g., options might come before the target.)",
                            targetElement: "-n",
                            position: "right"
                        },
                        {
                            instruction: "Set the count to 50 pings, drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8", "-n", "50"],
                            hint: "Multiple pings help identify patterns in response times.",
                            targetElement: "50",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You now know how to customize ping count for better testing."
                }
            ]
        },
        traceroute: {
            name: "Windows Traceroute",
            lessons: [
                {
                    title: "Basic Traceroute",
                    steps: [
                        {
                            instruction: "Let's trace a network path. Start with the 'tracert' command, drag it into the command box below.",
                            requiredComponents: ["tracert"],
                            hint: "tracert shows the route packets take to reach a destination.",
                            targetElement: "tracert",
                            position: "right"
                        },
                        {
                            instruction: "Add the destination 'google.com' to trace, drag it into the command box below.",
                            requiredComponents: ["tracert", "google.com"],
                            hint: "This will show all hops between you and Google's servers. (Note: `google.com` and `8.8.8.8` are often interchangeable for testing connectivity.)",
                            targetElement: "google.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great! You've traced the path to Google's servers."
                },
                {
                    title: "Limiting Trace Length",
                    steps: [
                        {
                            instruction: "Start with the tracert command, drag it into the command box below.",
                            requiredComponents: ["tracert"],
                            hint: "We'll add options to control the trace length.",
                            targetElement: "tracert",
                            position: "right"
                        },
                        {
                            instruction: "Add the /h parameter to set maximum hops, drag it into the command box below.",
                            requiredComponents: ["tracert", "/h"],
                            hint: "This limits how many network jumps to trace. (Parameter order can sometimes vary, e.g., options might come before the target.)",
                            targetElement: "/h",
                            position: "right"
                        },
                        {
                            instruction: "Set the maximum to 15 hops, drag it into the command box below.",
                            requiredComponents: ["tracert", "/h", "15"],
                            hint: "15 hops usually reaches most destinations.",
                            targetElement: "15",
                            position: "right"
                        },
                        {
                            instruction: "Finally, add 'google.com' as the destination, drag it into the command box below.",
                            requiredComponents: ["tracert", "/h", "15", "google.com"],
                            hint: "Now we'll see the path, limited to 15 hops. (Note: `google.com` and `8.8.8.8` are often interchangeable for testing connectivity.)",
                            targetElement: "google.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You can now control trace depth to focus on specific network segments."
                }
            ]
        },
        ipLookup: {
            name: "IP Lookup", // Changed name
            lessons: [
                {
                    title: "Internal IP Lookup",
                    steps: [
                        {
                            instruction: "Use the ipconfig command to view your basic network settings, drag it into the command box below.",
                            requiredComponents: ["ipconfig"],
                            hint: "ipconfig displays your computer's network adapter information.",
                            targetElement: "ipconfig",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great! You've learned how to view your basic IP configuration."
                },
                {
                    title: "External IP Lookup",
                    steps: [
                        {
                            instruction: "To find your public IP on Windows, start with 'nslookup', drag it into the command box below.",
                            requiredComponents: ["nslookup"],
                            hint: "'nslookup' is used to query DNS servers.",
                            targetElement: "nslookup",
                            position: "right"
                        },
                        {
                            instruction: "Specify the special hostname 'myip.opendns.com', drag it into the command box below.",
                            requiredComponents: ["nslookup", "myip.opendns.com"],
                            hint: "This hostname resolves to your public IP when queried against OpenDNS servers.",
                            targetElement: "myip.opendns.com",
                            position: "right"
                        },
                        {
                            instruction: "Finally, specify the OpenDNS server 'resolver1.opendns.com', drag it into the command box below.",
                            requiredComponents: ["nslookup", "myip.opendns.com", "resolver1.opendns.com"],
                            hint: "Querying this specific server ensures you get the correct public IP lookup.",
                            targetElement: "resolver1.opendns.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You've learned how to use 'nslookup' with OpenDNS to find your public IP address on Windows."
                }
            ]
        },
        flushDNS: {
            name: "Flush DNS Cache",
            lessons: [
                {
                    title: "Clear DNS Cache",
                    steps: [
                        {
                            instruction: "Start with the ipconfig command, drag it into the command box below.",
                            requiredComponents: ["ipconfig"],
                            hint: "We'll use ipconfig with a special parameter.",
                            targetElement: "ipconfig",
                            position: "right"
                        },
                        {
                            instruction: "Add the /flushdns parameter to clear the DNS cache, drag it into the command box below.",
                            requiredComponents: ["ipconfig", "/flushdns"],
                            hint: "This will clear stored DNS records.",
                            targetElement: "/flushdns",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You've learned how to clear your DNS cache to resolve name resolution issues."
                }
            ]
        }
    },
    mac: {
        ping: {
            name: "macOS Ping Commands",
            lessons: [
                {
                    title: "Basic Ping",
                    steps: [
                        {
                            instruction: "Let's start with a basic ping command. Add the 'ping' command, drag it into the command box below.",
                            requiredComponents: ["ping"],
                            hint: "The ping command tests if a network destination is reachable.",
                            targetElement: "ping",
                            position: "right"
                        },
                        {
                            instruction: "Now add the destination IP address (8.8.8.8), drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8"],
                            hint: "8.8.8.8 is Google's DNS server - a reliable test destination. (Note: `8.8.8.8` and `google.com` are often interchangeable for testing connectivity.)",
                            targetElement: "8.8.8.8",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great job! You've learned how to test basic connectivity."
                },
                {
                    title: "Advanced Ping Options",
                    steps: [
                        {
                            instruction: "Start with the ping command again, drag it into the command box below.",
                            requiredComponents: ["ping"],
                            hint: "We'll add more options to the basic ping command.",
                            targetElement: "ping",
                            position: "right"
                        },
                        {
                            instruction: "Add the destination (8.8.8.8), drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8"],
                            hint: "We'll use Google's DNS server again. (Note: `8.8.8.8` and `google.com` are often interchangeable for testing connectivity.)",
                            targetElement: "8.8.8.8",
                            position: "right"
                        },
                        {
                            instruction: "Add the count parameter (-c) to specify number of pings, drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8", "-c"],
                            hint: "The -c parameter lets you control how many pings to send. (Parameter order can sometimes vary, e.g., options might come before the target.)",
                            targetElement: "-c",
                            position: "right"
                        },
                        {
                            instruction: "Set the count to 50 pings, drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8", "-c", "50"],
                            hint: "Multiple pings help identify patterns in response times.",
                            targetElement: "50",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You now know how to customize ping count for better testing."
                }
            ]
        },
        traceroute: {
            name: "macOS Traceroute",
            lessons: [
                {
                    title: "Basic Traceroute",
                    steps: [
                        {
                            instruction: "Let's trace a network path. Start with the 'traceroute' command, drag it into the command box below.",
                            requiredComponents: ["traceroute"],
                            hint: "traceroute shows the route packets take to reach a destination.",
                            targetElement: "traceroute",
                            position: "right"
                        },
                        {
                            instruction: "Add the destination 'google.com' to trace, drag it into the command box below.",
                            requiredComponents: ["traceroute", "google.com"],
                            hint: "This will show all hops between you and Google's servers. (Note: `google.com` and `8.8.8.8` are often interchangeable for testing connectivity.)",
                            targetElement: "google.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great! You've traced the path to Google's servers."
                },
                {
                    title: "Limiting Trace Length",
                    steps: [
                        {
                            instruction: "Start with the traceroute command, drag it into the command box below.",
                            requiredComponents: ["traceroute"],
                            hint: "We'll add options to control the trace length.",
                            targetElement: "traceroute",
                            position: "right"
                        },
                        {
                            instruction: "Add the -m parameter to set maximum hops, drag it into the command box below.",
                            requiredComponents: ["traceroute", "-m"],
                            hint: "This limits how many network jumps to trace. (Parameter order can sometimes vary, e.g., options might come before the target.)",
                            targetElement: "-m",
                            position: "right"
                        },
                        {
                            instruction: "Set the maximum to 15 hops, drag it into the command box below.",
                            requiredComponents: ["traceroute", "-m", "15"],
                            hint: "15 hops usually reaches most destinations.",
                            targetElement: "15",
                            position: "right"
                        },
                        {
                            instruction: "Finally, add 'google.com' as the destination, drag it into the command box below.",
                            requiredComponents: ["traceroute", "-m", "15", "google.com"],
                            hint: "Now we'll see the path, limited to 15 hops. (Note: `google.com` and `8.8.8.8` are often interchangeable for testing connectivity.)",
                            targetElement: "google.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You can now control trace depth to focus on specific network segments."
                }
            ]
        },
        ipLookup: {
            name: "IP Lookup", // Changed name
            lessons: [
                {
                    title: "Basic Network Information",
                    steps: [
                        {
                            instruction: "Use the ifconfig command to view your network settings, drag it into the command box below.",
                            requiredComponents: ["ifconfig"],
                            hint: "ifconfig displays basic network adapter information.",
                            targetElement: "ifconfig",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great! You can now view your basic network configuration."
                },
                {
                    title: "External IP Lookup", // macOS - curl is correct
                    steps: [
                         {
                            instruction: "To find your public IP address (how you appear on the internet), start with the 'curl' command, drag it into the command box below.",
                            requiredComponents: ["curl"],
                            hint: "'curl' is a tool to transfer data from or to a server. We'll use it to ask an external service for our IP.",
                            targetElement: "curl",
                            position: "right"
                        },
                        {
                            instruction: "Now add the address of the service: 'ifconfig.me', drag it into the command box below.",
                            requiredComponents: ["curl", "ifconfig.me"],
                            hint: "ifconfig.me is a simple web service that just returns the IP address it sees you connecting from.",
                            targetElement: "ifconfig.me",
                            position: "right",
                            isFinal: true
                        }
                    ],
                   completion: "Excellent! You've learned how to use 'curl' with an external service like ifconfig.me to find your public IP address."
                }
            ]
        },
        flushDNS: {
            name: "Flush DNS Cache on macOS", // Updated name
            lessons: [
                {
                    title: "Clear DNS Cache",
                    steps: [
                        { // New first step for sudo
                            instruction: "Flushing DNS requires administrator privileges. Start with the `sudo` command, drag it into the command box below.",
                            requiredComponents: ["sudo"],
                            hint: "`sudo` executes commands as the superuser.",
                            targetElement: "sudo",
                            position: "right"
                        },
                        { // Modified original first step
                            instruction: "Now add the `dscacheutil` command, drag it into the command box below.",
                            requiredComponents: ["sudo", "dscacheutil"], // Added sudo
                            hint: "`dscacheutil` manages directory service caches, including DNS.",
                            targetElement: "dscacheutil",
                            position: "right"
                        },
                        { // Modified original second step
                            instruction: "Add the `-flushcache` parameter to clear the DNS cache, drag it into the command box below.",
                            requiredComponents: ["sudo", "dscacheutil", "-flushcache"], // Added sudo
                            hint: "This clears stored DNS records. Note: On modern macOS, you often also need `sudo killall -HUP mDNSResponder` afterwards (not built here) to make the system recognize the cleared cache immediately. Neither command usually shows output if successful.", // Updated hint
                            targetElement: "-flushcache",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You've built the command to clear the DNS cache. Remember the full process often involves a second command (`sudo killall -HUP mDNSResponder`)." // Updated completion
                }
            ]
        }
    },
    chrome: {
        ping: {
            name: "Chrome OS Ping Commands",
            lessons: [
                {
                    title: "Basic Ping",
                    steps: [
                        {
                            instruction: "Let's start with a basic ping command. Add the 'ping' command, drag it into the command box below.",
                            requiredComponents: ["ping"],
                            hint: "The ping command tests if a network destination is reachable.",
                            targetElement: "ping",
                            position: "right"
                        },
                        {
                            instruction: "Now add the destination IP address (8.8.8.8), drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8"],
                            hint: "8.8.8.8 is Google's DNS server - a reliable test destination. (Note: `8.8.8.8` and `google.com` are often interchangeable for testing connectivity.)",
                            targetElement: "8.8.8.8",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great job! You've learned how to test basic connectivity."
                },
                {
                    title: "Advanced Ping Options",
                    steps: [
                        {
                            instruction: "Start with the ping command again, drag it into the command box below.",
                            requiredComponents: ["ping"],
                            hint: "We'll add more options to the basic ping command.",
                            targetElement: "ping",
                            position: "right"
                        },
                        {
                            instruction: "Add the destination (8.8.8.8), drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8"],
                            hint: "We'll use Google's DNS server again. (Note: `8.8.8.8` and `google.com` are often interchangeable for testing connectivity.)",
                            targetElement: "8.8.8.8",
                            position: "right"
                        },
                        {
                            instruction: "Add the count parameter (-c) to specify number of pings, drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8", "-c"],
                            hint: "The -c parameter lets you control how many pings to send. (Parameter order can sometimes vary, e.g., options might come before the target.)",
                            targetElement: "-c",
                            position: "right"
                        },
                        {
                            instruction: "Set the count to 50 pings, drag it into the command box below.",
                            requiredComponents: ["ping", "8.8.8.8", "-c", "50"],
                            hint: "Multiple pings help identify patterns in response times.",
                            targetElement: "50",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You now know how to customize ping count for better testing."
                }
            ]
        },
        tracepath: {
            name: "Chrome OS Trace Path",
            lessons: [
                {
                    title: "Basic Trace Path",
                    steps: [
                        {
                            instruction: "Let's trace a network path. Start with the 'tracepath' command, drag it into the command box below.",
                            requiredComponents: ["tracepath"],
                            hint: "tracepath shows the route packets take to reach a destination.",
                            targetElement: "tracepath",
                            position: "right"
                        },
                        {
                            instruction: "Add the destination 'google.com' to trace, drag it into the command box below.",
                            requiredComponents: ["tracepath", "google.com"],
                            hint: "This will show all hops between you and Google's servers. (Note: `google.com` and `8.8.8.8` are often interchangeable for testing connectivity.)",
                            targetElement: "google.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great! You've traced the path to Google's servers."
                },
                {
                    title: "Limiting Trace Length",
                    steps: [
                        {
                            instruction: "Start with the tracepath command, drag it into the command box below.",
                            requiredComponents: ["tracepath"],
                            hint: "We'll add options to control the trace length.",
                            targetElement: "tracepath",
                            position: "right"
                        },
                        {
                            instruction: "Add the -m parameter to set maximum hops, drag it into the command box below.",
                            requiredComponents: ["tracepath", "-m"],
                            hint: "This limits how many network jumps to trace. (Parameter order can sometimes vary, e.g., options might come before the target.)",
                            targetElement: "-m",
                            position: "right"
                        },
                        {
                            instruction: "Set the maximum to 15 hops, drag it into the command box below.",
                            requiredComponents: ["tracepath", "-m", "15"],
                            hint: "15 hops usually reaches most destinations.",
                            targetElement: "15",
                            position: "right"
                        },
                        {
                            instruction: "Finally, add 'google.com' as the destination, drag it into the command box below.",
                            requiredComponents: ["tracepath", "-m", "15", "google.com"],
                            hint: "Now we'll see the path, limited to 15 hops. (Note: `google.com` and `8.8.8.8` are often interchangeable for testing connectivity.)",
                            targetElement: "google.com",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Excellent! You can now control trace depth to focus on specific network segments."
                }
            ]
        },
        ipLookup: {
            name: "IP Lookup", // Changed name
            lessons: [
                {
                    title: "Basic IP Information",
                    steps: [
                        {
                            instruction: "Start with the 'ip' command, drag it into the command box below.",
                            requiredComponents: ["ip"],
                            hint: "The ip command manages network settings.",
                            targetElement: "ip",
                            position: "right"
                        },
                        {
                            instruction: "Add 'addr' to show addresses, drag it into the command box below.",
                            requiredComponents: ["ip", "addr"],
                            hint: "addr displays address information.",
                            targetElement: "addr",
                            position: "right"
                        },
                        {
                            instruction: "Add 'show' to display interfaces, drag it into the command box below.",
                            requiredComponents: ["ip", "addr", "show"],
                            hint: "This shows the basic network interface information.",
                            targetElement: "show",
                            position: "right",
                            isFinal: true
                        }
                    ],
                    completion: "Great! You can now view your basic network configuration."
                },
                {
                    title: "External IP Lookup",
                    steps: [
                         { // Only one step for ChromeOS explanation - no targetElement, no instruction change needed
                            instruction: "On ChromeOS, there isn't a standard built-in terminal command to find your external IP. You typically need to visit a website in the browser.",
                            requiredComponents: [], // No components to build
                            hint: "Open a web browser and go to a site like 'ifconfig.me' or 'whatismyip.com' to see your public IP address.",
                            isFinal: true
                        }
                    ],
                   completion: "Understood! On ChromeOS, finding your external IP involves using a web browser rather than a terminal command."
                }
            ]
        },
        dns: {
            name: "Manage DNS Cache",
            lessons: [
                {
                    title: "Chrome Browser DNS Management",
                    steps: [
                        { // No targetElement, no instruction change needed
                            instruction: "Chrome OS manages DNS through the browser. To clear DNS cache:<br><br><strong>Method 1: Direct DNS Cache Clear</strong><br>1. Open Chrome browser<br>2. Type chrome://net-internals/#dns in the address bar<br>3. Click the 'Clear host cache' button<br><br><strong>Method 2: Clear Browsing Data</strong><br>1. Open Chrome Settings<br>2. Go to Privacy and security<br>3. Click 'Clear browsing data'<br>4. Select 'Cached images and files'<br>5. Click 'Clear data'",
                            requiredComponents: [],
                            hint: "Chrome OS uses the browser's DNS cache system instead of system commands.",
                            isFinal: true
                        }
                    ],
                    completion: "You've learned how to manage DNS cache in Chrome OS through the browser interface."
                }
            ]
        }
    }
};
