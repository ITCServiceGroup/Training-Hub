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
 * @param {number} nodeIndex - The index of the node in its parent (optional, if not provided, adds to end)
 * @returns {Object} The new node
 */
export const duplicateCollapsibleSection = (node, query, actions, currentParent, nodeIndex = null) => {
  console.log('[CollapsibleSectionDuplicator] Duplicating CollapsibleSection with special handler');

  // Start a batch of actions that will be treated as a single undo step
  const throttledActions = actions.history.throttle(100);

  // Create a deep copy of the props
  const nodeProps = { ...node.data.props };

  // Create a fresh node with the same properties
  const freshNode = {
    data: {
      type: CollapsibleSection, // Use the actual component reference
      props: nodeProps,
      custom: node.data.custom ? { ...node.data.custom } : undefined,
      isCanvas: !!node.data.isCanvas,
      displayName: 'CollapsibleSection', // Use the exact display name
      linkedNodes: {} // Initialize empty linkedNodes object
    }
  };

  // Create the new node
  const newNode = query.parseFreshNode(freshNode).toNode();
  console.log('[CollapsibleSectionDuplicator] New CollapsibleSection node created:', newNode.id);

  // Add the new node to the parent
  if (nodeIndex !== null) {
    // When duplicating directly, add right after the original
    console.log('[CollapsibleSectionDuplicator] Adding new CollapsibleSection to parent:', currentParent, 'at index:', nodeIndex + 1);
    throttledActions.add(newNode, currentParent, nodeIndex + 1);
  } else {
    // When duplicating within a larger section, add to end to maintain relative position
    console.log('[CollapsibleSectionDuplicator] Adding new CollapsibleSection to parent:', currentParent, 'at end');
    throttledActions.add(newNode, currentParent);
  }

  /**
   * Helper function to recursively duplicate a node and all its descendants
   * @param {string} originalNodeId - ID of the node to duplicate
   * @param {string} newParentIdForThisNode - ID of where to add the duplicated node
   * @returns {Object} The newly created top node of the duplicated subtree
   */
  function duplicateSubTree(originalNodeId, newParentIdForThisNode) {
    try {
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
          linkedNodes: {} // Initialize empty linkedNodes object
        }
      };

      // Create the new node instance
      const newCreatedNode = query.parseFreshNode(freshNodeData).toNode();

      // Add this newly created node to its new parent
      throttledActions.add(newCreatedNode, newParentIdForThisNode);
      console.log(`[CollapsibleSectionDuplicator] Added subtree node ${newCreatedNode.id} (${newCreatedNode.data.displayName}) to parent ${newParentIdForThisNode}`);

      // If the original node has linkedNodes, duplicate them too
      if (originalNode.data.linkedNodes && Object.keys(originalNode.data.linkedNodes).length > 0) {
        console.log(`[CollapsibleSectionDuplicator] Node ${originalNodeId} has linkedNodes:`, originalNode.data.linkedNodes);

        Object.entries(originalNode.data.linkedNodes).forEach(([linkedNodeKey, linkedNodeId]) => {
          try {
            // Verify the linked node exists before duplicating
            query.node(linkedNodeId).get();
            const newLinkedNode = duplicateSubTree(linkedNodeId, newCreatedNode.id);

            // Link the new node
            actions.setState(state => {
              const targetNode = state.nodes[newCreatedNode.id];
              if (targetNode && targetNode.data) {
                if (!targetNode.data.linkedNodes) {
                  targetNode.data.linkedNodes = {};
                }
                targetNode.data.linkedNodes[linkedNodeKey] = newLinkedNode.id;
              }
              return state;
            });

            console.log(`[CollapsibleSectionDuplicator] Linked node ${newLinkedNode.id} to ${newCreatedNode.id} with key ${linkedNodeKey}`);
          } catch (error) {
            console.error(`[CollapsibleSectionDuplicator] Error duplicating linkedNode ${linkedNodeKey}:${linkedNodeId}:`, error);
          }
        });
      }

      // If the original node had children, recursively duplicate them under the newCreatedNode
      if (originalNode.data.nodes && originalNode.data.nodes.length > 0) {
        console.log(`[CollapsibleSectionDuplicator] Node ${originalNodeId} has ${originalNode.data.nodes.length} children to process`);
        originalNode.data.nodes.forEach(childId => {
          duplicateSubTree(childId, newCreatedNode.id);
        });
      }

      return newCreatedNode;
    } catch (error) {
      console.error(`[CollapsibleSectionDuplicator] Error in duplicateSubTree for node ${originalNodeId}:`, error);
      return null;
    }
  }

  // Now duplicate the linkedNodes (step canvases or content canvas)
  if (node.data.linkedNodes && Object.keys(node.data.linkedNodes).length > 0) {
    console.log('[CollapsibleSectionDuplicator] CollapsibleSection has linkedNodes:', node.data.linkedNodes);

    // Process each linkedNode
    Object.entries(node.data.linkedNodes).forEach(([linkedNodeKey, linkedNodeId]) => {
      console.log(`[CollapsibleSectionDuplicator] Duplicating CollapsibleSection linkedNode ${linkedNodeKey}:${linkedNodeId}`);

      try {
        // Get the linkedNode to duplicate
        const linkedNodeToDuplicate = query.node(linkedNodeId).get();

        // Log the type of canvas we're duplicating
        console.log(`[CollapsibleSectionDuplicator] Duplicating ${
          linkedNodeKey.startsWith('step-') && linkedNodeKey.endsWith('-canvas')
            ? 'step canvas'
            : linkedNodeKey === 'content-canvas'
              ? 'content canvas'
              : 'unknown canvas type'
        }: ${linkedNodeKey}`);

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

        // Link the new node to the parent using setState (similar to Tabs component)
        actions.setState(state => {
          const targetNode = state.nodes[newNode.id];
          if (targetNode && targetNode.data) {
            if (!targetNode.data.linkedNodes) {
              targetNode.data.linkedNodes = {};
            }
            targetNode.data.linkedNodes[linkedNodeKey] = newLinkedNode.id;
          } else {
            console.error(`[CollapsibleSectionDuplicator] Target node ${newNode.id} or its data not found in state for linking.`);
          }
          return state;
        });

        console.log(`[CollapsibleSectionDuplicator] Linked new node ${newLinkedNode.id} to CollapsibleSection ${newNode.id} with key ${linkedNodeKey}`);

        // If the linkedNode has children, duplicate them too
        if (linkedNodeToDuplicate.data.nodes && linkedNodeToDuplicate.data.nodes.length > 0) {
          console.log(`[CollapsibleSectionDuplicator] LinkedNode ${linkedNodeId} has ${linkedNodeToDuplicate.data.nodes.length} children to process`);

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
        console.error(`[CollapsibleSectionDuplicator] Error duplicating linkedNode ${linkedNodeKey}:${linkedNodeId}:`, error);
      }
    });
  }

  console.log('[CollapsibleSectionDuplicator] CollapsibleSection structure and linked canvases duplicated successfully.');
  return newNode;
};
