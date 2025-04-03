// Drag and Drop handlers for the Router Simulator component

/**
 * Starts dragging the main router.
 * @param {Event} e - The mousedown or touchstart event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function startDrag(e, component) {
    if (e.type === 'touchstart') { e.preventDefault(); }

    component.isDragging = true;
    component.router.style.transition = 'none'; // Disable transition during drag
    component.router.style.cursor = 'grabbing';
    component.router.style.zIndex = '11'; // Bring to front

    const parentRect = component.routerPlacement.getBoundingClientRect();
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

    // Calculate offset relative to the parent container, not the element itself
    component.offsetX = clientX - parentRect.left - component.lastKnownPosition.x;
    component.offsetY = clientY - parentRect.top - component.lastKnownPosition.y;
}

/**
 * Moves the main router during drag.
 * @param {Event} e - The mousemove or touchmove event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function moveRouter(e, component) {
    if (!component.isDragging || !component.router || !component.routerPlacement) { return; }
    if (e.type === 'touchmove') { e.preventDefault(); }

    const parentRect = component.routerPlacement.getBoundingClientRect();
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    // Calculate new position based on cursor position relative to parent and initial offset
    let newX = clientX - parentRect.left - component.offsetX;
    let newY = clientY - parentRect.top - component.offsetY;

    // Clamp position within bounds
    newX = Math.round(Math.max(0, Math.min(newX, component.routerPlacement.offsetWidth - component.routerDimensions.width)));
    newY = Math.round(Math.max(0, Math.min(newY, component.routerPlacement.offsetHeight - component.routerDimensions.height)));

    // Update visual position immediately using transform
    component.router.style.transform = `translate(${newX}px, ${newY}px)`;
    component.lastKnownPosition = { x: newX, y: newY };

    // Request signal update directly - Call the component's method
    component._requestSignalUpdate();
}

/**
 * Stops dragging the main router.
 * @param {Event} e - The mouseup or touchend event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function stopDrag(e, component) {
    if (!component.isDragging) { return; }
    component.isDragging = false;
    component.router.style.cursor = 'grab';
    component.router.style.zIndex = '10';
    // Re-enable transition if desired, or keep it off for pure transform control
    // component.router.style.transition = 'transform 0.05s ease-out'; // Example if re-enabling

    // Ensure final signal update is requested - Call the component's method
    component._requestSignalUpdate();
}

/**
 * Starts dragging the mesh extender.
 * @param {Event} e - The mousedown or touchstart event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 * @param {number} extenderId - The ID (1 or 2) of the extender being dragged.
 */
export function startMeshExtenderDrag(e, component, extenderId) {
    const extender = component.extenders.find(ext => ext.id === extenderId);
    if (!extender || !extender.placed || !extender.element) { return; }
    if (e.type === 'touchstart') { e.preventDefault(); }

    component.draggingExtenderId = extenderId; // Set which extender is being dragged
    extender.element.style.transition = 'none'; // Disable transition
    extender.element.style.cursor = 'grabbing';
    extender.element.style.zIndex = '11'; // Bring to front

    const parentRect = component.routerPlacement.getBoundingClientRect();
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

    // Calculate offset relative to the parent container using the correct extender's position
    component.offsetX = clientX - parentRect.left - extender.x;
    component.offsetY = clientY - parentRect.top - extender.y;
}

/**
 * Moves the mesh extender during drag.
 * @param {Event} e - The mousemove or touchmove event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function moveMeshExtender(e, component) {
    // Check which extender is being dragged
    const extenderId = component.draggingExtenderId;
    if (!extenderId || !component.routerPlacement) { return; }

    const extender = component.extenders.find(ext => ext.id === extenderId);
    if (!extender || !extender.element) { return; }

    if (e.type === 'touchmove') { e.preventDefault(); }

    const parentRect = component.routerPlacement.getBoundingClientRect();
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    // Calculate new position
    let newX = clientX - parentRect.left - component.offsetX;
    let newY = clientY - parentRect.top - component.offsetY;

    // Clamp position using the correct extender's dimensions
    newX = Math.round(Math.max(0, Math.min(newX, component.routerPlacement.offsetWidth - extender.dimensions.width)));
    newY = Math.round(Math.max(0, Math.min(newY, component.routerPlacement.offsetHeight - extender.dimensions.height)));

    // Update visual position immediately using transform
    extender.element.style.transform = `translate(${newX}px, ${newY}px)`;
    // Update state position for the correct extender
    extender.x = newX;
    extender.y = newY;

    // Request signal update directly - Call the component's method
    component._requestSignalUpdate();
}

/**
 * Stops dragging the mesh extender.
 * @param {Event} e - The mouseup or touchend event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function stopMeshExtenderDrag(e, component) {
    const extenderId = component.draggingExtenderId;
    if (!extenderId) { return; } // Check if we were actually dragging an extender

    const extender = component.extenders.find(ext => ext.id === extenderId);
    if (extender && extender.element) {
        extender.element.style.cursor = 'grab';
        extender.element.style.zIndex = '10';
        // Re-enable transition if desired
        // extender.element.style.transition = 'transform 0.05s ease-out';
    }

    component.draggingExtenderId = null; // Reset dragging state

    // Ensure final signal update is requested - Call the component's method
    component._requestSignalUpdate();
}

/**
 * Starts dragging an interference source.
 * @param {Event} e - The mousedown or touchstart event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 * @param {string} sourceName - The name of the interference source.
 */
