import React, { useState } from 'react';

const ResultsTable = ({ results, sortField, sortOrder, onSort, onViewPDF, loading }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Using Tailwind classes instead of inline styles

  // Helper function to get column width class
  const getColumnWidthClass = (column) => {
    switch(column) {
      case 'date_of_test': return 'max-w-[100px]';
      case 'ldap': return 'max-w-[110px]';
      case 'quiz_type': return 'max-w-[180px]';
      case 'score_text': return 'max-w-[110px]';
      case 'supervisor': return 'max-w-[130px]';
      case 'market': return 'max-w-[80px]';
      case 'time_taken': return 'max-w-[60px]';
      default: return 'max-w-[100px]';
    }
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
      <div className="p-8 text-center">
        <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2 text-slate-500">Loading results...</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="p-8 text-center text-slate-500">
        No results found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full border-collapse border border-slate-300">
        <thead className="bg-slate-50 border-b border-slate-300">
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                onClick={() => onSort(column.field)}
                className={`p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-300 cursor-pointer select-none bg-slate-50 overflow-hidden text-ellipsis ${getColumnWidthClass(column.field)}`}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  <span className={sortField === column.field ? 'text-blue-500' : 'text-slate-400'}>
                    {getSortIcon(column.field)}
                  </span>
                </div>
              </th>
            ))}
            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-300 select-none bg-slate-50 max-w-[100px] overflow-hidden text-ellipsis">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr
              key={result.id || index}
              className={`${hoveredRow === index ? 'bg-slate-100' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-300 transition-colors`}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('date_of_test')}`}>
                {formatDate(result.date_of_test)}
              </td>
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('ldap')}`}>
                {result.ldap}
              </td>
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('quiz_type')}`}>
                {result.quiz_type}
              </td>
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('score_text')}`}>
                {result.score_text}
              </td>
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('supervisor')}`}>
                {result.supervisor}
              </td>
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('market')}`}>
                {result.market}
              </td>
              <td className={`p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis ${getColumnWidthClass('time_taken')}`}>
                {formatTime(result.time_taken)}
              </td>
              <td className="p-3 text-sm text-gray-800 border-r border-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                {result.pdf_url && (
                  <button
                    onClick={() => {
                      console.log('View PDF button clicked for URL:', result.pdf_url);
                      onViewPDF(result.pdf_url);
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-500 bg-transparent border border-blue-500 rounded-md cursor-pointer transition-all hover:bg-blue-500 hover:text-white"
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
