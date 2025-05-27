// --- FiberFaultSimulator Class Definition (Original Logic) ---
// (Keep the original class definition and faultTypes object here)
const faultTypes = {
    'break': { name: "Fiber Break", description: "Complete physical break...", severity: "high", troubleshooting: ["Use OTDR...", "Excavate...", "Replace...", "Perform fusion splicing...", "Test..."] },
    'macrobend': { name: "Macrobend", description: "Excessive bending...", severity: "medium", troubleshooting: ["Use VFL...", "Carefully reroute...", "Ensure proper bend radius...", "Secure fiber...", "Retest..."] },
    'microbend': { name: "Microbend", description: "Small-scale bends...", severity: "medium", troubleshooting: ["Use OTDR...", "Inspect fiber path...", "Release fiber...", "Ensure proper installation...", "Verify signal..."] },
    'connector': { name: "Bad Connector", description: "Damaged, worn, or improperly terminated...", severity: "medium", troubleshooting: ["Inspect connector...", "Clean connector...", "If damaged, replace...", "Ensure proper polishing...", "Test insertion loss..."] },
    'splice': { name: "Poor Splice", description: "Suboptimal fusion or mechanical splice...", severity: "medium", troubleshooting: ["Locate splice point...", "Open splice enclosure...", "For mechanical splices...", "For fusion splices...", "Verify splice quality..."] },
    'contamination': { name: "Connector Contamination", description: "Dirt, dust, or oils...", severity: "low", troubleshooting: ["Inspect connector...", "Clean using...", "Use dry cleaning...", "Re-inspect...", "Test signal levels..."] },
    'stress': { name: "Stress Point", description: "Localized stress...", severity: "low", troubleshooting: ["Use OTDR...", "Inspect fiber path...", "Relieve stress...", "Add proper strain relief...", "Monitor signal levels..."] },
    'ghosting': { name: "Ghost Reflection", description: "False reflections...", severity: "low", troubleshooting: ["Identify true events...", "Test from opposite end...", "Use proper OTDR settings...", "Address high-reflectance...", "Document known ghost..."] }
};

class FiberFaultSimulator {
    constructor(faultCanvas, otdrCanvas) { // Accept canvas elements directly
        this.faultCanvas = faultCanvas;
        this.otdrCanvas = otdrCanvas;

        if (!this.faultCanvas || !this.otdrCanvas) {
            throw new Error("Canvas elements not provided to constructor");
        }

        this.faultCtx = this.faultCanvas.getContext('2d');
        this.otdrCtx = this.otdrCanvas.getContext('2d');
        this.currentFaultType = null; // Initialize current fault type

        // Set initial canvas dimensions (will be resized)
        this.resizeCanvases();

        // Initialize visualization
        this.drawFiberLine();
        this.drawOTDRBaseline();

        // Add resize listener (consider if this is needed within Shadow DOM)
        // Might be better to observe the host element size
        // window.addEventListener('resize', this.resizeCanvases.bind(this));
        // TODO: Implement ResizeObserver for the host element instead of window resize
    }

    resizeCanvases() {
        // Use parent container dimensions (the shadow host's parent in this case)
        // Or use the host element itself if styled appropriately
        const hostElement = this.faultCanvas.getRootNode().host; // Get the custom element
        const container = hostElement.parentElement || hostElement; // Use host or its parent
        const containerWidth = container.offsetWidth;

        if (containerWidth <= 0) {
            console.warn("Simulator container has no width, defaulting canvas size.");
            this.faultCanvas.width = 600;
            this.faultCanvas.height = 180; // Adjusted default height (30% of 600)
            this.otdrCanvas.width = 600;
            this.otdrCanvas.height = 150;
        } else {
            const width = containerWidth * 0.9; // Adjust multiplier as needed
            const faultHeight = width * 0.3; // Use the reduced height ratio
            const otdrHeight = width * 0.25;

            this.faultCanvas.width = width;
            this.faultCanvas.height = faultHeight;
            this.otdrCanvas.width = width;
            this.otdrCanvas.height = otdrHeight;
        }

        // Redraw after resize
        this.drawFiberLine();
        this.drawOTDRBaseline();
        if (this.currentFaultType) {
            this.showFault(this.currentFaultType, false);
        }
    }

