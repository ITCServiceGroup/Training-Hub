import React, { useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import {
  extractBodyContent,
  extractStyleContent,
  extractUniqueScriptContent,
  processContentForWebComponents,
} from './utils/htmlUtils'; // Import necessary utils

const HtmlModeView = ({
  htmlModeContent,
  onHtmlContentChange,
  iframeRef,
  initialContent, // Needed for script/style extraction for preview
  title // Needed for preview iframe title (though not currently used in iframe logic)
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Effect to manually update iframe content in HTML mode with interactive element support
  useEffect(() => {
    const setupIframeContent = async () => {
      if (!iframeRef.current) return;

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentWindow.document;

      // Define theme-swapping styles
      const themeStyles = `
        /* Theme Swapping Colors */
        :root {
          /* Light Mode Values */
          --swap-navy-blue: #34495E;
          --swap-black: #000000;
          --swap-white: #FFFFFF;
          --swap-light-gray: #7E8C8D; /* Uses Dark Gray hex in light mode */
          --swap-dark-gray: #7E8C8D;
          --swap-medium-gray: #95A5A6; /* Uses Gray hex in light mode */
          --swap-gray: #95A5A6;
        }
        body.dark-theme {
          /* Dark Mode Values */
          --swap-navy-blue: #C2E0F4; /* Becomes Light Blue */
          --swap-black: #FFFFFF; /* Becomes White */
          --swap-white: #000000; /* Becomes Black */
          --swap-light-gray: #ECF0F1;
          --swap-dark-gray: #ECF0F1; /* Becomes Light Gray */
          --swap-medium-gray: #CED4D9;
          --swap-gray: #CED4D9; /* Becomes Medium Gray */
        }

        /* --- Theme Color Overrides for Inline Styles --- */

        /* Dark Mode Viewing: Override light mode inline styles */
        body.dark-theme [style*="color: #34495E"], body.dark-theme [style*="color: #34495e"] { color: var(--swap-navy-blue) !important; }
        body.dark-theme [style*="border-color: #34495E"], body.dark-theme [style*="border-color: #34495e"] { border-color: var(--swap-navy-blue) !important; }
        body.dark-theme [style*="color: #000000"] { color: var(--swap-black) !important; }
        body.dark-theme [style*="border-color: #000000"] { border-color: var(--swap-black) !important; }
        body.dark-theme [style*="color: #FFFFFF"], body.dark-theme [style*="color: #ffffff"] { color: var(--swap-white) !important; }
        body.dark-theme [style*="border-color: #FFFFFF"], body.dark-theme [style*="border-color: #ffffff"] { border-color: var(--swap-white) !important; }
        body.dark-theme [style*="color: #7E8C8D"], body.dark-theme [style*="color: #7e8c8d"] { color: var(--swap-light-gray) !important; }
        body.dark-theme [style*="border-color: #7E8C8D"], body.dark-theme [style*="border-color: #7e8c8d"] { border-color: var(--swap-light-gray) !important; }
        body.dark-theme [style*="color: #95A5A6"], body.dark-theme [style*="color: #95a5a6"] { color: var(--swap-medium-gray) !important; }
        body.dark-theme [style*="border-color: #95A5A6"], body.dark-theme [style*="border-color: #95a5a6"] { border-color: var(--swap-medium-gray) !important; }


        /* Light Mode Viewing: Override dark mode inline styles */
        body:not(.dark-theme) [style*="color: #C2E0F4"], body:not(.dark-theme) [style*="color: #c2e0f4"] { color: var(--swap-navy-blue) !important; }
        body:not(.dark-theme) [style*="border-color: #C2E0F4"], body:not(.dark-theme) [style*="border-color: #c2e0f4"] { border-color: var(--swap-navy-blue) !important; }
        body:not(.dark-theme) [style*="color: #FFFFFF"], body:not(.dark-theme) [style*="color: #ffffff"] { color: var(--swap-black) !important; }
        body:not(.dark-theme) [style*="border-color: #FFFFFF"], body:not(.dark-theme) [style*="border-color: #ffffff"] { border-color: var(--swap-black) !important; }
        body:not(.dark-theme) [style*="color: #000000"] { color: var(--swap-white) !important; }
        body:not(.dark-theme) [style*="border-color: #000000"] { border-color: var(--swap-white) !important; }
        body:not(.dark-theme) [style*="color: #ECF0F1"], body:not(.dark-theme) [style*="color: #ecf0f1"] { color: var(--swap-dark-gray) !important; }
        body:not(.dark-theme) [style*="border-color: #ECF0F1"], body:not(.dark-theme) [style*="border-color: #ecf0f1"] { border-color: var(--swap-dark-gray) !important; }
        body:not(.dark-theme) [style*="color: #CED4D9"], body:not(.dark-theme) [style*="color: #ced4d9"] { color: var(--swap-gray) !important; }
        body:not(.dark-theme) [style*="border-color: #CED4D9"], body:not(.dark-theme) [style*="border-color: #ced4d9"] { border-color: var(--swap-gray) !important; }
        /* --- End Theme Color Overrides --- */
      `;

      // Extract parts from the full HTML content in the textarea
      const fullHtml = htmlModeContent;
      const styleContent = extractStyleContent(fullHtml);
      const bodyContent = extractBodyContent(fullHtml);
      const mainScriptContent = extractUniqueScriptContent(fullHtml);

      // Process body content to handle empty paragraphs and replace shortcodes
      let processedBodyContent = bodyContent;
      processedBodyContent = processedBodyContent.replace(/<p><br><\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');
      processedBodyContent = processedBodyContent.replace(/<p>[\s&nbsp;]*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');
      processedBodyContent = processedBodyContent.replace(/<br>\s*<br>/g, '<br><div class="empty-line" style="height: 1em; display: block; margin: 0.5em 0;"></div>');
      // Handle TinyMCE specific empty paragraphs (only if they are visually empty)
      processedBodyContent = processedBodyContent.replace(/<p data-mce-empty="1">(?:<br>|\s|&nbsp;)*<\/p>/g, '<div class="empty-line" style="height: 1em; display: block; margin: 1em 0;"></div>');
      processedBodyContent = processContentForWebComponents(processedBodyContent);


      // Construct the complete HTML document with styles and content
      const combinedStyles = styleContent || `
        body { font-family: 'Inter', sans-serif; line-height: 1.6; margin: 20px; }
        img { max-width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        p { white-space: pre-wrap; }
        .empty-line { height: 1em; display: block; margin: 1em 0; }
        .loading { text-align: center; padding: 20px; color: #666; }

        /* Image Grid Layout Styles */
        .image-grid-wrapper {
          display: grid !important;
          gap: 1em;
          margin-bottom: 1em;
          padding: 5px;
        }
        .image-grid-wrapper.align-left {
          grid-template-columns: auto 1fr;
        }
        .image-grid-wrapper.align-right {
          grid-template-columns: 1fr auto;
        }
        .image-grid-wrapper.align-center {
          grid-template-columns: 1fr;
          justify-items: center;
        }
        .image-grid-wrapper > .grid-cell {
          min-width: 0;
        }
        .image-grid-wrapper > .image-cell {
          display: flex;
          align-items: flex-start;
        }
        .image-grid-wrapper > .image-cell > img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        /* Image Style Options */
        .image-grid-wrapper > .image-cell > img.border-thin {
          border: 1px solid #e0e0e0 !important;
        }
        .image-grid-wrapper > .image-cell > img.border-medium {
          border: 2px solid #e0e0e0 !important;
        }
        .image-grid-wrapper > .image-cell > img.border-thick {
          border: 4px solid #e0e0e0 !important;
        }
        /* Custom border colors will be applied as inline styles */
        .image-grid-wrapper > .image-cell > img.border-color-custom {
          /* This class just indicates that a custom color is being used */
          /* The actual color is set via inline style */
        }
        /* Border Style Options */
        .image-grid-wrapper > .image-cell > img.border-style-solid {
          border-style: solid !important;
        }
        .image-grid-wrapper > .image-cell > img.border-style-dashed {
          border-style: dashed !important;
        }
        .image-grid-wrapper > .image-cell > img.border-style-dotted {
          border-style: dotted !important;
        }
        /* Border Color Options */
        .image-grid-wrapper > .image-cell > img.border-color-gray {
          border-color: #e0e0e0 !important;
        }
        .image-grid-wrapper > .image-cell > img.border-color-black {
          border-color: #000000 !important;
        }
        .image-grid-wrapper > .image-cell > img.border-color-blue {
          border-color: #2563eb !important;
        }
        .image-grid-wrapper > .image-cell > img.border-color-red {
          border-color: #dc2626 !important;
        }
        .image-grid-wrapper > .image-cell > img.border-color-green {
          border-color: #16a34a !important;
        }
        .image-grid-wrapper > .image-cell > img.rounded-sm {
          border-radius: 4px !important;
        }
        .image-grid-wrapper > .image-cell > img.rounded-md {
          border-radius: 8px !important;
        }
        .image-grid-wrapper > .image-cell > img.rounded-lg {
          border-radius: 16px !important;
        }
        .image-grid-wrapper > .image-cell > img.rounded-full {
          border-radius: 9999px !important;
        }
      `;

      // Add debugging info
      console.log('Preparing HTML preview with content length:', processedBodyContent.length);
      console.log('Image style classes present:', processedBodyContent.match(/class="[^"]*(?:border|rounded)[^"]*"/g));

      // Enhanced debugging for border styles
      const borderStyleClasses = processedBodyContent.match(/class="[^"]*border-style-[^"]*"/g);
      console.log('Border style classes specifically:', borderStyleClasses);

      // Log the combined styles to verify border styles are included
      console.log('Combined styles include border styles:',
        combinedStyles.includes('border-style-solid') &&
        combinedStyles.includes('border-style-dashed') &&
        combinedStyles.includes('border-style-dotted'));

      const fullHtmlDocument = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="/fonts/inter.css">
          <title>${title || 'Preview'}</title>
          <style>
            html {
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            }
            body {
              background-color: ${isDark ? '#1e293b' : '#ffffff'};
              color: ${isDark ? '#f8fafc' : '#1e293b'};
            }
            ${combinedStyles}
            /* Empty line divs have inline styles, no specific class rule needed here */
            /* Remove potentially conflicting rules for p[data-empty] */

            /* Inject theme-specific variables and overrides */
            ${themeStyles}

            /* Force all style overrides */
            html body .image-grid-wrapper > .image-cell > img[class*="border-"],
            html body .image-grid-wrapper > .image-cell > img[class*="rounded-"] {
              box-sizing: border-box !important;
              display: block !important;
              max-width: 100% !important;
            }

            /* Explicit border thickness with correct color */
            html body .image-grid-wrapper > .image-cell > img.border-thin {
              border-width: 1px !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-medium {
              border-width: 2px !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-thick {
              border-width: 4px !important;
            }

            /* Border Color Options */
            html body .image-grid-wrapper > .image-cell > img.border-color-gray {
              border-color: #e0e0e0 !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-color-black {
              border-color: #000000 !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-color-blue {
              border-color: #2563eb !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-color-red {
              border-color: #dc2626 !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-color-green {
              border-color: #16a34a !important;
            }
            /* Custom border color class */
            html body .image-grid-wrapper > .image-cell > img.border-color-custom {
              /* This class just indicates that a custom color is being used */
              /* The actual color is set via inline style */
            }
            /* Custom border colors will be preserved from inline styles */

            /* Ensure border styles have highest specificity */
            html body .image-grid-wrapper > .image-cell > img.border-style-solid {
              border-style: solid !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-style-dashed {
              border-style: dashed !important;
            }
            html body .image-grid-wrapper > .image-cell > img.border-style-dotted {
              border-style: dotted !important;
            }

            /* Explicit border radius with highest specificity */
            html body .image-grid-wrapper > .image-cell > img.rounded-sm {
              border-radius: 4px !important;
            }
            html body .image-grid-wrapper > .image-cell > img.rounded-md {
              border-radius: 8px !important;
            }
            html body .image-grid-wrapper > .image-cell > img.rounded-lg {
              border-radius: 16px !important;
            }
            html body .image-grid-wrapper > .image-cell > img.rounded-full {
              border-radius: 9999px !important;
            }

            /* Fallback: Apply solid border style when thickness is present but no style is specified */
            html body .image-grid-wrapper > .image-cell > img.border-thin:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
            html body .image-grid-wrapper > .image-cell > img.border-medium:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted),
            html body .image-grid-wrapper > .image-cell > img.border-thick:not(.border-style-solid):not(.border-style-dashed):not(.border-style-dotted) {
              border-style: solid !important;
              border-color: #e0e0e0 !important;
            }
          </style>
        </head>
        <body class="${isDark ? 'dark-theme' : ''}">
          <div class="loading">Loading interactive elements...</div>
          ${processedBodyContent}
          <script>
            // Debug script to verify style application
            document.addEventListener('DOMContentLoaded', () => {
              const images = document.querySelectorAll('.image-grid-wrapper > .image-cell > img');
              console.log('Found ' + images.length + ' images in the preview');

              images.forEach(img => {
                const styles = window.getComputedStyle(img);
                const hasBorderStyleClass = img.className.includes('border-style-');

                console.log('Image styles:', {
                  class: img.className,
                  hasBorderStyleClass: hasBorderStyleClass,
                  border: styles.border,
                  borderStyle: styles.borderStyle,
                  borderWidth: styles.borderWidth,
                  borderColor: styles.borderColor,
                  borderRadius: styles.borderRadius
                });

                // Check for border color classes
                const hasBorderColorClass = img.classList.contains('border-color-gray') ||
                                          img.classList.contains('border-color-black') ||
                                          img.classList.contains('border-color-blue') ||
                                          img.classList.contains('border-color-red') ||
                                          img.classList.contains('border-color-green') ||
                                          img.classList.contains('border-color-custom');

                // Check for inline border color style
                const hasInlineBorderColor = img.style.borderColor && img.style.borderColor !== '';

                // Log border color information
                console.log('Border color info:', {
                  hasBorderColorClass: hasBorderColorClass,
                  hasInlineBorderColor: hasInlineBorderColor,
                  inlineBorderColor: img.style.borderColor,
                  computedBorderColor: styles.borderColor,
                  borderColorClasses: {
                    gray: img.classList.contains('border-color-gray'),
                    black: img.classList.contains('border-color-black'),
                    blue: img.classList.contains('border-color-blue'),
                    red: img.classList.contains('border-color-red'),
                    green: img.classList.contains('border-color-green'),
                    custom: img.classList.contains('border-color-custom')
                  }
                });

                // If no border color class or inline style is applied but there is a border, use default gray
                if (styles.borderWidth !== '0px' && !hasBorderColorClass && !hasInlineBorderColor) {
                  console.log('No border color class or inline style found, using default gray');
                }

                // Check if border radius is being applied correctly
                if (img.classList.contains('rounded-lg') && styles.borderRadius !== '16px') {
                  console.warn('Border radius not applied correctly for rounded-lg:', styles.borderRadius);
                  // Force the correct border radius
                  img.style.borderRadius = '16px';
                }

                // Check if border style classes are being applied correctly
                if (img.classList.contains('border-style-solid')) {
                  console.log('This image has border-style-solid class, borderStyle is:', styles.borderStyle);
                }
                if (img.classList.contains('border-style-dashed')) {
                  console.log('This image has border-style-dashed class, borderStyle is:', styles.borderStyle);
                }
                if (img.classList.contains('border-style-dotted')) {
                  console.log('This image has border-style-dotted class, borderStyle is:', styles.borderStyle);
                }

                // Check if there's a border thickness class but no border style
                const hasBorderThickness = img.classList.contains('border-thin') ||
                                          img.classList.contains('border-medium') ||
                                          img.classList.contains('border-thick');
                const hasBorderStyle = img.classList.contains('border-style-solid') ||
                                      img.classList.contains('border-style-dashed') ||
                                      img.classList.contains('border-style-dotted');

                if (hasBorderThickness && !hasBorderStyle) {
                  console.log('This image has border thickness but no border style - adding default solid style');
                  // Apply a default solid border style if there's thickness but no style
                  img.classList.add('border-style-solid');
                }
              });
            });
          </script>
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(fullHtmlDocument);
      iframeDoc.close();

      // Find required interactive elements
      const requiredElements = new Set();
      const shortcodeRegex = /\[interactive name="([^"]+)"\]/g;
      let match;
      while ((match = shortcodeRegex.exec(bodyContent)) !== null) {
        if (/^[a-zA-Z0-9-]+$/.test(match[1])) {
          requiredElements.add(match[1]);
        }
      }

      // Load interactive element scripts with proper error handling
      const loadScript = (elementName) => {
        return new Promise((resolve, reject) => {
          const scriptPath = `/interactive-elements/${elementName}/index.js`;
          const script = iframeDoc.createElement('script');
          script.type = 'module';
          script.src = new URL(scriptPath, window.location.origin).href;

          script.onload = () => {
            console.log(`Successfully loaded script for ${elementName}`);
            resolve();
          };

          script.onerror = (error) => {
            console.error(`Failed to load script for ${elementName}:`, error);
            reject(error);
          };

          iframeDoc.head.appendChild(script);
        });
      };

      try {
        // Load all required scripts concurrently
        await Promise.all(Array.from(requiredElements).map(loadScript));
        console.log('All interactive element scripts loaded successfully');

        // Update the loading message with the content
        const loadingDiv = iframeDoc.querySelector('.loading');
        if (loadingDiv) {
          loadingDiv.remove();
        }

        // Finally, inject any additional script content
        if (mainScriptContent) {
          console.log('Injecting additional script content');
          const mainScript = iframeDoc.createElement('script');
          mainScript.textContent = mainScriptContent;
          mainScript.type = 'module';
          iframeDoc.body.appendChild(mainScript);
        }
      } catch (error) {
        console.error('Error loading interactive elements:', error);
        iframeDoc.body.innerHTML = `
          <div style="color: #e53e3e; padding: 12px; border: 1px solid #feb2b2; border-radius: 4px; margin: 12px 0;">
            Error loading interactive elements. Please try refreshing the page.
          </div>
          ${processedBodyContent}
        `;
      }
    };

    setupIframeContent();
  }, [htmlModeContent, initialContent, iframeRef, isDark]); // Added isDark dependency

  return (
    <div className="w-full flex flex-col flex-grow h-[850px]">
      <div className="flex-1 min-h-0 h-full">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={30}>
            <div className="flex flex-col gap-2 h-full min-h-0 overflow-hidden">
              <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                HTML Editor (Full Document)
              </label>
              <textarea
                value={htmlModeContent}
                onChange={onHtmlContentChange} // Use the passed handler
                className={`w-full h-[calc(100%-30px)] font-mono text-sm p-2 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md resize-none overflow-auto focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                placeholder="Enter full HTML document content"
              />
            </div>
          </Panel>

          <PanelResizeHandle>
            <div
              className="w-1 mx-2 bg-gray-300 rounded transition-colors cursor-col-resize h-full hover:bg-gray-400"
            />
          </PanelResizeHandle>

          <Panel defaultSize={50} minSize={30}>
            {/* Make this outer div full height flex column */}
            <div className="flex flex-col gap-2 h-full">
              <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} flex-shrink-0`}> {/* Prevent label from shrinking */}
                 Preview
               </label>
               {/* Let this div grow and handle overflow */}
               <div className={`border ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-300 bg-white'} rounded-md p-4 flex-grow`}>
<iframe
  ref={iframeRef} // Use the passed ref
  className="w-full h-full border-none block"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
  title="Preview" // Use the passed title prop if needed for accessibility
/>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

HtmlModeView.displayName = 'HtmlModeView';

export default HtmlModeView;