export function startInterferenceDrag(e, component, sourceName) {
    const sourceData = component.floorplanData.interferenceSources.find(s => s.name === sourceName);
    const element = component.interferenceElements[sourceName];
    if (!sourceData || !sourceData.active || !element) { return; }
    if (e.type === 'touchstart') { e.preventDefault(); }

    component.isDraggingInterference = sourceName;
    element.style.transition = 'none';
    element.style.cursor = 'grabbing';
    element.style.zIndex = '11';

    const parentRect = component.routerPlacement.getBoundingClientRect();
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

    // Calculate initial visual position from center coordinates
    const initialVisualX = sourceData.x - sourceData.radius;
    const initialVisualY = sourceData.y - sourceData.radius;
    
    // Set offset relative to visual position
    component.offsetX = clientX - parentRect.left - initialVisualX;
    component.offsetY = clientY - parentRect.top - initialVisualY;
}

/**
 * Moves an interference source during drag.
 * @param {Event} e - The mousemove or touchmove event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function moveInterference(e, component) {
    if (!component.isDraggingInterference || !component.routerPlacement) { return; }
    if (e.type === 'touchmove') { e.preventDefault(); }

    const sourceName = component.isDraggingInterference;
    const sourceData = component.floorplanData.interferenceSources.find(s => s.name === sourceName);
    const element = component.interferenceElements[sourceName];
    if (!sourceData || !element) { return; }

    const parentRect = component.routerPlacement.getBoundingClientRect();
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    // Calculate new visual position
    let visualX = clientX - parentRect.left - component.offsetX;
    let visualY = clientY - parentRect.top - component.offsetY;

    // Calculate new center position
    let centerX = visualX + sourceData.radius;
    let centerY = visualY + sourceData.radius;

    // Clamp center position within bounds
    centerX = Math.round(Math.max(sourceData.radius, Math.min(centerX, component.routerPlacement.offsetWidth - sourceData.radius)));
    centerY = Math.round(Math.max(sourceData.radius, Math.min(centerY, component.routerPlacement.offsetHeight - sourceData.radius)));

    // Recalculate visual position from clamped center position
    visualX = centerX - sourceData.radius;
    visualY = centerY - sourceData.radius;

    // Update source data position (center point)
    sourceData.x = centerX;
    sourceData.y = centerY;

    // Store visual position
    sourceData.visualX = visualX;
    sourceData.visualY = visualY;

    // Update element position
    element.style.transform = `translate(${visualX}px, ${visualY}px)`;

    // Send updated config to worker, which will trigger recalculation
    component._sendConfigToWorker();
    // Also explicitly request a signal update using the new config
    component._requestSignalUpdate();
}

/**
 * Stops dragging an interference source.
 * @param {Event} e - The mouseup or touchend event.
 * @param {HTMLElement} component - The RouterSimulatorElement instance.
 */
export function stopInterferenceDrag(e, component) {
    if (!component.isDraggingInterference) { return; }

    const sourceName = component.isDraggingInterference;
    const element = component.interferenceElements[sourceName];
    if (element) {
        element.style.cursor = 'grab';
        element.style.zIndex = '3';
    }

    component.isDraggingInterference = null;
    // Send updated config to worker, which will trigger recalculation
    component._sendConfigToWorker();
    // Also explicitly request a signal update using the final config
    component._requestSignalUpdate();
}
