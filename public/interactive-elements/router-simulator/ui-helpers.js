// UI Helper functions for the Router Simulator component

/**
 * Calculates the boost factor for the mesh extender based on input signal strength.
 * @param {number} inputSignal - Signal strength at the extender (0.0 to 1.0).
 * @returns {number} - The calculated boost factor (0.0 to 1.0).
 */
function getMeshBoostFactor(inputSignal) {
    const MESH_MIN_INPUT_THRESHOLD = 0.05;
    if (inputSignal < MESH_MIN_INPUT_THRESHOLD) { return 0; }

    const getScaledBoost = (minOutput, maxOutput, input, minInput, maxInput) => {
        const scale = (input - minInput) / (maxInput - minInput);
        return minOutput + (maxOutput - minOutput) * Math.min(1, Math.max(0, scale));
    };

    if (inputSignal <= 0.15) { return getScaledBoost(0.30, 0.40, inputSignal, 0.05, 0.15); }
    if (inputSignal <= 0.30) { return getScaledBoost(0.41, 0.60, inputSignal, 0.16, 0.30); }
    if (inputSignal <= 0.50) { return getScaledBoost(0.61, 0.80, inputSignal, 0.31, 0.50); }
    return 1.0; // Max boost above 50% input
}

// updateSignalInfo function removed as the corresponding element is not in the template
