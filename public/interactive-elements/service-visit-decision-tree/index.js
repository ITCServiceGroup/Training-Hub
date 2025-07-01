// Service Visit Decision Tree Web Component

const serviceVisitDecisionTreeTemplate = document.createElement('template');
serviceVisitDecisionTreeTemplate.innerHTML = `
<style>
    :host {
        display: block;
        font-family: 'Inter', sans-serif;
        background: var(--custom-primary-bg-color, var(--bg-color, #ffffff));
        color: var(--text-color);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);

        /* Light mode defaults */
        --bg-color: var(--custom-primary-bg-color, #ffffff);
        --secondary-bg: var(--custom-secondary-bg-color, #f8fafc);
        --title-color: var(--custom-title-color, #2c3e50);
        --text-color: #374151;
        --border-color: #e5e7eb;
        --button-bg: var(--custom-button-color, #3b82f6);
        --button-text: #ffffff;
        --success-color: #22c55e;
        --warning-color: #f59e0b;
        --error-color: #ef4444;
        --accent-color: #8b5cf6;
    }

    :host(.dark-mode) {
        --bg-color: var(--custom-primary-bg-color, #1e293b);
        --secondary-bg: var(--custom-secondary-bg-color, #334155);
        --title-color: var(--custom-title-color, #f1f5f9);
        --text-color: #d1d5db;
        --border-color: #475569;
        --button-bg: var(--custom-button-color, #3b82f6);
        --button-text: #ffffff;
    }

    .container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .main-panel {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 24px;
        min-height: 500px;
    }

    .side-panel {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--border-color);
    }

    .title {
        color: var(--title-color);
        font-size: 24px;
        font-weight: 700;
        margin: 0;
    }

    .step-indicator {
        background: var(--button-bg);
        color: var(--button-text);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
    }

    .step-indicator.start {
        background: var(--success-color);
    }

    .step-indicator.complete {
        background: var(--success-color);
    }

    .step-indicator.ended {
        background: var(--error-color);
    }

    .step-content {
        text-align: center;
        margin-bottom: 32px;
    }

    .step-icon {
        font-size: 64px;
        margin-bottom: 16px;
        display: block;
    }

    .step-title {
        color: var(--title-color);
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 12px 0;
        line-height: 1.2;
    }

    .step-description {
        color: var(--text-color);
        font-size: 16px;
        line-height: 1.5;
        margin: 0;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    .options-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
    }

    .option-btn {
        background: var(--button-bg);
        color: var(--button-text);
        border: none;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .option-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        filter: brightness(1.1);
    }

    .option-btn:active {
        transform: translateY(0);
    }

    .navigation {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color);
    }

    .nav-btn {
        background: var(--secondary-bg);
        color: var(--text-color);
        border: 2px solid var(--border-color);
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .nav-btn:hover:not(:disabled) {
        border-color: var(--button-bg);
        color: var(--button-bg);
    }

    .nav-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .restart-btn {
        background: var(--warning-color);
        color: white;
        border: none;
    }

    .restart-btn:hover {
        filter: brightness(1.1);
    }

    .progress-section {
        margin-bottom: 24px;
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .progress-title {
        color: var(--title-color);
        font-size: 18px;
        font-weight: 600;
        margin: 0;
    }

    .progress-counter {
        color: var(--text-color);
        font-size: 14px;
        background: var(--bg-color);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
    }

    .progress-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 300px;
        overflow-y: auto;
    }

    .progress-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        margin-bottom: 4px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 14px;
    }

    .progress-icon {
        font-size: 16px;
        flex-shrink: 0;
    }

    .progress-title {
        color: var(--text-color);
        font-size: 14px;
        font-weight: 500;
    }

    .reset-progress-btn {
        background: var(--error-color);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .reset-progress-btn:hover {
        filter: brightness(1.1);
    }

    .workflow-info {
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 16px;
        margin-top: 20px;
    }

    .workflow-title {
        color: var(--title-color);
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
    }

    .workflow-description {
        color: var(--text-color);
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
    }

    @media (max-width: 768px) {
        .container {
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .main-panel, .side-panel {
            padding: 16px;
        }

        .title {
            font-size: 20px;
        }

        .step-title {
            font-size: 24px;
        }

        .step-icon {
            font-size: 48px;
        }

        .option-btn {
            padding: 14px 18px;
            font-size: 15px;
        }

        .navigation {
            flex-wrap: wrap;
        }
    }

    @media (max-width: 480px) {
        :host {
            padding: 12px;
        }

        .step-title {
            font-size: 20px;
        }

        .step-icon {
            font-size: 40px;
        }

        .option-btn {
            padding: 12px 16px;
            font-size: 14px;
        }
    }
</style>

<div class="container">
    <div class="main-panel">
        <div class="header">
            <h1 class="title">Service Visit Navigator</h1>
            <span id="step-indicator" class="step-indicator">Step 1</span>
        </div>

        <div class="step-content">
            <span id="step-icon" class="step-icon">👥</span>
            <h2 id="step-title" class="step-title">Customer Consultation & Walkthrough</h2>
            <p id="step-description" class="step-description">Identifying the problem, verifying CPE location and status.</p>
        </div>

        <div id="options-container" class="options-container">
            <!-- Options will be populated by JavaScript -->
        </div>

        <div class="navigation">
            <button id="back-btn" class="nav-btn">← Back</button>
            <button id="restart-btn" class="nav-btn restart-btn">🔄 Restart</button>
        </div>
    </div>

    <div class="side-panel">
        <div class="progress-section">
            <div class="progress-header">
                <h3 class="progress-title">Progress</h3>
                <div class="progress-counter-container">
                    <span id="progress-counter" class="progress-counter">0 steps completed</span>
                    <button id="reset-progress-btn" class="reset-progress-btn">Reset</button>
                </div>
            </div>
            <ul id="progress-list" class="progress-list">
                <!-- Progress items will be populated by JavaScript -->
            </ul>
        </div>

        <div class="workflow-info">
            <h4 class="workflow-title">Service Visit Workflow</h4>
            <p class="workflow-description">
                Follow this interactive decision tree to guide you through the complete service visit process.
                Each step represents a critical checkpoint in ensuring customer satisfaction and service quality.
            </p>
        </div>
    </div>
</div>
`;

class ServiceVisitDecisionTreeElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(serviceVisitDecisionTreeTemplate.content.cloneNode(true));
        
        // Current step tracking
        this.currentStep = null;
        this.stepHistory = [];
        this.completedSteps = new Set();
        
        // Decision tree data structure
        this.decisionTree = this.initializeDecisionTree();
    }

    connectedCallback() {
        console.log('[WebComponent] ServiceVisitDecisionTree connected to DOM.');

        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            this.initialize();
        }, 100);
    }

    initialize() {
        console.log('[WebComponent] ServiceVisitDecisionTree initializing...');

        // Check if shadow DOM elements exist
        const stepTitle = this.shadowRoot.getElementById('step-title');
        const stepDescription = this.shadowRoot.getElementById('step-description');

        if (!stepTitle || !stepDescription) {
            console.error('[WebComponent] ServiceVisitDecisionTree: Required DOM elements not found');
            return;
        }

        console.log('[WebComponent] ServiceVisitDecisionTree: DOM elements found, setting up...');

        this.setupEventListeners();
        this.startDecisionTree();

        console.log('[WebComponent] ServiceVisitDecisionTree initialization complete');
    }

    setupEventListeners() {
        // Restart button
        const restartBtn = this.shadowRoot.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => this.restartDecisionTree());

        // Back button
        const backBtn = this.shadowRoot.getElementById('back-btn');
        backBtn.addEventListener('click', () => this.goBack());

        // Progress reset button
        const resetProgressBtn = this.shadowRoot.getElementById('reset-progress-btn');
        resetProgressBtn.addEventListener('click', () => this.resetProgress());
    }

    initializeDecisionTree() {
        return {
            'start': {
                title: 'Step 1: Customer Consultation & Walkthrough',
                description: 'Identifying the problem, verifying CPE location and status.',
                icon: '👥',
                options: [
                    { text: 'Problem identified, proceed to check light levels', next: 'check-light' }
                ],
                isStart: true,
                stepNumber: 1
            },
            'check-light': {
                title: 'Step 2: Check Light & Fiber Patch Cable',
                description: 'Clean Fiber, Check Cap Orientation. Failing Light: @NIU - Escalate ticket through dispatch. @ONT - Replace FPC.',
                icon: '💡',
                options: [
                    { text: 'Light OK at both NIU and ONT - Continue', next: 'inspect-cabling' },
                    { text: 'No Light at NIU - Escalate ticket through dispatch', next: 'escalate-ticket' },
                    { text: 'No Light at ONT - Replace Fiber Patch Cable', next: 'replace-fpc' }
                ],
                stepNumber: 2
            },
            'escalate-ticket': {
                title: 'Escalate Ticket',
                description: 'No light detected at NIU. This indicates an issue with the fiber connection before the customer premises. Escalate ticket through dispatch.',
                icon: '🚨',
                options: [
                    { text: 'Ticket escalated through dispatch - End visit', next: 'end' }
                ],
                isEscalation: true
            },
            'replace-fpc': {
                title: 'Replace Fiber Patch Cable',
                description: 'No light at ONT detected. Replace the Fiber Patch Cable and recheck light levels.',
                icon: '🔧',
                options: [
                    { text: 'FPC replaced - Recheck light levels', next: 'check-light-after-fpc' },
                ]
            },
            'check-light-after-fpc': {
                title: 'Recheck Light After FPC Replacement',
                description: 'Verify light levels after replacing the Fiber Patch Cable.',
                icon: '💡',
                options: [
                    { text: 'Light now OK - Continue to next step', next: 'inspect-cabling' },
                    { text: 'Still no light - Escalate ticket', next: 'escalate-ticket' }
                ]
            },
            'inspect-cabling': {
                title: 'Step 3: Inspect Cabling',
                description: 'Power Supplies, RJ-45/RG-6 Fittings, CAT5e/COAX Cable. Failing: Replace if necessary.',
                icon: '🔍',
                options: [
                    { text: 'All cabling OK - Continue to equipment troubleshooting', next: 'troubleshoot-equipment' },
                    { text: 'Issues found with cabling - Replace/repair', next: 'replace-cabling' }
                ],
                stepNumber: 3
            },
            'replace-cabling': {
                title: 'Replace/Repair Cabling',
                description: 'Replace faulty cables, fittings, or power supplies as necessary.',
                icon: '🔧',
                options: [
                    { text: 'Cabling repaired - Continue to equipment troubleshooting', next: 'troubleshoot-equipment' }
                ]
            },
            'troubleshoot-equipment': {
                title: 'Step 4: Troubleshoot Equipment',
                description: 'Run speed tests, Power Cycle, Factory Reset, Test Cables, Swap CPE, use WiFi Analyzer. Failing: Replace if necessary. Relocate CPE if poor placement.',
                icon: '⚙️',
                options: [
                    { text: 'Equipment working properly - Continue to health check', next: 'health-check' },
                    { text: 'Equipment issues found - Replace/relocate', next: 'replace-equipment' }
                ],
                stepNumber: 4
            },
            'replace-equipment': {
                title: 'Replace/Relocate Equipment',
                description: 'Replace faulty equipment or relocate CPE if poor placement detected.',
                icon: '🔧',
                options: [
                    { text: 'Equipment replaced/relocated - Continue to health check', next: 'health-check' }
                ]
            },
            'health-check': {
                title: 'Step 5: Health Check and/or IST',
                description: 'Run Health Check & Diagnostics, Troubleshoot with IST. Escalate Ticket if Account issues are found.',
                icon: '🏥',
                options: [
                    { text: 'Health check passed - Continue to speed verification', next: 'verify-speeds' },
                    { text: 'Account issues found - Escalate ticket', next: 'escalate-account' }
                ],
                stepNumber: 5
            },
            'escalate-account': {
                title: 'Escalate Account Issues',
                description: 'Account issues discovered during health check. Escalate ticket for resolution.',
                icon: '🚨',
                options: [
                    { text: 'Account issues escalated - End visit', next: 'end' }
                ],
                isEscalation: true
            },
            'verify-speeds': {
                title: 'Step 6: Verify Speeds & Service',
                description: 'On Chromebook and Customer Equipment, including TV Service.',
                icon: '📊',
                options: [
                    { text: 'All speeds and services verified - Continue to closeout', next: 'customer-expectations' }
                ],
                stepNumber: 6
            },
            'customer-expectations': {
                title: 'Step 7: Set Customer Expectations & Closeout',
                description: 'Educate the customer and Notate, Notate, Notate.',
                icon: '📝',
                options: [
                    { text: 'Customer educated and visit documented - Complete service visit', next: 'complete' }
                ],
                stepNumber: 7
            },
            'complete': {
                title: 'Service Visit Complete',
                description: 'All steps completed successfully. Service visit is now complete.',
                icon: '✅',
                options: [],
                isComplete: true
            },
            'end': {
                title: 'Service Visit Ended',
                description: 'Service visit ended due to escalation or external factors.',
                icon: '🔚',
                options: [],
                isEnd: true
            }
        };
    }

    startDecisionTree() {
        this.currentStep = 'start';
        this.stepHistory = [];
        this.completedSteps.clear();
        this.updateDisplay();
    }

    restartDecisionTree() {
        this.startDecisionTree();
    }

    resetProgress() {
        this.completedSteps.clear();
        this.updateProgressDisplay();
    }

    goBack() {
        if (this.stepHistory.length > 0) {
            this.currentStep = this.stepHistory.pop();
            this.updateDisplay();
        }
    }

    selectOption(nextStepId) {
        if (this.currentStep) {
            this.stepHistory.push(this.currentStep);
            this.completedSteps.add(this.currentStep);
        }
        
        this.currentStep = nextStepId;
        this.updateDisplay();
    }

    updateDisplay() {
        console.log('[WebComponent] ServiceVisitDecisionTree updateDisplay called for step:', this.currentStep);

        const step = this.decisionTree[this.currentStep];
        if (!step) {
            console.error('[WebComponent] ServiceVisitDecisionTree: Step not found:', this.currentStep);
            return;
        }

        console.log('[WebComponent] ServiceVisitDecisionTree: Updating display for step:', step.title);

        // Update main content
        const stepTitle = this.shadowRoot.getElementById('step-title');
        const stepDescription = this.shadowRoot.getElementById('step-description');
        const stepIcon = this.shadowRoot.getElementById('step-icon');
        const optionsContainer = this.shadowRoot.getElementById('options-container');

        if (!stepTitle || !stepDescription || !stepIcon || !optionsContainer) {
            console.error('[WebComponent] ServiceVisitDecisionTree: Required elements not found in updateDisplay');
            return;
        }

        stepTitle.textContent = step.title;
        stepDescription.textContent = step.description;
        stepIcon.textContent = step.icon;

        // Clear and populate options
        optionsContainer.innerHTML = '';
        
        step.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option.text;
            button.addEventListener('click', () => this.selectOption(option.next));
            optionsContainer.appendChild(button);
        });

        // Update navigation buttons
        const backBtn = this.shadowRoot.getElementById('back-btn');
        backBtn.disabled = this.stepHistory.length === 0;

        // Update step indicator
        this.updateStepIndicator(step);
        
        // Update progress
        this.updateProgressDisplay();
    }

    updateStepIndicator(step) {
        const indicator = this.shadowRoot.getElementById('step-indicator');

        if (step.isStart) {
            indicator.textContent = 'Step 1';
            indicator.className = 'step-indicator start';
        } else if (step.isComplete) {
            indicator.textContent = 'Complete';
            indicator.className = 'step-indicator complete';
        } else if (step.isEnd || step.isEscalation) {
            indicator.textContent = 'Ended';
            indicator.className = 'step-indicator ended';
        } else if (step.stepNumber) {
            indicator.textContent = `Step ${step.stepNumber}`;
            indicator.className = 'step-indicator';
        } else {
            indicator.textContent = 'In Progress';
            indicator.className = 'step-indicator';
        }
    }

    updateProgressDisplay() {
        const progressList = this.shadowRoot.getElementById('progress-list');
        progressList.innerHTML = '';

        this.completedSteps.forEach(stepId => {
            const step = this.decisionTree[stepId];
            if (step) {
                const li = document.createElement('li');
                li.className = 'progress-item';
                li.innerHTML = `
                    <span class="progress-icon">${step.icon}</span>
                    <span class="progress-title">${step.title}</span>
                `;
                progressList.appendChild(li);
            }
        });

        // Update progress counter
        const progressCounter = this.shadowRoot.getElementById('progress-counter');
        progressCounter.textContent = `${this.completedSteps.size} steps completed`;
    }
}

// Define the custom element using the standard "-simulator" suffix
customElements.define('service-visit-decision-tree-simulator', ServiceVisitDecisionTreeElement);
console.log('[WebComponent] Custom element "service-visit-decision-tree-simulator" defined.');
