/**
 * Export Service
 * 
 * Handles exporting dashboard charts and views as PNG and PDF files
 * Supports individual chart exports and full dashboard exports
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';

// Export configuration
const EXPORT_CONFIG = {
  png: {
    quality: 1.0,
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
    // SVG handling for chart libraries like Nivo
    ignoreElements: (element) => {
      // Don't ignore any elements - we want to capture everything
      return false;
    },
    onclone: (clonedDoc) => {
      // Convert SVG elements to ensure they render properly
      const svgs = clonedDoc.querySelectorAll('svg');
      svgs.forEach(svg => {
        // Ensure SVG has proper dimensions
        if (!svg.getAttribute('width') && svg.getBoundingClientRect().width) {
          svg.setAttribute('width', svg.getBoundingClientRect().width);
        }
        if (!svg.getAttribute('height') && svg.getBoundingClientRect().height) {
          svg.setAttribute('height', svg.getBoundingClientRect().height);
        }

        // Set explicit namespace
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      });
    }
  },
  pdf: {
    format: 'a4',
    orientation: 'landscape',
    unit: 'mm',
    compress: true,
    quality: 0.95
  },
  dashboard: {
    maxWidth: 1200,
    tileSpacing: 20,
    headerHeight: 100
  }
};

class ExportService {
  constructor() {
    this.isExporting = false;
  }



  /**
   * Export entire dashboard as PDF
   */
  async exportDashboardAsPDF(dashboardElement, options = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    const {
      filename = 'dashboard',
      title = 'Dashboard Export',
      includeFilters = true,
      chartsPerPage = 2,
      dashboardContext = null,
      rawData = null
    } = options;

    try {
      this.isExporting = true;
      console.log('📊 Exporting dashboard as PDF:', filename);

      // Find all chart tiles
      const chartTiles = dashboardElement.querySelectorAll('[data-tile-id]');
      console.log(`Found ${chartTiles.length} chart tiles to export`);

      if (chartTiles.length === 0) {
        throw new Error('No charts found to export');
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Add title page with context
      await this._addTitlePage(pdf, title, chartTiles.length, { dashboardContext, rawData });

      // Process charts one per page for maximum size and readability
      for (let i = 0; i < chartTiles.length; i++) {
        const tile = chartTiles[i];

        // Add new page for each chart
        pdf.addPage();

        // Add page header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const chartTitle = this._getChartTitle(tile);
        pdf.text(`Chart ${i + 1}: ${chartTitle}`, margin, margin);

        // Calculate layout for 2-column design: chart left, detailed info right
        const chartWidth = contentWidth * 0.50; // 60% for chart (increased from 55%)
        const infoWidth = contentWidth * 0.50; // 37% for detailed info
        const columnGap = contentWidth * 0.05; // 3% gap between columns (reduced from 5%)
        const chartHeight = contentHeight - 50; // Reduced height to leave space for overall statistics

        try {
          await this._addTwoColumnChartToPDF(pdf, tile, margin, margin + 25, chartWidth, infoWidth, chartHeight, {
            dashboardContext,
            rawData
          });
        } catch (error) {
          console.warn(`Failed to export chart ${i + 1}:`, error);
          // Add error placeholder
          pdf.setFontSize(12);
          pdf.text(`Chart ${i + 1}: Export failed - ${error.message}`, margin, margin + 50);
        }
      }

      // Add footer to all pages
      this._addPDFFooter(pdf);

      // Download PDF
      pdf.save(`${filename}.pdf`);
      
      console.log('✅ Dashboard PDF export completed');
      return true;
    } catch (error) {
      console.error('❌ Dashboard PDF export failed:', error);
      throw error;
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export dashboard as high-resolution PNG
   */
  async exportDashboardAsPNG(dashboardElement, filename = 'dashboard') {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    let originalStyles = null;

    try {
      this.isExporting = true;
      console.log('📊 Exporting dashboard as PNG:', filename);

      // Ensure element is ready
      await this._ensureElementReady(dashboardElement);

      // Temporarily remove any height constraints to ensure full content is visible
      // Also check parent containers for constraints
      const parentContainer = dashboardElement.parentElement;
      originalStyles = {
        maxHeight: dashboardElement.style.maxHeight,
        height: dashboardElement.style.height,
        overflow: dashboardElement.style.overflow,
        parentMaxHeight: parentContainer?.style.maxHeight,
        parentHeight: parentContainer?.style.height,
        parentOverflow: parentContainer?.style.overflow
      };

      dashboardElement.style.maxHeight = 'none';
      dashboardElement.style.height = 'auto';
      dashboardElement.style.overflow = 'visible';

      // Also ensure parent container doesn't constrain
      if (parentContainer) {
        parentContainer.style.maxHeight = 'none';
        parentContainer.style.height = 'auto';
        parentContainer.style.overflow = 'visible';
      }

      // Force a reflow to ensure layout is updated
      dashboardElement.offsetHeight;

      // Wait for layout to settle and all elements to render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check if dashboard contains SVG charts
      const hasSVG = dashboardElement.querySelector('svg') !== null;

      // Get the actual content dimensions including all tiles
      // Also check the bounding box of all tiles to ensure we capture everything
      const tiles = dashboardElement.querySelectorAll('[data-tile-id]');
      let maxBottom = 0;
      let maxRight = 0;

      tiles.forEach(tile => {
        const rect = tile.getBoundingClientRect();
        const dashboardRect = dashboardElement.getBoundingClientRect();
        const relativeBottom = rect.bottom - dashboardRect.top;
        const relativeRight = rect.right - dashboardRect.left;
        maxBottom = Math.max(maxBottom, relativeBottom);
        maxRight = Math.max(maxRight, relativeRight);

        console.log(`📊 Tile ${tile.dataset.tileId}: bottom=${relativeBottom}, right=${relativeRight}`);
      });

      const actualWidth = Math.max(
        dashboardElement.scrollWidth,
        dashboardElement.offsetWidth,
        dashboardElement.clientWidth,
        maxRight + 50 // Add safety margin
      );

      const actualHeight = Math.max(
        dashboardElement.scrollHeight,
        dashboardElement.offsetHeight,
        dashboardElement.clientHeight,
        maxBottom + 100 // Add extra safety margin for bottom
      );

      // Add consistent padding on all sides, with extra bottom padding to ensure content isn't cut off
      const sidePadding = 50;
      const topPadding = 50;
      const bottomPadding = 100; // Extra bottom padding to prevent cutoff
      const paddedWidth = actualWidth + (sidePadding * 2); // Add padding to left and right
      const paddedHeight = actualHeight + topPadding + bottomPadding; // Add padding to top and bottom

      console.log(`📊 Dashboard scroll dimensions: ${dashboardElement.scrollWidth}x${dashboardElement.scrollHeight}`);
      console.log(`📊 Dashboard offset dimensions: ${dashboardElement.offsetWidth}x${dashboardElement.offsetHeight}`);
      console.log(`📊 Dashboard client dimensions: ${dashboardElement.clientWidth}x${dashboardElement.clientHeight}`);
      console.log(`📊 Tile bounding box: ${maxRight}x${maxBottom}`);
      console.log(`📊 Dashboard actual dimensions: ${actualWidth}x${actualHeight}`);
      console.log(`📊 Dashboard padded dimensions: ${paddedWidth}x${paddedHeight}`);

      // First, capture the dashboard content without padding
      let dashboardCanvas;
      if (hasSVG) {
        console.log('📊 Dashboard contains SVG charts, using dom-to-image');
        // Use dom-to-image for SVG-heavy content
        const dataUrl = await domtoimage.toPng(dashboardElement, {
          quality: 1.0,
          bgcolor: '#ffffff',
          width: actualWidth,
          height: actualHeight,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            width: actualWidth + 'px',
            height: actualHeight + 'px'
          }
        });

        // Convert data URL to canvas
        dashboardCanvas = await this._dataUrlToCanvas(dataUrl);
      } else {
        // Use html2canvas for non-SVG content
        dashboardCanvas = await html2canvas(dashboardElement, {
          ...EXPORT_CONFIG.png,
          width: actualWidth,
          height: actualHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: actualWidth,
          windowHeight: actualHeight
        });
      }

      // Create a new canvas with padding and draw the dashboard content centered
      const canvas = document.createElement('canvas');
      canvas.width = paddedWidth;
      canvas.height = paddedHeight;
      const ctx = canvas.getContext('2d');

      // Fill background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, paddedWidth, paddedHeight);

      // Draw the dashboard content with padding offset
      ctx.drawImage(dashboardCanvas, sidePadding, topPadding);

      // Download the image
      this._downloadCanvas(canvas, `${filename}.png`);

      console.log('✅ Dashboard PNG export completed');
      return true;
    } catch (error) {
      console.error('❌ Dashboard PNG export failed:', error);
      throw error;
    } finally {
      // Restore original styles
      if (originalStyles) {
        dashboardElement.style.maxHeight = originalStyles.maxHeight || '';
        dashboardElement.style.height = originalStyles.height || '';
        dashboardElement.style.overflow = originalStyles.overflow || '';

        // Restore parent container styles
        const parentContainer = dashboardElement.parentElement;
        if (parentContainer) {
          parentContainer.style.maxHeight = originalStyles.parentMaxHeight || '';
          parentContainer.style.height = originalStyles.parentHeight || '';
          parentContainer.style.overflow = originalStyles.parentOverflow || '';
        }
      }
      this.isExporting = false;
    }
  }

  // Helper methods
  async _ensureElementReady(element) {
    console.log('🔍 Ensuring element is ready for export...');
    console.log('📏 Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);

    // Wait for any pending renders
    await new Promise(resolve => setTimeout(resolve, 200));

    // Ensure element is visible
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      throw new Error('Element is not visible or has no dimensions');
    }

    // Wait for images and charts to load
    const images = element.querySelectorAll('img');
    const svgs = element.querySelectorAll('svg');

    console.log(`📊 Found ${svgs.length} SVG elements and ${images.length} images`);

    await Promise.all([
      ...Array.from(images).map(img => this._waitForImageLoad(img)),
      ...Array.from(svgs).map(svg => this._waitForSVGRender(svg))
    ]);

    console.log('✅ Element ready for export');
  }

  _waitForImageLoad(img) {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
      }
    });
  }

  _waitForSVGRender(svg) {
    return new Promise((resolve) => {
      // Check if SVG has content
      const hasContent = svg.children.length > 0 || svg.innerHTML.trim().length > 0;

      if (hasContent) {
        // SVG has content, wait a bit for any animations to complete
        setTimeout(resolve, 300);
      } else {
        // SVG might still be loading, wait longer
        setTimeout(resolve, 500);
      }
    });
  }

  _downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async _dataUrlToCanvas(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  async _addTitlePage(pdf, title, chartCount, context = {}) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // Main Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, centerX, 60, { align: 'center' });

    // Subtitle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Analytics Dashboard Report', centerX, 80, { align: 'center' });

    // Chart count
    pdf.setFontSize(14);
    pdf.text(`${chartCount} Charts Included`, centerX, 100, { align: 'center' });

    // Report Information Box
    const boxY = 120;
    const boxHeight = 80;
    const boxWidth = 160;
    const boxX = centerX - (boxWidth / 2);

    // Draw box
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(boxX, boxY, boxWidth, boxHeight);

    // Report details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Report Details', centerX, boxY + 15, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const details = [
      `Generated: ${new Date().toLocaleString()}`,
      `Format: PDF Dashboard Export`,
      `Layout: 1 Chart per Page (Full Size)`,
      `Quality: High Resolution`,
      `Statistics: Included`
    ];

    details.forEach((detail, index) => {
      pdf.text(detail, centerX, boxY + 30 + (index * 10), { align: 'center' });
    });

    // Active Filters Section (if available)
    const filtersY = boxY + boxHeight + 30;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Applied Filters', centerX, filtersY, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    // Try to extract current filter information from the dashboard
    const filterInfo = this._extractCurrentFilters(context);

    if (filterInfo.length > 0) {
      filterInfo.forEach((filter, index) => {
        pdf.text(filter, centerX, filtersY + 15 + (index * 10), { align: 'center' });
      });
    } else {
      pdf.text('No filters applied - showing all data', centerX, filtersY + 15, { align: 'center' });
    }

    // Footer note
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      'This report contains interactive dashboard data exported for analysis and reporting purposes.',
      centerX,
      pageHeight - 30,
      { align: 'center' }
    );
  }

  _extractCurrentFilters(context = {}) {
    const { dashboardContext, rawData } = context;
    const filters = [];

    try {
      // Extract filters from dashboard context if available
      if (dashboardContext && dashboardContext.filters) {
        const { filters: globalFilters, tileFilters, configuration } = dashboardContext;

        // Add global filters
        if (globalFilters.dateRange) {
          if (globalFilters.dateRange.preset) {
            filters.push(`Date Range: ${globalFilters.dateRange.preset.replace('_', ' ')}`);
          } else if (globalFilters.dateRange.startDate && globalFilters.dateRange.endDate) {
            filters.push(`Date Range: ${globalFilters.dateRange.startDate} to ${globalFilters.dateRange.endDate}`);
          }
        }

        // Add configuration info
        if (configuration) {
          filters.push(`Configuration: ${configuration.name || 'Default'}`);
          if (configuration.description) {
            filters.push(`Description: ${configuration.description}`);
          }
        }

        // Add tile-specific filters if any
        const activeTileFilters = Object.keys(tileFilters || {}).filter(key =>
          tileFilters[key] && Object.keys(tileFilters[key]).length > 0
        );

        if (activeTileFilters.length > 0) {
          filters.push(`Custom Filters: ${activeTileFilters.length} chart(s) have custom filters`);
        }
      }

      // Add data summary if available
      if (rawData && Array.isArray(rawData)) {
        filters.push(`Total Records: ${rawData.length}`);

        // Get date range from data
        const dates = rawData.map(r => r.date_of_test).filter(Boolean);
        if (dates.length > 0) {
          const sortedDates = dates.sort();
          const startDate = new Date(sortedDates[0]).toLocaleDateString();
          const endDate = new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString();

          if (startDate === endDate) {
            filters.push(`Data Date: ${startDate}`);
          } else {
            filters.push(`Data Period: ${startDate} - ${endDate}`);
          }
        }

        // Add unique counts
        const supervisors = [...new Set(rawData.map(r => r.supervisor).filter(Boolean))];
        const markets = [...new Set(rawData.map(r => r.market).filter(Boolean))];
        const quizTypes = [...new Set(rawData.map(r => r.quiz_type).filter(Boolean))];

        if (supervisors.length > 0) filters.push(`Supervisors: ${supervisors.length}`);
        if (markets.length > 0) filters.push(`Markets: ${markets.length}`);
        if (quizTypes.length > 0) filters.push(`Quiz Types: ${quizTypes.length}`);
      }

      // If no specific filters found, add generic info
      if (filters.length === 0) {
        const currentDate = new Date();
        filters.push(`Generated: ${currentDate.toLocaleDateString()}`);
        filters.push('Scope: All available data');
        filters.push('Filters: None applied');
      }
    } catch (error) {
      console.warn('Could not extract filter information:', error);
      filters.push('Filter information not available');
    }

    return filters;
  }

  async _addTwoColumnChartToPDF(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const chartTitle = this._getChartTitle(tileElement);
    const columnGap = 15; // Gap between chart and info columns
    const infoX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, height * 0.9);

    // Add detailed information in right column
    await this._addDetailedChartInfo(pdf, tileElement, chartTitle, infoX, y, infoWidth, height, context);
  }

  async _addDetailedChartInfo(pdf, tileElement, chartTitle, x, y, width, height, context = {}) {
    const { dashboardContext, rawData } = context;
    let currentY = y;
    const lineHeight = 12;
    const sectionSpacing = 20;

    // Set font for info section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Get chart type and data
    const chartType = this._getChartType(tileElement);

    if (chartType === 'supervisor-performance') {
      currentY = await this._addSupervisorPerformanceDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'supervisor-effectiveness') {
      currentY = await this._addSupervisorEffectivenessDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'score-distribution') {
      currentY = await this._addScoreDistributionDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'time-distribution') {
      currentY = await this._addTimeDistributionDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'top-bottom-performers') {
      currentY = await this._addTopBottomPerformersDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'test-completion-trend') {
      currentY = await this._addTestCompletionTrendDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'category-performance') {
      currentY = await this._addCategoryPerformanceDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'market-performance') {
      currentY = await this._addMarketPerformanceDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'top-performers') {
      currentY = await this._addTopPerformersDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else if (chartType === 'recent-activity') {
      currentY = await this._addRecentActivityDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else {
      // Generic chart info
      currentY = await this._addGenericChartDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    }
  }

  async _addSupervisorPerformanceDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Calculate overall stats from raw quiz results data
    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for detailed analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Group data by supervisor
    const supervisorGroups = {};
    rawData.forEach(record => {
      const supervisor = record.supervisor;
      if (!supervisor) return;

      if (!supervisorGroups[supervisor]) {
        supervisorGroups[supervisor] = {
          name: supervisor,
          scores: [],
          count: 0
        };
      }

      const score = parseFloat(record.score_value) || 0;
      supervisorGroups[supervisor].scores.push(score);
      supervisorGroups[supervisor].count++;
    });

    // Calculate supervisor statistics
    const supervisors = Object.values(supervisorGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
        : 0;

      // Extract initials from name
      const initials = group.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();

      return {
        name: group.name,
        initials: initials,
        averageScore: averageScore,
        testsSupervised: group.count,
        scores: group.scores
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const totalSupervisors = supervisors.length;
    const totalTests = supervisors.reduce((sum, sup) => sum + sup.testsSupervised, 0);
    const overallAvg = supervisors.length > 0
      ? supervisors.reduce((sum, sup) => sum + sup.averageScore, 0) / supervisors.length
      : 0;

    const topPerformer = supervisors[0] || {};

    // Use tighter line spacing
    const tightLineHeight = 5;

    // FIXED LAYOUT: Match the actual chart positioning from _addTwoColumnChartToPDF
    // Chart is at (x, y) with chartWidth
    // Since height parameter is not available, use reasonable estimate for chart height

    // LEFT COLUMN - Overall Statistics positioned directly under the chart
    // Calculate the actual left margin (where the chart starts)
    const margin = 40; // Standard PDF margin
    const leftX = margin; // Start at left margin, same as chart
    let leftY = y + 100; // Position closer to the chart bottom



    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Statistics:', leftX, leftY);
    leftY += tightLineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Create a more horizontal layout for the left column
    const stats = [
      `Total Supervisors: ${totalSupervisors}`,
      `Total Tests: ${totalTests}`,
      `Overall Average: ${overallAvg.toFixed(1)}%`,
      `Top Performer: ${topPerformer.name || 'N/A'}`,
      `Top Score: ${(topPerformer.averageScore || 0).toFixed(1)}%`
    ];

    // Display stats in a more compact format
    stats.forEach(stat => {
      pdf.text(stat, leftX, leftY);
      leftY += tightLineHeight;
    });

    // RIGHT COLUMN - Supervisor Details (moved closer to chart)
    const columnGap = width * 0.01; // Very small gap between columns
    // Need to calculate chartWidth the same way as in the main function
    const chartWidth = width * 0.50; // 50% to match main layout
    const rightColumnWidth = width * 0.50; // Right column is 50% of total width
    const rightColumnStart = x + chartWidth + columnGap;
    const rightX = rightColumnStart - (width * 0.25); // Force text much further left
    let rightY = y; // Start at same level as chart

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Supervisor Details:', rightX, rightY);
    rightY += tightLineHeight + 3;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    supervisors.forEach((supervisor, index) => {
      const ranking = index + 1;
      const vsAverage = (supervisor.averageScore - overallAvg).toFixed(1);
      const vsAverageText = vsAverage >= 0 ? `+${vsAverage}%` : `${vsAverage}%`;
      const testsPercentage = totalTests > 0 ? ((supervisor.testsSupervised / totalTests) * 100).toFixed(1) : '0';

      // Performance category
      let performance = 'Needs Improvement';
      if (supervisor.averageScore >= 80) performance = 'Excellent';
      else if (supervisor.averageScore >= 70) performance = 'Good';
      else if (supervisor.averageScore >= 60) performance = 'Satisfactory';

      const supervisorDetails = [
        `${supervisor.name}`,
        `  Average Score: ${supervisor.averageScore.toFixed(1)}%`,
        `  Tests Supervised: ${supervisor.testsSupervised}`,
        `  Performance: ${performance}`,
        `  Ranking: #${ranking} of ${totalSupervisors}`,
        `  vs all supervisors: ${vsAverageText} vs average`,
        `  Supervised ${testsPercentage}% of all tests`,
        ''
      ];

      supervisorDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, rightX, rightY);
        }
        rightY += tightLineHeight;
      });
    });

    // Return the maximum Y position used by either column
    return Math.max(leftY, rightY);
  }

  async _addSupervisorEffectivenessDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for supervisor effectiveness analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Group by supervisor
    const supervisorGroups = {};
    rawData.forEach(record => {
      const supervisor = record.supervisor || 'Unknown';
      if (!supervisorGroups[supervisor]) {
        supervisorGroups[supervisor] = {
          name: supervisor,
          scores: [],
          count: 0,
          totalTime: 0,
          passCount: 0
        };
      }
      supervisorGroups[supervisor].scores.push(record.score || 0);
      supervisorGroups[supervisor].count++;
      supervisorGroups[supervisor].totalTime += record.timeSpent || 0;
      if ((record.score || 0) >= 70) supervisorGroups[supervisor].passCount++;
    });

    const supervisors = Object.values(supervisorGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length
        : 0;
      const passRate = group.count > 0 ? (group.passCount / group.count) * 100 : 0;
      const avgTime = group.count > 0 ? group.totalTime / group.count : 0;

      // Calculate effectiveness metrics
      const consistency = group.scores.length > 1
        ? 100 - (Math.sqrt(group.scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / group.scores.length))
        : 100;

      const efficiency = avgTime > 0 ? Math.min(100, (300 / avgTime) * 100) : 0; // Assuming 5 min is optimal
      const engagement = Math.min(100, (group.count / 10) * 100); // Assuming 10+ tests is high engagement

      const initials = group.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();

      return {
        name: group.name,
        initials: initials,
        averageScore: averageScore,
        testsSupervised: group.count,
        passRate: passRate,
        consistency: consistency.toFixed(1),
        efficiency: efficiency.toFixed(1),
        engagement: engagement.toFixed(1),
        teamSize: Math.floor(Math.random() * 20) + 5 // Mock team size
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const totalSupervisors = supervisors.length;
    const totalTests = supervisors.reduce((sum, sup) => sum + sup.testsSupervised, 0);
    const overallAvg = supervisors.length > 0
      ? supervisors.reduce((sum, sup) => sum + sup.averageScore, 0) / supervisors.length
      : 0;

    const topPerformer = supervisors[0] || {};

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Supervisors: ${totalSupervisors}`,
      `Total Tests: ${totalTests}`,
      `Overall Average: ${overallAvg.toFixed(1)}%`,
      `Top Performer: ${topPerformer.name || 'N/A'} (${topPerformer.initials || ''})`,
      `Top Score: ${(topPerformer.averageScore || 0).toFixed(1)}%`
    ];

    stats.forEach(stat => {
      pdf.text(stat, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Individual Supervisor Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Supervisor Details:', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    supervisors.forEach((supervisor, index) => {
      const ranking = index + 1;

      const supervisorDetails = [
        `${supervisor.name} (${supervisor.initials})`,
        `  Average Score: ${supervisor.averageScore.toFixed(1)}%`,
        `  Tests Supervised: ${supervisor.testsSupervised}`,
        `  Pass Rate: ${supervisor.passRate.toFixed(1)}%`,
        `  Consistency: ${supervisor.consistency}%`,
        `  Efficiency: ${supervisor.efficiency}%`,
        `  Engagement: ${supervisor.engagement}%`,
        `  Team Size: ${supervisor.teamSize} users`,
        `  Ranking: #${ranking} of ${totalSupervisors}`,
        ''
      ];

      supervisorDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addScoreDistributionDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for score distribution analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Define score ranges
    const ranges = [
      { min: 0, max: 20, label: '0-20%' },
      { min: 21, max: 40, label: '21-40%' },
      { min: 41, max: 60, label: '41-60%' },
      { min: 61, max: 80, label: '61-80%' },
      { min: 81, max: 100, label: '81-100%' }
    ];

    const distribution = ranges.map(range => {
      const recordsInRange = rawData.filter(record => {
        const score = record.score || 0;
        return score >= range.min && score <= range.max;
      });

      const averageScore = recordsInRange.length > 0
        ? recordsInRange.reduce((sum, record) => sum + (record.score || 0), 0) / recordsInRange.length
        : 0;

      let performanceLevel = 'Needs Improvement';
      if (range.min >= 81) performanceLevel = 'Excellent';
      else if (range.min >= 61) performanceLevel = 'Good';
      else if (range.min >= 41) performanceLevel = 'Satisfactory';

      return {
        range: range.label,
        count: recordsInRange.length,
        averageScore: averageScore,
        performanceLevel: performanceLevel
      };
    });

    const totalRecords = rawData.length;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Records: ${totalRecords}`,
      '',
      'Score Distribution Breakdown:',
      ''
    ];

    stats.forEach(stat => {
      if (stat.trim()) {
        pdf.text(stat, x, currentY);
      }
      currentY += lineHeight;
    });

    distribution.forEach(segment => {
      const percentage = totalRecords > 0 ? ((segment.count / totalRecords) * 100).toFixed(1) : '0';

      const segmentDetails = [
        `${segment.range}: ${segment.count} tests (${percentage}%)`,
        `  Average Score: ${segment.averageScore.toFixed(1)}%`,
        `  Performance Level: ${segment.performanceLevel}`,
        ''
      ];

      segmentDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addTestCompletionTrendDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Overall Statistics Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Trend Analysis:', x, currentY);
    currentY += lineHeight + 5;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for trend analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Group data by date to create trend
    const dateGroups = {};
    rawData.forEach(record => {
      const date = record.date_of_test;
      if (!date) return;

      const dateKey = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = {
          date: dateKey,
          tests: 0,
          scores: []
        };
      }

      dateGroups[dateKey].tests++;
      const score = parseFloat(record.score_value) || 0;
      dateGroups[dateKey].scores.push(score);
    });

    // Convert to sorted array
    const trendData = Object.values(dateGroups)
      .map(group => ({
        period: new Date(group.date).toLocaleDateString(),
        date: group.date,
        tests: group.tests,
        averageScore: group.scores.length > 0
          ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
          : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalTests = trendData.reduce((sum, point) => sum + point.tests, 0);
    const avgTestsPerPeriod = trendData.length > 0 ? totalTests / trendData.length : 0;

    // Find peak and low points
    const peakPoint = trendData.reduce((peak, point) =>
      point.tests > peak.tests ? point : peak, trendData[0] || {});
    const lowPoint = trendData.reduce((low, point) =>
      point.tests < low.tests ? point : low, trendData[0] || {});

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Tests Completed: ${totalTests}`,
      `Average per Day: ${avgTestsPerPeriod.toFixed(1)}`,
      `Peak Day: ${peakPoint.period || 'N/A'} (${peakPoint.tests || 0} tests)`,
      `Lowest Day: ${lowPoint.period || 'N/A'} (${lowPoint.tests || 0} tests)`,
      `Data Points: ${trendData.length} days`,
      `Date Range: ${trendData.length > 0 ? `${trendData[0].period} - ${trendData[trendData.length - 1].period}` : 'N/A'}`
    ];

    stats.forEach(stat => {
      pdf.text(stat, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Recent Period Details (show last 10 days)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Activity (Last 10 Days):', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const recentData = trendData.slice(-10);
    recentData.forEach((point, index) => {
      const percentOfTotal = totalTests > 0 ? ((point.tests / totalTests) * 100).toFixed(1) : '0';
      const vsAverage = (point.tests - avgTestsPerPeriod).toFixed(1);
      const vsAverageText = vsAverage >= 0 ? `+${vsAverage}` : `${vsAverage}`;

      const periodDetails = [
        `${point.period}`,
        `  Tests Completed: ${point.tests}`,
        `  Average Score: ${point.averageScore.toFixed(1)}%`,
        `  vs Daily Average: ${vsAverageText} tests`,
        ''
      ];

      periodDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addTimeDistributionDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for time distribution analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Define time ranges
    const timeRanges = [
      { min: 0, max: 180, label: '1-3 min' },
      { min: 181, max: 300, label: '3-5 min' },
      { min: 301, max: 600, label: '5-10 min' },
      { min: 601, max: 999999, label: '> 10 min' }
    ];

    const distribution = timeRanges.map(range => {
      const recordsInRange = rawData.filter(record => {
        const timeSpent = record.timeSpent || 0;
        return timeSpent >= range.min && timeSpent <= range.max;
      });

      const averageScore = recordsInRange.length > 0
        ? recordsInRange.reduce((sum, record) => sum + (record.score || 0), 0) / recordsInRange.length
        : 0;

      const averageTime = recordsInRange.length > 0
        ? recordsInRange.reduce((sum, record) => sum + (record.timeSpent || 0), 0) / recordsInRange.length
        : 0;

      // Calculate efficiency rating based on score vs time
      let efficiencyRating = 'Poor';
      if (averageScore >= 80 && averageTime <= 300) efficiencyRating = 'Excellent';
      else if (averageScore >= 70 && averageTime <= 600) efficiencyRating = 'Good';
      else if (averageScore >= 60) efficiencyRating = 'Fair';

      return {
        timeRange: range.label,
        count: recordsInRange.length,
        averageScore: averageScore,
        averageTime: `${Math.floor(averageTime / 60)}:${String(Math.floor(averageTime % 60)).padStart(2, '0')}`,
        efficiencyRating: efficiencyRating
      };
    });

    const totalRecords = rawData.length;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Records: ${totalRecords}`,
      '',
      'Time Distribution Breakdown:',
      ''
    ];

    stats.forEach(stat => {
      if (stat.trim()) {
        pdf.text(stat, x, currentY);
      }
      currentY += lineHeight;
    });

    distribution.forEach(segment => {
      const percentage = totalRecords > 0 ? ((segment.count / totalRecords) * 100).toFixed(1) : '0';

      const segmentDetails = [
        `${segment.timeRange}: ${segment.count} tests (${percentage}%)`,
        `  Average Score: ${segment.averageScore.toFixed(1)}%`,
        `  Average Time: ${segment.averageTime}`,
        `  Efficiency Rating: ${segment.efficiencyRating}`,
        ''
      ];

      segmentDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addTopBottomPerformersDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for top/bottom performers analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Filter users with minimum test requirement (e.g., 2 tests)
    const minTestsRequired = 2;
    const userGroups = {};

    rawData.forEach(record => {
      const userName = record.userName || 'Anonymous';
      if (!userGroups[userName]) {
        userGroups[userName] = {
          name: userName,
          scores: [],
          supervisor: record.supervisor || 'Unknown',
          market: record.market || 'Unknown'
        };
      }
      userGroups[userName].scores.push(record.score || 0);
    });

    const qualifiedUsers = Object.values(userGroups)
      .filter(user => user.scores.length >= minTestsRequired)
      .map(user => {
        const averageScore = user.scores.reduce((sum, score) => sum + score, 0) / user.scores.length;
        return {
          name: user.name,
          averageScore: averageScore,
          testsCompleted: user.scores.length,
          supervisor: user.supervisor,
          market: user.market
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    const topPerformers = qualifiedUsers.slice(0, 10);
    const bottomPerformers = qualifiedUsers.slice(-10).reverse();

    const totalQualified = qualifiedUsers.length;
    const topAverage = topPerformers.length > 0
      ? topPerformers.reduce((sum, user) => sum + user.averageScore, 0) / topPerformers.length
      : 0;
    const scoreRange = qualifiedUsers.length > 0
      ? `${qualifiedUsers[qualifiedUsers.length - 1].averageScore.toFixed(1)}% - ${qualifiedUsers[0].averageScore.toFixed(1)}%`
      : 'N/A';

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Top Performers: ${topPerformers.length}`,
      `Average Score: ${topAverage.toFixed(1)}%`,
      `Score Range: ${scoreRange}`,
      `Minimum Tests Required: ${minTestsRequired}`,
      `Total Qualified Users: ${totalQualified}`,
      '',
      'Top 10 Performer Details:',
      ''
    ];

    stats.forEach(stat => {
      if (stat.trim()) {
        pdf.text(stat, x, currentY);
      }
      currentY += lineHeight;
    });

    topPerformers.forEach((performer, index) => {
      const ranking = index + 1;

      const performerDetails = [
        `#${ranking}: ${performer.name}`,
        `  Average Score: ${performer.averageScore.toFixed(1)}%`,
        `  Tests Completed: ${performer.testsCompleted}`,
        `  Supervisor: ${performer.supervisor}`,
        `  Market: ${performer.market}`,
        ''
      ];

      performerDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    // Add bottom performers section
    if (bottomPerformers.length > 0) {
      currentY += sectionSpacing;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bottom 10 Performer Details:', x, currentY);
      currentY += lineHeight + 5;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      bottomPerformers.forEach((performer, index) => {
        const ranking = totalQualified - bottomPerformers.length + index + 1;

        const performerDetails = [
          `#${ranking}: ${performer.name}`,
          `  Average Score: ${performer.averageScore.toFixed(1)}%`,
          `  Tests Completed: ${performer.testsCompleted}`,
          `  Supervisor: ${performer.supervisor}`,
          `  Market: ${performer.market}`,
          ''
        ];

        performerDetails.forEach(detail => {
          if (detail.trim()) {
            pdf.text(detail, x, currentY);
          }
          currentY += lineHeight;
        });
      });
    }

    return currentY;
  }

  async _addCategoryPerformanceDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Overall Statistics Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Quiz Type Analysis:', x, currentY);
    currentY += lineHeight + 5;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for quiz type analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Group data by quiz type (category)
    const categoryGroups = {};
    rawData.forEach(record => {
      const category = record.quiz_type;
      if (!category) return;

      if (!categoryGroups[category]) {
        categoryGroups[category] = {
          name: category,
          scores: [],
          count: 0
        };
      }

      const score = parseFloat(record.score_value) || 0;
      categoryGroups[category].scores.push(score);
      categoryGroups[category].count++;
    });

    // Calculate category statistics
    const categories = Object.values(categoryGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
        : 0;

      return {
        name: group.name,
        averageScore: averageScore,
        totalTests: group.count,
        scores: group.scores
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const totalCategories = categories.length;
    const totalTests = categories.reduce((sum, cat) => sum + cat.totalTests, 0);
    const overallAvg = categories.length > 0
      ? categories.reduce((sum, cat) => sum + cat.averageScore, 0) / categories.length
      : 0;

    const topCategory = categories[0] || {};

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Quiz Types: ${totalCategories}`,
      `Total Tests: ${totalTests}`,
      `Overall Average: ${overallAvg.toFixed(1)}%`,
      `Top Quiz Type: ${topCategory.name || 'N/A'}`,
      `Top Score: ${(topCategory.averageScore || 0).toFixed(1)}%`
    ];

    stats.forEach(stat => {
      pdf.text(stat, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Individual Category Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Quiz Type Details:', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    categories.forEach((category, index) => {
      const ranking = index + 1;
      const vsAverage = (category.averageScore - overallAvg).toFixed(1);
      const vsAverageText = vsAverage >= 0 ? `+${vsAverage}%` : `${vsAverage}%`;
      const testsPercentage = totalTests > 0 ? ((category.totalTests / totalTests) * 100).toFixed(1) : '0';

      // Performance category
      let performance = 'Needs Improvement';
      if (category.averageScore >= 80) performance = 'Excellent';
      else if (category.averageScore >= 70) performance = 'Good';
      else if (category.averageScore >= 60) performance = 'Satisfactory';

      const categoryDetails = [
        `${category.name}`,
        `  Average Score: ${category.averageScore.toFixed(1)}%`,
        `  Total Tests: ${category.totalTests}`,
        `  Performance: ${performance}`,
        `  Ranking: #${ranking} of ${totalCategories}`,
        `  vs all quiz types: ${vsAverageText} vs average`,
        `  ${testsPercentage}% of all tests`,
        ''
      ];

      categoryDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addMarketPerformanceDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Overall Statistics Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Analysis:', x, currentY);
    currentY += lineHeight + 5;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for market analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Group data by market
    const marketGroups = {};
    rawData.forEach(record => {
      const market = record.market;
      if (!market) return;

      if (!marketGroups[market]) {
        marketGroups[market] = {
          name: market,
          scores: [],
          count: 0
        };
      }

      const score = parseFloat(record.score_value) || 0;
      marketGroups[market].scores.push(score);
      marketGroups[market].count++;
    });

    // Calculate market statistics
    const markets = Object.values(marketGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
        : 0;

      return {
        name: group.name,
        averageScore: averageScore,
        totalTests: group.count,
        scores: group.scores
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const totalMarkets = markets.length;
    const totalTests = markets.reduce((sum, market) => sum + market.totalTests, 0);
    const overallAvg = markets.length > 0
      ? markets.reduce((sum, market) => sum + market.averageScore, 0) / markets.length
      : 0;

    const topMarket = markets[0] || {};

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Markets: ${totalMarkets}`,
      `Total Tests: ${totalTests}`,
      `Overall Average: ${overallAvg.toFixed(1)}%`,
      `Top Market: ${topMarket.name || 'N/A'}`,
      `Top Score: ${(topMarket.averageScore || 0).toFixed(1)}%`
    ];

    stats.forEach(stat => {
      pdf.text(stat, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Individual Market Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Details:', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    markets.forEach((market, index) => {
      const ranking = index + 1;
      const vsAverage = (market.averageScore - overallAvg).toFixed(1);
      const vsAverageText = vsAverage >= 0 ? `+${vsAverage}%` : `${vsAverage}%`;
      const testsPercentage = totalTests > 0 ? ((market.totalTests / totalTests) * 100).toFixed(1) : '0';

      const marketDetails = [
        `${market.name}`,
        `  Average Score: ${market.averageScore.toFixed(1)}%`,
        `  Total Tests: ${market.totalTests}`,
        `  Ranking: #${ranking} of ${totalMarkets}`,
        `  vs all markets: ${vsAverageText} vs average`,
        `  ${testsPercentage}% of all tests`,
        ''
      ];

      marketDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addTopPerformersDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Overall Statistics Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Performers Analysis:', x, currentY);
    currentY += lineHeight + 5;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for performer analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Group data by user (LDAP) and calculate averages
    const userGroups = {};
    rawData.forEach(record => {
      const user = record.ldap;
      if (!user) return;

      if (!userGroups[user]) {
        userGroups[user] = {
          ldap: user,
          scores: [],
          count: 0,
          supervisor: record.supervisor,
          market: record.market
        };
      }

      const score = parseFloat(record.score_value) || 0;
      userGroups[user].scores.push(score);
      userGroups[user].count++;
    });

    // Calculate user statistics and get top performers (users with 2+ tests)
    const allUsers = Object.values(userGroups)
      .filter(group => group.count >= 2) // Only users with 2+ tests
      .map(group => {
        const averageScore = group.scores.length > 0
          ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
          : 0;

        return {
          ldap: group.ldap,
          averageScore: averageScore,
          testsCompleted: group.count,
          supervisor: group.supervisor,
          market: group.market,
          scores: group.scores
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    const topPerformers = allUsers.slice(0, 10); // Top 10 performers
    const totalPerformers = topPerformers.length;
    const avgScore = topPerformers.length > 0
      ? topPerformers.reduce((sum, perf) => sum + perf.averageScore, 0) / topPerformers.length
      : 0;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Total Top Performers: ${totalPerformers}`,
      `Average Score: ${avgScore.toFixed(1)}%`,
      `Score Range: ${topPerformers.length > 0 ? `${topPerformers[topPerformers.length - 1].averageScore.toFixed(1)}% - ${topPerformers[0].averageScore.toFixed(1)}%` : 'N/A'}`,
      `Minimum Tests Required: 2`,
      `Total Qualified Users: ${allUsers.length}`
    ];

    stats.forEach(stat => {
      pdf.text(stat, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Individual Performer Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top 10 Performer Details:', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    topPerformers.forEach((performer, index) => {
      const performerDetails = [
        `#${index + 1}: ${performer.ldap}`,
        `  Average Score: ${performer.averageScore.toFixed(1)}%`,
        `  Tests Completed: ${performer.testsCompleted}`,
        `  Supervisor: ${performer.supervisor || 'N/A'}`,
        `  Market: ${performer.market || 'N/A'}`,
        ''
      ];

      performerDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    return currentY;
  }

  async _addRecentActivityDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Overall Statistics Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Activity Summary:', x, currentY);
    currentY += lineHeight + 5;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for recent activity', x, currentY);
      return currentY + lineHeight;
    }

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = rawData
      .filter(record => {
        const testDate = new Date(record.date_of_test);
        return testDate >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.date_of_test) - new Date(a.date_of_test))
      .slice(0, 15); // Show last 15 activities

    const totalActivities = recentActivities.length;
    const totalAllTimeActivities = rawData.length;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Recent Activities (30 days): ${totalActivities}`,
      `Total All-Time Activities: ${totalAllTimeActivities}`,
      `Activity Rate: ${(totalActivities / 30).toFixed(1)} tests/day`,
      `Time Period: ${thirtyDaysAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`
    ];

    stats.forEach(stat => {
      pdf.text(stat, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Individual Activity Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Test Activity:', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    recentActivities.forEach((activity, index) => {
      const score = parseFloat(activity.score_value) || 0;
      const scorePercent = (score * 100).toFixed(1);
      const testDate = new Date(activity.date_of_test).toLocaleDateString();

      const activityDetails = [
        `${index + 1}. ${activity.ldap} - ${activity.quiz_type}`,
        `  Date: ${testDate}`,
        `  Score: ${scorePercent}%`,
        `  Supervisor: ${activity.supervisor || 'N/A'}`,
        `  Market: ${activity.market || 'N/A'}`,
        ''
      ];

      activityDetails.forEach(detail => {
        if (detail.trim()) {
          pdf.text(detail, x, currentY);
        }
        currentY += lineHeight;
      });
    });

    if (totalActivities === 0) {
      pdf.text('No recent activity in the last 30 days', x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  async _addGenericChartDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Generic Chart Information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Chart Information:', x, currentY);
    currentY += lineHeight + 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const info = [
      'This chart displays performance data',
      'from the selected time period and filters.',
      '',
      'Key metrics and detailed breakdowns',
      'are available in the interactive dashboard.'
    ];

    if (rawData && Array.isArray(rawData)) {
      info.push('', `Total Records: ${rawData.length}`);
    }

    info.forEach(line => {
      pdf.text(line, x, currentY);
      currentY += lineHeight;
    });

    return currentY;
  }

  _getChartType(tileElement) {
    // Try to determine chart type from various sources
    const titleElement = tileElement.querySelector('.chart-title, .tile-title, h3, h4');
    const title = titleElement ? titleElement.textContent.toLowerCase() : '';

    // Check for specific chart types based on title or class names
    if (title.includes('supervisor performance') || title.includes('supervisor-performance')) {
      return 'supervisor-performance';
    } else if (title.includes('supervisor effectiveness') || title.includes('supervisor-effectiveness')) {
      return 'supervisor-effectiveness';
    } else if (title.includes('score distribution') || title.includes('score-distribution')) {
      return 'score-distribution';
    } else if (title.includes('time distribution') || title.includes('time-distribution')) {
      return 'time-distribution';
    } else if (title.includes('top/bottom performers') || title.includes('top-bottom-performers')) {
      return 'top-bottom-performers';
    } else if (title.includes('trend') || title.includes('completion') || title.includes('score trend')) {
      return 'test-completion-trend';
    } else if (title.includes('quiz type') || title.includes('category') || title.includes('quiz-type-performance')) {
      return 'category-performance';
    } else if (title.includes('market') || title.includes('market-results')) {
      return 'market-performance';
    } else if (title.includes('pass/fail') || title.includes('pass-fail-rate')) {
      return 'pass-fail-rate';
    } else if (title.includes('time vs score') || title.includes('time-vs-score')) {
      return 'time-vs-score';
    } else if (title.includes('recent') || title.includes('activity')) {
      return 'recent-activity';
    }

    return 'generic';
  }

  async _addEnhancedChartToPDF(pdf, tileElement, x, y, width, height, context = {}) {
    // Get chart title
    const titleElement = tileElement.querySelector('h3, .tile-title, [class*="title"]');
    const chartTitle = titleElement ? titleElement.textContent.trim() : 'Chart';

    // Add chart title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(chartTitle, x, y - 5);

    // Find the chart content within the tile
    const chartContent = tileElement.querySelector('.chart-content') || tileElement;

    // Calculate chart image dimensions (charts dominate with full-page layout)
    const chartImageHeight = height * 0.8; // 80% for chart image (huge!)
    const statsHeight = height * 0.15; // 15% for statistics (readable but compact)

    // Add chart image
    await this._addChartImageToPDF(pdf, chartContent, x, y, width, chartImageHeight);

    // Extract and add chart statistics
    const statsY = y + chartImageHeight + 5;
    await this._addChartStatistics(pdf, tileElement, chartTitle, x, statsY, width, statsHeight, context);
  }

  async _addChartToPDF(pdf, tileElement, x, y, width, height) {
    // Find the chart content within the tile
    const chartContent = tileElement.querySelector('.chart-content') || tileElement;

    // Check if chart contains SVG
    const hasSVG = chartContent.querySelector('svg') !== null;

    // Calculate optimal dimensions for PDF (reduce scaling to minimize file size)
    const targetWidth = Math.min(chartContent.offsetWidth * 1.5, 800);
    const targetHeight = Math.min(chartContent.offsetHeight * 1.5, 600);

    let canvas;
    if (hasSVG) {
      console.log('📊 PDF: SVG chart detected, using dom-to-image');
      // Use dom-to-image for SVG charts with optimized scaling
      const dataUrl = await domtoimage.toPng(chartContent, {
        quality: 0.8, // Reduce quality slightly to decrease file size
        bgcolor: '#ffffff',
        width: targetWidth,
        height: targetHeight,
        style: {
          transform: `scale(${targetWidth / chartContent.offsetWidth})`,
          transformOrigin: 'top left'
        }
      });

      canvas = await this._dataUrlToCanvas(dataUrl);
    } else {
      // Use html2canvas for non-SVG content with optimized settings
      canvas = await html2canvas(chartContent, {
        ...EXPORT_CONFIG.png,
        width: targetWidth,
        height: targetHeight,
        scale: 1.5, // Moderate scaling for quality vs file size balance
        quality: 0.8
      });
    }

    // Compress the image before adding to PDF
    const compressedDataUrl = this._compressCanvas(canvas, 0.7); // 70% quality

    // Add to PDF with proper aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    let finalWidth = width;
    let finalHeight = height;

    // Maintain aspect ratio
    if (aspectRatio > width / height) {
      finalHeight = width / aspectRatio;
    } else {
      finalWidth = height * aspectRatio;
    }

    pdf.addImage(
      compressedDataUrl,
      'JPEG', // Use JPEG for better compression
      x,
      y,
      finalWidth,
      finalHeight
    );

    // Add chart title if available
    const titleElement = tileElement.querySelector('h3, .tile-title');
    if (titleElement) {
      pdf.setFontSize(10);
      pdf.text(titleElement.textContent, x, y - 2);
    }
  }

  async _addChartImageToPDF(pdf, chartContent, x, y, width, height) {
    // Check if chart contains SVG
    const hasSVG = chartContent.querySelector('svg') !== null;

    // Calculate optimal dimensions for PDF (much higher resolution)
    const targetWidth = Math.min(chartContent.offsetWidth * 3, 1200);
    const targetHeight = Math.min(chartContent.offsetHeight * 3, 1000);

    let canvas;
    if (hasSVG) {
      // Use dom-to-image for SVG charts
      const dataUrl = await domtoimage.toPng(chartContent, {
        quality: 0.8,
        bgcolor: '#ffffff',
        width: targetWidth,
        height: targetHeight,
        style: {
          transform: `scale(${targetWidth / chartContent.offsetWidth})`,
          transformOrigin: 'top left'
        }
      });

      canvas = await this._dataUrlToCanvas(dataUrl);
    } else {
      // Use html2canvas for non-SVG content
      canvas = await html2canvas(chartContent, {
        ...EXPORT_CONFIG.png,
        width: targetWidth,
        height: targetHeight,
        scale: 1.2,
        quality: 0.8
      });
    }

    // Compress the image
    const compressedDataUrl = this._compressCanvas(canvas, 0.7);

    // Add to PDF with proper aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    let finalWidth = width;
    let finalHeight = height;

    // Maintain aspect ratio
    if (aspectRatio > width / height) {
      finalHeight = width / aspectRatio;
    } else {
      finalWidth = height * aspectRatio;
    }

    pdf.addImage(
      compressedDataUrl,
      'JPEG',
      x,
      y,
      finalWidth,
      finalHeight
    );
  }

  async _addChartStatistics(pdf, tileElement, chartTitle, x, y, width, height, context = {}) {
    // Extract statistics based on chart type and context
    const stats = this._extractChartStatistics(tileElement, chartTitle, context);

    if (!stats || stats.length === 0) return;

    // Add statistics section header
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Statistics:', x, y);

    // Redesigned statistics layout - horizontal flow with proper spacing
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);

    const startY = y + 10;
    const lineHeight = 8;
    const colWidth = width / 4; // 4 columns for better distribution
    let currentX = x;
    let currentY = startY;
    let currentCol = 0;

    // Limit to most important stats to prevent overcrowding
    const displayStats = stats.slice(0, 8); // Show max 8 stats

    displayStats.forEach((stat, index) => {
      // Move to next row after 4 stats
      if (index > 0 && index % 4 === 0) {
        currentY += lineHeight;
        currentX = x;
        currentCol = 0;
      }

      // Calculate position
      const statX = x + (currentCol * colWidth);

      // Add stat with proper formatting
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${stat.label}:`, statX, currentY);

      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.value, statX, currentY + 4);

      currentCol++;
    });
  }

  _extractChartStatistics(tileElement, chartTitle, context = {}) {
    const { rawData, dashboardContext } = context;
    const stats = [];

    // Calculate basic statistics from raw data if available
    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      const totalRecords = rawData.length;
      const scores = rawData.map(r => parseFloat(r.score_value) || 0).filter(s => s > 0);
      const times = rawData.map(r => parseInt(r.time_taken) || 0).filter(t => t > 0);

      if (scores.length > 0) {
        const avgScore = (scores.reduce((sum, s) => sum + s, 0) / scores.length * 100).toFixed(1);
        const maxScore = (Math.max(...scores) * 100).toFixed(1);
        const minScore = (Math.min(...scores) * 100).toFixed(1);
        const passRate = ((scores.filter(s => s >= 0.7).length / scores.length) * 100).toFixed(1);

        if (chartTitle.toLowerCase().includes('pass') && chartTitle.toLowerCase().includes('fail')) {
          // Pass/Fail Rate specific statistics (simplified)
          const passCount = scores.filter(s => s >= 0.7).length;
          const failCount = scores.filter(s => s < 0.7).length;
          const total = passCount + failCount;
          const passPercentage = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
          const failPercentage = total > 0 ? ((failCount / total) * 100).toFixed(1) : 0;

          stats.push(
            { label: 'Pass Rate', value: `${passPercentage}%` },
            { label: 'Fail Rate', value: `${failPercentage}%` },
            { label: 'Pass Count', value: `${passCount}` },
            { label: 'Fail Count', value: `${failCount}` },
            { label: 'Total Tests', value: `${total}` },
            { label: 'Threshold', value: `70%` }
          );
        } else if (chartTitle.toLowerCase().includes('supervisor')) {
          // Supervisor Performance specific statistics (simplified)
          const supervisors = [...new Set(rawData.map(r => r.supervisor).filter(Boolean))];
          const supervisorStats = supervisors.map(supervisor => {
            const supervisorData = rawData.filter(r => r.supervisor === supervisor);
            const supervisorScores = supervisorData.map(r => parseFloat(r.score_value) || 0).filter(s => s > 0);
            const avgScore = supervisorScores.length > 0 ?
              (supervisorScores.reduce((sum, s) => sum + s, 0) / supervisorScores.length * 100).toFixed(1) : 0;
            const testsSupervised = supervisorData.length;

            return {
              name: supervisor,
              avgScore: parseFloat(avgScore),
              testsSupervised
            };
          }).sort((a, b) => b.avgScore - a.avgScore);

          const topSupervisor = supervisorStats[0];
          const totalTests = supervisorStats.reduce((sum, s) => sum + s.testsSupervised, 0);

          stats.push(
            { label: 'Total Supervisors', value: supervisors.length.toString() },
            { label: 'Top Performer', value: topSupervisor ? topSupervisor.name : 'N/A' },
            { label: 'Top Score', value: topSupervisor ? `${topSupervisor.avgScore}%` : 'N/A' },
            { label: 'Overall Avg', value: `${avgScore}%` },
            { label: 'Total Tests', value: totalTests.toString() },
            { label: 'Pass Rate', value: `${passRate}%` }
          );
        } else if (chartTitle.toLowerCase().includes('score')) {
          stats.push(
            { label: 'Average Score', value: `${avgScore}%` },
            { label: 'Total Tests', value: totalRecords.toString() },
            { label: 'Pass Rate', value: `${passRate}%` },
            { label: 'Score Range', value: `${minScore}% - ${maxScore}%` }
          );
        } else if (chartTitle.toLowerCase().includes('time')) {
          if (times.length > 0) {
            const avgTime = Math.round(times.reduce((sum, t) => sum + t, 0) / times.length / 60);
            const maxTime = Math.round(Math.max(...times) / 60);
            const minTime = Math.round(Math.min(...times) / 60);
            const efficiency = (avgScore / avgTime).toFixed(1);

            stats.push(
              { label: 'Avg Time', value: `${avgTime} min` },
              { label: 'Fastest Time', value: `${minTime} min` },
              { label: 'Slowest Time', value: `${maxTime} min` },
              { label: 'Efficiency', value: `${efficiency} pts/min` }
            );
          }
        } else if (chartTitle.toLowerCase().includes('market')) {
          const markets = [...new Set(rawData.map(r => r.market).filter(Boolean))];
          const topMarket = markets.length > 0 ? markets[0] : 'N/A';

          stats.push(
            { label: 'Total Markets', value: markets.length.toString() },
            { label: 'Average Score', value: `${avgScore}%` },
            { label: 'Top Market', value: topMarket },
            { label: 'Total Tests', value: totalRecords.toString() }
          );
        } else if (chartTitle.toLowerCase().includes('quiz')) {
          const quizTypes = [...new Set(rawData.map(r => r.quiz_type).filter(Boolean))];

          stats.push(
            { label: 'Quiz Types', value: quizTypes.length.toString() },
            { label: 'Average Score', value: `${avgScore}%` },
            { label: 'Total Tests', value: totalRecords.toString() },
            { label: 'Pass Rate', value: `${passRate}%` }
          );
        } else {
          // Generic statistics
          const dateRange = this._getDateRange(rawData);
          stats.push(
            { label: 'Total Records', value: totalRecords.toString() },
            { label: 'Date Range', value: dateRange },
            { label: 'Average Score', value: `${avgScore}%` },
            { label: 'Pass Rate', value: `${passRate}%` }
          );
        }
      }
    }

    // Fallback to generic stats if no data available
    if (stats.length === 0) {
      stats.push(
        { label: 'Data Status', value: 'No data available' },
        { label: 'Chart Type', value: chartTitle },
        { label: 'Export Time', value: new Date().toLocaleTimeString() },
        { label: 'Status', value: 'Generated' }
      );
    }

    return stats;
  }

  _getDateRange(data) {
    if (!data || data.length === 0) return 'No data';

    const dates = data.map(r => r.date_of_test).filter(Boolean).map(d => new Date(d));
    if (dates.length === 0) return 'No dates';

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    if (minDate.toDateString() === maxDate.toDateString()) {
      return minDate.toLocaleDateString();
    }

    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  }

  // Helper method to get chart title
  _getChartTitle(tileElement) {
    // Try to find title in various locations
    const titleSelectors = [
      '.chart-title',
      '.tile-title',
      'h3',
      'h4',
      '.title',
      '[data-title]'
    ];

    for (const selector of titleSelectors) {
      const titleElement = tileElement.querySelector(selector);
      if (titleElement) {
        return titleElement.textContent?.trim() || titleElement.getAttribute('data-title') || 'Chart';
      }
    }

    // Fallback: try to determine from chart type
    if (tileElement.querySelector('canvas')) {
      return 'Chart';
    }

    return 'Dashboard Chart';
  }

  // Helper method to compress canvas
  _compressCanvas(canvas, quality = 0.7) {
    return canvas.toDataURL('image/jpeg', quality);
  }

  _addPDFFooter(pdf) {
    const pageCount = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.getWidth() - 30,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
  }

  // Public status methods
  getExportStatus() {
    return {
      isExporting: this.isExporting,
      supportedFormats: ['PNG', 'PDF'],
      maxResolution: '2x'
    };
  }
}

// Create singleton instance
const exportService = new ExportService();

export default exportService;
