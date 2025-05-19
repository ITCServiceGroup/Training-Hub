// Web Worker for Router Simulator Signal Calculation
console.log('[Worker] Script loading...');

// State variables within the worker (updated via messages)
let floorplanData = null;
let canvasWidth = 0;
let canvasHeight = 0;

// --- Calculation & Geometry Helpers (Copied from original index.js) ---

function getColorForStrength(strength) {
    // ... (calculation logic as before) ...
    const green = { r: 76, g: 175, b: 80 };
    const blue = { r: 33, g: 150, b: 243 };
    const yellow = { r: 255, g: 193, b: 7 };
    const red = { r: 244, g: 67, b: 54 };
    let r, g, b;

    if (strength >= 0.6) { // Green to Blue
        const t = (strength - 0.6) / 0.4;
        r = Math.round(blue.r + (green.r - blue.r) * t);
        g = Math.round(blue.g + (green.g - blue.g) * t);
        b = Math.round(blue.b + (green.b - blue.b) * t);
    } else if (strength >= 0.3) { // Blue to Yellow
        const t = (strength - 0.3) / 0.3;
        r = Math.round(yellow.r + (blue.r - yellow.r) * t);
        g = Math.round(yellow.g + (blue.g - yellow.g) * t);
        b = Math.round(yellow.b + (blue.b - yellow.b) * t);
    } else { // Yellow to Red
        const t = strength / 0.3;
        r = Math.round(red.r + (yellow.r - red.r) * t);
        g = Math.round(red.g + (yellow.g - red.g) * t);
        b = Math.round(red.b + (yellow.b - red.b) * t);
    }
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return { r, g, b };
}

function calculateSignalAtPoint(x, y, sourceX, sourceY) {
    // Use worker's state
    if (!floorplanData || !canvasWidth || !canvasHeight) {
        // console.warn("[Worker] calculateSignalAtPoint: Config not ready.");
        return 0;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(sourceX) || !Number.isFinite(sourceY)) {
        // console.warn("[Worker] calculateSignalAtPoint: Invalid coordinates.");
        return 0;
    }

    let sourceInterferencePenalty = 1.0;
    if (floorplanData.interferenceSources) {
        for (const source of floorplanData.interferenceSources) {
            if (source.active) {
                const distToInterference = Math.sqrt(Math.pow(sourceX - source.x, 2) + Math.pow(sourceY - source.y, 2));
                if (distToInterference <= source.radius) {
                    const proximityFactor = distToInterference / source.radius;
                    const basePenaltyFactor = Math.pow(proximityFactor, 1.5);
                    const signalMultiplier = 0.25 + (1 - 0.25) * basePenaltyFactor;
                    sourceInterferencePenalty *= signalMultiplier;
                }
            }
        }
    }


    const dx = x - sourceX;
    const dy = y - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.5 * 5;

    let strength = Math.pow(Math.max(0, 1 - (distance / maxRadius)), 2) * sourceInterferencePenalty;

    let totalAttenuation = calculateAttenuation(x, y, sourceX, sourceY);

    if (floorplanData.interferenceSources) {
        for (const source of floorplanData.interferenceSources) {
            if (source.active) {
                const distToSource = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                if (distToSource <= source.radius) {
                    const interferenceStrength = 1 - (distToSource / source.radius);
                    totalAttenuation += source.attenuation * interferenceStrength;
                }
                if (distToSource > source.radius && lineSegmentIntersectsCircle(sourceX, sourceY, x, y, source.x, source.y, source.radius)) {
                    totalAttenuation += source.attenuation * 0.75;
                }
            }
        }
    }


    strength *= Math.max(0, 1 - totalAttenuation);
    return Math.max(0, Math.min(1, strength));
}

