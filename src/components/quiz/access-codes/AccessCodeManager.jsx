import { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import AccessCodeGenerator from './AccessCodeGenerator';
import AccessCodeList from './AccessCodeList';
import { useTheme } from '../../../contexts/ThemeContext';

const AccessCodeManager = ({ quizId, quizTitle }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('generate'); // 'list' or 'generate' - Changed default
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCodeGenerated = useCallback(() => {
    // Trigger a refresh of the list when a new code is generated
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  }, []);

  return (
    <div className="py-4 max-w-full space-y-6">
      <div className={`rounded-xl border p-6 ${
        isDarkMode
          ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900'
          : 'border-slate-200 bg-gradient-to-r from-sky-50 to-white'
      }`}>
        <h2 className="text-4xl text-primary-dark dark:text-primary-light m-0">
          Access Codes
        </h2>
        {quizTitle && (
          <h3 className="text-xl text-slate-600 dark:text-slate-400 mt-2 mb-0 font-normal">
            {quizTitle}
          </h3>
        )}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Generate one-time learner codes and audit existing code usage for this quiz.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 md:p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'generate'
                  ? 'bg-primary-dark text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('generate')}
            >
              1. Generate New Code
            </button>
            <button
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'list'
                  ? 'bg-primary-dark text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('list')}
            >
              2. View Access Codes
            </button>
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

export default memo(AccessCodeManager);