    // ... (Keep all drawFiberLine, drawConnector, drawOTDRBaseline methods as before) ...
     // Draw the basic fiber line
    drawFiberLine() {
        this.faultCtx.clearRect(0, 0, this.faultCanvas.width, this.faultCanvas.height);
        const width = this.faultCanvas.width;
        const height = this.faultCanvas.height;
        const startX = width * 0.1;
        const endX = width * 0.9;
        const y = height * 0.5;

        // Draw fiber path
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(startX, y);
        this.faultCtx.lineTo(endX, y);
        this.faultCtx.strokeStyle = "#2196F3";
        this.faultCtx.lineWidth = 3;
        this.faultCtx.stroke();

        // Draw distance markers
        const numMarkers = 5;
        for (let i = 0; i <= numMarkers; i++) {
            const x = startX + (i / numMarkers) * (endX - startX);
            this.faultCtx.beginPath();
            this.faultCtx.moveTo(x, y + 10);
            this.faultCtx.lineTo(x, y + 20);
            this.faultCtx.strokeStyle = "#666";
            this.faultCtx.lineWidth = 1;
            this.faultCtx.stroke();

            this.faultCtx.fillStyle = "#666";
            this.faultCtx.font = "12px Arial";
            this.faultCtx.textAlign = "center";
            this.faultCtx.fillText(`${i}km`, x, y + 35);
        }

        // Draw connectors at both ends
        this.drawConnector(startX, y);
        this.drawConnector(endX, y);
    }

    // Draw a connector
    drawConnector(x, y) {
        this.faultCtx.fillStyle = "#1976D2";
        this.faultCtx.fillRect(x - 5, y - 10, 10, 20);
    }

    // Draw OTDR baseline
    drawOTDRBaseline() {
        this.otdrCtx.clearRect(0, 0, this.otdrCanvas.width, this.otdrCanvas.height);
        const width = this.otdrCanvas.width;
        const height = this.otdrCanvas.height;
        const startX = width * 0.1;
        const endX = width * 0.9;
        const baseY = height * 0.8;
        const topY = height * 0.2;

        // Draw axes
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(startX, topY);
        this.otdrCtx.lineTo(startX, baseY);
        this.otdrCtx.lineTo(endX, baseY);
        this.otdrCtx.strokeStyle = "#666";
        this.otdrCtx.lineWidth = 1;
        this.otdrCtx.stroke();

        // Draw baseline trace
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(startX, height * 0.3); // Start higher
        this.otdrCtx.lineTo(endX, height * 0.6);  // Slight downward slope for normal attenuation
        this.otdrCtx.strokeStyle = "#4CAF50";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();

        // Draw distance markers
        const numMarkers = 5;
        for (let i = 0; i <= numMarkers; i++) {
            const x = startX + (i / numMarkers) * (endX - startX);
            this.otdrCtx.beginPath();
            this.otdrCtx.moveTo(x, baseY);
            this.otdrCtx.lineTo(x, baseY + 5);
            this.otdrCtx.strokeStyle = "#666";
            this.otdrCtx.lineWidth = 1;
            this.otdrCtx.stroke();

            this.otdrCtx.fillStyle = "#666";
            this.otdrCtx.font = "10px Arial";
            this.otdrCtx.textAlign = "center";
            this.otdrCtx.fillText(`${i}km`, x, baseY + 15);
        }
    }


    // ... (Keep all drawFiberBreak, drawMacrobend, etc. methods as before) ...
     drawFiberBreak(xRatio) { // xRatio is 0 to 1
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY = this.otdrCanvas.height * 0.45; // Adjusted Y position
        const otdrSpikeY = this.otdrCanvas.height * 0.15; // Spike top
        const otdrEndY = this.otdrCanvas.height * 0.8; // Bottom line

        // Draw break on fiber line
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x - 10, y - 10);
        this.faultCtx.lineTo(x + 10, y + 10);
        this.faultCtx.moveTo(x - 10, y + 10);
        this.faultCtx.lineTo(x + 10, y - 10);
        this.faultCtx.strokeStyle = "#F44336";
        this.faultCtx.lineWidth = 2;
        this.faultCtx.stroke();

