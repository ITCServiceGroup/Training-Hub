import React from 'react';

const ResultsTable = ({ results, sortField, sortOrder, onSort, onViewPDF, loading }) => {
  const columns = [
    { field: 'date_of_test', label: 'Date' },
    { field: 'ldap', label: 'LDAP' },
    { field: 'quiz_type', label: 'Quiz Type' },
    { field: 'score_text', label: 'Score' },
    { field: 'supervisor', label: 'Supervisor' },
    { field: 'market', label: 'Market' },
    { field: 'time_taken', label: 'Time Taken' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="p-4 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2 text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="p-4 text-center text-gray-600">
        No results found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                onClick={() => onSort(column.field)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  <span className="text-gray-400">{getSortIcon(column.field)}</span>
                </div>
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={result.id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(result.date_of_test)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.ldap}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.quiz_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.score_text}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.supervisor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.market}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatTime(result.time_taken)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {result.pdf_url && (
                  <button
                    onClick={() => {
                      console.log('View PDF button clicked for URL:', result.pdf_url);
                      onViewPDF(result.pdf_url);
                    }}
                    className="text-blue-600 hover:text-blue-900"
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
