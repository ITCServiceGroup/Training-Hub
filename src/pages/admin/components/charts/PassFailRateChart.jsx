import React, { useMemo, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import { filterDataForChart, createPassFailClassificationFilter } from '../../utils/dashboardFilters';
import EnhancedTooltip from './EnhancedTooltip';

const PassFailRateChart = ({ data = [], loading = false }) => {
  const { isDark } = useTheme();
  const {
    getFiltersForChart,
    shouldFilterChart,
    drillDown,
    applyHoverFilter
  } = useDashboardFilters();

  // Filter data for this chart (includes hover filters from other charts, excludes own hover)
  const chartFilteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    try {
      const filters = getFiltersForChart('pass-fail-rate');
      const shouldFilter = shouldFilterChart('pass-fail-rate');

      // Use the standard filtering utility that handles all filter types correctly
      return filterDataForChart(data, filters, 'pass-fail-rate', shouldFilter);
    } catch (error) {
      console.warn('Error filtering chart data:', error);
      return [];
    }
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data for pass/fail analysis using clean quiz-specific thresholds
  const chartData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return [];

    console.log('PassFailRateChart: Analyzing', chartFilteredData.length, 'records');
    
    // Analyze quiz breakdown
    const quizBreakdown = {};
    chartFilteredData.forEach(record => {
      const quizTitle = record.quiz_title || 'Unknown Quiz';
      if (!quizBreakdown[quizTitle]) {
        quizBreakdown[quizTitle] = {
          total: 0,
          pass: 0,
          fail: 0,
          passing_score: record.passing_score || null,
          has_metadata: record.has_quiz_metadata || false
        };
      }
      
      const quiz = quizBreakdown[quizTitle];
      quiz.total++;
      
      // Simple pass/fail calculation: score_value >= passing_score (both decimal 0-1)
      const score = parseFloat(record.score_value) || 0;
      const passingScore = record.passing_score;
      if (passingScore == null) return; // Skip records without threshold
      const isPassing = score >= passingScore;
      
      if (isPassing) {
        quiz.pass++;
      } else {
        quiz.fail++;
      }
    });

    console.log('PassFailRateChart: Quiz breakdown:', quizBreakdown);

    // Calculate overall totals
    let totalPass = 0;
    let totalFail = 0;
    
    Object.values(quizBreakdown).forEach(quiz => {
      totalPass += quiz.pass;
      totalFail += quiz.fail;
    });

    const grandTotal = totalPass + totalFail;
    if (grandTotal === 0) return [];

    // Determine if we have multiple quizzes
    const uniqueQuizzes = Object.keys(quizBreakdown);
    const isMultiQuiz = uniqueQuizzes.length > 1;

    // Create display label for thresholds
    const thresholds = [...new Set(Object.values(quizBreakdown).map(q => Math.round(q.passing_score * 100)).filter(t => !isNaN(t)))];
    const thresholdLabel = thresholds.length > 1 
      ? `${Math.min(...thresholds)}%-${Math.max(...thresholds)}%`
      : `${thresholds[0]}%`;

    // Store quiz breakdown for multi-quiz display
    const quizStats = Object.entries(quizBreakdown).map(([title, stats]) => ({
      title,
      passRate: ((stats.pass / stats.total) * 100).toFixed(1),
      total: stats.total,
      pass: stats.pass,
      fail: stats.fail,
      threshold: Math.round(stats.passing_score * 100),
      hasMetadata: stats.has_metadata
    }));

    console.log('PassFailRateChart: Final results:', {
      totalPass,
      totalFail,
      grandTotal,
      isMultiQuiz,
      quizStats
    });

    const chartDataResult = [
      {
        id: 'pass',
        label: 'Pass',
        value: totalPass,
        percentage: ((totalPass / grandTotal) * 100).toFixed(1),
        color: '#10b981', // Green
        thresholdLabel,
        isMultiQuiz,
        quizStats
      },
      {
        id: 'fail',
        label: 'Fail', 
        value: totalFail,
        percentage: ((totalFail / grandTotal) * 100).toFixed(1),
        color: '#ef4444', // Red
        thresholdLabel,
        isMultiQuiz,
        quizStats
      }
    ].filter(item => item.value > 0);

    return chartDataResult;
  }, [chartFilteredData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">No data available</div>
      </div>
    );
  }

  const passData = chartData.find(d => d.id === 'pass');
  const passRate = passData?.percentage || '0';
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  
  // Extract multi-quiz information
  const isMultiQuiz = passData?.isMultiQuiz || false;
  const quizStats = passData?.quizStats || [];

  // Handle pass/fail segment click for drill-down
  const handleSegmentClick = (segment) => {
    const classification = segment.id; // 'pass' or 'fail'
    const classificationFilter = createPassFailClassificationFilter(classification, chartFilteredData);

    drillDown('passFailClassification', classificationFilter, 'pass-fail-rate');
  };

  // Handle segment hover for cross-filtering
  const handleSegmentHover = (segment) => {
    if (segment) {
      const classification = segment.id; // 'pass' or 'fail'
      const classificationFilter = createPassFailClassificationFilter(classification, chartFilteredData);
      applyHoverFilter('passFailClassification', classificationFilter, 'pass-fail-rate');
    }
  };

  const handleSegmentLeave = () => {
    applyHoverFilter('passFailClassification', null, 'pass-fail-rate');
  };

  // State for hover on info box
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  return (
    <div className="h-full w-full relative">
      {/* Pass Rate Summary */}
      <div 
        className={`absolute top-2 left-2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-2 cursor-pointer transition-all duration-200 hover:shadow-md ${showDetailedInfo ? 'max-w-xs' : 'w-28'}`}
        onMouseEnter={() => setShowDetailedInfo(true)}
        onMouseLeave={() => setShowDetailedInfo(false)}
      >
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {showDetailedInfo ? (isMultiQuiz ? 'Overall Pass Rate' : 'Pass Rate') : 'Pass Rate'}
        </div>
        <div className={`text-lg font-bold ${parseFloat(passRate) >= 80 ? 'text-green-600' : parseFloat(passRate) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {passRate}%
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {showDetailedInfo ? `${total} total tests` : `${total} tests`}
        </div>
        
        {/* Hover hint for multi-quiz */}
        {isMultiQuiz && quizStats.length > 0 && !showDetailedInfo && (
          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Hover for details
          </div>
        )}
        
        {/* Multi-quiz breakdown - only show on hover */}
        {isMultiQuiz && quizStats.length > 0 && showDetailedInfo && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              Aggregated from {quizStats.length} quiz{quizStats.length !== 1 ? 'es' : ''}:
            </div>
            {quizStats.map((quiz, index) => (
              <div key={index} className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                <div className="font-medium truncate" title={quiz.title}>
                  {quiz.title}
                </div>
                <div>
                  {quiz.passRate}% pass rate
                </div>
                <div>
                  {quiz.threshold}% threshold
                </div>
                <div className="text-slate-400 dark:text-slate-500">
                  {quiz.pass}/{quiz.total} passing
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={chartData.map(d => d.color)}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 12,
            fill: isDark ? '#e2e8f0' : '#475569',
          },
          tooltip: {
            container: {
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#475569',
              fontSize: 12,
              borderRadius: 6,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
              zIndex: 9999,
            },
          },
        }}
        borderWidth={2}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.3]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={isDark ? '#e2e8f0' : '#475569'}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]],
        }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        onClick={handleSegmentClick}
        onMouseEnter={handleSegmentHover}
        onMouseLeave={handleSegmentLeave}
        tooltip={({ datum }) => {
          const isPassing = datum.id === 'pass';
          // Get thresholdLabel from our chartData since Nivo doesn't pass custom fields
          const chartDataItem = chartData.find(d => d.id === datum.id);
          const thresholdLabel = chartDataItem?.thresholdLabel || '70%';
          
          const tooltipData = [
            { label: 'Result', value: datum.label },
            { label: 'Count', value: datum.value },
            { label: 'Percentage', value: `${chartDataItem?.percentage || '0'}%` },
            { label: 'Thresholds', value: thresholdLabel }
          ];

          // Create contextual additional info based on threshold variety
          const additionalInfo = thresholdLabel.includes('-')
            ? `Quiz-specific thresholds: ${thresholdLabel}`
            : `${isPassing ? 'Meeting' : 'Below'} ${thresholdLabel} threshold`;

          return (
            <EnhancedTooltip
              title="Pass/Fail Analysis"
              data={tooltipData}
              icon={true}
              color={datum.color}
              additionalInfo={additionalInfo}
            />
          );
        }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 20,
            itemWidth: 60,
            itemHeight: 18,
            itemTextColor: isDark ? '#e2e8f0' : '#475569',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle',
          },
        ]}
      />
    </div>
  );
};

export default PassFailRateChart;