        // Draw OTDR trace for break
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX, otdrMidY);
        this.otdrCtx.lineTo(otdrX, otdrSpikeY);  // Reflection spike
        this.otdrCtx.lineTo(otdrX + 2, otdrEndY);  // Complete loss
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        this.otdrCtx.strokeStyle = "#F44336";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

    drawMacrobend(xRatio) {
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const bendRadius = this.faultCanvas.height * 0.2;
        const controlY = y + bendRadius * 1.5;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY1 = this.otdrCanvas.height * 0.45;
        const otdrMidY2 = this.otdrCanvas.height * 0.55; // Loss at bend
        const otdrEndY = this.otdrCanvas.height * 0.65; // Higher attenuation

        // Draw large bend
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x - 50, y); // Start before the bend center
        this.faultCtx.quadraticCurveTo(x, controlY, x + 50, y); // End after bend center
        this.faultCtx.strokeStyle = "#FF9800";
        this.faultCtx.lineWidth = 3;
        this.faultCtx.stroke();

        // Draw OTDR trace for macrobend
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX - 10, otdrMidY1);
        this.otdrCtx.lineTo(otdrX, otdrMidY2);  // Loss at bend
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);  // Higher attenuation after bend
        this.otdrCtx.strokeStyle = "#FF9800";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

     drawMicrobend(xRatio) {
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const bendWidth = 60; // Total width of the microbend area
        const numBends = 6;
        const segmentWidth = bendWidth / numBends;
        const amplitude = 10;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY1 = this.otdrCanvas.height * 0.45;
        const otdrMidY2 = this.otdrCanvas.height * 0.55; // Gradual loss end
        const otdrEndY = this.otdrCanvas.height * 0.6;

        // Draw multiple small bends
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x - bendWidth / 2, y);
        for (let i = 0; i < numBends; i++) {
            this.faultCtx.quadraticCurveTo(
                x - bendWidth / 2 + (i + 0.5) * segmentWidth, y - amplitude * (i % 2 === 0 ? 1 : -1),
                x - bendWidth / 2 + (i + 1) * segmentWidth, y
            );
        }
        this.faultCtx.strokeStyle = "#FF9800";
        this.faultCtx.lineWidth = 3;
        this.faultCtx.stroke();

        // Draw OTDR trace for microbend
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX, otdrMidY1);
        this.otdrCtx.lineTo(otdrX + 30, otdrMidY2);  // Gradual loss
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        this.otdrCtx.strokeStyle = "#FF9800";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

    drawBadConnector(xRatio) {
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY1 = this.otdrCanvas.height * 0.45;
        const otdrSpikeY = this.otdrCanvas.height * 0.2; // High reflection
        const otdrMidY2 = this.otdrCanvas.height * 0.55; // Loss after
        const otdrEndY = this.otdrCanvas.height * 0.65;

        // Draw damaged connector
        this.faultCtx.fillStyle = "#F44336";
        this.faultCtx.fillRect(x - 8, y - 10, 16, 20);

        // Draw warning symbol
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x, y - 5);
        this.faultCtx.lineTo(x + 5, y + 5);
        this.faultCtx.lineTo(x - 5, y + 5);
        this.faultCtx.closePath();
        this.faultCtx.fillStyle = "#FFEB3B";
        this.faultCtx.fill();

        // Draw OTDR trace for bad connector
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX, otdrMidY1);
        this.otdrCtx.lineTo(otdrX, otdrSpikeY);  // High reflection spike
        this.otdrCtx.lineTo(otdrX + 2, otdrMidY2);  // Loss after connector
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        this.otdrCtx.strokeStyle = "#F44336";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

    drawPoorSplice(xRatio) {
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY1 = this.otdrCanvas.height * 0.45;
        const otdrMidY2 = this.otdrCanvas.height * 0.55; // Step loss
        const otdrEndY = this.otdrCanvas.height * 0.6;

        // Draw misaligned splice visual
        this.faultCtx.fillStyle = "#FF9800";
        this.faultCtx.fillRect(x - 10, y - 5, 20, 10);

        // Draw misalignment lines (visual cue)
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x - 20, y); // Line before splice box
        this.faultCtx.lineTo(x - 10, y);
        this.faultCtx.moveTo(x + 10, y + 3); // Line after splice box (offset)
        this.faultCtx.lineTo(x + 20, y + 3);
        this.faultCtx.strokeStyle = "#2196F3"; // Use fiber color
        this.faultCtx.lineWidth = 3;
        this.faultCtx.stroke();


        // Draw OTDR trace for poor splice
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX, otdrMidY1);
        this.otdrCtx.lineTo(otdrX + 2, otdrMidY2);  // Step loss
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        this.otdrCtx.strokeStyle = "#FF9800";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

    drawContamination(xRatio) {
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY1 = this.otdrCanvas.height * 0.45;
        const otdrSpikeY = this.otdrCanvas.height * 0.4; // Small reflection
        const otdrMidY2 = this.otdrCanvas.height * 0.5; // Small loss
        const otdrEndY = this.otdrCanvas.height * 0.6;

        // Draw connector
        this.drawConnector(x, y);

        // Draw contamination particles
        for (let i = 0; i < 8; i++) {
            const particleX = x - 6 + Math.random() * 12;
            const particleY = y - 5 + Math.random() * 10;
            this.faultCtx.beginPath();
            this.faultCtx.arc(particleX, particleY, 1, 0, Math.PI * 2);
            this.faultCtx.fillStyle = "#795548";
            this.faultCtx.fill();
        }

        // Draw OTDR trace for contamination
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX, otdrMidY1);
        this.otdrCtx.lineTo(otdrX, otdrSpikeY);  // Small reflection
        this.otdrCtx.lineTo(otdrX + 2, otdrMidY2);  // Small loss
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        this.otdrCtx.strokeStyle = "#795548";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

    drawStressPoint(xRatio) {
        const x = this.faultCanvas.width * (0.1 + 0.8 * xRatio);
        const y = this.faultCanvas.height * 0.5;
        const otdrX = this.otdrCanvas.width * (0.1 + 0.8 * xRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidY1 = this.otdrCanvas.height * 0.45;
        const otdrMidY2 = this.otdrCanvas.height * 0.55; // Gradual loss end
        const otdrEndY = this.otdrCanvas.height * 0.6;

        // Draw pressure indicator lines
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x, y - 30);
        this.faultCtx.lineTo(x, y + 30);
        this.faultCtx.strokeStyle = "#F44336";
        this.faultCtx.lineWidth = 1;
        this.faultCtx.stroke();

        // Draw arrows indicating pressure
        this.drawArrow(x, y - 30, y - 10); // Top arrow pointing down
        this.drawArrow(x, y + 30, y + 10); // Bottom arrow pointing up

        // Draw OTDR trace for stress point
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrX - 20, otdrMidY1);
        this.otdrCtx.lineTo(otdrX + 20, otdrMidY2);  // Gradual loss at stress point
        this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        this.otdrCtx.strokeStyle = "#F44336";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }

    drawGhostReflection(xRatio) {
        const realFaultRatio = xRatio; // Position of the real reflective event
        const ghostRatio = realFaultRatio + (realFaultRatio - 0); // Ghost appears at twice the distance from start
        const xReal = this.faultCanvas.width * (0.1 + 0.8 * realFaultRatio);
        const y = this.faultCanvas.height * 0.5;
        const xGhost = this.faultCanvas.width * (0.1 + 0.8 * ghostRatio);

        const otdrXReal = this.otdrCanvas.width * (0.1 + 0.8 * realFaultRatio);
        const otdrXGhost = this.otdrCanvas.width * (0.1 + 0.8 * ghostRatio);
        const otdrStartY = this.otdrCanvas.height * 0.3;
        const otdrMidYReal1 = this.otdrCanvas.height * 0.45;
        const otdrSpikeYReal = this.otdrCanvas.height * 0.25; // Real reflection
        const otdrMidYReal2 = this.otdrCanvas.height * 0.5;
        const otdrMidYGhost1 = this.otdrCanvas.height * 0.55;
        const otdrSpikeYGhost = this.otdrCanvas.height * 0.4; // Ghost reflection (smaller)
        const otdrMidYGhost2 = this.otdrCanvas.height * 0.6;
        const otdrEndY = this.otdrCanvas.height * 0.65;


        // Draw normal connector at the real fault location
        this.drawConnector(xReal, y);

        // Draw ghost indicator (visual cue, might not be on fiber line itself)
        if (xGhost < this.faultCanvas.width * 0.9) { // Only draw if within bounds
             this.faultCtx.beginPath();
             this.faultCtx.arc(xGhost, y, 10, 0, Math.PI * 2);
             this.faultCtx.strokeStyle = "rgba(255, 152, 0, 0.5)";
             this.faultCtx.lineWidth = 2;
             this.faultCtx.stroke();
             this.faultCtx.fillStyle = "rgba(255, 152, 0, 0.2)";
             this.faultCtx.fill();
        }


        // Draw OTDR trace with ghost reflection
        this.otdrCtx.beginPath();
        this.otdrCtx.moveTo(this.otdrCanvas.width * 0.1, otdrStartY);
        this.otdrCtx.lineTo(otdrXReal, otdrMidYReal1);
        this.otdrCtx.lineTo(otdrXReal, otdrSpikeYReal);  // Real reflection
        this.otdrCtx.lineTo(otdrXReal + 2, otdrMidYReal2);
        if (otdrXGhost < this.otdrCanvas.width * 0.9) { // Check if ghost is within trace bounds
            this.otdrCtx.lineTo(otdrXGhost, otdrMidYGhost1);
            this.otdrCtx.lineTo(otdrXGhost, otdrSpikeYGhost);  // Ghost reflection
            this.otdrCtx.lineTo(otdrXGhost + 2, otdrMidYGhost2);
            this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrEndY);
        } else {
             this.otdrCtx.lineTo(this.otdrCanvas.width * 0.9, otdrMidYGhost1); // End trace before ghost if out of bounds
        }
        this.otdrCtx.strokeStyle = "#FF9800";
        this.otdrCtx.lineWidth = 2;
        this.otdrCtx.stroke();
    }


    drawArrow(x, startY, endY) {
        const headSize = 5;
        const angle = Math.atan2(endY - startY, 0); // Arrow points vertically
        this.faultCtx.beginPath();
        this.faultCtx.moveTo(x, startY);
        this.faultCtx.lineTo(x, endY);
        // Arrowhead
        this.faultCtx.lineTo(x - headSize * Math.cos(angle - Math.PI / 6), endY - headSize * Math.sin(angle - Math.PI / 6));
        this.faultCtx.moveTo(x, endY);
        this.faultCtx.lineTo(x - headSize * Math.cos(angle + Math.PI / 6), endY - headSize * Math.sin(angle + Math.PI / 6));
        this.faultCtx.strokeStyle = "#F44336";
        this.faultCtx.lineWidth = 1;
        this.faultCtx.stroke();
    }


    showFault(faultType, updateText = true) {
        if (!faultTypes[faultType]) return;

        this.currentFaultType = faultType; // Store current fault
        const fault = faultTypes[faultType];

        // Draw fault visualization
        this.drawFiberLine(); // Redraw base fiber
        this.drawOTDRBaseline(); // Redraw base OTDR

        const faultPositionRatio = 0.5; // Place fault in the middle (0.5 ratio)

        switch(faultType) {
            case 'break': this.drawFiberBreak(faultPositionRatio); break;
            case 'macrobend': this.drawMacrobend(faultPositionRatio); break;
            case 'microbend': this.drawMicrobend(faultPositionRatio); break;
            case 'connector': this.drawBadConnector(faultPositionRatio); break;
            case 'splice': this.drawPoorSplice(faultPositionRatio); break;
            case 'contamination': this.drawContamination(faultPositionRatio); break;
            case 'stress': this.drawStressPoint(faultPositionRatio); break;
            case 'ghosting': this.drawGhostReflection(0.3); break; // Ghost needs a real event
        }

        if (updateText) {
             // Find the elements within the component's shadow DOM or context
             const faultTitle = document.getElementById("fault-title"); // This needs context!
             const faultDesc = document.getElementById("fault-description");
             const severityText = document.getElementById("severity-text");
             const severityIndicator = document.getElementById("severity-indicator");
             const troubleshootingList = document.getElementById("troubleshooting-list");
             const troubleshootingSteps = document.getElementById("troubleshooting-steps");

             // Call the separate updateUI function, passing the context if needed
             if (typeof updateUI === 'function') {
                 updateUI({
                     name: fault.name,
                     description: fault.description,
                     severity: fault.severity,
                     troubleshooting: fault.troubleshooting
                 });
             } else {
                 console.error("updateUI function is not defined globally.");
             }
             // Return value might not be needed if updateUI handles everything
             return null;
        }
        return null; // Indicate text shouldn't be updated (e.g., during resize)
    }
}