// Calculates the combined signal strength at point (x, y) considering the router and multiple extenders
function calculateCombinedSignalStrength(x, y, routerCenterX, routerCenterY, extenders, extenderStrengths) {
    let maxSignal = calculateSignalAtPoint(x, y, routerCenterX, routerCenterY); // Start with router signal

    const MESH_MIN_INPUT_THRESHOLD = 0.05;
    const MESH_EFFECTIVE_RANGE = 1.2;
    const maxRange = Math.min(canvasWidth, canvasHeight) * 0.5 * 5 * MESH_EFFECTIVE_RANGE;

    for (const extender of extenders) {
        if (!extender.placed) continue; // Skip if not placed

        const inputStrength = extenderStrengths[extender.id];
        if (inputStrength < MESH_MIN_INPUT_THRESHOLD) continue; // Skip if input signal is too weak

        const boostFactor = getMeshBoostFactor(inputStrength);
        const extenderCenterX = Math.floor(extender.x + (extender.width / 2));
        const extenderCenterY = Math.floor(extender.y + (extender.height / 2));

        const dx = x - extenderCenterX;
        const dy = y - extenderCenterY;
        const distanceFromMesh = Math.sqrt(dx * dx + dy * dy);

        // Calculate base signal from this extender
        let extenderSignal = boostFactor * Math.pow(Math.max(0, 1 - (distanceFromMesh / maxRange)), 2);

        // Apply attenuation from walls/obstacles between point (x,y) and this extender
        const extenderAttenuation = calculateAttenuation(x, y, extenderCenterX, extenderCenterY);
        extenderSignal *= Math.max(0, 1 - extenderAttenuation);

        // Apply attenuation from active interference sources affecting this extender's signal path
        if (floorplanData.interferenceSources) {
            for (const source of floorplanData.interferenceSources) {
                if (source.active) {
                    const distToSource = Math.sqrt(Math.pow(x - source.x, 2) + Math.pow(y - source.y, 2));
                    // Direct overlap with interference zone
                    if (distToSource <= source.radius) {
                        const interferenceStrength = 1 - (distToSource / source.radius);
                        extenderSignal *= Math.max(0, 1 - (source.attenuation * interferenceStrength));
                    }
                    // Signal path intersects interference zone
                    if (distToSource > source.radius && lineSegmentIntersectsCircle(extenderCenterX, extenderCenterY, x, y, source.x, source.y, source.radius)) {
                         extenderSignal *= Math.max(0, 1 - (source.attenuation * 0.75));
                    }
                }
            }
        }

        // Update maxSignal if this extender provides a stronger signal at this point
        maxSignal = Math.max(maxSignal, extenderSignal);
    }

    return maxSignal;
}


function getMeshBoostFactor(inputSignal) {
    // ... (calculation logic as before) ...
    const MESH_MIN_INPUT_THRESHOLD = 0.05;
    if (inputSignal < MESH_MIN_INPUT_THRESHOLD) return 0;

    const getScaledBoost = (minOutput, maxOutput, input, minInput, maxInput) => {
        const scale = (input - minInput) / (maxInput - minInput);
        return minOutput + (maxOutput - minOutput) * Math.min(1, Math.max(0, scale));
    };

    if (inputSignal <= 0.15) return getScaledBoost(0.30, 0.40, inputSignal, 0.05, 0.15);
    if (inputSignal <= 0.30) return getScaledBoost(0.41, 0.60, inputSignal, 0.16, 0.30);
    if (inputSignal <= 0.50) return getScaledBoost(0.61, 0.80, inputSignal, 0.31, 0.50);
    return 1.0; // Max boost above 50% input
}

function calculateAttenuation(x, y, sourceX, sourceY) {
    // Use worker's state
    if (!floorplanData || !floorplanData.walls || !floorplanData.fixedObstacles) {
        // console.warn("[Worker] calculateAttenuation: Missing floorplan data.");
        return 0;
    }
    let totalAttenuation = 0;

    // --- WALLS ONLY: Attenuation from ALL Walls ---
    // Process all walls (both external and internal)
    for (const wall of floorplanData.walls) {
        // Calculate the exact intersection point with the wall
        const intersection = getLineIntersection(sourceX, sourceY, x, y, wall.x1, wall.y1, wall.x2, wall.y2);

        if (intersection) {
            // Apply different attenuation based on wall type
            if (wall.isExternal === true) {
                totalAttenuation += 0.4; // Higher attenuation for external walls
            } else {
                totalAttenuation += 0.15; // Lower attenuation for internal walls
            }

            // Calculate the distance from the intersection point to the target point
            const distFromIntersection = Math.sqrt(
                Math.pow(intersection.x - x, 2) +
                Math.pow(intersection.y - y, 2)
            );

            // Calculate the total distance from source to target
            const totalDist = Math.sqrt(
                Math.pow(sourceX - x, 2) +
                Math.pow(sourceY - y, 2)
            );

            // Apply a gradual attenuation effect after passing through the wall
            // This creates a smooth transition rather than a sharp cutoff
            if (distFromIntersection > 0 && totalDist > 0) {
                // The attenuation effect gradually decreases as we move away from the wall
                const attenuationFactor = Math.max(0, 1 - (distFromIntersection / totalDist));
                totalAttenuation *= attenuationFactor;
            }
        }
    }

    // --- Attenuation from Fixed Obstacles ---
    for (const obstacle of floorplanData.fixedObstacles) {
        if (obstacle.attenuation && lineIntersectsRect(sourceX, sourceY, x, y, obstacle.x, obstacle.y, obstacle.x + obstacle.width, obstacle.y + obstacle.height)) {
            totalAttenuation += obstacle.attenuation;
        }
    }
    return totalAttenuation;
}

