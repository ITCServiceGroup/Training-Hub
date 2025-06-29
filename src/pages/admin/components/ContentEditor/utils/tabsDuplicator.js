/**
 * Utility functions for duplicating Tabs components
 */

import { Tabs } from '../components/selectors/Tabs';

/**
 * Duplicates a Tabs component and all its content
 * @param {Object} node - The node to duplicate
 * @param {Object} query - The craft.js query object
 * @param {Object} actions - The craft.js actions object
 * @param {string} currentParent - The ID of the parent node
 * @param {number} nodeIndex - The index of the node in its parent (optional, if not provided, adds to end)
 * @returns {Object} The new node
 */
export const duplicateTabs = (node, query, actions, currentParent, nodeIndex = null) => {
  console.log('[TabsDuplicator] Duplicating Tabs with special handler');

  // Start a batch of actions that will be treated as a single undo step
  const throttledActions = actions.history.throttle(100);

  // Create a deep copy of the props
  const nodeProps = { ...node.data.props };
  // Initialize content arrays for each tab
  nodeProps.tabContentChildren = [];

  // Create a fresh node with the same properties
  const freshNode = {
    data: {
      type: Tabs,
      props: nodeProps,
      custom: node.data.custom ? { ...node.data.custom } : undefined,
      isCanvas: !!node.data.isCanvas,
      displayName: 'Tabs',
      linkedNodes: {}
    }
  };

  // Create the new node
  const newNode = query.parseFreshNode(freshNode).toNode();
  console.log('[TabsDuplicator] New Tabs node created:', newNode);

  // Add the new node to the parent
  if (nodeIndex !== null) {
    // When duplicating directly, add right after the original
    console.log('[TabsDuplicator] Adding new Tabs to parent:', currentParent, 'at index:', nodeIndex + 1);
    throttledActions.add(newNode, currentParent, nodeIndex + 1);
  } else {
    // When duplicating within a larger section, add to end to maintain relative position
    console.log('[TabsDuplicator] Adding new Tabs to parent:', currentParent, 'at end');
    throttledActions.add(newNode, currentParent);
  }

  /**
   * Helper function to recursively duplicate a node and all its descendants
   * @param {string} originalNodeId - ID of the node to duplicate
   * @param {string} newParentIdForThisNode - ID of where to add the duplicated node
   * @returns {Object} The newly created top node of the duplicated subtree
   */
  function duplicateSubTree(originalNodeId, newParentIdForThisNode) {
    const originalNode = query.node(originalNodeId).get();
    console.log(`[TabsDuplicator] Duplicating subtree for node ${originalNodeId} (${originalNode.data.displayName})`);

    // Create a fresh version of this node
    const freshNodeData = {
      data: {
        type: query.getOptions().resolver[originalNode.data.displayName] || originalNode.data.type,
        props: { ...originalNode.data.props },
        custom: originalNode.data.custom ? { ...originalNode.data.custom } : undefined,
        isCanvas: !!originalNode.data.isCanvas,
        displayName: originalNode.data.displayName,
        linkedNodes: {}
      }
    };

    // Create the new node instance
    const newCreatedNode = query.parseFreshNode(freshNodeData).toNode();
    
    // Add this newly created node to its new parent
    throttledActions.add(newCreatedNode, newParentIdForThisNode);
    console.log(`[TabsDuplicator] Added subtree node ${newCreatedNode.id} (${newCreatedNode.data.displayName}) to parent ${newParentIdForThisNode}`);

    // If the original node had children, recursively duplicate them
    if (originalNode.data.nodes && originalNode.data.nodes.length > 0) {
      console.log(`[TabsDuplicator] Node ${originalNodeId} has ${originalNode.data.nodes.length} children to process`);
      originalNode.data.nodes.forEach(childId => {
        duplicateSubTree(childId, newCreatedNode.id);
      });
    }

    return newCreatedNode;
  }

  // Now duplicate the linkedNodes (tab content canvases)
  if (node.data.linkedNodes && Object.keys(node.data.linkedNodes).length > 0) {
    console.log('[TabsDuplicator] Tabs has linkedNodes:', node.data.linkedNodes);

    // Process each linkedNode
    Object.entries(node.data.linkedNodes).forEach(([linkedNodeKey, linkedNodeId]) => {
      console.log(`[TabsDuplicator] Duplicating tab content ${linkedNodeKey}:${linkedNodeId}`);

      try {
        // Get the linkedNode to duplicate
        const linkedNodeToDuplicate = query.node(linkedNodeId).get();

        // Create a fresh linkedNode
        const freshLinkedNode = {
          data: {
            type: linkedNodeToDuplicate.data.type,
            props: { ...linkedNodeToDuplicate.data.props },
            custom: linkedNodeToDuplicate.data.custom ? { ...linkedNodeToDuplicate.data.custom } : undefined,
            isCanvas: true,
            displayName: linkedNodeToDuplicate.data.displayName,
            linkedNodes: {}
          }
        };

        // Create the new linkedNode
        const newLinkedNode = query.parseFreshNode(freshLinkedNode).toNode();

        // Add the new linkedNode
        throttledActions.add(newLinkedNode, newNode.id);

        // Link the new node
        actions.setState(state => {
          const targetNode = state.nodes[newNode.id];
          if (targetNode && targetNode.data) {
            if (!targetNode.data.linkedNodes) {
              targetNode.data.linkedNodes = {};
            }
            targetNode.data.linkedNodes[linkedNodeKey] = newLinkedNode.id;
          }
        });

        // If the linkedNode has children, duplicate them too
        if (linkedNodeToDuplicate.data.nodes && linkedNodeToDuplicate.data.nodes.length > 0) {
          console.log(`[TabsDuplicator] Tab content ${linkedNodeId} has children:`, linkedNodeToDuplicate.data.nodes);

          // Process each child and its descendants recursively
          linkedNodeToDuplicate.data.nodes.forEach(childId => {
            try {
              duplicateSubTree(childId, newLinkedNode.id);
            } catch (error) {
              console.error(`[TabsDuplicator] Error in duplicateSubTree for child ${childId}:`, error);
            }
          });
        }
      } catch (error) {
        console.error(`[TabsDuplicator] Error duplicating tab content ${linkedNodeKey}:${linkedNodeId}:`, error);
      }
    });
  }

  console.log('[TabsDuplicator] Tabs structure and content duplicated successfully');
  return newNode;
};