// --- Web Component Definition ---

const fiberFaultTemplate = document.createElement('template');
fiberFaultTemplate.innerHTML = `
    <style>
        /* Copied from styles.css - Scoped by Shadow DOM */
        :host { /* Style the custom element itself */
            display: block; /* Ensure it takes up space */
            font-family: Arial, sans-serif;
            box-sizing: border-box;
            width: 100%;
        }
        .interactive-container {
            background-color: var(--custom-primary-bg-color, #fff);
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .interactive-content {
            width: 100%;
            max-width: 800px; /* Optional: Limit max width */
            padding: 20px;
            box-sizing: border-box;
        }
        h1, h3 { text-align: center; margin-top: 0; color: var(--custom-title-color, #333); }
        .fault-controls { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 15px 0; }
        button { padding: 8px 16px; background-color: var(--custom-button-color, #2196F3); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; }
        button:hover { background-color: #1976D2; filter: brightness(0.9); }
        .canvas-container { display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 20px 0; width: 100%; }
        canvas { display: block; max-width: 100%; height: auto; border: 1px solid #eee; }
        .fault-info { background-color: var(--custom-secondary-bg-color, #f5f5f5); padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2196F3; width: 100%; box-sizing: border-box; }
        .fault-severity { display: flex; align-items: center; margin: 10px 0; }
        .severity-indicator { width: 20px; height: 20px; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
        .low { background-color: #4CAF50; }
        .medium { background-color: #FF9800; }
        .high { background-color: #F44336; }
        .troubleshooting-steps { background-color: var(--custom-secondary-bg-color, #e8f5e9); padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px; }
        .troubleshooting-steps h4 { margin-top: 0; }
        .troubleshooting-steps ol { padding-left: 20px; margin-bottom: 0; }
    </style>
    <div class="interactive-container">
        <div class="interactive-content">
            <h1>Fiber Fault Detection Simulator</h1>
            <p>This simulator demonstrates various types of faults that can occur in fiber optic networks. Select a fault type to see its visualization and learn about troubleshooting steps.</p>
            <div class="fault-controls">
                <button data-fault-type="break">Fiber Break</button>
                <button data-fault-type="macrobend">Macrobend</button>
                <button data-fault-type="microbend">Microbend</button>
                <button data-fault-type="connector">Bad Connector</button>
                <button data-fault-type="splice">Poor Splice</button>
                <button data-fault-type="contamination">Contamination</button>
                <button data-fault-type="stress">Stress Point</button>
                <button data-fault-type="ghosting">Ghost Reflection</button>
            </div>
            <div class="canvas-container">
                <canvas id="fault-detector"></canvas>
                <canvas id="otdr-trace"></canvas>
            </div>
            <div class="fault-info">
                <h3 id="fault-title">Select a fault type above</h3>
                <p id="fault-description">Click one of the buttons above to simulate different types of fiber optic faults.</p>
                <div class="fault-severity">
                    <div class="severity-indicator" id="severity-indicator"></div>
                    <span id="severity-text">Severity: N/A</span>
                </div>
                <div class="troubleshooting-steps" id="troubleshooting-steps" style="display: none;">
                    <h4>Troubleshooting Steps:</h4>
                    <ol id="troubleshooting-list"></ol>
                </div>
            </div>
        </div>
    </div>
`;

class FiberFaultElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(fiberFaultTemplate.content.cloneNode(true));
        this.simulatorInstance = null; // Hold the simulator instance
    }

    connectedCallback() {
        console.log('[WebComponent] FiberFaultElement connected to DOM.');
        this.initialize();
    }

    initialize() {
        console.log('[WebComponent] Initializing...');
        const faultCanvas = this.shadowRoot.getElementById('fault-detector');
        const otdrCanvas = this.shadowRoot.getElementById('otdr-trace');

        if (!faultCanvas || !otdrCanvas) {
             console.error('[WebComponent] Canvas elements not found in Shadow DOM.');
             return;
        }

        try {
            console.log('[WebComponent] Instantiating FiberFaultSimulator...');
            // Pass the canvas elements from the Shadow DOM
            this.simulatorInstance = new FiberFaultSimulator(faultCanvas, otdrCanvas);
            console.log('[WebComponent] FiberFaultSimulator instantiated.');

            // Add event listeners to buttons within the Shadow DOM
            this.shadowRoot.querySelectorAll('.fault-controls button').forEach(button => {
                button.addEventListener('click', () => {
                    const faultType = button.getAttribute('data-fault-type');
                    if (this.simulatorInstance && faultType) {
                        const result = this.simulatorInstance.showFault(faultType);
                        if (result) {
                            this.updateUI(result); // Call the component's updateUI method
                        }
                    }
                });
            });
            console.log('[WebComponent] Event listeners attached.');
            console.log('[WebComponent] Initialization complete.');

        } catch (error) {
            console.error('[WebComponent] Failed to initialize simulator:', error);
            const contentArea = this.shadowRoot.querySelector('.interactive-content');
            if (contentArea) {
                 contentArea.innerHTML = `<p style="color: red; text-align: center;">Failed to load simulator: ${error.message}</p>`;
            }
        }
    }

    updateUI(result) {
        console.log('[WebComponent] Updating UI with result:', result);
        // Query elements within the Shadow DOM
        const faultTitle = this.shadowRoot.getElementById("fault-title");
        const faultDesc = this.shadowRoot.getElementById("fault-description");
        const severityText = this.shadowRoot.getElementById("severity-text");
        const severityIndicator = this.shadowRoot.getElementById("severity-indicator");
        const troubleshootingList = this.shadowRoot.getElementById("troubleshooting-list");
        const troubleshootingSteps = this.shadowRoot.getElementById("troubleshooting-steps");

        if (faultTitle) faultTitle.textContent = result.name;
        if (faultDesc) faultDesc.textContent = result.description;
        if (severityText) severityText.textContent = `Severity: ${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}`;

        if (severityIndicator) {
            severityIndicator.className = "severity-indicator"; // Reset classes
            severityIndicator.classList.add(result.severity); // Add new severity class
        }

        if (troubleshootingList) {
            troubleshootingList.innerHTML = ""; // Clear previous steps
            result.troubleshooting.forEach(step => {
                const li = document.createElement("li");
                li.textContent = step;
                troubleshootingList.appendChild(li);
            });
        }

        if (troubleshootingSteps) troubleshootingSteps.style.display = "block";
        console.log('[WebComponent] UI Update complete.');
    }

    // Optional: disconnectedCallback for cleanup if needed
    // disconnectedCallback() {
    //     console.log('[WebComponent] FiberFaultElement disconnected.');
    //     // Remove event listeners, stop animations, etc.
    // }
}

// Define the custom element
customElements.define('fiber-fault-simulator', FiberFaultElement);
console.log('[WebComponent] Custom element "fiber-fault-simulator" defined.');

// Remove the global initializeSimulator and updateUI functions as they are now part of the class
// function initializeSimulator() { ... }
// function updateUI(result) { ... }