// Helper function to calculate the exact intersection point between two line segments
function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Calculate the denominator
    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

    // If denominator is 0, lines are parallel
    if (denom === 0) return null;

    // Calculate ua and ub
    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

    // If ua and ub are between 0-1, segments intersect
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        // Calculate the intersection point
        const intersectionX = x1 + ua * (x2 - x1);
        const intersectionY = y1 + ua * (y2 - y1);
        return { x: intersectionX, y: intersectionY };
    }

    return null; // No intersection
}

function lineIntersectsRect(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
    // ... (geometry logic as before) ...
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    if (maxX < rx1 || minX > rx2 || maxY < ry1 || minY > ry2) return false;

    return (
        doLinesIntersect(x1, y1, x2, y2, rx1, ry1, rx2, ry1) || // Top
        doLinesIntersect(x1, y1, x2, y2, rx1, ry2, rx2, ry2) || // Bottom
        doLinesIntersect(x1, y1, x2, y2, rx1, ry1, rx1, ry2) || // Left
        doLinesIntersect(x1, y1, x2, y2, rx2, ry1, rx2, ry2)    // Right
    );
}

function doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Calculate the denominator
    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

    // If denominator is 0, lines are parallel
    if (denom === 0) return false;

    // Calculate ua and ub
    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

    // Return true if segment segments intersect
    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}

// These functions are no longer used since we're handling all walls directly in calculateAttenuation
// Keeping them as commented code for reference
/*
function checkExternalWallsInPath(x1, y1, x2, y2, floorplanData) {
    if (floorplanData.walls) {
        for (const wall of floorplanData.walls) {
            if (wall.isExternal === true) {
                if (doLinesIntersect(x1, y1, x2, y2, wall.x1, wall.y1, wall.x2, wall.y2)) {
                    return true;
                }
            }
        }
        return false;
    }
    else if (floorplanData.rooms) {
        for (const room of floorplanData.rooms) {
            if (room.externalWalls && isExternalWallIntersection(x1, y1, x2, y2, room)) {
                return true;
            }
        }
    }
    return false;
}

function isExternalWallIntersection(x1, y1, x2, y2, room) {
    if (!room || !room.externalWalls) return false;
    for (const wallDirection of room.externalWalls) {
        let wallStartX, wallStartY, wallEndX, wallEndY;
        switch (wallDirection) {
            case "north": wallStartX = room.x; wallStartY = room.y; wallEndX = room.x + room.width; wallEndY = room.y; break;
            case "south": wallStartX = room.x; wallStartY = room.y + room.height; wallEndX = room.x + room.width; wallEndY = room.y + room.height; break;
            case "west": wallStartX = room.x; wallStartY = room.y; wallEndX = room.x; wallEndY = room.y + room.height; break;
            case "east": wallStartX = room.x + room.width; wallStartY = room.y; wallEndX = room.x + room.width; wallEndY = room.y + room.height; break;
            default: continue;
        }
        if (doLinesIntersect(x1, y1, x2, y2, wallStartX, wallStartY, wallEndX, wallEndY)) {
            return true;
        }
    }
    return false;
}
*/

function lineSegmentIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
    // ... (geometry logic as before) ...
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = (fx * fx + fy * fy) - r * r;
    let discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return false;

    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) return true;

    const distSq1 = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy);
    const distSq2 = (x2 - cx) * (x2 - cx) + (y2 - cy) * (y2 - cy);
    if (distSq1 <= r * r && distSq2 <= r * r) return true;

    return false;
}

