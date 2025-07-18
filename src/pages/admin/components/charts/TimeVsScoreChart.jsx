import React, { useMemo, useState } from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { filterDataForChart } from '../../utils/dashboardFilters';

const TimeVsScoreChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getFiltersForChart, getCombinedFilters, shouldFilterChart } = useDashboardFilters();

  // Efficiency quadrant analysis
  const [showQuadrants, setShowQuadrants] = useState(true);
  const [quadrantThresholds, setQuadrantThresholds] = useState({
    scoreThreshold: 80, // 80% score threshold
    timeThreshold: 10   // 10 minutes time threshold
  });

  // Get filtered data (includes hover filters from other charts, excludes own hover)
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('time-vs-score');
    const shouldFilter = shouldFilterChart('time-vs-score');
    return filterDataForChart(data, filters, 'time-vs-score', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data for scatter plot with quadrant analysis
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Convert data to scatter plot format with quadrant classification
    const scatterData = filteredData
      .filter(result => result.time_taken && result.score_value)
      .map(result => {
        const timeMinutes = parseInt(result.time_taken) / 60;
        const scorePercent = parseFloat(result.score_value) * 100;

        // Classify into efficiency quadrants
        const isHighScore = scorePercent >= quadrantThresholds.scoreThreshold;
        const isFastTime = timeMinutes <= quadrantThresholds.timeThreshold;

        let quadrant, color, efficiency;
        if (isHighScore && isFastTime) {
          quadrant = 'High Score, Fast Time';
          color = '#10b981'; // Green - Optimal
          efficiency = 'optimal';
        } else if (isHighScore && !isFastTime) {
          quadrant = 'High Score, Slow Time';
          color = '#3b82f6'; // Blue - Thorough
          efficiency = 'thorough';
        } else if (!isHighScore && isFastTime) {
          quadrant = 'Low Score, Fast Time';
          color = '#f59e0b'; // Orange - Rushed
          efficiency = 'rushed';
        } else {
          quadrant = 'Low Score, Slow Time';
          color = '#ef4444'; // Red - Struggling
          efficiency = 'struggling';
        }

        return {
          x: timeMinutes,
          y: scorePercent,
          supervisor: result.supervisor || 'Unknown',
          market: result.market || 'Unknown',
          date: result.date_of_test,
          ldap: result.ldap || 'Unknown',
          quadrant,
          efficiency,
          color
        };
      })
      .filter(point => point.x > 0 && point.y >= 0 && point.x <= 30) // Filter outliers
      .slice(0, 200); // Limit for performance

    return [{ id: 'time_vs_score', data: scatterData }];
  }, [filteredData, quadrantThresholds]);

  // Calculate quadrant statistics
  const quadrantStats = useMemo(() => {
    if (!chartData[0]?.data) return {};

    const stats = {
      optimal: { count: 0, percentage: 0 },
      thorough: { count: 0, percentage: 0 },
      rushed: { count: 0, percentage: 0 },
      struggling: { count: 0, percentage: 0 }
    };

    const total = chartData[0].data.length;
    chartData[0].data.forEach(point => {
      stats[point.efficiency].count++;
    });

    Object.keys(stats).forEach(key => {
      stats[key].percentage = ((stats[key].count / total) * 100).toFixed(1);
    });

    return stats;
  }, [chartData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  if (chartData.length === 0 || chartData[0].data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" style={{ height: '275px' }}>
      {/* Quadrant Controls */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <button
          onClick={() => setShowQuadrants(!showQuadrants)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            showQuadrants
              ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle efficiency quadrants"
        >
          <FaExpand size={10} />
          Quadrants
        </button>

        {showQuadrants && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600 px-2 py-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Score:</span>
              <input
                type="number"
                value={quadrantThresholds.scoreThreshold}
                onChange={(e) => setQuadrantThresholds(prev => ({
                  ...prev,
                  scoreThreshold: parseInt(e.target.value) || 80
                }))}
                className="w-12 text-xs px-1 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                min="0"
                max="100"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">%</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Time:</span>
              <input
                type="number"
                value={quadrantThresholds.timeThreshold}
                onChange={(e) => setQuadrantThresholds(prev => ({
                  ...prev,
                  timeThreshold: parseInt(e.target.value) || 10
                }))}
                className="w-12 text-xs px-1 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                min="1"
                max="30"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">min</span>
            </div>
          </div>
        )}
      </div>

      {/* Quadrant Statistics */}
      {showQuadrants && (
        <div className="absolute top-2 right-2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Efficiency Analysis</div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Optimal: {quadrantStats.optimal?.percentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Thorough: {quadrantStats.thorough?.percentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>Rushed: {quadrantStats.rushed?.percentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Struggling: {quadrantStats.struggling?.percentage}%</span>
            </div>
          </div>
        </div>
      )}

      <ResponsiveScatterPlot
        data={chartData}
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        xScale={{ type: 'linear', min: 0, max: 'auto' }}
        yScale={{ type: 'linear', min: 0, max: 100 }}
        blendMode="multiply"
        nodeSize={8}
        colors={{ datum: 'color' }}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 12,
            fill: isDark ? '#e2e8f0' : '#475569',
          },
          axis: {
            domain: {
              line: {
                stroke: isDark ? '#475569' : '#cbd5e1',
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 12,
                fill: isDark ? '#e2e8f0' : '#475569',
              },
            },
            ticks: {
              line: {
                stroke: isDark ? '#475569' : '#cbd5e1',
                strokeWidth: 1,
              },
              text: {
                fontSize: 11,
                fill: isDark ? '#e2e8f0' : '#475569',
              },
            },
          },
          grid: {
            line: {
              stroke: isDark ? '#374151' : '#f1f5f9',
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#475569',
              fontSize: 12,
              borderRadius: 6,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
            },
          },
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Time Taken (minutes)',
          legendOffset: 40,
          legendPosition: 'middle',
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Score (%)',
          legendOffset: -50,
          legendPosition: 'middle',
        }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={({ node }) => {
          // Calculate efficiency score (higher score in less time = more efficient)
          const efficiency = (node.data.y / node.data.x).toFixed(1);

          // Determine performance category
          let performanceCategory = 'Average';
          let timeCategory = 'Normal';

          if (node.data.y >= 90) performanceCategory = 'Excellent';
          else if (node.data.y >= 80) performanceCategory = 'Good';
          else if (node.data.y >= 70) performanceCategory = 'Fair';
          else performanceCategory = 'Needs Improvement';

          if (node.data.x <= 5) timeCategory = 'Very Fast';
          else if (node.data.x <= 10) timeCategory = 'Fast';
          else if (node.data.x <= 15) timeCategory = 'Normal';
          else if (node.data.x <= 20) timeCategory = 'Slow';
          else timeCategory = 'Very Slow';

          // Calculate comparison to ideal (high score, low time)
          const idealScore = 95;
          const idealTime = 8;
          const distanceFromIdeal = Math.sqrt(
            Math.pow(idealScore - node.data.y, 2) +
            Math.pow(idealTime - node.data.x, 2)
          ).toFixed(1);

          const data = [
            { label: 'Score', value: `${node.data.y.toFixed(1)}%` },
            { label: 'Time Taken', value: `${node.data.x.toFixed(1)} min` },
            { label: 'Efficiency', value: `${efficiency} pts/min` },
            { label: 'Performance', value: performanceCategory },
            { label: 'Speed', value: timeCategory },
            { label: 'Supervisor', value: node.data.supervisor },
            { label: 'Market', value: node.data.market }
          ];

          return (
            <EnhancedTooltip
              title="Quiz Performance"
              data={data}
              icon={true}
              color={node.data.color}
              additionalInfo={`Efficiency Category: ${node.data.quadrant}`}
            />
          );
        }}

      />

      {/* Quadrant Labels (simplified approach) */}
      {showQuadrants && (
        <div className="absolute top-16 left-16 z-10 text-xs font-bold space-y-1 bg-white dark:bg-slate-800 rounded p-2 shadow-sm border border-slate-200 dark:border-slate-600">
          <div className="text-slate-600 dark:text-slate-400 mb-1">Efficiency Quadrants:</div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-600 dark:text-green-400">OPTIMAL (Fast + High Score)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-blue-600 dark:text-blue-400">THOROUGH (Slow + High Score)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-orange-600 dark:text-orange-400">RUSHED (Fast + Low Score)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-600 dark:text-red-400">STRUGGLING (Slow + Low Score)</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thresholds: {quadrantThresholds.scoreThreshold}% score, {quadrantThresholds.timeThreshold}min time
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeVsScoreChart;
