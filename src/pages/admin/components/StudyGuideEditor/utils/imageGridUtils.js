// --- Grid Layout Helper Functions ---

export const getGridWrapper = (editor, node) => {
   if (!editor || !node) return null;
   // Start from the node and go up the DOM tree
   let currentNode = node;
   while (currentNode && currentNode !== editor.getBody()) {
      if (editor.dom.hasClass(currentNode, 'image-grid-wrapper')) {
         // Found a wrapper, now ensure it's the outermost one related to this node
         let parentWrapper = editor.dom.getParent(currentNode.parentNode, '.image-grid-wrapper');
         // Keep going up until we find the top-level wrapper for this context
         while (parentWrapper) {
            currentNode = parentWrapper;
            parentWrapper = editor.dom.getParent(currentNode.parentNode, '.image-grid-wrapper');
         }
         return currentNode; // Return the outermost wrapper found
      }
      currentNode = currentNode.parentNode;
   }
   return null; // No wrapper found in the ancestry
};


export const unwrapImageFromGrid = (editor, wrapperNode) => {
   if (!editor || !wrapperNode) return;
   console.log('Unwrapping image from grid:', wrapperNode);
   const imgElement = wrapperNode.querySelector('.image-cell > img'); // Get the actual img element

   // Get content from the content cell
   const contentCell = wrapperNode.querySelector('.content-cell');
   let contentNodes = [];

   if (contentCell) {
       // Get all direct children of the content cell
       contentNodes = Array.from(contentCell.childNodes);
   }

   // Place image back before the wrapper
   if (imgElement) {
       editor.dom.insertAfter(imgElement, wrapperNode);
       // Remove any alignment classes from the image itself
       editor.dom.removeClass(imgElement, 'align-left align-right align-center');
       // Remove float styles if they exist
       editor.dom.setStyle(imgElement, 'float', '');
       editor.dom.removeClass(imgElement, 'mce-floatleft mce-floatright');
   }

   // Place content nodes back after the image
   let lastNode = imgElement || wrapperNode; // Start inserting after the image or wrapper

   // If there are no content nodes but there was content in the cell, create a paragraph
   if (contentNodes.length === 0) {
       if (contentCell && contentCell.innerHTML.trim()) {
           // There was some content that wasn't wrapped in a block element
           const p = editor.dom.create('p');
           p.innerHTML = contentCell.innerHTML;
           editor.dom.insertAfter(p, lastNode);
           lastNode = p;
       }
   } else {
       // Insert all content nodes after the image
       contentNodes.forEach(node => {
           editor.dom.insertAfter(node, lastNode);
           lastNode = node; // Update last node for correct order
       });
   }

   // Remove the now empty wrapper
   editor.dom.remove(wrapperNode);

   // Reselect the image if it exists
   if (imgElement) {
       editor.selection.select(imgElement);
   }
   editor.nodeChanged(); // Notify editor of changes
};

export const getAdjacentContent = (editor, imgNode) => {
    if (!editor || !imgNode) return null;
    // Try to find the next sibling paragraph or div. Adjust logic as needed.
    let next = imgNode.parentNode.nextSibling;
    while (next && (next.nodeType === 3 && !next.nodeValue.trim())) { // Skip empty text nodes
      next = next.nextSibling;
    }
    // Only consider paragraphs or divs for now
    if (next && (next.nodeName === 'P' || next.nodeName === 'DIV')) {
      return next;
    }

    // If no adjacent content found, create a new paragraph *after* the image's block parent
    const parentBlock = editor.dom.getParent(imgNode, editor.dom.isBlock);
    const insertAfterNode = parentBlock || imgNode; // Insert after the block parent or image itself
    const newParagraph = editor.dom.create('p', {}, '<br>'); // Create paragraph with BR
    editor.dom.insertAfter(newParagraph, insertAfterNode);
    return newParagraph;
};


