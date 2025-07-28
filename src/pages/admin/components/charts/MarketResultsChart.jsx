import { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { filterDataForChart, shouldShowDrillDownIndicators } from '../../utils/dashboardFilters';

const MarketResultsChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getFiltersForChart, getCombinedFilters, shouldFilterChart, drillDown, applyHoverFilter } = useDashboardFilters();

  // Get filtered data (includes hover filters from other charts, excludes own hover)
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('market-results');
    const shouldFilter = shouldFilterChart('market-results');
    return filterDataForChart(data, filters, 'market-results', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data by market
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Group by market and calculate averages
    const marketGroups = {};

    filteredData.forEach(result => {
      const market = result.market || 'Unknown';
      
      if (!marketGroups[market]) {
        marketGroups[market] = {
          scores: [],
          count: 0
        };
      }
      
      const score = parseFloat(result.score_value) || 0;
      marketGroups[market].scores.push(score);
      marketGroups[market].count++;
    });

    // Calculate averages and format for pie chart
    const marketData = Object.entries(marketGroups)
      .map(([market, group]) => {
        const average = group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length;
        return {
          id: market,
          label: market.length > 12 ? market.substring(0, 12) + '...' : market,
          fullName: market,
          value: group.count,
          averageScore: (average * 100).toFixed(1),
          count: group.count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 markets

    return marketData;
  }, [filteredData]);

  // Handle market click for drill-down
  const handleMarketClick = (marketData) => {
    drillDown('market', {
      fullName: marketData.data.fullName,
      id: marketData.data.id
    }, 'market-results');
  };

  // Handle market hover for cross-filtering
  const handleMarketHover = (marketData) => {
    if (marketData) {
      applyHoverFilter('market', marketData.data.fullName, 'market-results');
    }
  };

  const handleMarketLeave = () => {
    // Clear hover filter when mouse leaves
    applyHoverFilter('market', null, 'market-results');
  };

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

  const colors = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'
  ];

  return (
    <div className="h-full w-full">
      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={colors}
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
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
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
        onClick={handleMarketClick}
        onMouseEnter={handleMarketHover}
        onMouseLeave={handleMarketLeave}
        tooltip={({ datum }) => {
          const combinedFilters = getCombinedFilters();
          const canDrillDown = shouldShowDrillDownIndicators('market-results', combinedFilters);

          // Calculate market performance vs others
          const allMarkets = chartData;
          const totalTests = allMarkets.reduce((sum, market) => sum + market.value, 0);
          const marketShare = ((datum.value / totalTests) * 100).toFixed(1);

          // Find market ranking
          const sortedMarkets = [...allMarkets].sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));
          const ranking = sortedMarkets.findIndex(m => m.id === datum.data.id) + 1;

          // Calculate comparison to average
          const overallAverage = allMarkets.reduce((sum, market) =>
            sum + (parseFloat(market.averageScore) * market.value), 0) / totalTests;
          const comparison = {
            period: 'all markets',
            change: ((parseFloat(datum.data.averageScore) - overallAverage) / overallAverage * 100).toFixed(1),
            label: 'vs average'
          };

          const data = [
            { label: 'Market', value: datum.data.fullName },
            { label: 'Tests Taken', value: datum.value },
            { label: 'Average Score', value: `${datum.data.averageScore}%` },
            { label: 'Market Share', value: `${marketShare}%` },
            { label: 'Ranking', value: `#${ranking} of ${allMarkets.length}` }
          ];

          return (
            <EnhancedTooltip
              title="Market Performance"
              data={data}
              icon={true}
              color={datum.color}
              comparison={comparison}
              showDrillDown={canDrillDown}
              drillDownText="Click to drill down to this market"
              additionalInfo={`This market represents ${marketShare}% of all test activity`}
            />
          );
        }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 60,
            translateY: 0,
            itemsSpacing: 2,
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

export default MarketResultsChart;
