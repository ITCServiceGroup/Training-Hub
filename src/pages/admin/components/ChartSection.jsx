import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ChartSection = ({ data }) => {
  const scoreChartRef = useRef(null);
  const timeChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const supervisorChartRef = useRef(null);
  const marketChartRef = useRef(null);
  const scatterChartRef = useRef(null);

  const chartInstances = useRef({});

  const colorPalette = [
    { bg: 'rgba(255, 99, 132, 0.5)', border: 'rgb(255, 99, 132)' },
    { bg: 'rgba(54, 162, 235, 0.5)', border: 'rgb(54, 162, 235)' },
    { bg: 'rgba(255, 206, 86, 0.5)', border: 'rgb(255, 206, 86)' },
    { bg: 'rgba(75, 192, 192, 0.5)', border: 'rgb(75, 192, 192)' },
    { bg: 'rgba(153, 102, 255, 0.5)', border: 'rgb(153, 102, 255)' },
    { bg: 'rgba(255, 159, 64, 0.5)', border: 'rgb(255, 159, 64)' }
  ];

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.3
  };

  useEffect(() => {
    Object.values(chartInstances.current).forEach(chart => chart?.destroy());
    chartInstances.current = {};

    if (!data || data.length === 0) return;

    initScoreChart();
    initTimeChart();
    initTrendChart();
    initSupervisorChart();
    initMarketChart();
    initScatterChart();

    return () => {
      Object.values(chartInstances.current).forEach(chart => chart?.destroy());
    };
  }, [data]);

  const initScoreChart = () => {
    const ctx = scoreChartRef.current.getContext('2d');
    const buckets = Array(10).fill(0);
    
    data.forEach(item => {
      const score = item.score_value * 100;
      const index = Math.min(Math.floor(score / 10), 9);
      buckets[index]++;
    });

    chartInstances.current.score = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%'],
        datasets: [{
          label: 'Score Distribution',
          data: buckets,
          backgroundColor: colorPalette[0].bg,
          borderColor: colorPalette[0].border,
          borderWidth: 1
        }]
      },
      options: {
        ...baseChartOptions,
        plugins: {
          title: {
            display: true,
            text: 'Score Distribution'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Results'
            }
          }
        }
      }
    });
  };

  const initTimeChart = () => {
    const ctx = timeChartRef.current.getContext('2d');
    let bucket1 = 0, bucket2 = 0, bucket3 = 0;
    
    data.forEach(item => {
      const minutes = item.time_taken / 60;
      if (minutes < 10) bucket1++;
      else if (minutes < 20) bucket2++;
      else bucket3++;
    });

    chartInstances.current.time = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['<10 mins', '10-20 mins', '>20 mins'],
        datasets: [{
          data: [bucket1, bucket2, bucket3],
          backgroundColor: colorPalette.map(c => c.bg),
          borderColor: colorPalette.map(c => c.border),
          borderWidth: 1
        }]
      },
      options: {
        ...baseChartOptions,
        plugins: {
          title: {
            display: true,
            text: 'Time Distribution'
          }
        }
      }
    });
  };

  const initTrendChart = () => {
    const ctx = trendChartRef.current.getContext('2d');
    const dateScores = {};
    
    data.forEach(item => {
      const date = item.date_of_test.split('T')[0];
      if (!dateScores[date]) dateScores[date] = [];
      dateScores[date].push(item.score_value * 100);
    });

    const sortedDates = Object.keys(dateScores).sort();
    const avgScores = sortedDates.map(date => {
      const scores = dateScores[date];
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    chartInstances.current.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Average Score',
          data: avgScores,
          borderColor: colorPalette[2].border,
          backgroundColor: colorPalette[2].bg,
          tension: 0.1
        }]
      },
      options: {
        ...baseChartOptions,
        plugins: {
          title: {
            display: true,
            text: 'Score Trend Over Time'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Average Score (%)'
            }
          }
        }
      }
    });
  };

  const initSupervisorChart = () => {
    const ctx = supervisorChartRef.current.getContext('2d');
    const supervisorScores = {};
    
    data.forEach(item => {
      if (!supervisorScores[item.supervisor]) supervisorScores[item.supervisor] = [];
      supervisorScores[item.supervisor].push(item.score_value * 100);
    });

    const supervisors = Object.keys(supervisorScores).sort();
    const avgScores = supervisors.map(sup => {
      const scores = supervisorScores[sup];
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    chartInstances.current.supervisor = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: supervisors,
        datasets: [{
          label: 'Average Score',
          data: avgScores,
          backgroundColor: colorPalette.map(c => c.bg),
          borderColor: colorPalette.map(c => c.border),
          borderWidth: 1
        }]
      },
      options: {
        ...baseChartOptions,
        plugins: {
          title: {
            display: true,
            text: 'Supervisor Performance'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Average Score (%)'
            }
          }
        }
      }
    });
  };

  const initMarketChart = () => {
    const ctx = marketChartRef.current.getContext('2d');
    const marketCounts = {};
    
    data.forEach(item => {
      marketCounts[item.market] = (marketCounts[item.market] || 0) + 1;
    });

    const markets = Object.keys(marketCounts).sort();

    chartInstances.current.market = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: markets,
        datasets: [{
          data: markets.map(market => marketCounts[market]),
          backgroundColor: colorPalette.map(c => c.bg),
          borderColor: colorPalette.map(c => c.border),
          borderWidth: 1
        }]
      },
      options: {
        ...baseChartOptions,
        plugins: {
          title: {
            display: true,
            text: 'Results by Market'
          }
        }
      }
    });
  };

  const initScatterChart = () => {
    const ctx = scatterChartRef.current.getContext('2d');
    const scatterData = data.map(item => ({
      x: item.time_taken / 60,
      y: item.score_value * 100
    }));

    chartInstances.current.scatter = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Time vs Score',
          data: scatterData,
          backgroundColor: colorPalette[5].bg
        }]
      },
      options: {
        ...baseChartOptions,
        plugins: {
          title: {
            display: true,
            text: 'Time Taken vs Score'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time Taken (minutes)'
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Score (%)'
            }
          }
        }
      }
    });
  };

  const containerStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    width: '100%'
  };

  const chartContainerStyles = {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
    maxHeight: '400px',
    minHeight: '350px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={containerStyles}>
      <h2 style={titleStyles}>Charts/Graphs</h2>
      <div style={gridStyles}>
        <div style={chartContainerStyles}>
          <canvas ref={scoreChartRef} />
        </div>
        <div style={chartContainerStyles}>
          <canvas ref={timeChartRef} />
        </div>
        <div style={chartContainerStyles}>
          <canvas ref={trendChartRef} />
        </div>
        <div style={chartContainerStyles}>
          <canvas ref={supervisorChartRef} />
        </div>
        <div style={chartContainerStyles}>
          <canvas ref={marketChartRef} />
        </div>
        <div style={chartContainerStyles}>
          <canvas ref={scatterChartRef} />
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