export const applyGridWrapper = (editor, imgNode, alignment) => {
   if (!editor || !imgNode) return;
   editor.undoManager.transact(() => {
       console.log(`Applying grid alignment: ${alignment} to image:`, imgNode);
       // Find the direct parent cell and then the wrapper
       // const imgCell = editor.dom.getParent(imgNode, '.grid-cell.image-cell'); // This might be unreliable if imgNode isn't in cell yet
       // let wrapper = imgCell ? editor.dom.getParent(imgCell, '.image-grid-wrapper') : null;
       // If not found via cell, try finding wrapper via getGridWrapper (might be selected differently)
       // if (!wrapper) {
       let wrapper = getGridWrapper(editor, imgNode); // Use refactored helper
       // }
       console.log('Existing wrapper found:', wrapper);

       // If alignment is 'none', unwrap if currently wrapped
       if (alignment === 'none') {
           if (wrapper) {
               unwrapImageFromGrid(editor, wrapper); // Use refactored helper
           } else {
               // If not wrapped, ensure no float/alignment styles remain on the image itself
               editor.dom.setStyle(imgNode, 'float', '');
               editor.dom.removeClass(imgNode, 'mce-floatleft mce-floatright');
               editor.dom.removeClass(imgNode, 'align-left align-right align-center');
               console.log('Alignment none: Image was not wrapped, ensured no styles remain.');
           }
           // No need to select image here, unwrap handles it if needed
           editor.nodeChanged();
           return; // Exit after handling 'none'
       }

       // --- Applying an alignment (left, center, right) ---

       // If the image is ALREADY in a wrapper, just update the class
       if (wrapper) {
           console.log('Wrapper exists, updating alignment class.');
           // Get the current alignment before changing it
           let currentAlignment = 'left'; // Default
           if (editor.dom.hasClass(wrapper, 'align-left')) currentAlignment = 'left';
           else if (editor.dom.hasClass(wrapper, 'align-center')) currentAlignment = 'center';
           else if (editor.dom.hasClass(wrapper, 'align-right')) currentAlignment = 'right';

           // Remove old alignment class and add new one
           editor.dom.removeClass(wrapper, 'align-left align-right align-center'); // Remove old alignment
           editor.dom.addClass(wrapper, `align-${alignment}`); // Add new alignment

           // Ensure image inside doesn't have conflicting styles
           const imgInWrapper = wrapper.querySelector('.image-cell > img');
           if (imgInWrapper) {
               editor.dom.setStyle(imgInWrapper, 'float', '');
               editor.dom.removeClass(imgInWrapper, 'mce-floatleft mce-floatright');
           }

           // If changing from center to left/right or vice versa, we need to adjust the grid structure
           if ((currentAlignment === 'center' && (alignment === 'left' || alignment === 'right')) ||
               ((currentAlignment === 'left' || currentAlignment === 'right') && alignment === 'center')) {
               // Force a reflow of the grid by toggling a class
               editor.dom.toggleClass(wrapper, 'reflow-grid');
               setTimeout(() => {
                   editor.dom.toggleClass(wrapper, 'reflow-grid');
               }, 10);
           }
       } else {
           // Wrapper does NOT exist, need to create it
           console.log('Wrapper does not exist, creating new one.');
           const adjacentContent = getAdjacentContent(editor, imgNode); // Use refactored helper
           console.log('Adjacent content found:', adjacentContent);

           // Create the wrapper and cells
           wrapper = editor.dom.create('div', { class: `image-grid-wrapper align-${alignment}` });
           const newImgCell = editor.dom.create('div', { class: 'grid-cell image-cell' });

           // Create a content container that will hold the text
           const contentCell = editor.dom.create('div', { class: 'grid-cell content-cell' });

           // Determine the node to insert the wrapper *after* (image or its parent paragraph if it's the only child)
           const parentNode = imgNode.parentNode;
           const insertAfterNode = (parentNode && parentNode.nodeName === 'P' && parentNode.childNodes.length === 1) ? parentNode : imgNode;
           console.log('Inserting wrapper after:', insertAfterNode);

           editor.dom.insertAfter(wrapper, insertAfterNode);

           // Move the image into the image cell
           newImgCell.appendChild(imgNode); // This moves the imgNode
           wrapper.appendChild(newImgCell);

           // Move adjacent content into the content cell (if found)
           if (adjacentContent) {
               // Check if adjacentContent is already the wrapper we just inserted (can happen if getAdjacentContent created it)
               if (adjacentContent !== wrapper) {
                  contentCell.appendChild(adjacentContent); // Move adjacent content
               } else {
                  // If adjacentContent *is* the wrapper, it means we created a new paragraph inside it.
                  // We need to find that paragraph. This case might need refinement.
                  console.warn("Adjacent content was the newly created paragraph, check logic.");
                  const p = adjacentContent.querySelector('p'); // Assuming getAdjacentContent created a p
                  if (p) contentCell.appendChild(p);
                  else contentCell.appendChild(editor.dom.create('p', {}, '<br>')); // Fallback
               }
           } else {
               // If no adjacent content, add a paragraph to make it editable
               const p = editor.dom.create('p', {}, '<br>');
               contentCell.appendChild(p);
           }
           wrapper.appendChild(contentCell);

           // Ensure the moved image doesn't have conflicting styles
           editor.dom.setStyle(imgNode, 'float', '');
           editor.dom.removeClass(imgNode, 'mce-floatleft mce-floatright');
           editor.dom.removeClass(imgNode, 'align-left align-right align-center');
       }

       // Select the image after applying any alignment to maintain context
       editor.selection.select(imgNode);

       editor.nodeChanged(); // Important to update editor state
   });
};
// --- End Grid Layout Helper Functions ---
