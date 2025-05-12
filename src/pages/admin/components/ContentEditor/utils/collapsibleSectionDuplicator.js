/**
 * Utility functions for duplicating CollapsibleSection components
 */

import { CollapsibleSection } from '../components/selectors/CollapsibleSection';

/**
 * Duplicates a CollapsibleSection component and all its content
 * @param {Object} node - The node to duplicate
 * @param {Object} query - The craft.js query object
 * @param {Object} actions - The craft.js actions object
 * @param {string} currentParent - The ID of the parent node
 * @param {number} nodeIndex - The index of the node in its parent
 * @returns {Object} The new node
 */
export const duplicateCollapsibleSection = (node, query, actions, currentParent, nodeIndex) => {
  console.log('Duplicating CollapsibleSection with special handler');

  // Start a batch of actions that will be treated as a single undo step
  const throttledActions = actions.history.throttle(100);

  // Create a deep copy of the props
  const nodeProps = { ...node.data.props };

  // Prepare step children arrays if steps are enabled
  if (nodeProps.stepsEnabled) {
    const numberOfSteps = nodeProps.numberOfSteps || 3;
    for (let i = 1; i <= numberOfSteps; i++) {
      const stepPropName = `step${i}Children`;
      // Initialize as empty array
      nodeProps[stepPropName] = [];
    }
  }

  // Create a fresh node with the same properties
  const freshNode = {
    data: {
      type: CollapsibleSection, // Use the actual component reference
      props: nodeProps,
      custom: node.data.custom ? { ...node.data.custom } : undefined,
      isCanvas: !!node.data.isCanvas,
      displayName: 'Collapsible Section', // Use the exact display name
      linkedNodes: {} // Initialize empty linkedNodes object
    }
  };

  // Create the new node
  const newNode = query.parseFreshNode(freshNode).toNode();
  console.log('New CollapsibleSection node created:', newNode);

  // Add the new node to the same parent as the original, right after it
  console.log('Adding new CollapsibleSection to parent:', currentParent, 'at index:', nodeIndex + 1);
  throttledActions.add(newNode, currentParent, nodeIndex + 1);

  /**
   * Helper function to recursively duplicate a node and all its descendants
   * @param {string} originalNodeId - ID of the node to duplicate
   * @param {string} newParentIdForThisNode - ID of where to add the duplicated node
   * @param {Object} throttledActions - Batched actions object
   * @param {Object} query - Craft.js query object
   * @returns {Object} The newly created top node of the duplicated subtree
   */
  function duplicateSubTree(originalNodeId, newParentIdForThisNode) {
    const originalNode = query.node(originalNodeId).get();
    console.log(`[CollapsibleSectionDuplicator] Duplicating subtree for node ${originalNodeId} (${originalNode.data.displayName})`);

    // Create a fresh version of this node
    const freshNodeData = {
      data: {
        type: query.getOptions().resolver[originalNode.data.displayName] || originalNode.data.type,
        props: { ...originalNode.data.props },
        custom: originalNode.data.custom ? { ...originalNode.data.custom } : undefined,
        isCanvas: !!originalNode.data.isCanvas,
        displayName: originalNode.data.displayName,
        linkedNodes: {} // Assuming simple children for now
      }
    };

    // Create the new node instance
    const newCreatedNode = query.parseFreshNode(freshNodeData).toNode();
    
    // Add this newly created node to its new parent
    throttledActions.add(newCreatedNode, newParentIdForThisNode);
    console.log(`[CollapsibleSectionDuplicator] Added subtree node ${newCreatedNode.id} (${newCreatedNode.data.displayName}) to parent ${newParentIdForThisNode}`);

    // If the original node had children, recursively duplicate them under the newCreatedNode
    if (originalNode.data.nodes && originalNode.data.nodes.length > 0) {
      console.log(`[CollapsibleSectionDuplicator] Node ${originalNodeId} has ${originalNode.data.nodes.length} children to process`);
      originalNode.data.nodes.forEach(childId => {
        duplicateSubTree(childId, newCreatedNode.id);
      });
    }

    return newCreatedNode;
  }

  // Now duplicate the linkedNodes (step canvases or content canvas)
  if (node.data.linkedNodes && Object.keys(node.data.linkedNodes).length > 0) {
    console.log('CollapsibleSection has linkedNodes:', node.data.linkedNodes);

    // Process each linkedNode
    Object.entries(node.data.linkedNodes).forEach(([linkedNodeKey, linkedNodeId]) => {
      console.log(`Duplicating CollapsibleSection linkedNode ${linkedNodeKey}:${linkedNodeId}`);

      try {
        // Get the linkedNode to duplicate
        const linkedNodeToDuplicate = query.node(linkedNodeId).get();

        // Check if this is a step canvas or content canvas
        const isStepCanvas = linkedNodeKey.startsWith('step-') && linkedNodeKey.endsWith('-canvas');
        const isContentCanvas = linkedNodeKey === 'content-canvas';

        // Create a fresh linkedNode
        const freshLinkedNode = {
          data: {
            type: linkedNodeToDuplicate.data.type,
            props: { ...linkedNodeToDuplicate.data.props },
            custom: linkedNodeToDuplicate.data.custom ? { ...linkedNodeToDuplicate.data.custom } : undefined,
            isCanvas: true, // Ensure it's a canvas
            displayName: linkedNodeToDuplicate.data.displayName,
            linkedNodes: {} // Initialize empty linkedNodes object
          }
        };

        // Create the new linkedNode
        const newLinkedNode = query.parseFreshNode(freshLinkedNode).toNode();

        // Add the new linkedNode
        throttledActions.add(newLinkedNode, newNode.id);

        // Link the new node to the parent
        // console.log('Inspecting actions object before setNodeData:', actions); // Removed for this attempt
        // actions.setNodeData(newNode.id, (data) => { // OLD, FAILING LINE
        //   if (!data.linkedNodes) {
        //     data.linkedNodes = {};
        //   }
        //   data.linkedNodes[linkedNodeKey] = newLinkedNode.id;
        // });

        // NEW ATTEMPT using actions.setState
        actions.setState(state => {
          const targetNode = state.nodes[newNode.id];
          if (targetNode && targetNode.data) { // Ensure targetNode and targetNode.data exist
            if (!targetNode.data.linkedNodes) {
              targetNode.data.linkedNodes = {};
            }
            targetNode.data.linkedNodes[linkedNodeKey] = newLinkedNode.id;
          } else {
            console.error(`[CollapsibleSectionDuplicator] Target node ${newNode.id} or its data not found in state for linking.`);
          }
          // Craft.js uses Immer for setState, so direct mutation of the draft state is expected.
          // No explicit return of a new state object is needed if Immer is correctly proxying the state.
          // However, to be absolutely safe or if Immer's behavior is uncertain here,
          // one might consider returning a new state, but this is usually not necessary with Craft.js.
          return state; // Let Immer handle the new state generation from mutations
        });

        console.log(`Linked new node ${newLinkedNode.id} to CollapsibleSection ${newNode.id} with key ${linkedNodeKey} using setState`);

        // If the linkedNode has children, duplicate them too
        if (linkedNodeToDuplicate.data.nodes && linkedNodeToDuplicate.data.nodes.length > 0) {
          console.log(`LinkedNode ${linkedNodeId} has children:`, linkedNodeToDuplicate.data.nodes);

          // Process each child and its descendants recursively
          linkedNodeToDuplicate.data.nodes.forEach(childId => {
            try {
              // newLinkedNode.id is the ID of the new canvas this child subtree should go into
              duplicateSubTree(childId, newLinkedNode.id);
            } catch (error) {
              console.error(`[CollapsibleSectionDuplicator] Error in duplicateSubTree for child ${childId}:`, error);
            }
          });
        }
      } catch (error) {
        console.error(`Error duplicating linkedNode ${linkedNodeKey}:${linkedNodeId}:`, error);
      }
    });
  }

  console.log('CollapsibleSection structure and linked canvases duplicated successfully.');
  return newNode;
};
