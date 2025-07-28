import React, { useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';

const RetakeAnalysisChart = ({ data = [], loading = false }) => {
  const { isDark } = useTheme();
  const { getFiltersForChart, shouldFilterChart } = useDashboardFilters();

  // Filter data for this chart (includes hover filters from other charts, excludes own hover)
  const chartFilteredData = useMemo(() => {
    const filters = getFiltersForChart('retake-analysis');
    const shouldFilter = shouldFilterChart('retake-analysis');

    if (!shouldFilter) return data;

    return data.filter(result => {
      if (filters.supervisor && result.supervisor !== filters.supervisor) return false;
      if (filters.market && result.market !== filters.market) return false;
      if (filters.timeRange) {
        const resultDate = new Date(result.date_of_test);
        const startDate = new Date(filters.timeRange.startDate);
        const endDate = new Date(filters.timeRange.endDate);
        if (resultDate < startDate || resultDate > endDate) return false;
      }
      if (filters.quizType && result.quiz_type !== filters.quizType) return false;
      return true;
    });
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process retake flow data
  const sankeyData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return { nodes: [], links: [] };

    // Group by user and quiz type to track retake patterns
    const userQuizGroups = {};
    
    chartFilteredData.forEach(result => {
      const key = `${result.ldap}-${result.quiz_type}`;
      if (!userQuizGroups[key]) {
        userQuizGroups[key] = {
          attempts: [],
          user: result.ldap,
          quizType: result.quiz_type
        };
      }
      
      const score = parseFloat(result.score_value) || 0;
      const threshold = result.passing_score;
      const passed = threshold != null ? score >= threshold : false;
      
      userQuizGroups[key].attempts.push({
        score: score,
        date: result.date_of_test,
        passed: passed
      });
    });

    // Sort attempts by date for each user-quiz combination
    Object.values(userQuizGroups).forEach(group => {
      group.attempts.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Count flow patterns
    const flowCounts = {
      'First Attempt': { pass: 0, fail: 0 },
      'Second Attempt': { pass: 0, fail: 0 },
      'Third Attempt': { pass: 0, fail: 0 },
      'Fourth+ Attempt': { pass: 0, fail: 0 }
    };

    Object.values(userQuizGroups).forEach(group => {
      group.attempts.forEach((attempt, index) => {
        let attemptLabel;
        if (index === 0) attemptLabel = 'First Attempt';
        else if (index === 1) attemptLabel = 'Second Attempt';
        else if (index === 2) attemptLabel = 'Third Attempt';
        else attemptLabel = 'Fourth+ Attempt';

        if (attempt.passed) {
          flowCounts[attemptLabel].pass++;
        } else {
          flowCounts[attemptLabel].fail++;
        }
      });
    });

    // Create nodes
    const nodes = [
      // Attempt nodes
      { id: 'First Attempt', color: '#3b82f6' },
      { id: 'Second Attempt', color: '#f59e0b' },
      { id: 'Third Attempt', color: '#ef4444' },
      { id: 'Fourth+ Attempt', color: '#dc2626' },
      
      // Outcome nodes
      { id: 'Pass - 1st Try', color: '#10b981' },
      { id: 'Pass - 2nd Try', color: '#059669' },
      { id: 'Pass - 3rd Try', color: '#047857' },
      { id: 'Pass - 4th+ Try', color: '#065f46' },
      { id: 'Fail - 1st Try', color: '#f87171' },
      { id: 'Fail - 2nd Try', color: '#ef4444' },
      { id: 'Fail - 3rd Try', color: '#dc2626' },
      { id: 'Fail - 4th+ Try', color: '#b91c1c' },
      
      // Final outcomes
      { id: 'Eventually Passed', color: '#10b981' },
      { id: 'Never Passed', color: '#ef4444' }
    ];

    // Create links
    const links = [];

    // Links from attempts to immediate outcomes
    if (flowCounts['First Attempt'].pass > 0) {
      links.push({
        source: 'First Attempt',
        target: 'Pass - 1st Try',
        value: flowCounts['First Attempt'].pass
      });
    }
    if (flowCounts['First Attempt'].fail > 0) {
      links.push({
        source: 'First Attempt',
        target: 'Fail - 1st Try',
        value: flowCounts['First Attempt'].fail
      });
    }
    if (flowCounts['Second Attempt'].pass > 0) {
      links.push({
        source: 'Second Attempt',
        target: 'Pass - 2nd Try',
        value: flowCounts['Second Attempt'].pass
      });
    }
    if (flowCounts['Second Attempt'].fail > 0) {
      links.push({
        source: 'Second Attempt',
        target: 'Fail - 2nd Try',
        value: flowCounts['Second Attempt'].fail
      });
    }
    if (flowCounts['Third Attempt'].pass > 0) {
      links.push({
        source: 'Third Attempt',
        target: 'Pass - 3rd Try',
        value: flowCounts['Third Attempt'].pass
      });
    }
    if (flowCounts['Third Attempt'].fail > 0) {
      links.push({
        source: 'Third Attempt',
        target: 'Fail - 3rd Try',
        value: flowCounts['Third Attempt'].fail
      });
    }
    if (flowCounts['Fourth+ Attempt'].pass > 0) {
      links.push({
        source: 'Fourth+ Attempt',
        target: 'Pass - 4th+ Try',
        value: flowCounts['Fourth+ Attempt'].pass
      });
    }
    if (flowCounts['Fourth+ Attempt'].fail > 0) {
      links.push({
        source: 'Fourth+ Attempt',
        target: 'Fail - 4th+ Try',
        value: flowCounts['Fourth+ Attempt'].fail
      });
    }

    // Calculate final outcomes
    let eventuallyPassed = 0;
    let neverPassed = 0;

    Object.values(userQuizGroups).forEach(group => {
      const finalPassed = group.attempts.some(attempt => attempt.passed);
      if (finalPassed) {
        eventuallyPassed++;
      } else {
        neverPassed++;
      }
    });

    // Links to final outcomes
    const totalPasses = flowCounts['First Attempt'].pass + flowCounts['Second Attempt'].pass + 
                       flowCounts['Third Attempt'].pass + flowCounts['Fourth+ Attempt'].pass;
    
    if (totalPasses > 0) {
      links.push({
        source: 'Pass - 1st Try',
        target: 'Eventually Passed',
        value: flowCounts['First Attempt'].pass
      });
      if (flowCounts['Second Attempt'].pass > 0) {
        links.push({
          source: 'Pass - 2nd Try',
          target: 'Eventually Passed',
          value: flowCounts['Second Attempt'].pass
        });
      }
      if (flowCounts['Third Attempt'].pass > 0) {
        links.push({
          source: 'Pass - 3rd Try',
          target: 'Eventually Passed',
          value: flowCounts['Third Attempt'].pass
        });
      }
      if (flowCounts['Fourth+ Attempt'].pass > 0) {
        links.push({
          source: 'Pass - 4th+ Try',
          target: 'Eventually Passed',
          value: flowCounts['Fourth+ Attempt'].pass
        });
      }
    }

    if (neverPassed > 0) {
      // For users who never passed, link their final failed attempt
      links.push({
        source: 'Fail - 1st Try',
        target: 'Never Passed',
        value: Math.max(0, neverPassed - flowCounts['Second Attempt'].fail - flowCounts['Third Attempt'].fail - flowCounts['Fourth+ Attempt'].fail)
      });
      if (flowCounts['Second Attempt'].fail > 0) {
        links.push({
          source: 'Fail - 2nd Try',
          target: 'Never Passed',
          value: Math.min(flowCounts['Second Attempt'].fail, neverPassed)
        });
      }
    }

    // Filter out links with zero values and nodes that aren't used
    const validLinks = links.filter(link => link.value > 0);
    const usedNodeIds = new Set();
    validLinks.forEach(link => {
      usedNodeIds.add(link.source);
      usedNodeIds.add(link.target);
    });
    const validNodes = nodes.filter(node => usedNodeIds.has(node.id));

    return {
      nodes: validNodes,
      links: validLinks
    };
  }, [chartFilteredData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  if (sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">No retake data available</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Legend - Horizontal layout at top */}
      <div className="absolute top-2 left-2 right-2 z-10 p-1">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">Retake Flow:</span>
          <span className="text-slate-600 dark:text-slate-400">Flow shows attempt → outcome patterns</span>
          <span className="text-slate-600 dark:text-slate-400">Width = number of users</span>
          <span className="text-slate-600 dark:text-slate-400">Green = passed, Red = failed</span>
        </div>
      </div>

      <ResponsiveSankey
        data={sankeyData}
        margin={{ top: 50, right: 180, bottom: 50, left: 120 }}
        align="justify"
        colors={{ scheme: 'category10' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={30}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.8]],
        }}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={20}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1]],
        }}
        animate={true}
        motionStiffness={140}
        motionDamping={13}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 11,
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
        tooltip={({ node, link }) => {
          if (node) {
            const isAttempt = node.id.includes('Attempt');
            const isOutcome = node.id.includes('Pass') || node.id.includes('Fail');
            const isFinal = node.id === 'Eventually Passed' || node.id === 'Never Passed';
            
            let tooltipData = [
              { label: 'Stage', value: node.id },
              { label: 'Users', value: node.value }
            ];

            if (isAttempt) {
              tooltipData.push({ label: 'Type', value: 'Attempt Stage' });
            } else if (isOutcome) {
              tooltipData.push({ label: 'Type', value: 'Immediate Outcome' });
            } else if (isFinal) {
              tooltipData.push({ label: 'Type', value: 'Final Outcome' });
            }

            return (
              <EnhancedTooltip
                title="Retake Flow Node"
                data={tooltipData}
                icon={true}
                color={node.color}
                additionalInfo={`${node.value} users reached this stage`}
              />
            );
          }

          if (link) {
            const successRate = link.target.includes('Pass') ? 
              ((link.value / (link.source.value || 1)) * 100).toFixed(1) : null;

            const tooltipData = [
              { label: 'From', value: link.source.id },
              { label: 'To', value: link.target.id },
              { label: 'Users', value: link.value }
            ];

            if (successRate) {
              tooltipData.push({ label: 'Success Rate', value: `${successRate}%` });
            }

            return (
              <EnhancedTooltip
                title="Retake Flow"
                data={tooltipData}
                icon={true}
                color={link.target.color}
                additionalInfo={`${link.value} users followed this path`}
              />
            );
          }

          return null;
        }}
      />
    </div>
  );
};

export default RetakeAnalysisChart;
