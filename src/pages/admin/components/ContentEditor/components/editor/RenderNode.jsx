import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useToolbarZIndex } from '../../contexts/ToolbarZIndexContext';
import { ROOT_NODE } from '@craftjs/utils';
import ReactDOM from 'react-dom';
import { FaArrowsAlt, FaTrash, FaArrowUp, FaCopy } from 'react-icons/fa';
import { duplicateCollapsibleSection } from '../../utils/collapsibleSectionDuplicator';
import { duplicateTabs } from '../../utils/tabsDuplicator';


export const RenderNode = ({ render }) => {
  const { id, dom, name, isHovered, isSelected, parent, data, connectors, isDragged, isDropTarget } = useNode((node) => ({
    isHovered: node.events.hovered,
    isSelected: node.events.selected,
    isDragged: node.events.dragged,
    isDropTarget: node.events.dropTarget,
    dom: node.dom,
    name: node.data.custom?.displayName || node.data.displayName || node.data.name,
    id: node.id,
    parent: node.data.parent,
    data: node.data,
  }));

  const { actions, query } = useEditor();

  // Check if the node is a container and can accept drops
  const isContainer = data.name === 'Container';
  const canAcceptDrop = isContainer && data.custom?.isCanvas;

  // Check if the node is draggable and deletable
  const isDraggable = query.node(id).isDraggable();
  const isDeletable = query.node(id).isDeletable();

  // Skip ROOT element indicators
  const isRoot = id === 'ROOT';

  // Check if this is a canvas element inside a CollapsibleSection
  const isCollapsibleSectionCanvas = () => {
    // Check if this is a canvas element
    const isCanvas = data.custom?.isCanvas || data.isCanvas;

    // Check if this is a step content or content canvas in CollapsibleSection
    const isStepContent = dom?.classList?.contains('craft-step-content');
    const isContentCanvas = dom?.classList?.contains('craft-container') &&
                           dom?.classList?.contains('is-canvas') &&
                           dom?.closest('.craft-collapsible-section');

    // Direct check for our new specific class
    const hasCollapsibleSectionCanvasClass = dom?.classList?.contains('collapsible-section-canvas');

    // Also check by ID pattern for step canvases or content canvas
    const isCanvasById = (id?.startsWith('step-') && id?.endsWith('-canvas')) || id === 'content-canvas';

    // Check if this is the main CollapsibleSection component itself (not its canvas)
    const isMainCollapsibleSection = dom?.classList?.contains('craft-collapsible-section') &&
                                    dom?.classList?.contains('main-component');

    // If this is the main CollapsibleSection component, we want to show the toolbar
    if (isMainCollapsibleSection) {
      return false;
    }

    // Also check by parent node type
    let isChildOfCollapsibleSection = false;
    if (parent && parent !== ROOT_NODE) {
      try {
        const parentNode = query.node(parent).get();
        const parentName = parentNode.data.displayName || parentNode.data.name;
        isChildOfCollapsibleSection = parentName === 'Collapsible Section';
      } catch (e) {
        // Ignore errors
      }
    }

    return (isCanvas && (isStepContent || isContentCanvas || isCanvasById || hasCollapsibleSectionCanvasClass || isChildOfCollapsibleSection));
  };

  // Create a ref for the toolbar
  const toolbarRef = useRef(null);
  const { updateZIndex, getZIndex } = useToolbarZIndex();

  // Function to get position for the toolbar
  const getPos = useCallback((domElement) => {
    if (!domElement) return { top: 0, left: 0 };

    const { top, left, bottom } = domElement.getBoundingClientRect();
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`,
    };
  }, []);

  // Update toolbar position on scroll
  const scroll = useCallback(() => {
    if (toolbarRef.current && dom) {
      const { top, left } = getPos(dom);
      toolbarRef.current.style.top = top;
      toolbarRef.current.style.left = left;
    }
  }, [dom, getPos]);

  // Update z-index and classes based on hover/select state for all nodes (except ROOT)
  useEffect(() => {
    if (dom && !isRoot) { // Exclude ROOT node
      // Handle selection state
      if (isSelected) {
        dom.classList.add('component-selected');
      } else {
        dom.classList.remove('component-selected');
      }

      // Handle hover state separately and update z-index
      if (isHovered && !isSelected) {
        dom.classList.add('component-hovered');
        updateZIndex(id);
      } else {
        dom.classList.remove('component-hovered');
      }

      // Update z-index when selected
      if (isSelected) {
        updateZIndex(id);
      }
    } else if (dom) {
      // Ensure classes are removed if it's the ROOT node or no longer hovered/selected
      dom.classList.remove('component-selected');
      dom.classList.remove('component-hovered');
    }
  }, [dom, isSelected, isHovered, isRoot]); // Dependencies updated

  // Utility function to check if element is within editor UI
  const isEditorUiElement = useCallback((target) => {
    return Boolean(
      target.closest('.px-2.py-2.text-white.bg-teal-600') || // Toolbar
      target.closest('.settings-panel') || // Settings panel
      target.closest('.settings-panel-content') || // Settings content
      target.closest('.settings-panel-body') || // Settings body
      target.closest('.craftjs-renderer') || // Editor area
      target.closest('.editor-menu') || // Editor menus
      document.activeElement?.tagName === 'INPUT' || // Focused input
      document.activeElement?.tagName === 'TEXTAREA' || // Focused textarea
      document.activeElement?.tagName === 'SELECT' // Focused select
    );
  }, []);

  // Mark containers as potential drop targets during drag operations
  useEffect(() => {
    if (!dom) return;

    // Handle dragging state for the element being dragged
    if (isDragged) {
      dom.setAttribute('data-dragging', 'true');

      // Add dragging-active class to the renderer as a fallback for browsers that don't support :has()
      const renderer = document.querySelector('.craftjs-renderer');
      if (renderer) {
        renderer.classList.add('dragging-active');
      }
    } else {
      dom.removeAttribute('data-dragging');
    }

    // Handle drop target state for containers
    if (canAcceptDrop) {
      const isDragging = query.getState().events.dragged.size > 0;
      if (isDragging && !isDragged) {
        dom.setAttribute('data-can-drop', 'true');

        // Add depth class to create visual hierarchy
        const depth = getContainerDepth(id, query);
        if (depth > 0) {
          dom.classList.add(`depth-${depth}`);
        }
      } else {
        dom.removeAttribute('data-can-drop');
        // Remove depth classes
        dom.classList.remove('depth-1', 'depth-2', 'depth-3');
      }
    }

    // Handle drop hover state
    if (isDropTarget) {
      dom.setAttribute('data-drag-hover', 'true');
    } else {
      dom.removeAttribute('data-drag-hover');
    }

    // Clean up function to remove dragging-active class when component unmounts or drag ends
    return () => {
      if (isDragged) {
        const renderer = document.querySelector('.craftjs-renderer');
        if (renderer) {
          renderer.classList.remove('dragging-active');
        }
      }
    };
  }, [dom, canAcceptDrop, isDragged, isDropTarget, query, id]);

  // Helper function to determine container nesting depth
  const getContainerDepth = (nodeId, query) => {
    let depth = 0;
    let currentId = nodeId;

    while (currentId !== 'ROOT') {
      try {
        const parentId = query.node(currentId).get().data.parent;
        if (parentId === 'ROOT') break;

        currentId = parentId;
        depth++;

        // Prevent infinite loops
        if (depth > 10) break;
      } catch (e) {
        break;
      }
    }

    return Math.min(depth, 3); // Cap at depth-3 for styling
  };

  // Handle scroll events and selection state
  useEffect(() => {
    const craftJsRenderer = document.querySelector('.craftjs-renderer');
    if (craftJsRenderer) {
      // Scroll handling
      craftJsRenderer.addEventListener('scroll', scroll);

      // Handle click outside without clearing selection unnecessarily
      const handleClickOutside = (e) => {
        const clickedElement = e.target;

        // Only clear if clicking outside editor area completely
        if (isSelected && dom && !dom.contains(clickedElement) && !isEditorUiElement(clickedElement)) {
          // Save selection state before clearing
          const studyGuideId = query.getOptions().studyGuideId;
          localStorage.setItem(`content_editor_${studyGuideId}_selection_meta`, JSON.stringify({
            nodeId: id,
            timestamp: Date.now(),
            clearedBy: 'clickOutside'
          }));

          // Use setTimeout to let any click handlers in the settings panel execute first
          setTimeout(() => {
            if (!isEditorUiElement(document.activeElement)) {
              actions.clearEvents();
            }
          }, 0);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        craftJsRenderer.removeEventListener('scroll', scroll);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [scroll, isSelected, dom, actions, query, id, isEditorUiElement]);

  // Initialize selection on mount if this node was previously selected
  useEffect(() => {
    const studyGuideId = query.getOptions().studyGuideId;
    const selectedNodeId = localStorage.getItem(`content_editor_${studyGuideId}_selected_node`);

    if (selectedNodeId === id) {
      // Set this node as selected
      actions.setNodeEvent(id, 'selected', true);

      // Also ensure the node is visible in the settings panel
      actions.selectNode(id);
    }
  }, [id, actions, query]);

  // Button style
  const btnStyle = {
    padding: '0',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
  };

  // Create a wrapper with position relative to contain the indicators
  // We need to use a wrapper for all elements to ensure consistent behavior

  // Check if we should hide the toolbar
  const shouldHideToolbar = isCollapsibleSectionCanvas() ||
                           // Direct check for our specific canvas class
                           dom?.classList?.contains('collapsible-section-canvas');

  return (
    <>
      {(isHovered || isSelected) && !isRoot && !shouldHideToolbar
        ? ReactDOM.createPortal(
            <div
              ref={toolbarRef}
              className="px-2 py-2 text-white bg-teal-600 fixed flex items-center"
              style={{
                left: getPos(dom).left,
                top: getPos(dom).top,
                marginTop: '-29px',
                height: '30px',
                fontSize: '12px',
                lineHeight: '12px',
                zIndex: getZIndex(id),
              }}
            >
              <h2 className="flex-1 mr-4 truncate">{name || 'Element'}</h2>
              {isDraggable ? (
                <a
                  className="mr-2 cursor-move"
                  ref={(dom) => {
                    if (dom) {
                      // Make sure we're using the correct connector
                      connectors.drag(dom);
                      // Add a data attribute to help identify this as a drag handle
                      dom.setAttribute('data-drag-handle', 'true');
                    }
                  }}
                  style={btnStyle}
                >
                  <FaArrowsAlt size={14} />
                </a>
              ) : null}
              {id !== ROOT_NODE && (
                <a
                  className="mr-2 cursor-pointer"
                  onClick={() => {
                    actions.selectNode(parent);
                  }}
                  style={btnStyle}
                >
                  <FaArrowUp size={14} />
                </a>
              )}
              {isDeletable && (
                <a
                  className="mr-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();

                    try {
                      console.log('Starting node duplication for node ID:', id);

                      // Get the node to duplicate
                      const node = query.node(id).get();
                      console.log('Node to duplicate:', node);

                      // Get the current parent of the node
                      // This ensures we add the duplicated node to the same container
                      const currentParent = node.data.parent;
                      console.log('Current parent:', currentParent);

                      // Special handling for components with linked nodes
                      if (node.data.displayName === 'Collapsible Section') {
                        console.log('Duplicating CollapsibleSection component with special handler');

                        try {
                          // Use specialized duplicator function
                          const parentNode = query.node(currentParent).get();
                          const nodeIndex = parentNode.data.nodes.indexOf(id);
                          duplicateCollapsibleSection(node, query, actions, currentParent, nodeIndex);
                          console.log('CollapsibleSection and all content duplicated successfully');
                          return;
                        } catch (error) {
                          console.error('Error duplicating CollapsibleSection:', error);
                          // Continue with normal duplication as fallback
                        }
                      } else if (node.data.displayName === 'Tabs') {
                        console.log('Duplicating Tabs component with special handler');

                        try {
                          // Use specialized duplicator function
                          const parentNode = query.node(currentParent).get();
                          const nodeIndex = parentNode.data.nodes.indexOf(id);
                          duplicateTabs(node, query, actions, currentParent, nodeIndex);
                          console.log('Tabs and all content duplicated successfully');
                          return;
                        } catch (error) {
                          console.error('Error duplicating Tabs:', error);
                          // Continue with normal duplication as fallback
                        }
                      }

                      // Check if this is a container with children
                      const isContainer = node.data.isCanvas;
                      const hasChildren = node.data.nodes && node.data.nodes.length > 0;

                      if (isContainer && hasChildren) {
                        // For containers with children, we need to duplicate the entire node tree
                        console.log('Duplicating container with children');

                        try {
                          // Start a batch of actions that will be treated as a single undo step
                          // This ensures that all the duplication operations can be undone with a single undo
                          const throttledActions = actions.history.throttle(100);

                          // Define a recursive function to duplicate a node and all its children
                          const duplicateNodeWithChildren = (nodeId, newParentId) => {
                            // Get the node to duplicate
                            const nodeToDuplicate = query.node(nodeId).get();
                            console.log(`Duplicating node ${nodeId}:`, nodeToDuplicate);

                            // Create a fresh node with the same properties
                            // Get the actual component type from the resolver
                            const nodeType = query.getOptions().resolver[nodeToDuplicate.data.displayName];

                            const freshNode = {
                              data: {
                                // Use the actual component from the resolver if available, otherwise use the original type
                                type: nodeType || nodeToDuplicate.data.type,
                                props: { ...nodeToDuplicate.data.props },
                                custom: nodeToDuplicate.data.custom ? { ...nodeToDuplicate.data.custom } : undefined,
                                isCanvas: !!nodeToDuplicate.data.isCanvas,
                                displayName: nodeToDuplicate.data.displayName,
                                linkedNodes: {},
                              }
                            };

                            // Create the new node
                            const newNode = query.parseFreshNode(freshNode).toNode();
                            console.log(`New node created for ${nodeId}:`, newNode);

                            // Add the new node to the specified parent using the throttled actions
                            // This ensures all additions are part of the same undo step
                            throttledActions.add(newNode, newParentId);

                            // If this node has children, recursively duplicate them
                            if (nodeToDuplicate.data.nodes && nodeToDuplicate.data.nodes.length > 0) {
                              console.log(`Node ${nodeId} has children:`, nodeToDuplicate.data.nodes);

                              // Process each child node
                              nodeToDuplicate.data.nodes.forEach(childId => {
                                // Recursively duplicate the child and its descendants
                                duplicateNodeWithChildren(childId, newNode.id);
                              });
                            }

                            return newNode;
                          };

                          // Get the original node's index in its parent's nodes array
                          // This will help us place the duplicated container right after the original
                          const parentNode = query.node(currentParent).get();
                          const nodeIndex = parentNode.data.nodes.indexOf(id);
                          console.log('Original node index in parent:', nodeIndex);

                          // Create a new container with the same properties
                          const containerType = node.data.type;
                          const containerProps = { ...node.data.props };

                          // Create a fresh container node
                          // Get the actual component type from the resolver
                          const containerComponentType = query.getOptions().resolver[node.data.displayName];

                          const freshContainerNode = {
                            data: {
                              // Use the actual component from the resolver if available, otherwise use the original type
                              type: containerComponentType || containerType,
                              props: containerProps,
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: true, // Ensure it's still a canvas
                              displayName: node.data.displayName,
                              linkedNodes: {},
                            }
                          };

                          // Create the new container node
                          const newContainerNode = query.parseFreshNode(freshContainerNode).toNode();
                          console.log('New container node created:', newContainerNode);

                          // Add the new container to the same parent as the original, right after it
                          console.log('Adding new container to parent:', currentParent, 'at index:', nodeIndex + 1);
                          throttledActions.add(newContainerNode, currentParent, nodeIndex + 1);

                          // Now duplicate each child node and add it to the new container
                          const childNodeIds = node.data.nodes || [];
                          console.log('Child nodes to duplicate:', childNodeIds);

                          // Process each child node
                          childNodeIds.forEach(childId => {
                            // Use the recursive function to duplicate each child and its descendants
                            duplicateNodeWithChildren(childId, newContainerNode.id);
                          });

                          console.log('Container and all nested children duplicated successfully');
                        } catch (containerError) {
                          console.error('Error duplicating container with children:', containerError);
                          console.log('Falling back to simple container duplication without children');

                          console.log('Attempting simplified duplication approach');

                          // Start a batch of actions that will be treated as a single undo step
                          const throttledActions = actions.history.throttle(100);

                          // Define a simpler recursive function for the fallback
                          const simpleDuplicateNodeWithChildren = (nodeId, newParentId) => {
                            try {
                              // Get the node to duplicate
                              const nodeToDuplicate = query.node(nodeId).get();

                              // Create a fresh node with the same properties
                              // Get the actual component type from the resolver
                              const nodeType = query.getOptions().resolver[nodeToDuplicate.data.displayName];

                              const freshNode = {
                                data: {
                                  // Use the actual component from the resolver if available, otherwise use the original type
                                  type: nodeType || nodeToDuplicate.data.type,
                                  props: { ...nodeToDuplicate.data.props },
                                  custom: nodeToDuplicate.data.custom ? { ...nodeToDuplicate.data.custom } : undefined,
                                  isCanvas: !!nodeToDuplicate.data.isCanvas,
                                  displayName: nodeToDuplicate.data.displayName,
                                  linkedNodes: {},
                                }
                              };

                              // Create the new node
                              const newNode = query.parseFreshNode(freshNode).toNode();

                              // Add the new node to the specified parent using throttled actions
                              throttledActions.add(newNode, newParentId);

                              return newNode;
                            } catch (error) {
                              console.error(`Error duplicating node ${nodeId}:`, error);
                              return null;
                            }
                          };

                          // Get the original node's index in its parent's nodes array
                          const parentNode = query.node(currentParent).get();
                          const nodeIndex = parentNode.data.nodes.indexOf(id);

                          // Create a fresh node with the same properties
                          // Get the actual component type from the resolver
                          const nodeType = query.getOptions().resolver[node.data.displayName];

                          const freshNode = {
                            data: {
                              // Use the actual component from the resolver if available, otherwise use the original type
                              type: nodeType || node.data.type,
                              props: { ...node.data.props },
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: true, // Ensure it's still a canvas
                              displayName: node.data.displayName,
                              linkedNodes: {},
                            }
                          };

                          // Create a new container node
                          const newNode = query.parseFreshNode(freshNode).toNode();
                          console.log('New container node created:', newNode);

                          // Add the new container to the same parent as the original, right after it
                          throttledActions.add(newNode, currentParent, nodeIndex + 1);

                          // Try to duplicate at least the direct children
                          const childNodeIds = node.data.nodes || [];
                          childNodeIds.forEach(childId => {
                            simpleDuplicateNodeWithChildren(childId, newNode.id);
                          });

                          console.log('Container duplicated with simplified approach');
                        }
                      } else {
                        // For regular components, just duplicate the node itself
                        console.log('Duplicating regular component');

                        try {
                          // Start a batch of actions that will be treated as a single undo step
                          const throttledActions = actions.history.throttle(100);

                          // Get the original node's index in its parent's nodes array
                          // This will help us place the duplicated component right after the original
                          const parentNode = query.node(currentParent).get();
                          const nodeIndex = parentNode.data.nodes.indexOf(id);
                          console.log('Original node index in parent:', nodeIndex);

                          // Create a fresh node with the same properties
                          // Get the actual component type from the resolver
                          const nodeType = query.getOptions().resolver[node.data.displayName];

                          const freshNode = {
                            data: {
                              // Use the actual component from the resolver if available, otherwise use the original type
                              type: nodeType || node.data.type,
                              props: { ...node.data.props },
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: !!node.data.isCanvas,
                              displayName: node.data.displayName,
                              linkedNodes: {},
                            }
                          };

                          // Create a new node
                          const newNode = query.parseFreshNode(freshNode).toNode();
                          console.log('New node created:', newNode);

                          // Add the new node to the same parent as the original node, right after it
                          console.log('Adding new node to parent:', currentParent, 'at index:', nodeIndex + 1);
                          throttledActions.add(newNode, currentParent, nodeIndex + 1);

                          console.log('Node duplicated successfully');
                        } catch (error) {
                          console.error('Error getting node index:', error);

                          // Fallback: just add to the parent without specifying index
                          // Still use throttled actions for consistent undo behavior
                          const throttledActions = actions.history.throttle(100);

                          // Get the actual component type from the resolver
                          const nodeType = query.getOptions().resolver[node.data.displayName];

                          const freshNode = {
                            data: {
                              // Use the actual component from the resolver if available, otherwise use the original type
                              type: nodeType || node.data.type,
                              props: { ...node.data.props },
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: !!node.data.isCanvas,
                              displayName: node.data.displayName,
                              linkedNodes: {},
                            }
                          };

                          const newNode = query.parseFreshNode(freshNode).toNode();
                          throttledActions.add(newNode, currentParent);
                          console.log('Node duplicated successfully (fallback method)');
                        }
                      }
                    } catch (error) {
                      console.error('Error duplicating node:', error);
                    }
                  }}
                  style={btnStyle}
                >
                  <FaCopy size={14} />
                </a>
              )}
              {isDeletable ? (
                <a
                  className="cursor-pointer"
                  onMouseDown={async (e) => {
                    e.stopPropagation();

                    // Get the node being deleted
                    const node = query.node(id).get();

                    // Special handling for components with linked nodes
                    if (node.data.displayName === 'Collapsible Section' || node.data.displayName === 'Tabs') {
                      try {
                        // Get the node's parent
                        const parentId = node.data.parent;
                        if (!parentId) {
                          console.error('[RenderNode] Cannot delete: node has no parent');
                          return;
                        }

                        // Get all linkedNodes
                        const linkedNodeIds = Object.values(node.data.linkedNodes || {});
                        console.log('[RenderNode] Found linked nodes:', linkedNodeIds);

                        // Get parent's current nodes array
                        const parent = query.node(parentId).get();
                        const parentNodes = [...(parent.data.nodes || [])];

                        // Remove the component from its parent's nodes array
                        const nodeIndex = parentNodes.indexOf(id);
                        if (nodeIndex > -1) {
                          parentNodes.splice(nodeIndex, 1);
                        }

                        // First, clear any localStorage items related to this component
                        if (node.data.displayName === 'Tabs') {
                          try {
                            const tabStorageKey = `tabs-active-tab-${id}`;
                            localStorage.removeItem(tabStorageKey);
                            console.log(`[RenderNode] Removed localStorage item: ${tabStorageKey}`);
                          } catch (e) {
                            console.log('[RenderNode] Error clearing localStorage:', e);
                          }
                        }

                        // Start a batch of actions that will be treated as a single undo step
                        const throttledActions = actions.history.throttle(100);

                        // Update parent's nodes array without this node
                        throttledActions.setState(state => {
                          if (state.nodes[parentId]) {
                            state.nodes[parentId].data.nodes = parentNodes;
                          }
                        });

                        // Remove the linkedNodes references
                        throttledActions.setState(state => {
                          if (state.nodes[id]) {
                            state.nodes[id].data.linkedNodes = {};
                          }
                        });

                        // First, mark all nodes for deletion in the state
                        // This will help prevent errors when components try to access their nodes during deletion
                        throttledActions.setState(state => {
                          // Mark the main node for deletion
                          if (state.nodes[id]) {
                            state.nodes[id].data._pendingDeletion = true;
                          }

                          // Mark all linked nodes for deletion
                          linkedNodeIds.forEach(linkedNodeId => {
                            if (state.nodes[linkedNodeId]) {
                              state.nodes[linkedNodeId].data._pendingDeletion = true;
                            }
                          });
                        });

                        // Wait a tick to let React process the state update
                        await new Promise(resolve => setTimeout(resolve, 0));

                        // Delete linked nodes first
                        const linkedNodePromises = linkedNodeIds.map(linkedNodeId => {
                          return new Promise(resolve => {
                            try {
                              // Check if the node exists before trying to delete it
                              let nodeExists = false;
                              try {
                                if (linkedNodeId && query.node(linkedNodeId).get()) {
                                  nodeExists = true;
                                }
                              } catch (e) {
                                nodeExists = false;
                              }

                              if (nodeExists) {
                                // First remove any localStorage items for this node
                                try {
                                  const tabStorageKey = `tabs-active-tab-${linkedNodeId}`;
                                  localStorage.removeItem(tabStorageKey);
                                } catch (e) {
                                  // Ignore localStorage errors
                                }

                                // Then delete the node
                                throttledActions.delete(linkedNodeId);
                                console.log(`[RenderNode] Deleted linked node: ${linkedNodeId}`);
                              } else {
                                console.log(`[RenderNode] Linked node ${linkedNodeId} not found or already deleted`);
                              }
                            } catch (error) {
                              console.log(`[RenderNode] Error deleting linked node ${linkedNodeId}:`, error);
                            }
                            resolve();
                          });
                        });

                        // Use Promise.all to wait for all linked node deletions to complete
                        Promise.all(linkedNodePromises)
                          .then(() => {
                            console.log('[RenderNode] All linked nodes deleted, now deleting main node');
                            // Finally delete the main node
                            throttledActions.delete(id);
                          })
                          .catch(error => {
                            console.error('[RenderNode] Error in linked node deletion promises:', error);
                            // Still try to delete the main node
                            throttledActions.delete(id);
                          });

                      } catch (error) {
                        console.error('[RenderNode] Error deleting component:', error);
                        // Fallback to standard delete
                        try {
                          actions.delete(id);
                        } catch (e) {
                          console.error('[RenderNode] Fallback delete also failed:', e);
                        }
                      }
                    } else {
                      // Standard delete for other components
                      actions.delete(id);
                    }
                  }}
                  style={btnStyle}
                >
                  <FaTrash size={14} />
                </a>
              ) : null}
            </div>,
            document.querySelector('.page-container') // Match example portal target
          )
        : null}
      {/* Render the component directly */}
      {render}
      {/* Indicator styles are now handled by CSS via the 'component-selected' class */}
    </>
  );
};
