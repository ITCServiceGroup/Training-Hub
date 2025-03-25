import React, { useState, useEffect } from 'react';
import { quizResultsService } from '../../services/api/quizResults';
import ResultsTable from './components/ResultsTable';
import ChartSection from './components/ChartSection';
import PDFModal from './components/PDFModal';
import ExportButtons from './components/ExportButtons';
import DateFilter from './components/Filters/DateFilter';
import MultiSelect from './components/Filters/MultiSelect';
import NumberRangeFilter from './components/Filters/NumberRangeFilter';

const Results = () => {
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
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [ldaps, setLdaps] = useState([]);
  const [selectedLdaps, setSelectedLdaps] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });
  const [timeRange, setTimeRange] = useState({ min: 0, max: 3600 });
  
  // Sorting state
  const [sortField, setSortField] = useState('date_of_test');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Fetch filter options (supervisors, ldaps, markets)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [supervisorsList, ldapsList, marketsList] = await Promise.all([
          quizResultsService.getDistinctValues('supervisor'),
          quizResultsService.getDistinctValues('ldap'),
          quizResultsService.getDistinctValues('market')
        ]);
        
        setSupervisors(supervisorsList);
        setLdaps(ldapsList);
        setMarkets(marketsList);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError('Failed to load filter options');
      }
    };
    
    fetchFilterOptions();
  }, []);
  
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
          minScore: scoreRange.min / 100,
          maxScore: scoreRange.max / 100,
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
    
    fetchResults();
  }, [
    dateFilter, 
    selectedSupervisors, 
    selectedLdaps, 
    selectedMarkets, 
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
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
            <DateFilter 
              value={dateFilter} 
              onChange={setDateFilter} 
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Score Range</h3>
            <NumberRangeFilter 
              type="score"
              value={scoreRange} 
              onChange={setScoreRange} 
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Time Range</h3>
            <NumberRangeFilter 
              type="time"
              value={timeRange} 
              onChange={setTimeRange} 
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Supervisors</h3>
            <MultiSelect 
              options={supervisors.map(s => ({ value: s, label: s }))} 
              value={selectedSupervisors} 
              onChange={setSelectedSupervisors} 
              placeholder="Select supervisors" 
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">LDAPs</h3>
            <MultiSelect 
              options={ldaps.map(l => ({ value: l, label: l }))} 
              value={selectedLdaps} 
              onChange={setSelectedLdaps} 
              placeholder="Select LDAPs" 
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Markets</h3>
            <MultiSelect 
              options={markets.map(m => ({ value: m, label: m }))} 
              value={selectedMarkets} 
              onChange={setSelectedMarkets} 
              placeholder="Select markets" 
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <ExportButtons data={results} />
        </div>
        
        {error ? (
          <div className="p-4 text-center text-red-600">
            {error}
          </div>
        ) : (
          <ResultsTable 
            results={results} 
            sortField={sortField} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
            onViewPDF={handleViewPDF} 
            loading={loading} 
          />
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