// --- Main Worker Logic ---

self.onmessage = function(e) {
    const { type, payload } = e.data;
    console.log('[Worker] Received message:', type, payload);

    if (type === 'updateConfig') {
        // Update worker state with new config
        floorplanData = payload.floorplanData;
        canvasWidth = payload.canvasWidth;
        canvasHeight = payload.canvasHeight;
        console.log('[Worker] Config updated:', { canvasWidth, canvasHeight, floorplanKey: floorplanData?.name }); // Added optional chaining
    } else if (type === 'calculateSignal') {
        console.log('[Worker] Starting signal calculation...');
        if (!floorplanData || !canvasWidth || !canvasHeight) {
            console.warn("[Worker] Cannot calculate signal, config not ready.");
            // Optionally send back an error or empty result
            // self.postMessage({ type: 'signalError', payload: 'Config not ready' });
            return;
        }

        const {
            routerX, routerY, routerWidth, routerHeight,
            extenders // Receive the array of extender data
        } = payload;

        // Calculate router center position
        const routerCenterX = Math.floor(routerX + (routerWidth / 2));
        const routerCenterY = Math.floor(routerY + (routerHeight / 2));

        // Calculate input signal strength for each placed extender
        const extenderStrengths = {}; // Use an object mapped by ID
        for (const extender of extenders) {
            if (extender.placed) {
                const extenderCenterX = Math.floor(extender.x + (extender.width / 2));
                const extenderCenterY = Math.floor(extender.y + (extender.height / 2));
                extenderStrengths[extender.id] = calculateSignalAtPoint(extenderCenterX, extenderCenterY, routerCenterX, routerCenterY);
            } else {
                extenderStrengths[extender.id] = 0; // Store 0 if not placed
            }
        }


        // Generate ImageData
        // Use try-catch for ImageData creation as it can fail with 0 dimensions
        let imageData;
        try {
             imageData = new ImageData(canvasWidth, canvasHeight); // Use constructor directly in worker
        } catch (error) {
            console.error("[Worker] Error creating ImageData:", error, {canvasWidth, canvasHeight});
            // self.postMessage({ type: 'signalError', payload: 'Failed to create ImageData' });
            return;
        }
        const data = imageData.data;

        // Pixel loop - wrap in try-catch? Might be too slow.
        try {
            for (let y = 0; y < canvasHeight; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    const strength = calculateCombinedSignalStrength(
                        x, y,
                        routerCenterX, routerCenterY,
                        extenders, // Pass the array
                        extenderStrengths // Pass the calculated strengths
                    );
                    const color = getColorForStrength(strength);
                    const alpha = Math.floor(strength * 0.6 * 255); // Adjusted alpha

                    const i = (y * canvasWidth + x) * 4;
                    data[i] = color.r;
                    data[i + 1] = color.g;
                    data[i + 2] = color.b;
                    data[i + 3] = alpha;
                }
            }
        } catch (calcError) {
             console.error("[Worker] Error during pixel calculation loop:", calcError);
             // self.postMessage({ type: 'signalError', payload: 'Calculation loop failed' });
             return;
        }


        // Send the result back to the main thread
        console.log('[Worker] Calculation complete. Sending signalResult...');
        try {
            // Convert extenderStrengths object back to array for posting
            const extenderStrengthsArray = Object.entries(extenderStrengths).map(([id, strength]) => ({ id: parseInt(id), strength }));

            self.postMessage({
                type: 'signalResult',
                payload: {
                    imageData: imageData,
                    extenderStrengths: extenderStrengthsArray // Send back calculated strengths for all extenders
                }
            }, [imageData.data.buffer]); // Transfer the buffer
        } catch (postError) {
             console.error("[Worker] Error posting message back to main thread:", postError);
        }

    } else {
         console.warn('[Worker] Received unknown message type:', type);
    }
};

// Add error handling for the worker itself
self.onerror = function(error) {
    console.error('[Worker] Uncaught error in worker:', error);
    // Optionally notify the main thread
    // self.postMessage({ type: 'workerError', payload: error.message });
};

console.log('[Worker] Initialized and message listener attached.');
