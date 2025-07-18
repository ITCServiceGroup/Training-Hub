import React, { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useDashboardFilters = useDashboard;

export const DashboardProvider = ({ children }) => {
  // Drill-down state
  const [drillDownState, setDrillDownState] = useState({
    supervisor: null,
    market: null,
    timeRange: null,
    scoreRange: null,
    quizType: null,
    question: null,
    breadcrumbs: []
  });

  // Cross-filtering state
  const [crossFilters, setCrossFilters] = useState({
    supervisor: null,
    market: null,
    timeRange: null,
    scoreRange: null,
    quizType: null,
    question: null,
    sourceChart: null // Track which chart initiated the filter
  });

  // Temporary hover cross-filters (don't show in breadcrumbs)
  const [hoverFilters, setHoverFilters] = useState({
    supervisor: null,
    market: null,
    timeRange: null,
    scoreRange: null,
    quizType: null,
    question: null,
    sourceChart: null
  });

  // Brush selection state for trend charts
  const [brushSelection, setBrushSelection] = useState({
    timeRange: null,
    sourceChart: null
  });

  // Active drill-down level
  const [drillLevel, setDrillLevel] = useState(0); // 0 = overview, 1 = first drill, 2 = second drill, etc.

  // Handle drill-down actions
  const drillDown = useCallback((type, value, sourceChart) => {
    setDrillDownState(prev => {
      const newState = { ...prev };
      const newBreadcrumbs = [...prev.breadcrumbs];

      switch (type) {
        case 'supervisor':
          // Store the fullName for filtering (this is what matches the raw data)
          newState.supervisor = value.fullName || value;
          newBreadcrumbs.push({
            type: 'supervisor',
            value: value.fullName || value,
            label: `Supervisor: ${value.fullName || value}`,
            sourceChart
          });
          break;
        case 'market':
          // Store the fullName for filtering (this is what matches the raw data)
          newState.market = value.fullName || value;
          newBreadcrumbs.push({
            type: 'market',
            value: value.fullName || value,
            label: `Market: ${value.fullName || value}`,
            sourceChart
          });
          break;
        case 'timeRange':
          newState.timeRange = value;
          newBreadcrumbs.push({
            type: 'timeRange',
            value,
            label: `Time: ${value.label}`,
            sourceChart
          });
          break;
        case 'scoreRange':
          newState.scoreRange = value;
          newBreadcrumbs.push({
            type: 'scoreRange',
            value,
            label: `Score: ${value.label}`,
            sourceChart
          });
          break;
        case 'quizType':
          newState.quizType = value.fullName || value;
          newBreadcrumbs.push({
            type: 'quizType',
            value: value.fullName || value,
            label: `Quiz: ${value.fullName || value}`,
            sourceChart
          });
          break;
        case 'question':
          newState.question = value;
          newBreadcrumbs.push({
            type: 'question',
            value,
            label: `Question: ${value.questionId}`,
            sourceChart
          });
          break;
        default:
          break;
      }

      newState.breadcrumbs = newBreadcrumbs;
      return newState;
    });

    setDrillLevel(prev => prev + 1);
  }, []);

  // Handle hover cross-filtering (temporary filters for visual feedback only)
  const applyHoverFilter = useCallback((type, value, sourceChart) => {
    if (value === null) {
      // Clear all hover filters when hovering stops
      setHoverFilters({
        supervisor: null,
        market: null,
        timeRange: null,
        scoreRange: null,
        quizType: null,
        question: null,
        sourceChart: null
      });
    } else {
      // Only apply hover filter if there's no existing drill-down or cross-filter for this type
      // This ensures drill-down filters are preserved during hover
      setHoverFilters({
        supervisor: type === 'supervisor' ? value : null,
        market: type === 'market' ? value : null,
        timeRange: type === 'timeRange' ? value : null,
        scoreRange: type === 'scoreRange' ? value : null,
        quizType: type === 'quizType' ? value : null,
        question: type === 'question' ? value : null,
        sourceChart
      });
    }
  }, []);

  // Handle persistent cross-filtering (shows in breadcrumbs)
  const applyCrossFilter = useCallback((type, value, sourceChart) => {
    setCrossFilters({
      supervisor: type === 'supervisor' ? value : null,
      market: type === 'market' ? value : null,
      timeRange: type === 'timeRange' ? value : null,
      scoreRange: type === 'scoreRange' ? value : null,
      sourceChart: value ? sourceChart : null
    });
  }, []);

  // Handle brush selection for trend charts
  const applyBrushSelection = useCallback((timeRange, sourceChart) => {
    setBrushSelection({
      timeRange,
      sourceChart: timeRange ? sourceChart : null
    });
  }, []);

  // Clear brush selection
  const clearBrushSelection = useCallback(() => {
    setBrushSelection({
      timeRange: null,
      sourceChart: null
    });
  }, []);

  // Clear cross-filters
  const clearCrossFilters = useCallback(() => {
    setCrossFilters({
      supervisor: null,
      market: null,
      timeRange: null,
      scoreRange: null,
      quizType: null,
      question: null,
      sourceChart: null
    });
    setHoverFilters({
      supervisor: null,
      market: null,
      timeRange: null,
      scoreRange: null,
      quizType: null,
      question: null,
      sourceChart: null
    });
    clearBrushSelection();
  }, [clearBrushSelection]);

  // Navigate back in drill-down
  const drillBack = useCallback((targetLevel = null) => {
    if (targetLevel !== null) {
      // Navigate to specific level
      const targetBreadcrumbs = drillDownState.breadcrumbs.slice(0, targetLevel);
      setDrillDownState(prev => ({
        ...prev,
        breadcrumbs: targetBreadcrumbs,
        supervisor: targetBreadcrumbs.find(b => b.type === 'supervisor')?.value || null,
        market: targetBreadcrumbs.find(b => b.type === 'market')?.value || null,
        timeRange: targetBreadcrumbs.find(b => b.type === 'timeRange')?.value || null,
        scoreRange: targetBreadcrumbs.find(b => b.type === 'scoreRange')?.value || null,
        quizType: targetBreadcrumbs.find(b => b.type === 'quizType')?.value || null,
        question: targetBreadcrumbs.find(b => b.type === 'question')?.value || null
      }));
      setDrillLevel(targetLevel);
    } else {
      // Go back one level
      const newBreadcrumbs = drillDownState.breadcrumbs.slice(0, -1);
      const lastRemoved = drillDownState.breadcrumbs[drillDownState.breadcrumbs.length - 1];
      
      setDrillDownState(prev => {
        const newState = { ...prev, breadcrumbs: newBreadcrumbs };
        
        // Remove the last drill-down filter
        if (lastRemoved) {
          switch (lastRemoved.type) {
            case 'supervisor':
              newState.supervisor = null;
              break;
            case 'market':
              newState.market = null;
              break;
            case 'timeRange':
              newState.timeRange = null;
              break;
            case 'scoreRange':
              newState.scoreRange = null;
              break;
            case 'quizType':
              newState.quizType = null;
              break;
            case 'question':
              newState.question = null;
              break;
          }
        }
        
        return newState;
      });
      setDrillLevel(prev => Math.max(0, prev - 1));
    }
  }, [drillDownState.breadcrumbs]);

  // Reset all drill-down state
  const resetDrillDown = useCallback(() => {
    setDrillDownState({
      supervisor: null,
      market: null,
      timeRange: null,
      scoreRange: null,
      quizType: null,
      question: null,
      breadcrumbs: []
    });
    setDrillLevel(0);
    clearCrossFilters();
  }, [clearCrossFilters]);

  // Get combined filters (drill-down + cross-filters + hover filters + brush selection)
  const getCombinedFilters = useCallback(() => {
    // Drill-down filters take precedence and are always applied
    const baseFilters = {
      supervisor: drillDownState.supervisor,
      market: drillDownState.market,
      timeRange: drillDownState.timeRange || brushSelection.timeRange,
      scoreRange: drillDownState.scoreRange,
      quizType: drillDownState.quizType,
      question: drillDownState.question,
    };

    // Cross-filters are applied only if there's no corresponding drill-down filter
    const withCrossFilters = {
      supervisor: baseFilters.supervisor || crossFilters.supervisor,
      market: baseFilters.market || crossFilters.market,
      timeRange: baseFilters.timeRange || crossFilters.timeRange,
      scoreRange: baseFilters.scoreRange || crossFilters.scoreRange,
      quizType: baseFilters.quizType || crossFilters.quizType,
      question: baseFilters.question || crossFilters.question,
    };

    // Hover filters are additive - they add additional constraints but don't override existing filters
    const finalFilters = {
      supervisor: withCrossFilters.supervisor,
      market: withCrossFilters.market,
      timeRange: withCrossFilters.timeRange,
      scoreRange: withCrossFilters.scoreRange,
      quizType: withCrossFilters.quizType,
      question: withCrossFilters.question,
    };

    // Add hover filters as additional constraints (only if they don't conflict with existing filters)
    if (hoverFilters.supervisor && !finalFilters.supervisor) {
      finalFilters.supervisor = hoverFilters.supervisor;
    }
    if (hoverFilters.market && !finalFilters.market) {
      finalFilters.market = hoverFilters.market;
    }
    if (hoverFilters.timeRange && !finalFilters.timeRange) {
      finalFilters.timeRange = hoverFilters.timeRange;
    }
    if (hoverFilters.scoreRange && !finalFilters.scoreRange) {
      finalFilters.scoreRange = hoverFilters.scoreRange;
    }
    if (hoverFilters.quizType && !finalFilters.quizType) {
      finalFilters.quizType = hoverFilters.quizType;
    }
    if (hoverFilters.question && !finalFilters.question) {
      finalFilters.question = hoverFilters.question;
    }

    return {
      ...finalFilters,
      isDrillDown: drillLevel > 0,
      isCrossFiltered: crossFilters.sourceChart !== null,
      isHoverFiltered: hoverFilters.sourceChart !== null,
      isBrushSelected: brushSelection.sourceChart !== null
    };
  }, [drillDownState, crossFilters, hoverFilters, brushSelection, drillLevel]);

  // Get base filters (drill-down + cross-filters + brush, excluding hover)
  const getBaseFilters = useCallback(() => {
    return {
      supervisor: drillDownState.supervisor || crossFilters.supervisor,
      market: drillDownState.market || crossFilters.market,
      timeRange: drillDownState.timeRange || crossFilters.timeRange || brushSelection.timeRange,
      scoreRange: drillDownState.scoreRange || crossFilters.scoreRange,
      quizType: drillDownState.quizType || crossFilters.quizType,
      question: drillDownState.question || crossFilters.question,
      isDrillDown: drillLevel > 0,
      isCrossFiltered: crossFilters.sourceChart !== null,
      isBrushSelected: brushSelection.sourceChart !== null
    };
  }, [drillDownState, crossFilters, brushSelection, drillLevel]);

  // Get filters for a specific chart (includes hover filters from other charts)
  const getFiltersForChart = useCallback((chartId) => {
    const baseFilters = getBaseFilters();
    const combined = getCombinedFilters();

    // If this chart is the source of hover filtering, use base filters only
    if (hoverFilters.sourceChart === chartId) {
      return baseFilters;
    }

    // If this chart is the source of cross-filtering or brush selection, use base filters only
    if ((baseFilters.isCrossFiltered && crossFilters.sourceChart === chartId) ||
        (baseFilters.isBrushSelected && brushSelection.sourceChart === chartId)) {
      return baseFilters;
    }

    // For all other charts, include hover filters from other charts
    return combined;
  }, [getBaseFilters, getCombinedFilters, hoverFilters.sourceChart, crossFilters.sourceChart, brushSelection.sourceChart]);

  // Check if data should be filtered for a specific chart
  const shouldFilterChart = useCallback((chartId) => {
    const filters = getFiltersForChart(chartId);
    return filters.supervisor || filters.market || filters.timeRange || filters.scoreRange || filters.quizType || filters.question;
  }, [getFiltersForChart]);

  const value = {
    // State
    drillDownState,
    crossFilters,
    hoverFilters,
    brushSelection,
    drillLevel,

    // Actions
    drillDown,
    drillBack,
    resetDrillDown,
    applyCrossFilter,
    applyHoverFilter,
    applyBrushSelection,
    clearCrossFilters,
    clearBrushSelection,

    // Utilities
    getCombinedFilters,
    getBaseFilters,
    getFiltersForChart,
    shouldFilterChart
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
