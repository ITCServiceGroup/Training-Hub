import React, { useState } from 'react';

const ResultsTable = ({ results, sortField, sortOrder, onSort, onViewPDF, loading }) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // Style definitions
  const containerStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #cbd5e1'
  };

  const getTheadStyles = () => ({
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #cbd5e1'
  });

  const getThStyles = (column, isClickable = false) => ({
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderRight: '1px solid #cbd5e1',
    cursor: isClickable ? 'pointer' : 'default',
    userSelect: 'none',
    backgroundColor: '#f8fafc',
    maxWidth: column === 'date_of_test' ? '100px' :
             column === 'ldap' ? '110px' :
             column === 'quiz_type' ? '180px' :
             column === 'score_text' ? '110px' :
             column === 'supervisor' ? '130px' :
             column === 'market' ? '80px' :
             column === 'time_taken' ? '60px' : 
             '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  });

  const getTrStyles = (index) => ({
    backgroundColor: hoveredRow === index ? '#f1f5f9' : index % 2 === 0 ? 'white' : '#f8fafc',
    borderBottom: '1px solid #cbd5e1',
    transition: 'background-color 0.2s'
  });

  const getTdStyles = (column) => ({
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#1f2937',
    borderRight: '1px solid #cbd5e1',
    whiteSpace: 'nowrap',
    maxWidth: column === 'date_of_test' ? '100px' :
             column === 'ldap' ? '110px' :
             column === 'quiz_type' ? '180px' :
             column === 'score_text' ? '110px' :
             column === 'supervisor' ? '130px' :
             column === 'market' ? '80px' :
             column === 'time_taken' ? '60px' : 
             '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  });

  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#3b82f6',
    backgroundColor: 'transparent',
    border: '1px solid #3b82f6',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const buttonHoverStyles = {
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const loadingContainerStyles = {
    padding: '2rem',
    textAlign: 'center'
  };

  const loadingSpinnerStyles = {
    display: 'inline-block',
    width: '1.5rem',
    height: '1.5rem',
    border: '2px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const noResultsStyles = {
    padding: '2rem',
    textAlign: 'center',
    color: '#64748b'
  };

  const columns = [
    { field: 'date_of_test', label: 'Date' },
    { field: 'ldap', label: 'LDAP' },
    { field: 'quiz_type', label: 'Quiz Type' },
    { field: 'score_text', label: 'Score' },
    { field: 'supervisor', label: 'Supervisor' },
    { field: 'market', label: 'Market' },
    { field: 'time_taken', label: 'Time' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSortIcon = (field) => {
    if (field !== sortField) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div style={loadingContainerStyles}>
        <div style={loadingSpinnerStyles} role="status">
          <span style={{ display: 'none' }}>Loading...</span>
        </div>
        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Loading results...</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div style={noResultsStyles}>
        No results found.
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <table style={tableStyles}>
        <thead style={getTheadStyles()}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                onClick={() => onSort(column.field)}
                style={getThStyles(column.field, true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{column.label}</span>
                  <span style={{ color: sortField === column.field ? '#3b82f6' : '#94a3b8' }}>
                    {getSortIcon(column.field)}
                  </span>
                </div>
              </th>
            ))}
            <th style={getThStyles('actions', false)}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr 
              key={result.id || index}
              style={getTrStyles(index)}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td style={getTdStyles('date_of_test')}>
                {formatDate(result.date_of_test)}
              </td>
              <td style={getTdStyles('ldap')}>
                {result.ldap}
              </td>
              <td style={getTdStyles('quiz_type')}>
                {result.quiz_type}
              </td>
              <td style={getTdStyles('score_text')}>
                {result.score_text}
              </td>
              <td style={getTdStyles('supervisor')}>
                {result.supervisor}
              </td>
              <td style={getTdStyles('market')}>
                {result.market}
              </td>
              <td style={getTdStyles('time_taken')}>
                {formatTime(result.time_taken)}
              </td>
              <td style={getTdStyles('actions')}>
                {result.pdf_url && (
                  <button
                    onClick={() => {
                      console.log('View PDF button clicked for URL:', result.pdf_url);
                      onViewPDF(result.pdf_url);
                    }}
                    style={buttonStyles}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyles)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyles)}
                  >
                    View PDF
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
