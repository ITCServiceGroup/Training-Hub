import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const DashboardResultsTable = ({ 
  results = [], 
  loading = false, 
  onViewPDF = null,
  initialPageSize = 25
}) => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortField, setSortField] = useState('date_of_test');
  const [sortOrder, setSortOrder] = useState('desc');
  const [hoveredRow, setHoveredRow] = useState(null);

  // Reset to first page when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  // Sort results
  const sortedResults = useMemo(() => {
    if (!results.length) return [];

    return [...results].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle different data types
      if (sortField === 'date_of_test') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortField === 'score_text') {
        // Extract numeric value from percentage strings like "85%"
        aVal = parseFloat(aVal?.replace('%', '')) || 0;
        bVal = parseFloat(bVal?.replace('%', '')) || 0;
      } else if (sortField === 'time_taken') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      } else {
        // String comparison
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, sortField, sortOrder]);

  // Paginate results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedResults.slice(startIndex, endIndex);
  }, [sortedResults, currentPage, pageSize]);

  // Pagination info
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Helper function to get column width class
  const getColumnWidthClass = (column) => {
    switch(column) {
      case 'date_of_test': return 'w-[100px]';
      case 'ldap': return 'w-[110px]';
      case 'quiz_type': return 'w-[180px]';
      case 'score_text': return 'w-[110px]';
      case 'supervisor': return 'w-[130px]';
      case 'market': return 'w-[80px]';
      case 'time_taken': return 'w-[60px]';
      default: return 'w-[100px]';
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 p-8">
        <LoadingSpinner size="lg" text="Loading results..." />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 overflow-hidden">
      {/* Header with pagination controls */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Quiz Results
          </h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {totalResults} total results
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-500 rounded px-3 py-2 text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[70px]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">per page</span>
          </div>
        </div>
      </div>

      {totalResults === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          No results found matching current filters.
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.field}
                      onClick={() => handleSort(column.field)}
                      className={`p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider border-r border-slate-200 dark:border-slate-600 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${getColumnWidthClass(column.field)}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{column.label}</span>
                        <span className={sortField === column.field ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                          {getSortIcon(column.field)}
                        </span>
                      </div>
                    </th>
                  ))}
                  {onViewPDF && (
                    <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider w-[100px]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((result, index) => (
                  <tr
                    key={result.id || index}
                    className={`${hoveredRow === index ? 'bg-slate-100 dark:bg-slate-600' : index % 2 === 0 ? 'bg-white dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-750'} border-b border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors`}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('date_of_test')}`}>
                      <div className="truncate">{formatDate(result.date_of_test)}</div>
                    </td>
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('ldap')}`}>
                      <div className="truncate">{result.ldap}</div>
                    </td>
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('quiz_type')}`}>
                      <div className="truncate" title={result.quiz_type}>{result.quiz_type}</div>
                    </td>
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('score_text')}`}>
                      <div className="truncate font-medium">{result.score_text}</div>
                    </td>
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('supervisor')}`}>
                      <div className="truncate" title={result.supervisor}>{result.supervisor}</div>
                    </td>
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('market')}`}>
                      <div className="truncate">{result.market}</div>
                    </td>
                    <td className={`p-3 text-sm text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 ${getColumnWidthClass('time_taken')}`}>
                      <div className="truncate">{formatTime(result.time_taken)}</div>
                    </td>
                    {onViewPDF && (
                      <td className="p-3 text-sm text-slate-900 dark:text-slate-100 w-[100px]">
                        {result.pdf_url && (
                          <button
                            onClick={() => onViewPDF(result.pdf_url)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            View PDF
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {startResult} to {endResult} of {totalResults} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-500 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  Previous
                </button>
                
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-500 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardResultsTable;