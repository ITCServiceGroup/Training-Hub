import React, { useState } from 'react';
import { updateAllDashboards, previewChanges } from '../utils/updateTemplates';

/**
 * Update Templates Button Component
 * 
 * This component provides a UI to update dashboard templates with the new chart organization.
 */
const UpdateTemplatesButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => {
    const preview = previewChanges();
    setResult({
      type: 'preview',
      data: preview,
      message: `Preview: ${preview.templates} templates with ${preview.totalCharts} total charts (${preview.uniqueCharts} unique)`
    });
    setShowPreview(true);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const updateResult = await updateAllDashboards();
      setResult({
        type: updateResult.success ? 'success' : 'error',
        data: updateResult,
        message: updateResult.message
      });
    } catch (error) {
      setResult({
        type: 'error',
        data: { error: error.message },
        message: 'Failed to update dashboards'
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'preview': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Update Dashboard Templates
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update all dashboard templates and user dashboards to use the new chart organization with all 12 available charts.
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Changes
        </button>
        
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update All Dashboards'}
        </button>
      </div>

      {result && (
        <div className={`p-3 rounded-lg border ${getResultColor(result.type)}`}>
          <div className="font-medium">{result.message}</div>
          
          {result.type === 'success' && result.data.templates && (
            <div className="text-sm mt-2">
              <div>✅ Updated {result.data.templates.length} templates</div>
              <div>✅ Updated {result.data.userDashboards?.length || 0} user dashboards</div>
            </div>
          )}
          
          {result.type === 'preview' && (
            <div className="text-sm mt-2">
              <div>📋 Templates: {result.data.templates}</div>
              <div>📊 Total Charts: {result.data.totalCharts}</div>
              <div>🎯 Unique Charts: {result.data.uniqueCharts}</div>
            </div>
          )}
          
          {result.type === 'error' && (
            <div className="text-sm mt-2">
              Error: {result.data.error}
            </div>
          )}
        </div>
      )}

      {showPreview && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">New Chart Organization:</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div><strong>Executive Overview:</strong> pass-fail-rate, score-trend, market-results, top-bottom-performers, supervisor-effectiveness</div>
            <div><strong>Manager Dashboard:</strong> supervisor-performance, supervisor-effectiveness, score-distribution, time-distribution, retake-analysis</div>
            <div><strong>Training Analytics:</strong> quiz-type-performance, time-vs-score, question-level-analytics, score-distribution, retake-analysis</div>
            <div><strong>Performance Monitoring:</strong> pass-fail-rate, score-trend, time-vs-score, top-bottom-performers</div>
            <div><strong>Quick Overview:</strong> pass-fail-rate, quiz-completion-rate, score-trend</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateTemplatesButton;
