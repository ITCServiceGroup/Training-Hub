import React, { useRef, useEffect, useCallback, forwardRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';
import ReactDOM from 'react-dom';
import { FaArrowsAlt, FaTrash, FaArrowUp } from 'react-icons/fa';

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
