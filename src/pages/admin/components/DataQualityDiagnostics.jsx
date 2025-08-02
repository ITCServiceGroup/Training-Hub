/**
 * Data Quality Diagnostics Component
 * Provides detailed analysis of quiz results data quality issues
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { quizResultsService } from '../../../services/api/quizResults';

const DataQualityDiagnostics = ({ isOpen, onClose, dashboardData = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dashboardData.length > 0) {
      analyzeDashboardData();
    }
  }, [isOpen, dashboardData]);

  const analyzeDashboardData = () => {
    setLoading(true);
    
    try {
      // Analyze the current dashboard data
      const analysis = {
        totalRecords: dashboardData.length,
        recordsWithMetadata: dashboardData.filter(r => r.has_quiz_metadata).length,
        recordsWithoutMetadata: dashboardData.filter(r => !r.has_quiz_metadata).length,
        recordsUsingDefaultScore: dashboardData.filter(r => r.using_default_score).length,
        exactMatches: dashboardData.filter(r => r.match_type === 'exact').length,
        fuzzyMatches: dashboardData.filter(r => r.match_type === 'fuzzy').length,
        noMatches: dashboardData.filter(r => r.match_type === 'none').length,
        
        // Detailed breakdowns
        problemRecords: {
          noMatches: dashboardData.filter(r => r.match_type === 'none'),
          defaultScore: dashboardData.filter(r => r.using_default_score),
          fuzzyMatches: dashboardData.filter(r => r.match_type === 'fuzzy')
        },
        
        // Unique quiz types
        uniqueQuizTypes: [...new Set(dashboardData.map(r => r.quiz_type || r.quiz_title).filter(Boolean))],
        failedQuizTypes: [...new Set(dashboardData.filter(r => r.match_type === 'none').map(r => r.quiz_type).filter(Boolean))]
      };

      setDiagnostics(analysis);
    } catch (error) {
      console.error('Error analyzing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} px-6 py-4 border-b ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📊 Data Quality Diagnostics
            </h2>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Analyzing data quality...
              </div>
            </div>
          ) : diagnostics ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {diagnostics.totalRecords}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Total Records
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-green-900' : 'bg-green-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                    {diagnostics.recordsWithMetadata}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    With Metadata
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-yellow-900' : 'bg-yellow-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {diagnostics.fuzzyMatches}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Fuzzy Matches
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-red-900' : 'bg-red-50'} p-4 rounded-lg`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    {diagnostics.noMatches}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    No Matches
                  </div>
                </div>
              </div>

              {/* Failed Quiz Types */}
              {diagnostics.failedQuizTypes.length > 0 && (
                <div className={`${isDark ? 'bg-red-900/20' : 'bg-red-50'} p-4 rounded-lg border ${isDark ? 'border-red-800' : 'border-red-200'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    ❌ Quiz Types with No Matches ({diagnostics.failedQuizTypes.length})
                  </h3>
                  <div className="space-y-1">
                    {diagnostics.failedQuizTypes.map((type, index) => (
                      <div key={index} className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'} font-mono`}>
                        "{type}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Records Details */}
              {diagnostics.problemRecords.noMatches.length > 0 && (
                <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Records with No Quiz Metadata Match ({diagnostics.problemRecords.noMatches.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                          <th className="text-left p-2">Quiz Type</th>
                          <th className="text-left p-2">Quiz ID</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Score</th>
                          <th className="text-left p-2">User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnostics.problemRecords.noMatches.slice(0, 20).map((record, index) => (
                          <tr key={index} className={`border-b ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                            <td className="p-2 font-mono">{record.quiz_type || 'N/A'}</td>
                            <td className="p-2 font-mono text-xs">{record.quiz_id || 'N/A'}</td>
                            <td className="p-2">{new Date(record.date_of_test).toLocaleDateString()}</td>
                            <td className="p-2">{(record.score_value * 100).toFixed(1)}%</td>
                            <td className="p-2">{record.ldap}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {diagnostics.problemRecords.noMatches.length > 20 && (
                      <div className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Showing first 20 of {diagnostics.problemRecords.noMatches.length} records
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Quiz Types */}
              <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  All Quiz Types in Dataset ({diagnostics.uniqueQuizTypes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {diagnostics.uniqueQuizTypes.map((type, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-white text-slate-700'} font-mono`}>
                      "{type}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No data available for analysis
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} px-6 py-4 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityDiagnostics;