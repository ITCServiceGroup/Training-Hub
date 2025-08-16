import { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { accessCodesService } from '../../../services/api/accessCodes';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAccessCodeForm } from '../../../hooks/useAccessCodeForm';
import GeneratedCodeDisplay from './GeneratedCodeDisplay';

const AccessCodeGenerator = ({ quizId, onGenerated }) => {
  const { isDarkMode } = useTheme();
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    testTakerInfo,
    supervisors,
    markets,
    isLoading,
    error,
    emailError,
    resetForm,
    handleChange,
    validateForm,
    setError
  } = useAccessCodeForm();


  const handleGenerateCode = useCallback(async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    // Validate form before submission
    if (!validateForm()) {
      setIsGenerating(false);
      return;
    }

    try {
      const code = await accessCodesService.generateCode(quizId, testTakerInfo);
      setGeneratedCode(code);
      if (onGenerated) {
        onGenerated(code);
      }
    } catch (error) {
      setError(error.message || 'Failed to generate access code');
    } finally {
      setIsGenerating(false);
    }
  }, [quizId, testTakerInfo, validateForm, onGenerated, setError]);

  const handleGenerateAnother = useCallback(() => {
    resetForm();
    setGeneratedCode(null);
  }, [resetForm]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Generate Access Code</h3>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {generatedCode ? (
        <GeneratedCodeDisplay
          generatedCode={generatedCode}
          onGenerateAnother={handleGenerateAnother}
        />
      ) : (
        <form onSubmit={handleGenerateCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="ldap">
              LDAP Username
            </label>
            <input
              id="ldap"
              type="text"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-200 autofill:dark:bg-slate-800 autofill:dark:text-slate-200",
                error
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-primary"
              )}
              style={isDarkMode ? {
                colorScheme: 'dark',
                WebkitTextFillColor: '#e2e8f0 !important',
                WebkitBoxShadow: '0 0 0 1000px #1e293b inset !important',
              } : {}}
              value={testTakerInfo.ldap}
              onChange={(e) => handleChange('ldap', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-200 autofill:dark:bg-slate-800 autofill:dark:text-slate-200",
                emailError || error
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-primary"
              )}
              style={isDarkMode ? {
                colorScheme: 'dark',
                WebkitTextFillColor: '#e2e8f0 !important',
                WebkitBoxShadow: '0 0 0 1000px #1e293b inset !important',
              } : {}}
              value={testTakerInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="market">
              Market
            </label>
            <select
              id="market"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-200",
                error
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-primary"
              )}
              style={isDarkMode ? {
                colorScheme: 'dark',
                backgroundColor: '#1e293b',
                color: '#e2e8f0'
              } : {}}
              value={testTakerInfo.market}
              onChange={(e) => handleChange('market', e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Select Market</option>
              {markets.map((market) => (
                <option key={market.id} value={market.name}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="supervisor">
              Supervisor
            </label>
            <select
              id="supervisor"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-200",
                error
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-primary"
              )}
              value={testTakerInfo.supervisor}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              required
              disabled={isLoading || !testTakerInfo.market}
            >
              <option value="">
                {testTakerInfo.market 
                  ? `Select Supervisor for ${testTakerInfo.market}` 
                  : "Select Market First"
                }
              </option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.name}>
                  {supervisor.name}
                  {supervisor.markets && ` (${supervisor.markets.name})`}
                </option>
              ))}
            </select>
            
            {/* Helper text for market-supervisor relationship */}
            {testTakerInfo.market && supervisors.length === 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                No supervisors available for {testTakerInfo.market} market. Please contact an administrator.
              </p>
            )}
            
            {!testTakerInfo.market && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a market to see available supervisors for that market.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:dark:opacity-50"
            disabled={isGenerating || emailError}
          >
            {isGenerating ? 'Generating...' : 'Generate Access Code'}
          </button>
        </form>
      )}
    </div>
  );
};

AccessCodeGenerator.propTypes = {
  quizId: PropTypes.string.isRequired,
  onGenerated: PropTypes.func
};

export default memo(AccessCodeGenerator);
