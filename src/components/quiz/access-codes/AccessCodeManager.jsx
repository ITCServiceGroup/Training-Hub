import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AccessCodeGenerator from './AccessCodeGenerator';
import AccessCodeList from './AccessCodeList';
import { useTheme } from '../../../contexts/ThemeContext';

const AccessCodeManager = ({ quizId, quizTitle }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('generate'); // 'list' or 'generate' - Changed default
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCodeGenerated = () => {
    // Trigger a refresh of the list when a new code is generated
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="py-4 max-w-full">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl text-teal-700 dark:text-teal-500 m-0">
              Access Codes
            </h2>
            {quizTitle && (
              <h3 className="text-xl text-slate-600 dark:text-slate-400 mt-2 mb-0 font-normal">
                {quizTitle}
              </h3>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex mb-6 relative">
            {/* Add bottom border that spans the full width */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex gap-1">
              {/* Generate New Code Tab */}
              <button
                className={`py-2 px-6 font-medium rounded-t-lg border border-b-0 -mb-px relative ${
                  activeTab === 'generate'
                    ? 'bg-teal-700 dark:bg-teal-800 text-white border-slate-200 dark:border-slate-700 z-10' // Active: teal bg, white text
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600' // Inactive: light bg, darker on hover
                }`}
                onClick={() => setActiveTab('generate')}
              >
                Generate New Code
              </button>

              {/* Access Codes Tab */}
              <button
                className={`py-2 px-6 font-medium rounded-t-lg border border-b-0 -mb-px relative ${
                  activeTab === 'list'
                    ? 'bg-teal-700 dark:bg-teal-800 text-white border-slate-200 dark:border-slate-700 z-10'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => setActiveTab('list')}
              >
                Access Codes
              </button>
            </div>
          </div>

          <div>
            {activeTab === 'generate' ? (
              <AccessCodeGenerator
                quizId={quizId}
                onGenerated={handleCodeGenerated}
              />
            ) : (
              <AccessCodeList
                quizId={quizId}
                key={refreshTrigger} // Force refresh when new code is generated
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AccessCodeManager.propTypes = {
  quizId: PropTypes.string.isRequired,
  quizTitle: PropTypes.string
};

export default AccessCodeManager;
