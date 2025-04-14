export class TutorialManager {
    constructor(element) {
        this.element = element;
        this.currentTutorial = null;
        this.currentLesson = null;
        this.currentStep = null;
        this.isEnding = false;
        
        this.setupTutorialUI();
        
        // Set up overlay click handler once
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && !this.isEnding) {
                e.stopPropagation();
                this.endTutorial();
            }
        });
        
        // Prevent clicks on the panel from closing the tutorial
        this.tutorialPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        console.log('[WebComponent CommandBuilder] Tutorial manager initialized');
    }

    clearTutorialState() {
        this.overlay.querySelectorAll('.tutorial-highlight').forEach(h => h.remove());
        this.tutorialPanel.querySelectorAll('.tutorial-arrow').forEach(a => a.remove());
        this.tutorialPanel.style = '';
        this.tutorialPanel.classList.remove('animated');
        this.overlay.style.display = 'none';
        this.overlay.classList.remove('visible');
        this.tutorialPanel.style.opacity = '0';
        this.tutorialHint.style.display = ''; // Reset hint display style to default
        this.completionMessage.style.display = 'none';
        this.currentTutorial = null;
        this.currentLesson = null;
        this.currentStep = null;
        // Do NOT reset the builder here; preserve user progress after tutorial ends
        // this.element.resetBuilder();
    }
    
    setupTutorialUI() {
        // Create tutorial overlay
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.setAttribute('aria-live', 'polite'); // For accessibility
        overlay.innerHTML = `
            <div class="tutorial-panel">
                <div class="tutorial-header">
                    <h3 id="tutorial-title"></h3>
                    <button class="tutorial-button secondary" id="close-tutorial">×</button>
                </div>
                <div class="tutorial-content" id="tutorial-content"></div>
                <div class="tutorial-progress" id="tutorial-progress"></div>
                <div class="tutorial-hint" id="tutorial-hint"></div>
                <div class="completion-message" id="completion-message"></div>
                <div class="next-tutorial-container" style="display: none;">
                    <button class="tutorial-button next-tutorial" id="next-tutorial">Next Tutorial</button>
                </div>
            </div>
        `;
        
        this.element.shadowRoot.appendChild(overlay);
        
        // Store references and set initial styles
        this.overlay = overlay;
        this.overlay.style.display = 'none';
        
        this.tutorialPanel = overlay.querySelector('.tutorial-panel');
        this.tutorialPanel.style.opacity = '0';
        this.tutorialTitle = overlay.querySelector('#tutorial-title');
        this.tutorialContent = overlay.querySelector('#tutorial-content');
        this.tutorialProgress = overlay.querySelector('#tutorial-progress');
        this.tutorialHint = overlay.querySelector('#tutorial-hint');
        this.completionMessage = overlay.querySelector('#completion-message');
        this.completionMessage.style.display = 'none'; // Initialize hidden
        this.nextTutorialContainer = overlay.querySelector('.next-tutorial-container');
        this.nextTutorialButton = overlay.querySelector('#next-tutorial');
        
        // Add event listeners
        overlay.querySelector('#close-tutorial').addEventListener('click', () => this.endTutorial());
        this.nextTutorialButton.addEventListener('click', () => this.startNextTutorial());
    }
    
    // Modified to accept an optional lessonIndex
    startTutorial(tutorialPath, lessonIndex = 0) { 
        if (this.isEnding) return;
        
        // Clear any existing state without animations
        this.clearTutorialState();
        
        // Parse tutorial path (os.tutorialType)
        const [os, tutorialType] = tutorialPath.split('.');
        
        // Get the tutorial for this OS
        const osTutorials = this.element.tutorials[os];
        if (!osTutorials) {
            console.error(`[WebComponent CommandBuilder] No tutorials found for OS: ${os}`);
            return;
        }
        
        // Get the specific tutorial
        this.currentTutorial = osTutorials[tutorialType];
        if (!this.currentTutorial) {
            console.error(`[WebComponent CommandBuilder] Tutorial not found: ${tutorialType} for OS: ${os}`);
            return;
        }
        
        // Use the provided lessonIndex, default to 0
        if (!this.currentTutorial.lessons || lessonIndex >= this.currentTutorial.lessons.length) {
             console.error(`[WebComponent CommandBuilder] Invalid lesson index ${lessonIndex} for tutorial: ${tutorialType}`);
             lessonIndex = 0; // Fallback to the first lesson
        }
        this.currentLesson = this.currentTutorial.lessons[lessonIndex];
        this.currentStep = 0;

        // Setup initial display
        this.overlay.style.display = 'flex';
        
        // Allow the display: flex to take effect before updating UI
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Double RAF to ensure first frame is painted
                this.overlay.classList.add('visible');
                this.tutorialPanel.style.opacity = '1';
                this.updateTutorialUI();
                console.log(`[WebComponent CommandBuilder] Tutorial started:`, {
                    os,
                    type: tutorialType,
                    name: this.currentTutorial.name
                });
            });
        });
    }
    
    endTutorial() {
        if (this.isEnding) return;
        this.isEnding = true;
        
        // Fade out effects
        this.overlay.classList.remove('visible');
        this.tutorialPanel.style.opacity = '0';
        
        // Remove elements after transition
        setTimeout(() => {
            this.clearTutorialState();
            this.isEnding = false;
            console.log('[WebComponent CommandBuilder] Tutorial ended');
        }, 300); // Match transition duration
    }
    
    calculatePanelPosition(targetElement) {
        if (!targetElement) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };

        // Get element bounds
        const elementRect = targetElement.getBoundingClientRect();
        const containerRect = this.element.getBoundingClientRect();
        const panelRect = this.tutorialPanel.getBoundingClientRect();

        // Check available space on each side
        const spaceRight = containerRect.right - elementRect.right;
        const spaceLeft = elementRect.left - containerRect.left;
        const spaceTop = elementRect.top - containerRect.top;
        const spaceBottom = containerRect.bottom - elementRect.bottom;

        // Calculate panel width/height if not yet available
        const panelWidth = panelRect.width || 300;
        const panelHeight = panelRect.height || 200;

        // Default position (right of element, vertically centered)
        let position = {
            left: `${elementRect.right + 20}px`,
            top: `${elementRect.top + (elementRect.height / 2)}px`,
            transform: 'translateY(-50%)',
            arrow: 'left'
        };

        // If not enough space on right, try left
        if (spaceRight < panelWidth + 30 && spaceLeft > panelWidth + 30) {
            position = {
                left: `${elementRect.left - panelWidth - 20}px`,
                top: `${elementRect.top + (elementRect.height / 2)}px`,
                transform: 'translateY(-50%)',
                arrow: 'right'
            };
        }
        // If not enough space on either side, position below or above
        else if (spaceRight < panelWidth + 30 && spaceLeft < panelWidth + 30) {
            const horizontalCenter = elementRect.left + (elementRect.width / 2);
            
            if (spaceBottom > panelHeight + 30) {
                position = {
                    left: `${horizontalCenter}px`,
                    top: `${elementRect.bottom + 20}px`,
                    transform: 'translateX(-50%)',
                    arrow: 'top'
                };
            } else {
                position = {
                    left: `${horizontalCenter}px`,
                    top: `${elementRect.top - panelHeight - 20}px`,
                    transform: 'translateX(-50%)',
                    arrow: 'bottom'
                };
            }
        }

        return position;
    }

    positionTutorialPanel() {
        // Clear existing highlights, arrows, and drop zone target class first
        this.overlay.querySelectorAll('.tutorial-highlight').forEach(h => h.remove());
        this.tutorialPanel.querySelectorAll('.tutorial-arrow').forEach(a => a.remove());
        this.element.dropZone.classList.remove('drop-zone-tutorial-target'); // Remove target class
        
        if (!this.currentLesson || this.currentStep === null) {
            // Center the panel if no current step
            Object.assign(this.tutorialPanel.style, {
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        const currentStep = this.currentLesson.steps[this.currentStep];
        if (!currentStep) return;

        const targetValue = currentStep.targetElement;
        if (!targetValue) return;

        console.log('[WebComponent CommandBuilder] Positioning panel for:', targetValue);
        
        // Find the target element in both the component palette and drop zone
        const allComponents = [
            ...this.element.shadowRoot.querySelectorAll('.command-component'),
            ...this.element.shadowRoot.querySelectorAll('.placed-component')
        ];
        
        console.log('[WebComponent CommandBuilder] Looking for target:', {
            targetValue,
            availableComponents: allComponents.map(elem => ({
                value: elem.dataset.value,
                text: elem.textContent.replace('×', '').trim()
            }))
        });
        
        const targetElement = allComponents.find(elem => {
            const matches = elem.dataset.value === targetValue || 
                          elem.textContent.replace('×', '').trim() === targetValue;
            if (matches) {
                console.log('[WebComponent CommandBuilder] Found matching element:', {
                    value: elem.dataset.value,
                    text: elem.textContent.replace('×', '').trim(),
                    targetValue
                });
            }
            return matches;
        });

        if (!targetElement) {
            console.log('[WebComponent CommandBuilder] Target element not found:', targetValue);
            return;
        }

        // Add highlight effect to the component
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        const rect = targetElement.getBoundingClientRect();
        
        // Account for scroll position
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        Object.assign(highlight.style, {
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            left: `${rect.left + scrollX}px`,
            top: `${rect.top + scrollY}px`
        });
        this.overlay.appendChild(highlight);

        // Also highlight the drop zone
        this.element.dropZone.classList.add('drop-zone-tutorial-target');

        // Position panel with animation
        this.tutorialPanel.classList.add('animated');
        const position = this.calculatePanelPosition(targetElement);
        Object.assign(this.tutorialPanel.style, {
            left: position.left,
            top: position.top,
            transform: position.transform,
            opacity: '1'
        });

        // Update arrow
        this.tutorialPanel.querySelectorAll('.tutorial-arrow').forEach(arrow => arrow.remove());
        const arrow = document.createElement('div');
        arrow.className = `tutorial-arrow ${position.arrow}`;
        this.tutorialPanel.appendChild(arrow);
    }

    updateTutorialUI() {
        if (!this.currentTutorial || !this.currentLesson || this.currentStep === null) {
            console.log('[WebComponent CommandBuilder] Cannot update UI - invalid state:', {
                tutorial: !!this.currentTutorial,
                lesson: !!this.currentLesson,
                step: this.currentStep
            });
            return;
        }
        
        const currentStep = this.currentLesson.steps[this.currentStep];
        if (!currentStep) {
            console.log('[WebComponent CommandBuilder] Invalid step index:', this.currentStep);
            return;
        }

        // Clear existing highlights
        this.overlay.querySelectorAll('.tutorial-highlight').forEach(h => h.remove());
        
        console.log('[WebComponent CommandBuilder] Updating UI for step:', {
            step: this.currentStep + 1,
            target: currentStep.targetElement,
            instruction: currentStep.instruction
        });
        
        // Update content with validation
        this.tutorialTitle.textContent = this.currentLesson.title || '';
        this.tutorialContent.textContent = currentStep.instruction || '';
        this.tutorialHint.textContent = currentStep.hint || '';
        
        // Update progress indicators
        this.tutorialProgress.innerHTML = '';
        this.currentLesson.steps.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator';
            if (index === this.currentStep) {
                indicator.classList.add('active');
            } else if (index < this.currentStep) {
                indicator.classList.add('completed');
            }
            this.tutorialProgress.appendChild(indicator);
        });
        
        // Use RAF to ensure DOM updates complete before positioning
        requestAnimationFrame(() => {
            this.positionTutorialPanel();
        });
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateTutorialUI();
        }
    }
    
    showTutorialCompletion() {
        // Clear existing highlights and arrows
        this.overlay.querySelectorAll('.tutorial-highlight').forEach(h => h.remove());
        this.tutorialPanel.querySelectorAll('.tutorial-arrow').forEach(a => a.remove());
        
        // Update panel position with animation
        requestAnimationFrame(() => {
            this.tutorialPanel.classList.add('animated');
            Object.assign(this.tutorialPanel.style, {
                left: '50%',
                top: '30%',
                transform: 'translate(-50%, -50%)'
            });
            
            // Show completion message and next tutorial button immediately
            this.tutorialContent.textContent = '';
            this.tutorialProgress.innerHTML = ''; // Clear progress indicators
            this.tutorialHint.style.display = 'none'; // Hide the hint box completely
            this.completionMessage.textContent = this.currentLesson.completion;
            this.completionMessage.style.display = 'block';
            
            console.log('[WebComponent CommandBuilder] Tutorial completed:', this.currentTutorial.name);
            
            // Get the current tutorial type
            const currentType = Object.entries(this.element.tutorials[this.element.currentOS])
                .find(([_, tutorial]) => tutorial === this.currentTutorial)?.[0];

            // Tutorial progression mapping
            const currentOS = this.element.currentOS;
            const nextTutorials = {
                windows: {
                    ping: 'traceroute',
                    traceroute: 'internalIP',
                    internalIP: 'flushDNS'
                },
                mac: {
                    ping: 'traceroute',
                    traceroute: 'internalIP',
                    internalIP: 'flushDNS'
                },
                chrome: {
                    ping: 'tracepath',
                    tracepath: 'internalIP',
                    internalIP: 'flushDNS'
                }
            };

            // Show next tutorial button if there's a next tutorial
            if (currentType && nextTutorials[currentType]) {
                console.log('[WebComponent CommandBuilder] Enabling next tutorial button for:', currentType);
                this.nextTutorialContainer.style.display = 'block';
            }
        });
    }

    nextStep() {
        // First validate if we can proceed
        if (!this.validateCurrentStep()) return;
        
        // Check if we're completing the tutorial
        if (this.currentStep >= this.currentLesson.steps.length - 1) {
            this.showTutorialCompletion();
            return;
        }
        
        // Update step counter
        this.currentStep++;
        
        // Set up a promise chain for the UI updates
        Promise.resolve()
            .then(() => {
                // First update content
                const currentStep = this.currentLesson.steps[this.currentStep];
                if (!currentStep) {
                    console.error('Invalid step index:', this.currentStep);
                    return;
                }
                
                this.tutorialTitle.textContent = this.currentLesson.title;
                this.tutorialContent.textContent = currentStep.instruction;
                this.tutorialHint.textContent = currentStep.hint;
                
                // Update progress indicators
                this.tutorialProgress.innerHTML = '';
                this.currentLesson.steps.forEach((_, index) => {
                    const indicator = document.createElement('div');
                    indicator.className = 'step-indicator';
                    if (index === this.currentStep) {
                        indicator.classList.add('active');
                    } else if (index < this.currentStep) {
                        indicator.classList.add('completed');
                    }
                    this.tutorialProgress.appendChild(indicator);
                });
            })
            .then(() => new Promise(resolve => requestAnimationFrame(resolve)))
            .then(() => {
                // After content update, position the panel
                this.positionTutorialPanel();
                console.log('[WebComponent CommandBuilder] Step updated:', this.currentStep + 1);
            })
            .catch(error => {
                console.error('[WebComponent CommandBuilder] Error updating step:', error);
            });
    }

    startNextTutorial() {
        if (!this.currentTutorial) return;

        // Find the current tutorial type by matching the tutorial object
        const currentType = Object.entries(this.element.tutorials[this.element.currentOS])
            .find(([_, tutorial]) => tutorial === this.currentTutorial)?.[0];

        if (!currentType) {
            console.error('[WebComponent CommandBuilder] Could not determine current tutorial type');
            return;
        }
        
        // Tutorial progression mapping
        const nextTutorials = {
            windows: {
                ping: 'traceroute',
                traceroute: 'internalIP',
                internalIP: 'flushDNS',
                flushDNS: null
            },
            mac: {
                ping: 'traceroute',
                traceroute: 'internalIP',
                internalIP: 'flushDNS',
                flushDNS: null
            },
            chrome: {
                ping: 'tracepath',
                tracepath: 'internalIP',
                internalIP: 'flushDNS',
                flushDNS: null
            }
        };
        
        const osProgressions = nextTutorials[this.element.currentOS] || {};
        const nextType = osProgressions[currentType];
        if (!nextType) {
            // End of tutorial sequence
            this.endTutorial();
            return;
        }
        
        this.nextTutorialContainer.style.display = 'none';
        this.element.resetBuilder();
        this.startTutorial(`${this.element.currentOS}.${nextType}`);
    }
    
    validateCurrentStep() {
        if (!this.currentLesson || this.currentStep === null) {
            console.log('[TutorialManager] Invalid tutorial state:', {
                lesson: !!this.currentLesson,
                step: this.currentStep
            });
            return false;
        }
        
        const currentStepData = this.currentLesson.steps[this.currentStep];
        if (!currentStepData) {
            console.log('[TutorialManager] Step data not found:', this.currentStep);
            return false;
        }
        
        const currentCommand = this.element.getCurrentCommand();
        const isFinalStep = currentStepData.isFinal || this.currentStep === this.currentLesson.steps.length - 1;

        // Log current state for debugging
        console.log('[WebComponent CommandBuilder] Validating step:', {
            step: this.currentStep + 1,
            required: currentStepData.requiredComponents,
            current: currentCommand,
            isFinalStep,
            currentTutorial: this.currentTutorial?.name
        });

        if (isFinalStep) {
            // Handle final steps with no components (instructional steps)
            if (currentStepData.requiredComponents.length === 0) {
                console.log('[WebComponent CommandBuilder] Final instructional step complete');
                requestAnimationFrame(() => {
                    this.showTutorialCompletion();
                });
                return true; // Step is valid as it's just instructional
            }

            // Final step requires exact match of all components if components are expected
            if (currentCommand.length !== currentStepData.requiredComponents.length) {
                console.log('[WebComponent CommandBuilder] Final step - length mismatch');
                return false;
            }

            const exactMatch = currentStepData.requiredComponents.every((component, index) => {
                // Allow flexibility in order for final check, just ensure all required are present
                const matches = currentCommand.includes(component);
                // const matches = currentCommand[index] === component; // Original stricter check
                if (!matches) {
                    console.log('[WebComponent CommandBuilder] Final step - mismatch at position', index);
                }
                return matches;
            });

            if (exactMatch) {
                console.log('[WebComponent CommandBuilder] Final step complete');
                // Use requestAnimationFrame for smoother transition
                requestAnimationFrame(() => {
                    this.showTutorialCompletion();
                });
                return true;
            }
            return false;
        }

        // For non-final steps, just check the current target component
        const targetElement = currentStepData.targetElement;
        const requiredPosition = currentStepData.requiredComponents.indexOf(targetElement);
        const currentPosition = currentCommand.indexOf(targetElement);

        // For intermediate steps, only validate the current target component
        console.log('[WebComponent CommandBuilder] Checking component:', {
            targetElement,
            currentPosition,
            currentCommand,
            os: this.element.currentOS,
            tutorialName: this.currentTutorial?.name,
            requiredComponents: currentStepData.requiredComponents,
            step: this.currentStep,
            isFinalStep
        });

        // Special handling for first step - only check if component exists
        if (this.currentStep === 0) {
            let isValid = currentPosition >= 0;
            if (isValid) {
                console.log('[WebComponent CommandBuilder] First step validated:', {
                    component: targetElement,
                    found: true
                });
                setTimeout(() => {
                    if (!this.isEnding) {
                        requestAnimationFrame(() => this.nextStep());
                    }
                }, 300);
            }
            return isValid;
        }
        
        // For intermediate steps, just check if the target component exists and all previous required components exist
        let isValid = currentPosition >= 0;
        if (isValid && requiredPosition > 0) {
            // Check that all previous required components exist
            const prevComponents = currentStepData.requiredComponents.slice(0, requiredPosition);
            isValid = prevComponents.every(component => currentCommand.includes(component));
            
            console.log('[WebComponent CommandBuilder] Checking previous components:', {
                targetComponent: targetElement,
                prevComponents,
                allPresent: isValid,
                currentCommand
            });
        }

        if (isValid) {
            // Use shorter delay for smoother progression
            setTimeout(() => {
                if (!this.isEnding) {
                    const newCommand = this.element.getCurrentCommand();
                    // Just check if the component is still present
                    if (newCommand.indexOf(targetElement) >= 0) {
                        requestAnimationFrame(() => this.nextStep());
                    }
                }
            }, 300);
        }

        return isValid;
    }
}
