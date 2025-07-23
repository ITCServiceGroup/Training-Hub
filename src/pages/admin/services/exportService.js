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

      // Debug logging
      console.log('PDF Export - rawData:', rawData ? `${rawData.length} records` : 'undefined');
      console.log('PDF Export - dashboardContext:', dashboardContext);

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
        pdf.text(chartTitle, margin, margin);

        // Calculate layout for 2-column design: chart left, detailed info right
        const chartWidth = contentWidth * 0.50; // 60% for chart (increased from 55%)
        const infoWidth = contentWidth * 0.50; // 37% for detailed info
        const columnGap = contentWidth * 0.05; // 3% gap between columns (reduced from 5%)
        const chartHeight = contentHeight - 50; // Reduced height to leave space for overall statistics

        try {
          await this._addTwoColumnChartToPDF(pdf, tile, margin, margin + 12, chartWidth, infoWidth, chartHeight, {
            dashboardContext,
            rawData
          });
        } catch (error) {
          console.warn(`Failed to export chart ${i + 1}:`, error);
          // Add error placeholder
          pdf.setFontSize(12);
          pdf.text(`Export failed - ${error.message}`, margin, margin + 25);
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
    const chartType = this._getChartType(tileElement);
    const columnGap = 15; // Gap between chart and info columns
    const infoX = x + chartWidth + columnGap;

    // Special layout for Top/Bottom Performers
    if (chartType === 'top-bottom-performers') {
      await this._addTopBottomPerformersSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Supervisor Performance
    if (chartType === 'supervisor-performance') {
      await this._addSupervisorPerformanceSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Supervisor Effectiveness
    if (chartType === 'supervisor-effectiveness') {
      await this._addSupervisorEffectivenessSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Score Distribution
    if (chartType === 'score-distribution') {
      await this._addScoreDistributionSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Time Distribution
    if (chartType === 'time-distribution') {
      await this._addTimeDistributionSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Test Completion Trend
    if (chartType === 'test-completion-trend') {
      await this._addTestCompletionTrendSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Category Performance
    if (chartType === 'category-performance') {
      await this._addCategoryPerformanceSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Market Performance
    if (chartType === 'market-performance') {
      await this._addMarketPerformanceSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Top Performers
    if (chartType === 'top-performers') {
      await this._addTopPerformersSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Recent Activity
    if (chartType === 'recent-activity') {
      await this._addRecentActivitySpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Pass/Fail Rate
    if (chartType === 'pass-fail-rate') {
      await this._addPassFailRateSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Time vs Score
    if (chartType === 'time-vs-score') {
      await this._addTimeVsScoreSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Question Analytics
    if (chartType === 'question-analytics') {
      await this._addQuestionAnalyticsSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Special layout for Retake Analysis
    if (chartType === 'retake-analysis') {
      await this._addRetakeAnalysisSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context);
      return;
    }

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, height * 0.9);

    // Add detailed information in right column
    await this._addDetailedChartInfo(pdf, tileElement, chartTitle, infoX, y, infoWidth, height, context);
  }

  async _addDetailedChartInfo(pdf, tileElement, chartTitle, x, y, width, height, context = {}) {
    const { dashboardContext, rawData } = context;
    let currentY = y;
    const lineHeight = 5;
    const sectionSpacing = 4;

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
      // Top/Bottom Performers uses a special layout - handled in chart positioning
      return currentY;
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
    } else if (chartType === 'pass-fail-rate') {
      currentY = await this._addPassFailRateDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    } else {
      // Generic chart info
      currentY = await this._addGenericChartDetails(pdf, x, currentY, width, rawData, lineHeight, sectionSpacing);
    }
  }

  async _addSupervisorPerformanceHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Enhanced anonymization function (matches chart component)
    const anonymizeName = (ldap) => {
      let hash = 0;
      for (let i = 0; i < ldap.length; i++) {
        const char = ldap.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      hash = Math.abs(hash);
      const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Sigma', 'Omega', 'Zeta', 'Kappa', 'Lambda'];
      const suffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
      const prefixIndex = hash % prefixes.length;
      const suffixIndex = Math.floor(hash / 100) % suffixes.length;
      return `${prefixes[prefixIndex]}-${suffixes[suffixIndex]}`;
    };

    // Detect anonymization state from the chart component
    const shouldAnonymize = this._detectAnonymizationState(tileElement);

    // Calculate basic statistics
    const minTestsRequired = 1;
    const userGroups = {};

    rawData.forEach(record => {
      const supervisor = record.supervisor;
      if (!supervisor) return;

      if (!userGroups[supervisor]) {
        userGroups[supervisor] = {
          name: supervisor,
          scores: [],
          count: 0
        };
      }

      const score = parseFloat(record.score_value) || 0;
      userGroups[supervisor].scores.push(score);
      userGroups[supervisor].count++;
    });

    // Calculate supervisor statistics
    const supervisors = Object.values(userGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
        : 0;

      return {
        name: group.name,
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
    const padding = 4; // Consistent with other sections

    // Overall Statistics under the graph (single column with title)
    const statsWidth = width;
    const statsLineHeight = 6;
    const headerHeight = 12; // Space for "Overall Statistics:" title
    const statsContentHeight = 5 * statsLineHeight; // 5 stat lines
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    // Draw border for stats section
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, statsWidth, statsHeight);

    let currentStatsY = y + padding;
    
    // Add "Overall Statistics:" title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Statistics:', x + 4, currentStatsY);
    currentStatsY += tightLineHeight + 3;

    // Add underline for section header
    pdf.line(x + 4, currentStatsY - 2, x + statsWidth - 4, currentStatsY - 2);

    // Add padding below the dividing line
    currentStatsY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    // Single column stats with bold labels and normal values
    const stats = [
      { label: 'Total Supervisors:', value: `${totalSupervisors}` },
      { label: 'Total Tests:', value: `${totalTests}` },
      { label: 'Overall Average:', value: `${overallAvg.toFixed(1)}%` },
      { label: 'Top Performer:', value: shouldAnonymize ? anonymizeName(topPerformer.name || 'N/A') : (topPerformer.name || 'N/A') },
      { label: 'Top Score:', value: `${(topPerformer.averageScore || 0).toFixed(1)}%` }
    ];

    stats.forEach(stat => {
      // Bold label
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentStatsY);
      
      // Normal value
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentStatsY);
      
      currentStatsY += statsLineHeight;
    });
  }

  async _addSupervisorPerformanceDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Enhanced anonymization function (matches chart component)
    const anonymizeName = (ldap) => {
      let hash = 0;
      for (let i = 0; i < ldap.length; i++) {
        const char = ldap.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      hash = Math.abs(hash);
      const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Sigma', 'Omega', 'Zeta', 'Kappa', 'Lambda'];
      const suffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
      const prefixIndex = hash % prefixes.length;
      const suffixIndex = Math.floor(hash / 100) % suffixes.length;
      return `${prefixes[prefixIndex]}-${suffixes[suffixIndex]}`;
    };

    // Detect anonymization state from the chart component
    const shouldAnonymize = this._detectAnonymizationState(tileElement);

    // Calculate basic statistics (same as horizontal stats)
    const userGroups = {};
    rawData.forEach(record => {
      const supervisor = record.supervisor;
      if (!supervisor) return;

      if (!userGroups[supervisor]) {
        userGroups[supervisor] = {
          name: supervisor,
          scores: [],
          count: 0
        };
      }

      const score = parseFloat(record.score_value) || 0;
      userGroups[supervisor].scores.push(score);
      userGroups[supervisor].count++;
    });

    const supervisors = Object.values(userGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? (group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length) * 100
        : 0;

      return {
        name: group.name,
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

    const tightLineHeight = 5;
    const padding = 4;

    // Supervisor Details in single-box two-column layout
    const maxSupervisorsToShow = Math.min(supervisors.length, 10);
    const supervisorsPerColumn = Math.ceil(maxSupervisorsToShow / 2);
    const supervisorHeight = (tightLineHeight + 1) + (5 * tightLineHeight) + 2; // Name line + 5 info lines + gap
    const detailsContentHeight = (supervisorsPerColumn * supervisorHeight) + 15; // Header space
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    // Single border around the entire supervisor details section
    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    // Section header
    let currentY = y + padding;

    // Section header for supervisor details
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Supervisor Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    // Add underline for section header
    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    // Two-column layout for supervisors (up to 10)
    const colWidth = (width - 20) / 2; // Two equal columns with margins
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4; // Small gap between columns

    const supervisorsToShow = supervisors.slice(0, maxSupervisorsToShow);
    let leftColY = currentY;
    let rightColY = currentY;

    supervisorsToShow.forEach((supervisor, index) => {
      const ranking = index + 1;
      const vsAverage = (supervisor.averageScore - overallAvg).toFixed(1);
      const vsAverageText = vsAverage >= 0 ? `+${vsAverage}%` : `${vsAverage}%`;
      const testsPercentage = totalTests > 0 ? ((supervisor.testsSupervised / totalTests) * 100).toFixed(1) : '0';

      // Performance category
      let performance = 'Needs Improvement';
      if (supervisor.averageScore >= 80) performance = 'Excellent';
      else if (supervisor.averageScore >= 70) performance = 'Good';
      else if (supervisor.averageScore >= 60) performance = 'Satisfactory';

      // Determine which column to use (alternating: 1,3,5,7,9 in left; 2,4,6,8,10 in right)
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      // Bold name and ranking with color coding
      pdf.setFont('helvetica', 'bold');
      if (ranking <= 2) {
        pdf.setTextColor(0, 120, 0); // Dark green for top 2
      } else {
        pdf.setTextColor(0, 0, 0); // Black for others
      }
      const displayName = shouldAnonymize ? anonymizeName(supervisor.name) : supervisor.name;
      pdf.text(`#${ranking}: ${displayName}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      // Regular font for details
      pdf.setTextColor(0, 0, 0); // Reset to black
      pdf.setFont('helvetica', 'normal');
      
      const supervisorInfo = [
        `  Average: ${supervisor.averageScore.toFixed(1)}%`,
        `  Tests: ${supervisor.testsSupervised}`,
        `  Performance: ${performance}`,
        `  vs Average: ${vsAverageText}`,
        `  Coverage: ${testsPercentage}%`
      ];

      supervisorInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      // Small gap between supervisors
      colY += 2;

      // Update column Y positions
      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addSupervisorEffectivenessSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addSupervisorEffectivenessHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addSupervisorEffectivenessDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addScoreDistributionSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData, dashboardContext } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Debug logging
    console.log('Score Distribution Export - rawData:', rawData ? `${rawData.length} records` : 'undefined');
    console.log('Score Distribution Export - dashboardContext:', dashboardContext);

    // Ensure we have data to work with
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      console.warn('No rawData available for Score Distribution export');
      // Add chart in left column only
      await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

      // Add error message in stats area
      pdf.setFontSize(10);
      pdf.setTextColor(255, 0, 0);
      pdf.text('Export failed - rawData is not defined', x, y + chartHeight + 20);
      return;
    }

    // Apply the same filtering logic as the chart component
    const filteredData = this._applyChartFiltering(rawData, 'score-distribution', dashboardContext);
    console.log('Score Distribution - filteredData:', filteredData ? `${filteredData.length} records` : 'undefined');

    // Process the filtered data using the same logic as ScoreDistributionChart
    const chartData = this._processScoreDistributionData(filteredData);
    console.log('Score Distribution - chartData:', chartData);

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart using processed chart data
    const statsY = y + chartHeight + 6;
    await this._addScoreDistributionHorizontalStats(pdf, x, statsY, chartWidth, chartData, tileElement);

    // Add details in right column using processed chart data
    await this._addScoreDistributionDetailsList(pdf, rightColumnX, y, infoWidth, height, chartData, tileElement);
  }

  async _addTimeDistributionSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addTimeDistributionHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addTimeDistributionDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addTestCompletionTrendSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addTestCompletionTrendHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addTestCompletionTrendDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addCategoryPerformanceSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addCategoryPerformanceHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addCategoryPerformanceDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addMarketPerformanceSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addMarketPerformanceHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addMarketPerformanceDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addTopPerformersSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addTopPerformersHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addTopPerformersDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addRecentActivitySpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addRecentActivityHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addRecentActivityDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addPassFailRateSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addPassFailRateHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addPassFailRateDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addTimeVsScoreSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addTimeVsScoreHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addTimeVsScoreDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addQuestionAnalyticsSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addQuestionAnalyticsHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addQuestionAnalyticsDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addRetakeAnalysisSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85;
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addRetakeAnalysisHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add details in right column
    await this._addRetakeAnalysisDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addTimeVsScoreHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate time vs score correlation statistics
    const validRecords = rawData.filter(record => 
      record.score_value != null && record.time_taken != null
    );

    if (validRecords.length === 0) return;

    const scores = validRecords.map(r => parseFloat(r.score_value) || 0);
    const times = validRecords.map(r => parseFloat(r.time_taken) || 0);
    
    // Calculate correlation coefficient
    const n = validRecords.length;
    const sumX = times.reduce((a, b) => a + b, 0);
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = times.map((x, i) => x * scores[i]).reduce((a, b) => a + b, 0);
    const sumX2 = times.map(x => x * x).reduce((a, b) => a + b, 0);
    const sumY2 = scores.map(y => y * y).reduce((a, b) => a + b, 0);
    
    const correlation = n > 1 ? 
      (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)) : 0;

    const avgTime = sumX / n;
    const avgScore = (sumY / n) * 100;
    const fastTests = validRecords.filter(r => parseFloat(r.time_taken) < avgTime).length;
    const slowTests = n - fastTests;
    const efficiencyScore = validRecords.filter(r => 
      parseFloat(r.time_taken) <= avgTime && parseFloat(r.score_value) >= 0.8
    ).length;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time vs Score Analysis:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Correlation Coefficient:', value: `${(correlation || 0).toFixed(3)}` },
      { label: 'Average Time:', value: `${avgTime.toFixed(1)} min` },
      { label: 'Average Score:', value: `${avgScore.toFixed(1)}%` },
      { label: 'Efficient Tests:', value: `${efficiencyScore}/${n} (${((efficiencyScore/n)*100).toFixed(1)}%)` },
      { label: 'Time Distribution:', value: `${fastTests} fast, ${slowTests} slow` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addTimeVsScoreDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    const validRecords = rawData.filter(record => 
      record.score_value != null && record.time_taken != null
    ).slice(0, 10);

    if (validRecords.length === 0) return;

    // Sort by efficiency (high score, low time)
    const detailRecords = validRecords.map(record => {
      const score = parseFloat(record.score_value) * 100;
      const time = parseFloat(record.time_taken);
      const efficiency = time > 0 ? score / time : 0;
      return {
        user: record.user_name || record.user_id || 'Unknown',
        score: score,
        time: time,
        efficiency: efficiency,
        test: record.test_name || 'Test'
      };
    }).sort((a, b) => b.efficiency - a.efficiency);

    const tightLineHeight = 5;
    const padding = 4;
    const maxRecordsToShow = Math.min(detailRecords.length, 10);
    const recordsPerColumn = Math.ceil(maxRecordsToShow / 2);
    const recordHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (recordsPerColumn * recordHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time vs Score Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    detailRecords.forEach((record, index) => {
      const ranking = index + 1;
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (record.efficiency >= 5) {
        pdf.setTextColor(0, 120, 0);
      } else if (record.efficiency >= 3) {
        pdf.setTextColor(255, 140, 0);
      } else {
        pdf.setTextColor(180, 0, 0);
      }
      pdf.text(`#${ranking}: ${record.user}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const recordInfo = [
        `  Score: ${record.score.toFixed(1)}%`,
        `  Time: ${record.time.toFixed(1)} min`,
        `  Efficiency: ${record.efficiency.toFixed(2)}`,
        `  Test: ${record.test.substring(0, 20)}${record.test.length > 20 ? '...' : ''}`
      ];

      recordInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addQuestionAnalyticsHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate question analytics statistics
    const questionGroups = {};
    rawData.forEach(record => {
      const questionId = record.question_id || record.question || 'Unknown';
      if (!questionGroups[questionId]) {
        questionGroups[questionId] = {
          id: questionId,
          attempts: 0,
          correct: 0,
          totalTime: 0,
          responses: []
        };
      }
      questionGroups[questionId].attempts++;
      if (record.is_correct || (parseFloat(record.score_value) || 0) >= 0.8) {
        questionGroups[questionId].correct++;
      }
      questionGroups[questionId].totalTime += parseFloat(record.time_taken) || 0;
      questionGroups[questionId].responses.push(record);
    });

    const questions = Object.values(questionGroups).map(group => ({
      id: group.id,
      difficulty: group.attempts > 0 ? ((group.attempts - group.correct) / group.attempts) * 100 : 0,
      successRate: group.attempts > 0 ? (group.correct / group.attempts) * 100 : 0,
      avgTime: group.attempts > 0 ? group.totalTime / group.attempts : 0,
      attempts: group.attempts
    }));

    const totalQuestions = questions.length;
    const totalAttempts = questions.reduce((sum, q) => sum + q.attempts, 0);
    const overallSuccessRate = questions.length > 0 
      ? questions.reduce((sum, q) => sum + q.successRate, 0) / questions.length 
      : 0;
    const hardestQuestion = questions.sort((a, b) => a.successRate - b.successRate)[0];
    const easiestQuestion = questions.sort((a, b) => b.successRate - a.successRate)[0];

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Question Analytics Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Questions:', value: `${totalQuestions}` },
      { label: 'Total Attempts:', value: `${totalAttempts}` },
      { label: 'Overall Success Rate:', value: `${overallSuccessRate.toFixed(1)}%` },
      { label: 'Hardest Question:', value: `${hardestQuestion?.id || 'N/A'} (${(hardestQuestion?.successRate || 0).toFixed(1)}%)` },
      { label: 'Easiest Question:', value: `${easiestQuestion?.id || 'N/A'} (${(easiestQuestion?.successRate || 0).toFixed(1)}%)` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addQuestionAnalyticsDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    const questionGroups = {};
    rawData.forEach(record => {
      const questionId = record.question_id || record.question || 'Unknown';
      if (!questionGroups[questionId]) {
        questionGroups[questionId] = {
          id: questionId,
          attempts: 0,
          correct: 0,
          totalTime: 0,
          text: record.question_text || questionId
        };
      }
      questionGroups[questionId].attempts++;
      if (record.is_correct || (parseFloat(record.score_value) || 0) >= 0.8) {
        questionGroups[questionId].correct++;
      }
      questionGroups[questionId].totalTime += parseFloat(record.time_taken) || 0;
    });

    const questions = Object.values(questionGroups).slice(0, 10).map(group => ({
      id: group.id,
      text: group.text,
      successRate: group.attempts > 0 ? (group.correct / group.attempts) * 100 : 0,
      avgTime: group.attempts > 0 ? group.totalTime / group.attempts : 0,
      attempts: group.attempts,
      difficulty: group.attempts > 0 ? ((group.attempts - group.correct) / group.attempts) * 100 : 0
    })).sort((a, b) => a.successRate - b.successRate);

    const tightLineHeight = 5;
    const padding = 4;
    const maxQuestionsToShow = Math.min(questions.length, 10);
    const questionsPerColumn = Math.ceil(maxQuestionsToShow / 2);
    const questionHeight = (tightLineHeight + 1) + (5 * tightLineHeight) + 2;
    const detailsContentHeight = (questionsPerColumn * questionHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Question Analytics Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    questions.forEach((question, index) => {
      const ranking = index + 1;
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (question.successRate <= 50) {
        pdf.setTextColor(180, 0, 0);
      } else if (question.successRate <= 75) {
        pdf.setTextColor(255, 140, 0);
      } else {
        pdf.setTextColor(0, 120, 0);
      }
      pdf.text(`Q${ranking}: ${question.id}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const questionInfo = [
        `  Success Rate: ${question.successRate.toFixed(1)}%`,
        `  Avg Time: ${question.avgTime.toFixed(1)} min`,
        `  Attempts: ${question.attempts}`,
        `  Difficulty: ${question.difficulty < 25 ? 'Easy' : question.difficulty < 50 ? 'Medium' : 'Hard'}`,
        `  Text: ${question.text.substring(0, 25)}${question.text.length > 25 ? '...' : ''}`
      ];

      questionInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addRetakeAnalysisHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate retake analysis statistics
    const userAttempts = {};
    rawData.forEach(record => {
      const userId = record.user_id || record.user_name || 'Unknown';
      const testId = record.test_id || record.test_name || 'Unknown';
      const key = `${userId}_${testId}`;
      
      if (!userAttempts[key]) {
        userAttempts[key] = {
          user: userId,
          test: testId,
          attempts: [],
          scores: [],
          times: []
        };
      }
      
      const attemptNum = parseInt(record.attempt_number) || userAttempts[key].attempts.length + 1;
      const score = parseFloat(record.score_value) || 0;
      const time = parseFloat(record.time_taken) || 0;
      
      userAttempts[key].attempts.push(attemptNum);
      userAttempts[key].scores.push(score);
      userAttempts[key].times.push(time);
    });

    const retakeData = Object.values(userAttempts).filter(data => data.attempts.length > 1);
    const totalRetakes = retakeData.length;
    const totalUsers = Object.keys(userAttempts).length;
    const retakeRate = totalUsers > 0 ? (totalRetakes / totalUsers) * 100 : 0;
    
    let improvedScores = 0;
    let avgImprovement = 0;
    let successfulRetakes = 0;

    retakeData.forEach(data => {
      const firstScore = data.scores[0] * 100;
      const lastScore = data.scores[data.scores.length - 1] * 100;
      const improvement = lastScore - firstScore;
      
      if (improvement > 0) {
        improvedScores++;
        avgImprovement += improvement;
      }
      
      if (lastScore >= 80) {
        successfulRetakes++;
      }
    });

    avgImprovement = improvedScores > 0 ? avgImprovement / improvedScores : 0;
    const improvementRate = totalRetakes > 0 ? (improvedScores / totalRetakes) * 100 : 0;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Retake Analysis Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Retake Rate:', value: `${retakeRate.toFixed(1)}% (${totalRetakes}/${totalUsers})` },
      { label: 'Improvement Rate:', value: `${improvementRate.toFixed(1)}% (${improvedScores}/${totalRetakes})` },
      { label: 'Average Improvement:', value: `${avgImprovement.toFixed(1)}%` },
      { label: 'Successful Retakes:', value: `${successfulRetakes}/${totalRetakes} (${totalRetakes > 0 ? ((successfulRetakes/totalRetakes)*100).toFixed(1) : 0}%)` },
      { label: 'Total Retake Instances:', value: `${totalRetakes}` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addRetakeAnalysisDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    const userAttempts = {};
    rawData.forEach(record => {
      const userId = record.user_id || record.user_name || 'Unknown';
      const testId = record.test_id || record.test_name || 'Unknown';
      const key = `${userId}_${testId}`;
      
      if (!userAttempts[key]) {
        userAttempts[key] = {
          user: userId,
          test: testId,
          attempts: [],
          scores: [],
          times: []
        };
      }
      
      const attemptNum = parseInt(record.attempt_number) || userAttempts[key].attempts.length + 1;
      const score = parseFloat(record.score_value) || 0;
      const time = parseFloat(record.time_taken) || 0;
      
      userAttempts[key].attempts.push(attemptNum);
      userAttempts[key].scores.push(score);
      userAttempts[key].times.push(time);
    });

    const retakeDetails = Object.values(userAttempts)
      .filter(data => data.attempts.length > 1)
      .slice(0, 10)
      .map(data => {
        const firstScore = data.scores[0] * 100;
        const lastScore = data.scores[data.scores.length - 1] * 100;
        const improvement = lastScore - firstScore;
        const maxAttempts = Math.max(...data.attempts);
        
        return {
          user: data.user,
          test: data.test,
          attempts: maxAttempts,
          firstScore: firstScore,
          lastScore: lastScore,
          improvement: improvement,
          successful: lastScore >= 80
        };
      })
      .sort((a, b) => b.improvement - a.improvement);

    const tightLineHeight = 5;
    const padding = 4;
    const maxRetakesToShow = Math.min(retakeDetails.length, 10);
    const retakesPerColumn = Math.ceil(maxRetakesToShow / 2);
    const retakeHeight = (tightLineHeight + 1) + (5 * tightLineHeight) + 2;
    const detailsContentHeight = (retakesPerColumn * retakeHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Retake Analysis Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    retakeDetails.forEach((retake, index) => {
      const ranking = index + 1;
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (retake.improvement > 20) {
        pdf.setTextColor(0, 120, 0);
      } else if (retake.improvement > 0) {
        pdf.setTextColor(255, 140, 0);
      } else {
        pdf.setTextColor(180, 0, 0);
      }
      pdf.text(`#${ranking}: ${retake.user}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const retakeInfo = [
        `  First: ${retake.firstScore.toFixed(1)}%`,
        `  Last: ${retake.lastScore.toFixed(1)}%`,
        `  Improvement: ${retake.improvement >= 0 ? '+' : ''}${retake.improvement.toFixed(1)}%`,
        `  Attempts: ${retake.attempts}`,
        `  Status: ${retake.successful ? 'Passed' : 'Failed'}`
      ];

      retakeInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addSupervisorPerformanceDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Supervisor Performance uses _addSupervisorPerformanceSpecialLayout instead
    return y;
  }

  async _addSupervisorEffectivenessHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate effectiveness statistics
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
      supervisorGroups[supervisor].scores.push(parseFloat(record.score_value) || 0);
      supervisorGroups[supervisor].count++;
      supervisorGroups[supervisor].totalTime += parseFloat(record.time_taken) || 0;
      if ((parseFloat(record.score_value) || 0) >= 0.7) supervisorGroups[supervisor].passCount++;
    });

    const supervisors = Object.values(supervisorGroups).map(group => {
      const averageScore = group.scores.length > 0
        ? group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length
        : 0;
      const passRate = group.count > 0 ? (group.passCount / group.count) * 100 : 0;
      const avgTime = group.count > 0 ? group.totalTime / group.count : 0;
      return {
        name: group.name,
        averageScore: averageScore * 100,
        passRate: passRate,
        averageTime: avgTime,
        testsSupervised: group.count
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const totalSupervisors = supervisors.length;
    const totalTests = supervisors.reduce((sum, sup) => sum + sup.testsSupervised, 0);
    const overallAvg = supervisors.length > 0
      ? supervisors.reduce((sum, sup) => sum + sup.averageScore, 0) / supervisors.length
      : 0;
    const topPerformer = supervisors[0] || {};

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Supervisor Effectiveness Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Supervisors:', value: `${totalSupervisors}` },
      { label: 'Total Tests:', value: `${totalTests}` },
      { label: 'Overall Average:', value: `${overallAvg.toFixed(1)}%` },
      { label: 'Top Performer:', value: topPerformer.name || 'N/A' },
      { label: 'Top Score:', value: `${(topPerformer.averageScore || 0).toFixed(1)}%` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addSupervisorEffectivenessDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
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
      supervisorGroups[supervisor].scores.push(parseFloat(record.score_value) || 0);
      supervisorGroups[supervisor].count++;
      supervisorGroups[supervisor].totalTime += parseFloat(record.time_taken) || 0;
      if ((parseFloat(record.score_value) || 0) >= 0.7) supervisorGroups[supervisor].passCount++;
    });

    const supervisors = Object.values(supervisorGroups).slice(0, 10).map(group => {
      const averageScore = group.scores.length > 0
        ? group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length
        : 0;
      const passRate = group.count > 0 ? (group.passCount / group.count) * 100 : 0;
      const avgTime = group.count > 0 ? group.totalTime / group.count : 0;
      return {
        name: group.name,
        averageScore: averageScore * 100,
        passRate: passRate,
        averageTime: avgTime,
        testsSupervised: group.count
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const tightLineHeight = 5;
    const padding = 4;
    const maxSupervisorsToShow = Math.min(supervisors.length, 10);
    const supervisorsPerColumn = Math.ceil(maxSupervisorsToShow / 2);
    const supervisorHeight = (tightLineHeight + 1) + (5 * tightLineHeight) + 2;
    const detailsContentHeight = (supervisorsPerColumn * supervisorHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Supervisor Effectiveness Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    supervisors.forEach((supervisor, index) => {
      const ranking = index + 1;
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (ranking <= 2) {
        pdf.setTextColor(0, 120, 0);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(`#${ranking}: ${supervisor.name}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const supervisorInfo = [
        `  Average: ${supervisor.averageScore.toFixed(1)}%`,
        `  Pass Rate: ${supervisor.passRate.toFixed(1)}%`,
        `  Avg Time: ${Math.round(supervisor.averageTime)}min`,
        `  Tests: ${supervisor.testsSupervised}`,
        `  Effectiveness: ${supervisor.passRate >= 80 ? 'High' : supervisor.passRate >= 60 ? 'Medium' : 'Low'}`
      ];

      supervisorInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addSupervisorEffectivenessDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Supervisor Effectiveness uses _addSupervisorEffectivenessSpecialLayout instead
    return y;
  }

  async _addScoreDistributionHorizontalStats(pdf, x, y, width, dataSource, tileElement = null) {
    if (!dataSource) return;

    // Handle both processed chart data and raw data
    let scoreRanges, totalRecords, scoreSum;

    if (Array.isArray(dataSource) && dataSource.length > 0 && dataSource[0]?.range) {
      // Using processed chart data from _processScoreDistributionData
      scoreRanges = dataSource.map(item => ({
        min: item.min,
        max: item.max,
        label: item.range || item.id,
        count: item.count
      }));
      totalRecords = scoreRanges.reduce((sum, range) => sum + range.count, 0);
      // Calculate average from the ranges (approximation) - ranges are already in percentage form
      scoreSum = scoreRanges.reduce((sum, range) => {
        const midpoint = (range.min + range.max) / 2;
        return sum + (midpoint * range.count);
      }, 0);
    } else if (Array.isArray(dataSource) && dataSource.length > 0) {
      // Fallback to raw data processing with correct logic matching chart component
      scoreRanges = [
        { min: 0, max: 20, label: '0-20%', count: 0 },
        { min: 21, max: 40, label: '21-40%', count: 0 },
        { min: 41, max: 60, label: '41-60%', count: 0 },
        { min: 61, max: 80, label: '61-80%', count: 0 },
        { min: 81, max: 100, label: '81-100%', count: 0 }
      ];

      totalRecords = 0;
      scoreSum = 0;

      dataSource.forEach(record => {
        const score = (parseFloat(record.score_value) || 0) * 100; // Convert to percentage like chart
        scoreSum += score;
        totalRecords++;

        // Use same logic as chart component
        if (score <= 20) {
          scoreRanges[0].count++;
        } else if (score <= 40) {
          scoreRanges[1].count++;
        } else if (score <= 60) {
          scoreRanges[2].count++;
        } else if (score <= 80) {
          scoreRanges[3].count++;
        } else {
          scoreRanges[4].count++;
        }
      });
    } else {
      return; // No valid data
    }

    const averageScore = totalRecords > 0 ? scoreSum / totalRecords : 0;
    const highPerformers = scoreRanges[4].count; // 81-100%
    const lowPerformers = scoreRanges[0].count + scoreRanges[1].count; // 0-40%
    const mostCommonRange = scoreRanges.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev
    );

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Score Distribution Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Records:', value: `${totalRecords}` },
      { label: 'Average Score:', value: `${averageScore.toFixed(1)}%` },
      { label: 'High Performers:', value: `${highPerformers} (${((highPerformers/totalRecords)*100).toFixed(1)}%)` },
      { label: 'Most Common Range:', value: mostCommonRange.label },
      { label: 'Range Count:', value: `${mostCommonRange.count} records` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addScoreDistributionDetailsList(pdf, x, y, width, height, dataSource, tileElement = null) {
    if (!dataSource) return;

    // Handle both processed chart data and raw data
    let scoreRanges;

    if (Array.isArray(dataSource) && dataSource.length > 0 && dataSource[0]?.range) {
      // Using processed chart data from _processScoreDistributionData
      scoreRanges = dataSource.map(item => ({
        min: item.min,
        max: item.max,
        label: item.range || item.id,
        count: item.count,
        percentage: item.percentage || '0.0'
      }));
    } else if (Array.isArray(dataSource) && dataSource.length > 0) {
      // Fallback to raw data processing with correct logic matching chart component
      scoreRanges = [
        { min: 0, max: 20, label: '0-20%', count: 0, records: [] },
        { min: 21, max: 40, label: '21-40%', count: 0, records: [] },
        { min: 41, max: 60, label: '41-60%', count: 0, records: [] },
        { min: 61, max: 80, label: '61-80%', count: 0, records: [] },
        { min: 81, max: 100, label: '81-100%', count: 0, records: [] }
      ];

      const totalRecords = dataSource.length;
      dataSource.forEach(record => {
        const score = (parseFloat(record.score_value) || 0) * 100; // Convert to percentage like chart

        // Use same logic as chart component
        let targetRange = null;
        if (score <= 20) {
          targetRange = scoreRanges[0];
        } else if (score <= 40) {
          targetRange = scoreRanges[1];
        } else if (score <= 60) {
          targetRange = scoreRanges[2];
        } else if (score <= 80) {
          targetRange = scoreRanges[3];
        } else {
          targetRange = scoreRanges[4];
        }

        if (targetRange) {
          targetRange.count++;
          if (targetRange.records) {
            targetRange.records.push(record);
          }
        }
      });

      // Calculate percentages
      scoreRanges.forEach(range => {
        range.percentage = totalRecords > 0 ? ((range.count / totalRecords) * 100).toFixed(1) : '0.0';
      });
    } else {
      return; // No valid data
    }

    // Calculate total records from the score ranges
    const totalRecords = scoreRanges.reduce((sum, range) => sum + range.count, 0);

    const tightLineHeight = 5;
    const padding = 4;
    const rangesPerColumn = Math.ceil(scoreRanges.length / 2);
    const rangeHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (rangesPerColumn * rangeHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Score Distribution Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    scoreRanges.forEach((range, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      const percentage = totalRecords > 0 ? (range.count / totalRecords) * 100 : 0;

      pdf.setFont('helvetica', 'bold');
      if (percentage >= 30) {
        pdf.setTextColor(0, 120, 0);
      } else if (percentage >= 20) {
        pdf.setTextColor(0, 0, 120);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(`${range.label}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const rangeInfo = [
        `  Count: ${range.count}`,
        `  Percentage: ${percentage.toFixed(1)}%`,
        `  Performance: ${percentage >= 20 ? 'Normal' : 'Low Distribution'}`,
        `  Trend: ${range.min >= 61 ? 'High Achievers' : range.min >= 41 ? 'Average' : 'Needs Improvement'}`
      ];

      rangeInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addScoreDistributionDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Score Distribution uses _addScoreDistributionSpecialLayout instead
    return y;
  }

  async _addTimeDistributionHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate time distribution statistics
    const timeRanges = [
      { min: 0, max: 300, label: '0-5 min', count: 0 },
      { min: 301, max: 600, label: '5-10 min', count: 0 },
      { min: 601, max: 900, label: '10-15 min', count: 0 },
      { min: 901, max: 1800, label: '15-30 min', count: 0 },
      { min: 1801, max: Infinity, label: '30+ min', count: 0 }
    ];

    let totalRecords = 0;
    let timeSum = 0;

    rawData.forEach(record => {
      const timeSpent = parseFloat(record.time_taken) || parseFloat(record.timeSpent) || 0;
      timeSum += timeSpent;
      totalRecords++;

      timeRanges.forEach(range => {
        if (timeSpent >= range.min && timeSpent <= range.max) {
          range.count++;
        }
      });
    });

    const averageTime = totalRecords > 0 ? timeSum / totalRecords : 0;
    const quickUsers = timeRanges[0].count + timeRanges[1].count; // 0-10 min
    const slowUsers = timeRanges[4].count; // 30+ min
    const mostCommonRange = timeRanges.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev
    );

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time Distribution Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Records:', value: `${totalRecords}` },
      { label: 'Average Time:', value: `${Math.round(averageTime / 60)} min` },
      { label: 'Quick Users (0-10m):', value: `${quickUsers} (${((quickUsers/totalRecords)*100).toFixed(1)}%)` },
      { label: 'Most Common Range:', value: mostCommonRange.label },
      { label: 'Range Count:', value: `${mostCommonRange.count} records` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addTimeDistributionDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const timeRanges = [
      { min: 0, max: 300, label: '0-5 min', count: 0, records: [] },
      { min: 301, max: 600, label: '5-10 min', count: 0, records: [] },
      { min: 601, max: 900, label: '10-15 min', count: 0, records: [] },
      { min: 901, max: 1800, label: '15-30 min', count: 0, records: [] },
      { min: 1801, max: Infinity, label: '30+ min', count: 0, records: [] }
    ];

    rawData.forEach(record => {
      const timeSpent = parseFloat(record.time_taken) || parseFloat(record.timeSpent) || 0;
      timeRanges.forEach(range => {
        if (timeSpent >= range.min && timeSpent <= range.max) {
          range.count++;
          range.records.push(record);
        }
      });
    });

    const totalRecords = rawData.length;

    const tightLineHeight = 5;
    const padding = 4;
    const rangesPerColumn = Math.ceil(timeRanges.length / 2);
    const rangeHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (rangesPerColumn * rangeHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time Distribution Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    timeRanges.forEach((range, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      const percentage = totalRecords > 0 ? (range.count / totalRecords) * 100 : 0;

      pdf.setFont('helvetica', 'bold');
      if (range.label.includes('5-10') || range.label.includes('10-15')) {
        pdf.setTextColor(0, 120, 0); // Green for optimal times
      } else if (range.label.includes('30+')) {
        pdf.setTextColor(120, 0, 0); // Red for slow times
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(`${range.label}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const rangeInfo = [
        `  Count: ${range.count}`,
        `  Percentage: ${percentage.toFixed(1)}%`,
        `  Speed: ${range.min <= 600 ? 'Fast' : range.min <= 1800 ? 'Average' : 'Slow'}`,
        `  Efficiency: ${percentage >= 20 ? 'Normal Distribution' : 'Low Activity'}`
      ];

      rangeInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
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
    // This function is now bypassed by the special layout system
    // Time Distribution uses _addTimeDistributionSpecialLayout instead
    return y;
  }

  async _addTestCompletionTrendHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate test completion trend statistics
    const dateGroups = {};
    let totalTests = 0;
    let passedTests = 0;
    let totalScore = 0;

    rawData.forEach(record => {
      const date = record.completion_date || record.date || new Date().toISOString().split('T')[0];
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      
      if (!dateGroups[date]) {
        dateGroups[date] = { count: 0, totalScore: 0, passed: 0 };
      }
      
      dateGroups[date].count++;
      dateGroups[date].totalScore += score;
      if (score >= 0.7) dateGroups[date].passed++;
      
      totalTests++;
      totalScore += score;
      if (score >= 0.7) passedTests++;
    });

    const dates = Object.keys(dateGroups).sort();
    const averageScore = totalTests > 0 ? (totalScore / totalTests) * 100 : 0;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const totalDays = dates.length;
    const avgTestsPerDay = totalDays > 0 ? totalTests / totalDays : 0;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Test Completion Trend Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Tests:', value: `${totalTests}` },
      { label: 'Average Score:', value: `${averageScore.toFixed(1)}%` },
      { label: 'Pass Rate:', value: `${passRate.toFixed(1)}%` },
      { label: 'Days Active:', value: `${totalDays}` },
      { label: 'Avg Tests/Day:', value: `${avgTestsPerDay.toFixed(1)}` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addTestCompletionTrendDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const dateGroups = {};
    rawData.forEach(record => {
      const date = record.completion_date || record.date || new Date().toISOString().split('T')[0];
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      
      if (!dateGroups[date]) {
        dateGroups[date] = { count: 0, totalScore: 0, passed: 0, records: [] };
      }
      
      dateGroups[date].count++;
      dateGroups[date].totalScore += score;
      if (score >= 0.7) dateGroups[date].passed++;
      dateGroups[date].records.push(record);
    });

    const dateEntries = Object.entries(dateGroups)
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgScore: data.count > 0 ? (data.totalScore / data.count) * 100 : 0,
        passRate: data.count > 0 ? (data.passed / data.count) * 100 : 0
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const tightLineHeight = 5;
    const padding = 4;
    const entriesPerColumn = Math.ceil(dateEntries.length / 2);
    const entryHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (entriesPerColumn * entryHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Test Completion Trend Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    dateEntries.forEach((entry, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (entry.passRate >= 80) {
        pdf.setTextColor(0, 120, 0);
      } else if (entry.passRate >= 60) {
        pdf.setTextColor(0, 0, 120);
      } else {
        pdf.setTextColor(120, 0, 0);
      }
      pdf.text(`${entry.date}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const entryInfo = [
        `  Tests: ${entry.count}`,
        `  Avg Score: ${entry.avgScore.toFixed(1)}%`,
        `  Pass Rate: ${entry.passRate.toFixed(1)}%`,
        `  Trend: ${entry.passRate >= 70 ? 'Positive' : 'Needs Attention'}`
      ];

      entryInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addTestCompletionTrendDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Test Completion Trend uses _addTestCompletionTrendSpecialLayout instead
    return y;
  }

  async _addCategoryPerformanceHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate category performance statistics
    const categoryGroups = {};
    let totalTests = 0;
    let totalScore = 0;

    rawData.forEach(record => {
      const category = record.category || record.test_category || 'Unknown';
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = { count: 0, totalScore: 0, passed: 0 };
      }
      
      categoryGroups[category].count++;
      categoryGroups[category].totalScore += score;
      if (score >= 0.7) categoryGroups[category].passed++;
      
      totalTests++;
      totalScore += score;
    });

    const categories = Object.entries(categoryGroups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: data.count > 0 ? (data.totalScore / data.count) * 100 : 0,
        passRate: data.count > 0 ? (data.passed / data.count) * 100 : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    const totalCategories = categories.length;
    const overallAvg = totalTests > 0 ? (totalScore / totalTests) * 100 : 0;
    const topCategory = categories[0] || {};
    const avgTestsPerCategory = totalCategories > 0 ? totalTests / totalCategories : 0;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category Performance Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Categories:', value: `${totalCategories}` },
      { label: 'Overall Average:', value: `${overallAvg.toFixed(1)}%` },
      { label: 'Top Category:', value: topCategory.name || 'N/A' },
      { label: 'Top Score:', value: `${(topCategory.avgScore || 0).toFixed(1)}%` },
      { label: 'Avg Tests/Category:', value: `${avgTestsPerCategory.toFixed(1)}` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addCategoryPerformanceDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const categoryGroups = {};
    rawData.forEach(record => {
      const category = record.category || record.test_category || 'Unknown';
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = { count: 0, totalScore: 0, passed: 0, records: [] };
      }
      
      categoryGroups[category].count++;
      categoryGroups[category].totalScore += score;
      if (score >= 0.7) categoryGroups[category].passed++;
      categoryGroups[category].records.push(record);
    });

    const categories = Object.entries(categoryGroups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: data.count > 0 ? (data.totalScore / data.count) * 100 : 0,
        passRate: data.count > 0 ? (data.passed / data.count) * 100 : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    const tightLineHeight = 5;
    const padding = 4;
    const categoriesPerColumn = Math.ceil(categories.length / 2);
    const categoryHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (categoriesPerColumn * categoryHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category Performance Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    categories.forEach((category, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (category.avgScore >= 80) {
        pdf.setTextColor(0, 120, 0);
      } else if (category.avgScore >= 60) {
        pdf.setTextColor(0, 0, 120);
      } else {
        pdf.setTextColor(120, 0, 0);
      }
      pdf.text(`${category.name}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const categoryInfo = [
        `  Tests: ${category.count}`,
        `  Avg Score: ${category.avgScore.toFixed(1)}%`,
        `  Pass Rate: ${category.passRate.toFixed(1)}%`,
        `  Performance: ${category.avgScore >= 80 ? 'Excellent' : category.avgScore >= 60 ? 'Good' : 'Needs Improvement'}`
      ];

      categoryInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addTopBottomPerformersSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85; // Keep chart large, reduce stats area
    const statsAreaHeight = height * 0.15; // Smaller area below chart for horizontal stats
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column (reduced height)
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add horizontal summary statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addTopBottomPerformersHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add detailed performer lists in right column
    await this._addTopBottomPerformersDetailedLists(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addSupervisorPerformanceSpecialLayout(pdf, tileElement, x, y, chartWidth, infoWidth, height, context = {}) {
    const { rawData } = context;
    const columnGap = 15;
    const chartHeight = height * 0.85; // Keep chart large, reduce stats area
    const rightColumnX = x + chartWidth + columnGap;

    // Add chart in left column (reduced height)
    await this._addChartImageToPDF(pdf, tileElement, x, y, chartWidth, chartHeight);

    // Add overall statistics below the chart
    const statsY = y + chartHeight + 6;
    await this._addSupervisorPerformanceHorizontalStats(pdf, x, statsY, chartWidth, rawData, tileElement);

    // Add supervisor details in right column
    await this._addSupervisorPerformanceDetailsList(pdf, rightColumnX, y, infoWidth, height, rawData, tileElement);
  }

  async _addTopBottomPerformersHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Enhanced anonymization function (matches chart component)
    const anonymizeName = (ldap) => {
      let hash = 0;
      for (let i = 0; i < ldap.length; i++) {
        const char = ldap.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      hash = Math.abs(hash);
      const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Sigma', 'Omega', 'Zeta', 'Kappa', 'Lambda'];
      const suffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
      const prefixIndex = hash % prefixes.length;
      const suffixIndex = Math.floor(hash / 100) % suffixes.length;
      return `${prefixes[prefixIndex]}-${suffixes[suffixIndex]}`;
    };

    // Detect anonymization state from the chart component
    const shouldAnonymize = this._detectAnonymizationState(tileElement);

    // Calculate basic statistics first
    const minTestsRequired = 1;
    const userGroups = {};

    rawData.forEach(record => {
      const userName = record.ldap || record.userName || 'Anonymous';
      const displayName = shouldAnonymize ? anonymizeName(userName) : userName;

      if (!userGroups[userName]) {
        userGroups[userName] = {
          name: displayName,
          scores: [],
          supervisor: record.supervisor || 'Unknown',
          market: record.market || 'Unknown'
        };
      }
      userGroups[userName].scores.push(parseFloat(record.score_value) || 0);
    });

    const qualifiedUsers = Object.values(userGroups)
      .filter(user => user.scores.length >= minTestsRequired)
      .map(user => {
        const averageScore = user.scores.reduce((sum, score) => sum + score, 0) / user.scores.length * 100;
        return {
          name: user.name,
          averageScore: averageScore,
          testsCompleted: user.scores.length,
          supervisor: user.supervisor,
          market: user.market
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    const topPerformers = qualifiedUsers.slice(0, 5);
    const totalQualified = qualifiedUsers.length;
    const topAverage = topPerformers.length > 0
      ? topPerformers.reduce((sum, user) => sum + user.averageScore, 0) / topPerformers.length
      : 0;
    const scoreRange = qualifiedUsers.length > 0
      ? `${qualifiedUsers[qualifiedUsers.length - 1].averageScore.toFixed(1)}% - ${qualifiedUsers[0].averageScore.toFixed(1)}%`
      : 'N/A';

    // Standard horizontal stats layout (matching Score Distribution style)
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 6 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top/Bottom Performers Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    // Add padding below the dividing line
    currentY += 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Performers:', value: `${topPerformers.length}` },
      { label: 'Average Score:', value: `${topAverage.toFixed(1)}%` },
      { label: 'Top Performer:', value: topPerformers[0]?.name || 'N/A' },
      { label: 'Top Score:', value: `${topPerformers[0]?.averageScore.toFixed(1) || '0'}%` },
      { label: 'Score Range:', value: scoreRange },
      { label: 'Qualified Users:', value: `${totalQualified}` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  // Helper method to detect anonymization state from chart component
  _detectAnonymizationState(tileElement) {
    if (!tileElement) return false;

    // Method 1: Look for the anonymization toggle button and check its title/text
    const anonymizeButton = tileElement.querySelector('button[title*="Anonymize"], button[title*="Show real names"]');
    if (anonymizeButton) {
      const title = anonymizeButton.getAttribute('title') || '';
      const buttonText = anonymizeButton.textContent || '';

      // If title says "Show real names" or button text says "Anonymous", then anonymization is ON
      const isAnonymized = title.includes('Show real names') || buttonText.includes('Anonymous');
      console.log('📊 PDF Export: Detected anonymization state from button:', isAnonymized, { title, buttonText });
      return isAnonymized;
    }

    // Method 2: Fallback - check if any displayed names in the chart follow anonymization pattern
    const chartLabels = tileElement.querySelectorAll('text, .nivo-bar-label, .recharts-text');
    for (const label of chartLabels) {
      const text = label.textContent || '';
      if (text.match(/^[A-Z][a-z]+-\d+$/)) {
        console.log('📊 PDF Export: Detected anonymization from chart labels:', true);
        return true; // Found anonymized name pattern
      }
    }

    console.log('📊 PDF Export: No anonymization detected, using real names');
    return false; // Default to not anonymized
  }

  async _addTopBottomPerformersDetailedLists(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    const lineHeight = 4;
    const sectionSpacing = 6;
    let currentY = y;

    // Enhanced anonymization function (matches chart component)
    const anonymizeName = (ldap) => {
      // Create a stable hash from the LDAP for consistent anonymization
      let hash = 0;
      for (let i = 0; i < ldap.length; i++) {
        const char = ldap.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Convert hash to positive number
      hash = Math.abs(hash);
      
      // Generate anonymous identifier
      const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Sigma', 'Omega', 'Zeta', 'Kappa', 'Lambda'];
      const suffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
      
      const prefixIndex = hash % prefixes.length;
      const suffixIndex = Math.floor(hash / 100) % suffixes.length;
      
      return `${prefixes[prefixIndex]}-${suffixes[suffixIndex]}`;
    };

    // Detect anonymization state from the chart component
    const shouldAnonymize = this._detectAnonymizationState(tileElement);

    // Enhanced data processing with tooltip-like information
    const minTestsRequired = 1;
    const userGroups = {};

    console.log('📊 PDF Export: Processing', rawData.length, 'records with anonymization:', shouldAnonymize);

    rawData.forEach(record => {
      const userName = record.ldap || record.userName || 'Anonymous';
      const displayName = shouldAnonymize ? anonymizeName(userName) : userName;

      if (!userGroups[userName]) {
        userGroups[userName] = {
          name: displayName,
          originalName: userName,
          scores: [],
          supervisor: record.supervisor || 'Unknown',
          market: record.market || 'Unknown',
          totalTests: 0
        };
      }
      const score = parseFloat(record.score_value) || 0;
      userGroups[userName].scores.push(score);
      userGroups[userName].totalTests++;
    });

    const qualifiedUsers = Object.values(userGroups)
      .filter(user => user.scores.length >= minTestsRequired)
      .map(user => {
        const scores = user.scores.map(s => s * 100); // Convert to percentage
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const bestScore = Math.max(...scores);
        const worstScore = Math.min(...scores);
        
        // Calculate consistency (100 - coefficient of variation)
        const mean = averageScore;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;
        const consistency = Math.max(0, 100 - coefficientOfVariation);

        // Simple trend calculation (improving/declining/stable)
        let trend = 'stable';
        if (scores.length >= 3) {
          const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
          const secondHalf = scores.slice(Math.floor(scores.length / 2));
          const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
          
          if (secondAvg > firstAvg + 5) trend = 'improving';
          else if (secondAvg < firstAvg - 5) trend = 'declining';
        }

        return {
          name: user.name,
          averageScore: averageScore,
          bestScore: bestScore,
          worstScore: worstScore,
          consistency: consistency,
          testsCompleted: user.scores.length,
          totalTests: user.totalTests,
          supervisor: user.supervisor,
          market: user.market,
          trend: trend
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    const topPerformers = qualifiedUsers.slice(0, 5);
    const bottomPerformers = qualifiedUsers.slice(-5).reverse();

    // Split right column into two: Top 5 on left, Bottom 5 on right
    const leftColWidth = width * 0.48;
    const rightColWidth = width * 0.48;
    const colGap = width * 0.04;
    const rightColX = x + leftColWidth + colGap;

    // Calculate dynamic height based on actual content
    const padding = 4; // Reduced padding to match horizontal stats
    const headerHeight = lineHeight + 3 + 2; // Header + underline space
    const performerHeight = (lineHeight + 1) + (6 * lineHeight) + 2; // Name line + 6 info lines + gap
    const calculatedContentHeight = headerHeight + (Math.max(topPerformers.length, bottomPerformers.length) * performerHeight);
    const sectionHeight = calculatedContentHeight + padding - 2; // Minimal padding with tighter fit

    // Left column border (Top 5 Performers) - dynamic height
    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252); // Very light blue-gray background
    pdf.setLineWidth(0.5);
    pdf.rect(x, currentY - 5, leftColWidth, sectionHeight, 'FD'); // Fill and Draw

    // Right column border (Bottom 5 Performers) - dynamic height
    pdf.rect(rightColX, currentY - 5, rightColWidth, sectionHeight, 'FD');

    // Header separator lines
    pdf.setDrawColor(120, 120, 120);
    pdf.setLineWidth(0.8);

    // Top 5 Performers (Left side)
    let topCurrentY = currentY;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top 5 Performers:', x + 4, topCurrentY);
    topCurrentY += lineHeight + 3;

    // Add underline for section header
    pdf.line(x + 4, topCurrentY - 2, x + leftColWidth - 4, topCurrentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    topPerformers.forEach((performer, index) => {
      const ranking = index + 1;

      // Bold name and ranking with color coding
      pdf.setFont('helvetica', 'bold');
      if (ranking <= 2) {
        pdf.setTextColor(0, 120, 0); // Dark green for top 2
      } else {
        pdf.setTextColor(0, 0, 0); // Black for others
      }
      pdf.text(`#${ranking}: ${performer.name}`, x + 4, topCurrentY + 2);
      topCurrentY += lineHeight + 1;

      // Regular font for details
      pdf.setTextColor(0, 0, 0); // Reset to black
      pdf.setFont('helvetica', 'normal');
      const performerInfo = [
        `  Average: ${performer.averageScore.toFixed(1)}%`,
        `  Best: ${performer.bestScore.toFixed(1)}%`,
        `  Worst: ${performer.worstScore.toFixed(1)}%`,
        `  Supervisor: ${performer.supervisor}`,
        `  Market: ${performer.market}`,
        `  Trend: ${performer.trend}`
      ];

      performerInfo.forEach(info => {
        pdf.text(info, x + 4, topCurrentY);
        topCurrentY += lineHeight;
      });

      // Small gap between performers
      topCurrentY += 2;
    });

    // Bottom 5 Performers (Right side)
    let bottomCurrentY = currentY;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bottom 5 Performers:', rightColX + 4, bottomCurrentY);
    bottomCurrentY += lineHeight + 3;

    // Add underline for section header
    pdf.line(rightColX + 4, bottomCurrentY - 2, rightColX + rightColWidth - 4, bottomCurrentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    bottomPerformers.forEach((performer, index) => {
      const ranking = index + 1; // Bottom performers numbered 1-5

      // Bold name and ranking with color coding
      pdf.setFont('helvetica', 'bold');
      if (ranking <= 2) {
        pdf.setTextColor(150, 0, 0); // Dark red for bottom 2
      } else {
        pdf.setTextColor(0, 0, 0); // Black for others
      }
      pdf.text(`#${ranking}: ${performer.name}`, rightColX + 4, bottomCurrentY + 2);
      bottomCurrentY += lineHeight + 1;

      // Regular font for details
      pdf.setTextColor(0, 0, 0); // Reset to black
      pdf.setFont('helvetica', 'normal');
      const performerInfo = [
        `  Average: ${performer.averageScore.toFixed(1)}%`,
        `  Best: ${performer.bestScore.toFixed(1)}%`,
        `  Worst: ${performer.worstScore.toFixed(1)}%`,
        `  Supervisor: ${performer.supervisor}`,
        `  Market: ${performer.market}`,
        `  Trend: ${performer.trend}`
      ];

      performerInfo.forEach(info => {
        pdf.text(info, rightColX + 4, bottomCurrentY);
        bottomCurrentY += lineHeight;
      });

      // Small gap between performers
      bottomCurrentY += 2;
    });
  }

  async _addTopBottomPerformersDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for top/bottom performers analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Filter users with minimum test requirement (e.g., 1 test)
    const minTestsRequired = 1;
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

    const topPerformers = qualifiedUsers.slice(0, 5);
    const bottomPerformers = qualifiedUsers.slice(-5).reverse();

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
    // This function is now bypassed by the special layout system
    // Category Performance uses _addCategoryPerformanceSpecialLayout instead
    return y;
  }

  async _addMarketPerformanceHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate market performance statistics
    const marketGroups = {};
    let totalTests = 0;
    let totalScore = 0;

    rawData.forEach(record => {
      const market = record.market || record.region || record.location || 'Unknown';
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      
      if (!marketGroups[market]) {
        marketGroups[market] = { count: 0, totalScore: 0, passed: 0 };
      }
      
      marketGroups[market].count++;
      marketGroups[market].totalScore += score;
      if (score >= 0.7) marketGroups[market].passed++;
      
      totalTests++;
      totalScore += score;
    });

    const markets = Object.entries(marketGroups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: data.count > 0 ? (data.totalScore / data.count) * 100 : 0,
        passRate: data.count > 0 ? (data.passed / data.count) * 100 : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    const totalMarkets = markets.length;
    const overallAvg = totalTests > 0 ? (totalScore / totalTests) * 100 : 0;
    const topMarket = markets[0] || {};
    const avgTestsPerMarket = totalMarkets > 0 ? totalTests / totalMarkets : 0;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Performance Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Markets:', value: `${totalMarkets}` },
      { label: 'Overall Average:', value: `${overallAvg.toFixed(1)}%` },
      { label: 'Top Market:', value: topMarket.name || 'N/A' },
      { label: 'Top Score:', value: `${(topMarket.avgScore || 0).toFixed(1)}%` },
      { label: 'Avg Tests/Market:', value: `${avgTestsPerMarket.toFixed(1)}` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addMarketPerformanceDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const marketGroups = {};
    rawData.forEach(record => {
      const market = record.market || record.region || record.location || 'Unknown';
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      
      if (!marketGroups[market]) {
        marketGroups[market] = { count: 0, totalScore: 0, passed: 0, records: [] };
      }
      
      marketGroups[market].count++;
      marketGroups[market].totalScore += score;
      if (score >= 0.7) marketGroups[market].passed++;
      marketGroups[market].records.push(record);
    });

    const markets = Object.entries(marketGroups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: data.count > 0 ? (data.totalScore / data.count) * 100 : 0,
        passRate: data.count > 0 ? (data.passed / data.count) * 100 : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    const tightLineHeight = 5;
    const padding = 4;
    const marketsPerColumn = Math.ceil(markets.length / 2);
    const marketHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (marketsPerColumn * marketHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Performance Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    markets.forEach((market, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (market.avgScore >= 80) {
        pdf.setTextColor(0, 120, 0);
      } else if (market.avgScore >= 60) {
        pdf.setTextColor(0, 0, 120);
      } else {
        pdf.setTextColor(120, 0, 0);
      }
      pdf.text(`${market.name}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const marketInfo = [
        `  Tests: ${market.count}`,
        `  Avg Score: ${market.avgScore.toFixed(1)}%`,
        `  Pass Rate: ${market.passRate.toFixed(1)}%`,
        `  Performance: ${market.avgScore >= 80 ? 'Excellent' : market.avgScore >= 60 ? 'Good' : 'Needs Improvement'}`
      ];

      marketInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addOldCategoryPerformanceDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
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
    // This function is now bypassed by the special layout system
    // Market Performance uses _addMarketPerformanceSpecialLayout instead
    return y;
  }

  async _addOldMarketPerformanceDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
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

  async _addTopPerformersHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate top performers statistics
    const performers = rawData.map(record => ({
      name: record.name || record.user_name || record.ldap || 'Unknown',
      score: parseFloat(record.score_value) || parseFloat(record.score) || 0,
      timeSpent: parseFloat(record.time_taken) || parseFloat(record.timeSpent) || 0
    })).sort((a, b) => b.score - a.score);

    const totalPerformers = performers.length;
    const topPerformers = performers.slice(0, 10);
    const averageScore = performers.length > 0 ? performers.reduce((sum, p) => sum + p.score, 0) / performers.length : 0;
    const highPerformers = performers.filter(p => p.score >= 0.8).length;
    const topScore = performers[0]?.score || 0;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Performers Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Performers:', value: `${totalPerformers}` },
      { label: 'Average Score:', value: `${(averageScore * 100).toFixed(1)}%` },
      { label: 'High Performers:', value: `${highPerformers} (${((highPerformers/totalPerformers)*100).toFixed(1)}%)` },
      { label: 'Top Score:', value: `${(topScore * 100).toFixed(1)}%` },
      { label: 'Top Performer:', value: topPerformers[0]?.name || 'N/A' }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addTopPerformersDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const performers = rawData.map(record => ({
      name: record.name || record.user_name || record.ldap || 'Unknown',
      score: parseFloat(record.score_value) || parseFloat(record.score) || 0,
      timeSpent: parseFloat(record.time_taken) || parseFloat(record.timeSpent) || 0
    })).sort((a, b) => b.score - a.score).slice(0, 10);

    const tightLineHeight = 5;
    const padding = 4;
    const performersPerColumn = Math.ceil(performers.length / 2);
    const performerHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (performersPerColumn * performerHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Performers Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    performers.forEach((performer, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      const ranking = index + 1;

      pdf.setFont('helvetica', 'bold');
      if (ranking <= 3) {
        pdf.setTextColor(0, 120, 0);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(`#${ranking}: ${performer.name}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const performerInfo = [
        `  Score: ${(performer.score * 100).toFixed(1)}%`,
        `  Time: ${Math.round(performer.timeSpent / 60)}min`,
        `  Rank: #${ranking}`,
        `  Level: ${performer.score >= 0.9 ? 'Expert' : performer.score >= 0.8 ? 'Advanced' : 'Intermediate'}`
      ];

      performerInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addTopPerformersDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Top Performers uses _addTopPerformersSpecialLayout instead
    return y;
  }

  async _addOldTopPerformersDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
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

  async _addRecentActivityHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate recent activity statistics
    const now = new Date();
    const activities = rawData.map(record => {
      const date = new Date(record.completion_date || record.date || record.timestamp || now);
      const daysSince = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      return {
        date: date.toISOString().split('T')[0],
        daysSince,
        user: record.name || record.user_name || record.ldap || 'Unknown',
        activity: record.activity || record.test_name || 'Test Completion',
        score: parseFloat(record.score_value) || parseFloat(record.score) || 0
      };
    }).sort((a, b) => a.daysSince - b.daysSince);

    const totalActivities = activities.length;
    const recentActivities = activities.filter(a => a.daysSince <= 7).length;
    const todayActivities = activities.filter(a => a.daysSince === 0).length;
    const weeklyAverage = recentActivities / 7;
    const mostActiveUser = activities.reduce((acc, curr) => {
      acc[curr.user] = (acc[curr.user] || 0) + 1;
      return acc;
    }, {});
    const topUser = Object.entries(mostActiveUser).sort(([,a], [,b]) => b - a)[0];

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Activity Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Activities:', value: `${totalActivities}` },
      { label: 'Recent (7 days):', value: `${recentActivities}` },
      { label: 'Today:', value: `${todayActivities}` },
      { label: 'Weekly Average:', value: `${weeklyAverage.toFixed(1)}` },
      { label: 'Most Active User:', value: topUser ? `${topUser[0]} (${topUser[1]})` : 'N/A' }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addRecentActivityDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const now = new Date();
    const activities = rawData.map(record => {
      const date = new Date(record.completion_date || record.date || record.timestamp || now);
      const daysSince = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      return {
        date: date.toISOString().split('T')[0],
        daysSince,
        user: record.name || record.user_name || record.ldap || 'Unknown',
        activity: record.activity || record.test_name || 'Test Completion',
        score: parseFloat(record.score_value) || parseFloat(record.score) || 0
      };
    }).sort((a, b) => a.daysSince - b.daysSince).slice(0, 10);

    const tightLineHeight = 5;
    const padding = 4;
    const activitiesPerColumn = Math.ceil(activities.length / 2);
    const activityHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (activitiesPerColumn * activityHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Activity Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    activities.forEach((activity, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      pdf.setFont('helvetica', 'bold');
      if (activity.daysSince === 0) {
        pdf.setTextColor(0, 120, 0);
      } else if (activity.daysSince <= 3) {
        pdf.setTextColor(0, 0, 120);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(`${activity.user}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const activityInfo = [
        `  Date: ${activity.date}`,
        `  Days Ago: ${activity.daysSince}`,
        `  Activity: ${activity.activity.substring(0, 20)}...`,
        `  Recency: ${activity.daysSince === 0 ? 'Today' : activity.daysSince <= 3 ? 'Recent' : 'Older'}`
      ];

      activityInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addRecentActivityDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Recent Activity uses _addRecentActivitySpecialLayout instead
    return y;
  }

  async _addOldRecentActivityDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
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

  async _addPassFailRateHorizontalStats(pdf, x, y, width, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Process rawData to calculate pass/fail rate statistics
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalScore = 0;

    rawData.forEach(record => {
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      totalTests++;
      totalScore += score;
      
      if (score >= 0.7) {
        passedTests++;
      } else {
        failedTests++;
      }
    });

    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const failRate = totalTests > 0 ? (failedTests / totalTests) * 100 : 0;
    const averageScore = totalTests > 0 ? (totalScore / totalTests) * 100 : 0;
    const passThreshold = 70;

    // Standard horizontal stats layout
    const padding = 4;
    const tightLineHeight = 5;
    const statsLineHeight = 6;
    const headerHeight = 12;
    const statsContentHeight = 5 * statsLineHeight;
    const statsHeight = headerHeight + statsContentHeight + (padding * 2) - 1;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 2, width, statsHeight);

    let currentY = y + padding;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pass/Fail Rate Stats:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Tests:', value: `${totalTests}` },
      { label: 'Pass Rate:', value: `${passRate.toFixed(1)}% (${passedTests})` },
      { label: 'Fail Rate:', value: `${failRate.toFixed(1)}% (${failedTests})` },
      { label: 'Average Score:', value: `${averageScore.toFixed(1)}%` },
      { label: 'Pass Threshold:', value: `${passThreshold}%` }
    ];

    stats.forEach(stat => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label, x + 4, currentY);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(stat.label);
      pdf.text(stat.value, x + 4 + labelWidth + 2, currentY);
      currentY += statsLineHeight;
    });
  }

  async _addPassFailRateDetailsList(pdf, x, y, width, height, rawData, tileElement = null) {
    if (!rawData || !Array.isArray(rawData)) return;

    // Same processing as horizontal stats
    const scoreRanges = [
      { min: 0, max: 0.3, label: 'Poor (0-30%)', count: 0, type: 'fail' },
      { min: 0.31, max: 0.49, label: 'Below Average (31-49%)', count: 0, type: 'fail' },
      { min: 0.5, max: 0.69, label: 'Average (50-69%)', count: 0, type: 'fail' },
      { min: 0.7, max: 0.84, label: 'Good (70-84%)', count: 0, type: 'pass' },
      { min: 0.85, max: 1.0, label: 'Excellent (85-100%)', count: 0, type: 'pass' }
    ];

    rawData.forEach(record => {
      const score = parseFloat(record.score_value) || parseFloat(record.score) || 0;
      scoreRanges.forEach(range => {
        if (score >= range.min && score <= range.max) {
          range.count++;
        }
      });
    });

    const totalRecords = rawData.length;

    const tightLineHeight = 5;
    const padding = 4;
    const rangesPerColumn = Math.ceil(scoreRanges.length / 2);
    const rangeHeight = (tightLineHeight + 1) + (4 * tightLineHeight) + 2;
    const detailsContentHeight = (rangesPerColumn * rangeHeight) + 15;
    const detailsSectionHeight = detailsContentHeight + padding - 2;

    pdf.setDrawColor(180, 180, 180);
    pdf.setFillColor(248, 250, 252);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 5, width, detailsSectionHeight, 'FD');

    let currentY = y + padding;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pass/Fail Rate Details:', x + 4, currentY);
    currentY += tightLineHeight + 3;

    pdf.line(x + 4, currentY - 2, x + width - 4, currentY - 2);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    const colWidth = (width - 20) / 2;
    const leftColX = x + 8;
    const rightColX = x + 8 + colWidth + 4;

    let leftColY = currentY;
    let rightColY = currentY;

    scoreRanges.forEach((range, index) => {
      const isLeftColumn = (index % 2 === 0);
      const colX = isLeftColumn ? leftColX : rightColX;
      let colY = isLeftColumn ? leftColY : rightColY;

      const percentage = totalRecords > 0 ? (range.count / totalRecords) * 100 : 0;

      pdf.setFont('helvetica', 'bold');
      if (range.type === 'pass') {
        pdf.setTextColor(0, 120, 0);
      } else {
        pdf.setTextColor(120, 0, 0);
      }
      pdf.text(`${range.label}`, colX, colY + 2);
      colY += tightLineHeight + 1;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      const rangeInfo = [
        `  Count: ${range.count}`,
        `  Percentage: ${percentage.toFixed(1)}%`,
        `  Status: ${range.type.toUpperCase()}`,
        `  Impact: ${range.type === 'pass' ? 'Positive' : 'Needs Improvement'}`
      ];

      rangeInfo.forEach(info => {
        pdf.text(info, colX, colY);
        colY += tightLineHeight;
      });

      colY += 2;

      if (isLeftColumn) {
        leftColY = colY;
      } else {
        rightColY = colY;
      }
    });
  }

  async _addPassFailRateDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    // This function is now bypassed by the special layout system
    // Pass/Fail Rate uses _addPassFailRateSpecialLayout instead
    return y;
  }

  async _addOldPassFailRateDetails(pdf, x, y, width, rawData, lineHeight, sectionSpacing) {
    let currentY = y;

    // Overall Statistics Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pass/Fail Rate Analysis:', x, currentY);
    currentY += lineHeight + 2;

    if (!rawData || !Array.isArray(rawData)) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No data available for pass/fail analysis', x, currentY);
      return currentY + lineHeight;
    }

    // Analyze thresholds in the dataset
    const thresholds = rawData
      .map(result => result.passing_threshold || 70)
      .filter((threshold, index, arr) => arr.indexOf(threshold) === index);

    // Calculate pass/fail counts using actual quiz thresholds
    let passCount = 0;
    let failCount = 0;
    const passDetails = [];
    const failDetails = [];

    rawData.forEach((result) => {
      const score = parseFloat(result.score_value) || 0;
      const threshold = (result.passing_threshold || 70) / 100; // Convert to decimal
      
      if (score >= threshold) {
        passCount++;
        passDetails.push({
          score: score,
          threshold: result.passing_threshold || 70,
          user: result.ldap || 'Unknown',
          quizType: result.quiz_type || 'Unknown'
        });
      } else {
        failCount++;
        failDetails.push({
          score: score,
          threshold: result.passing_threshold || 70,
          user: result.ldap || 'Unknown',
          quizType: result.quiz_type || 'Unknown'
        });
      }
    });

    const total = passCount + failCount;
    const passPercentage = total > 0 ? ((passCount / total) * 100).toFixed(1) : '0';
    const failPercentage = total > 0 ? ((failCount / total) * 100).toFixed(1) : '0';

    // Create threshold context for display
    const thresholdLabel = thresholds.length > 1 
      ? `${Math.min(...thresholds)}%-${Math.max(...thresholds)}%`
      : `${thresholds[0]}%`;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // General Chart Information
    const generalInfo = [
      `Total Tests: ${total}`,
      `Pass/Fail Threshold: ${thresholdLabel}`,
      `Overall Pass Rate: ${passPercentage}%`,
      `Overall Fail Rate: ${failPercentage}%`
    ];

    generalInfo.forEach(info => {
      pdf.text(info, x, currentY);
      currentY += lineHeight;
    });

    currentY += sectionSpacing;

    // Pass Breakdown Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pass Breakdown:', x, currentY);
    currentY += lineHeight + 2;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (passCount > 0) {
      // Calculate pass statistics
      const passScores = passDetails.map(p => p.score * 100); // Convert to percentage for display
      const avgPassScore = passScores.length > 0 ? (passScores.reduce((sum, s) => sum + s, 0) / passScores.length).toFixed(1) : '0';
      const highestPassScore = passScores.length > 0 ? Math.max(...passScores).toFixed(1) : '0';
      const lowestPassScore = passScores.length > 0 ? Math.min(...passScores).toFixed(1) : '0';

      const passBreakdownInfo = [
        `Count: ${passCount} tests`,
        `Percentage: ${passPercentage}% of all tests`,
        `Average Score: ${avgPassScore}%`,
        `Score Range: ${lowestPassScore}% - ${highestPassScore}%`,
        `Status: Meeting or exceeding ${thresholdLabel} threshold`
      ];

      passBreakdownInfo.forEach(info => {
        pdf.text(info, x, currentY);
        currentY += lineHeight;
      });
    } else {
      pdf.text('No passing tests found', x, currentY);
      currentY += lineHeight;
    }

    currentY += sectionSpacing;

    // Fail Breakdown Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fail Breakdown:', x, currentY);
    currentY += lineHeight + 2;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (failCount > 0) {
      // Calculate fail statistics
      const failScores = failDetails.map(f => f.score * 100); // Convert to percentage for display
      const avgFailScore = failScores.length > 0 ? (failScores.reduce((sum, s) => sum + s, 0) / failScores.length).toFixed(1) : '0';
      const highestFailScore = failScores.length > 0 ? Math.max(...failScores).toFixed(1) : '0';
      const lowestFailScore = failScores.length > 0 ? Math.min(...failScores).toFixed(1) : '0';

      const failBreakdownInfo = [
        `Count: ${failCount} tests`,
        `Percentage: ${failPercentage}% of all tests`,
        `Average Score: ${avgFailScore}%`,
        `Score Range: ${lowestFailScore}% - ${highestFailScore}%`,
        `Status: Below ${thresholdLabel} threshold`
      ];

      failBreakdownInfo.forEach(info => {
        pdf.text(info, x, currentY);
        currentY += lineHeight;
      });
    } else {
      pdf.text('No failing tests found', x, currentY);
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
    } else if (title.includes('question analytics') || title.includes('question-analytics')) {
      return 'question-analytics';
    } else if (title.includes('retake analysis') || title.includes('retake-analysis')) {
      return 'retake-analysis';
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

  async _addChartImageToPDF(pdf, tileElement, x, y, width, height) {
    // Find the actual chart content within the tile, excluding header/title/controls
    let chartContent = tileElement.querySelector('.dashboard-tile-content');

    // Fallback to other possible chart content selectors
    if (!chartContent) {
      chartContent = tileElement.querySelector('.chart-content') ||
                    tileElement.querySelector('canvas')?.parentElement ||
                    tileElement.querySelector('svg')?.parentElement ||
                    tileElement;
    }

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
          // Pass/Fail Rate specific statistics using actual quiz thresholds
          const thresholds = rawData
            .map(result => result.passing_threshold || 70)
            .filter((threshold, index, arr) => arr.indexOf(threshold) === index);

          let passCount = 0;
          let failCount = 0;

          // Calculate pass/fail using actual thresholds from each quiz result
          rawData.forEach((result) => {
            const score = parseFloat(result.score_value) || 0;
            const threshold = (result.passing_threshold || 70) / 100; // Convert to decimal
            
            if (score >= threshold) {
              passCount++;
            } else {
              failCount++;
            }
          });

          const total = passCount + failCount;
          const passPercentage = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
          const failPercentage = total > 0 ? ((failCount / total) * 100).toFixed(1) : 0;

          // Create threshold display
          const thresholdLabel = thresholds.length > 1 
            ? `${Math.min(...thresholds)}%-${Math.max(...thresholds)}%`
            : `${thresholds[0]}%`;

          stats.push(
            { label: 'Pass Rate', value: `${passPercentage}%` },
            { label: 'Fail Rate', value: `${failPercentage}%` },
            { label: 'Pass Count', value: `${passCount}` },
            { label: 'Fail Count', value: `${failCount}` },
            { label: 'Total Tests', value: `${total}` },
            { label: 'Threshold', value: thresholdLabel }
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

  // Apply chart filtering using the same logic as dashboard components
  _applyChartFiltering(rawData, chartId, dashboardContext) {
    if (!rawData || !Array.isArray(rawData) || !dashboardContext) {
      return rawData || [];
    }

    // Import the filtering logic from dashboardFilters.js
    // For now, implement basic filtering logic here
    let filteredData = [...rawData];

    // Apply supervisor filter
    if (dashboardContext.supervisor) {
      const supervisorValue = typeof dashboardContext.supervisor === 'object'
        ? dashboardContext.supervisor.fullName || dashboardContext.supervisor.supervisor
        : dashboardContext.supervisor;

      filteredData = filteredData.filter(result =>
        result.supervisor === supervisorValue
      );
    }

    // Apply market filter
    if (dashboardContext.market) {
      const marketValue = typeof dashboardContext.market === 'object'
        ? dashboardContext.market.fullName || dashboardContext.market.id
        : dashboardContext.market;

      filteredData = filteredData.filter(result =>
        result.market === marketValue
      );
    }

    // Apply score range filter
    if (dashboardContext.scoreRange) {
      const { min, max } = dashboardContext.scoreRange;
      filteredData = filteredData.filter(result => {
        const score = (parseFloat(result.score_value) || 0) * 100;
        return score >= min && score <= max;
      });
    }

    // Add more filters as needed...

    return filteredData;
  }

  // Process Score Distribution data using the same logic as ScoreDistributionChart
  _processScoreDistributionData(filteredData) {
    if (!filteredData || filteredData.length === 0) return [];

    // Define score ranges exactly like the chart component
    const ranges = [
      { label: '0-20%', min: 0, max: 20, count: 0 },
      { label: '21-40%', min: 21, max: 40, count: 0 },
      { label: '41-60%', min: 41, max: 60, count: 0 },
      { label: '61-80%', min: 61, max: 80, count: 0 },
      { label: '81-100%', min: 81, max: 100, count: 0 }
    ];

    // Count scores in each range using the same logic as the chart
    filteredData.forEach(result => {
      const score = (parseFloat(result.score_value) || 0) * 100; // Convert to percentage

      // Find the appropriate range for this score using same logic as chart
      let targetRange = null;
      if (score <= 20) {
        targetRange = ranges[0]; // 0-20%
      } else if (score <= 40) {
        targetRange = ranges[1]; // 21-40%
      } else if (score <= 60) {
        targetRange = ranges[2]; // 41-60%
      } else if (score <= 80) {
        targetRange = ranges[3]; // 61-80%
      } else {
        targetRange = ranges[4]; // 81-100%
      }

      if (targetRange) {
        targetRange.count++;
      }
    });

    return ranges.map(range => ({
      id: range.label,
      range: range.label,
      count: range.count,
      percentage: filteredData.length > 0 ? ((range.count / filteredData.length) * 100).toFixed(1) : 0,
      min: range.min,
      max: range.max
    }));
  }

  // Helper method to extract processed data from chart components
  _extractChartData(tileElement, chartType) {
    try {
      // Look for chart data in various ways depending on chart type
      switch (chartType) {
        case 'score-distribution':
          return this._extractScoreDistributionData(tileElement);
        case 'time-distribution':
          return this._extractTimeDistributionData(tileElement);
        case 'supervisor-performance':
          return this._extractSupervisorPerformanceData(tileElement);
        // Add more chart types as needed
        default:
          console.warn(`Chart data extraction not implemented for type: ${chartType}`);
          return null;
      }
    } catch (error) {
      console.error(`Error extracting chart data for ${chartType}:`, error);
      return null;
    }
  }

  // Extract Score Distribution chart data
  _extractScoreDistributionData(tileElement) {
    // Try to find the chart component's data
    // Look for data attributes or React component state
    const chartContainer = tileElement.querySelector('.dashboard-tile-content');
    if (!chartContainer) return null;

    // For now, return null to fall back to raw data processing
    // This will be enhanced to extract actual React component data
    return null;
  }

  // Extract Time Distribution chart data
  _extractTimeDistributionData(tileElement) {
    return null; // Placeholder
  }

  // Extract Supervisor Performance chart data
  _extractSupervisorPerformanceData(tileElement) {
    return null; // Placeholder
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
