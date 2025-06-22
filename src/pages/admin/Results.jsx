import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quizResultsService } from '../../services/api/quizResults';
import ResultsTable from './components/ResultsTable';
import ChartSection from './components/ChartSection';
import PDFModal from './components/PDFModal';
import ExportButtons from './components/ExportButtons';
import DateFilter from './components/Filters/DateFilter';
import MultiSelect from './components/Filters/MultiSelect';
import NumberRangeFilter from './components/Filters/NumberRangeFilter';

const Results = () => {
  const { theme } = useTheme(); // Get current theme
  // State for filters, data, loading, etc.
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Log state changes for debugging
  useEffect(() => {
    console.log('showPdfModal state changed to:', showPdfModal);
    console.log('pdfUrl state:', pdfUrl);
  }, [showPdfModal, pdfUrl]);

  // Filter states
  const [dateFilter, setDateFilter] = useState({
    preset: 'last_month',
    startDate: null,
    endDate: null
  });
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [selectedLdaps, setSelectedLdaps] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedQuizTypes, setSelectedQuizTypes] = useState([]);
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });
  const [timeRange, setTimeRange] = useState({ min: 0, max: 3600 });

  // Sorting state
  const [sortField, setSortField] = useState('date_of_test');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch results based on filters
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const data = await quizResultsService.getFilteredResults({
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          supervisors: selectedSupervisors,
          ldaps: selectedLdaps,
          markets: selectedMarkets,
          quizTypes: selectedQuizTypes,
          minScore: scoreRange.min / 100, // Revert: Divide by 100
          maxScore: scoreRange.max / 100, // Revert: Divide by 100
          minTime: timeRange.min,
          maxTime: timeRange.max,
          sortField,
          sortOrder
        });

        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    console.log('Results.jsx: useEffect triggered, calling fetchResults...'); // Add this log
    fetchResults();
  }, [
    dateFilter,
    selectedSupervisors,
    selectedLdaps,
    selectedMarkets,
    selectedQuizTypes,
    scoreRange,
    timeRange,
    sortField,
    sortOrder
  ]);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle PDF view
  const handleViewPDF = (url) => {
    console.log('handleViewPDF called with URL:', url);
    setPdfUrl(url);
    setShowPdfModal(true);
    console.log('showPdfModal set to:', true);
  };

  // Using Tailwind classes instead of inline styles

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Filters</h2>
        <div className="space-y-6">
          {/* Row 1: Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Date Range */}
            <div className="flex flex-col justify-center h-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Date Range</label>
              <DateFilter
                value={dateFilter}
                onChange={setDateFilter}
              />
            </div>
            {/* Score Range */}
            <div className="flex flex-col justify-center h-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Score Range</label>
              <NumberRangeFilter
                type="score"
                value={scoreRange}
                onChange={setScoreRange}
                hideTitle={true}
              />
            </div>
            {/* Time Range */}
            <div className="flex flex-col justify-center h-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Time Range</label>
              <NumberRangeFilter
                type="time"
                value={timeRange}
                onChange={setTimeRange}
                hideTitle={true}
              />
            </div>
          </div>
          {/* Divider */}
          <div className="border-t-2 border-gray-200 dark:border-slate-500 my-2" />
          {/* Row 2: Selection Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Supervisors */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Supervisors</label>
              <MultiSelect
                type="supervisors"
                value={selectedSupervisors}
                onChange={setSelectedSupervisors}
                hideLabel={true}
              />
            </div>
            {/* LDAPs */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">LDAPs</label>
              <MultiSelect
                type="ldaps"
                value={selectedLdaps}
                onChange={setSelectedLdaps}
                hideLabel={true}
              />
            </div>
            {/* Markets */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Markets</label>
              <MultiSelect
                type="markets"
                value={selectedMarkets}
                onChange={setSelectedMarkets}
                hideLabel={true}
              />
            </div>
            {/* Quiz Types */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Quiz Types</label>
              <MultiSelect
                type="quizTypes"
                value={selectedQuizTypes}
                onChange={setSelectedQuizTypes}
                hideLabel={true}
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-end items-center gap-3 pt-4">
            <button
              type="button"
              className="btn-secondary dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              onClick={() => {
                setDateFilter({ preset: 'last_month', startDate: null, endDate: null });
                setSelectedSupervisors([]);
                setSelectedLdaps([]);
                setSelectedMarkets([]);
                setSelectedQuizTypes([]);
                setScoreRange({ min: 0, max: 100 });
                setTimeRange({ min: 0, max: 3600 });
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn-primary dark:bg-teal-600 dark:hover:bg-teal-700"
              // "Apply" is visually present; actual filtering is handled by useEffect on filter state
              onClick={() => { /* No-op, filters auto-apply */ }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6">

        {error ? (
          <div className="p-4 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            <ResultsTable
              results={results}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onViewPDF={handleViewPDF}
              loading={loading}
            />
            <div className="mt-6 flex justify-end">
              <ExportButtons data={results} />
            </div>
          </>
        )}
      </div>

      {results.length > 0 && (
        <ChartSection data={results} />
      )}

      <PDFModal
        isOpen={showPdfModal}
        pdfUrl={pdfUrl}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
};

export default Results;
