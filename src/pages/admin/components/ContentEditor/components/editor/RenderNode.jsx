import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';
import ReactDOM from 'react-dom';
import { FaArrowsAlt, FaTrash, FaArrowUp, FaCopy } from 'react-icons/fa';

export const RenderNode = ({ render }) => {
  const { id, dom, name, isHovered, isSelected, parent, data, connectors } = useNode((node) => ({
    isHovered: node.events.hovered,
    isSelected: node.events.selected,
    dom: node.dom,
    name: node.data.custom?.displayName || node.data.displayName || node.data.name,
    id: node.id,
    parent: node.data.parent,
    data: node.data,
  }));

  const { actions, query } = useEditor();

  // Check if the node is a container
  const isContainer = data.name === 'Container';

  // Check if the node is draggable and deletable
  const isDraggable = query.node(id).isDraggable();
  const isDeletable = query.node(id).isDeletable();

  // Skip ROOT element indicators
  const isRoot = id === 'ROOT';

  // Create a ref for the toolbar
  const toolbarRef = useRef(null);

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

  // Add/remove classes based on hover/select state for all nodes (except ROOT)
  useEffect(() => {
    if (dom && !isRoot) { // Exclude ROOT node
      // Handle selection state
      if (isSelected) {
        dom.classList.add('component-selected');
      } else {
        dom.classList.remove('component-selected');
      }

      // Handle hover state separately
      if (isHovered && !isSelected) {
        dom.classList.add('component-hovered');
      } else {
        dom.classList.remove('component-hovered');
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
  const isTextNode = data.name === 'Text';

  return (
    <>
      {(isHovered || isSelected) && !isRoot
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
                zIndex: 9999,
              }}
            >
              <h2 className="flex-1 mr-4 truncate">{name || 'Element'}</h2>
              {isDraggable ? (
                <a
                  className="mr-2 cursor-move"
                  ref={(dom) => connectors.drag(dom)} // Match example pattern
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
                            const freshNode = {
                              data: {
                                type: nodeToDuplicate.data.type,
                                props: { ...nodeToDuplicate.data.props },
                                custom: nodeToDuplicate.data.custom ? { ...nodeToDuplicate.data.custom } : undefined,
                                isCanvas: !!nodeToDuplicate.data.isCanvas,
                                displayName: nodeToDuplicate.data.displayName,
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
                          const freshContainerNode = {
                            data: {
                              type: containerType,
                              props: containerProps,
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: true, // Ensure it's still a canvas
                              displayName: node.data.displayName,
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
                              const freshNode = {
                                data: {
                                  type: nodeToDuplicate.data.type,
                                  props: { ...nodeToDuplicate.data.props },
                                  custom: nodeToDuplicate.data.custom ? { ...nodeToDuplicate.data.custom } : undefined,
                                  isCanvas: !!nodeToDuplicate.data.isCanvas,
                                  displayName: nodeToDuplicate.data.displayName,
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
                          const freshNode = {
                            data: {
                              type: node.data.type,
                              props: { ...node.data.props },
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: true, // Ensure it's still a canvas
                              displayName: node.data.displayName,
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
                          const freshNode = {
                            data: {
                              type: node.data.type,
                              props: { ...node.data.props },
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: !!node.data.isCanvas,
                              displayName: node.data.displayName,
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

                          const freshNode = {
                            data: {
                              type: node.data.type,
                              props: { ...node.data.props },
                              custom: node.data.custom ? { ...node.data.custom } : undefined,
                              isCanvas: !!node.data.isCanvas,
                              displayName: node.data.displayName,
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
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    actions.delete(id);
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
