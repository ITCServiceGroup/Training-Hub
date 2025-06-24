# Service Visit Decision Tree

An interactive decision tree component that guides technicians through the complete "Life of a Service Visit" workflow.

## Overview

This interactive element provides a step-by-step decision tree for service technicians to follow during customer visits. It covers all 7 main steps of the service visit process, with branching paths for different scenarios and escalation procedures.

## Features

- **Interactive Step-by-Step Guidance**: Navigate through each step of the service visit process
- **Progress Tracking**: Visual progress indicator showing completed steps
- **Branching Logic**: Different paths based on findings and test results
- **Escalation Paths**: Clear escalation procedures for issues requiring dispatch
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Theme Support**: Supports both light and dark modes
- **Navigation Controls**: Back button and restart functionality

## Workflow Steps

1. **Customer Consultation & Walkthrough** - Identifying problems and verifying CPE
2. **Check Light & Fiber Patch Cable** - Light level checks and fiber maintenance
3. **Inspect Cabling** - Power supplies, fittings, and cable inspection
4. **Troubleshoot Equipment** - Speed tests, resets, and equipment testing
5. **Health Check and/or IST** - System diagnostics and account verification
6. **Verify Speeds & Service** - Final speed and service verification
7. **Set Customer Expectations & Closeout** - Customer education and documentation

## Usage in Study Guides

To include this interactive element in a study guide, use the shortcode:

```
[interactive name="service-visit-decision-tree"]
```

## Technical Details

- **Component Name**: `service-visit-decision-tree`
- **Files**: 
  - `index.js` - Main component logic
  - `template.js` - HTML template and CSS styles
  - `test.html` - Test page for development
- **Dependencies**: None (vanilla Web Component)
- **Browser Support**: Modern browsers with Web Components support

## Customization

The component uses CSS custom properties for theming:
- `--custom-primary-bg-color` - Primary background color
- `--custom-secondary-bg-color` - Secondary background color
- `--custom-title-color` - Title text color
- `--custom-button-color` - Button background color

## Development

To test the component locally, open `test.html` in a web browser. The test page includes theme switching functionality to verify both light and dark mode appearances.
