import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { accessCodesService } from '../../../services/api/accessCodes';
import { organizationService } from '../../../services/api/organization';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../common/ToastContainer';
import { isValidEmail, getEmailErrorMessage } from '../../../utils/validation';

const AccessCodeGenerator = ({ quizId, onGenerated }) => {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const [testTakerInfo, setTestTakerInfo] = useState({
    ldap: '',
    email: '',
    supervisor: '',
    market: ''
  });
  const [supervisors, setSupervisors] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const [supervisorsData, marketsData] = await Promise.all([
          organizationService.getSupervisors(),
          organizationService.getMarkets()
        ]);
        setSupervisors(supervisorsData);
        setMarkets(marketsData);
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
        setError('Failed to load supervisor and market options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const resetForm = () => {
    setTestTakerInfo({
      ldap: '',
      email: '',
      supervisor: '',
      market: ''
    });
    setGeneratedCode(null);
    setError(null);
    setEmailError(null);
  };

  const handleChange = (field, value) => {
    setTestTakerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    
    // Validate email field in real-time
    if (field === 'email') {
      if (value.trim() === '') {
        setEmailError(null); // Clear error when field is empty
      } else if (!isValidEmail(value)) {
        setEmailError(getEmailErrorMessage(value));
      } else {
        setEmailError(null);
      }
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    // Validate email before submission
    if (!isValidEmail(testTakerInfo.email)) {
      setEmailError(getEmailErrorMessage(testTakerInfo.email));
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
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.code);
      console.log('Copying generated code and showing toast:', generatedCode.code);
      // Add a small delay to ensure the clipboard operation completes
      setTimeout(() => {
        showToast('Access Code copied to clipboard', 'success', 3000);
      }, 100);
    } catch (error) {
      console.error('Failed to copy code:', error);
      showToast('Failed to copy code', 'error', 3000);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Generate Access Code</h3>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {generatedCode ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4">Access Code Generated</h4>
          <div className="text-3xl font-mono font-bold text-center p-4 bg-white dark:bg-slate-800 rounded border border-green-300 dark:border-green-700 mb-4">
            {generatedCode.code}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">LDAP Username</p>
              <p className="font-medium dark:text-slate-200">{generatedCode.ldap}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-medium dark:text-slate-200">{generatedCode.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Supervisor</p>
              <p className="font-medium dark:text-slate-200">{generatedCode.supervisor}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Market</p>
              <p className="font-medium dark:text-slate-200">{generatedCode.market}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white font-medium rounded-lg transition-colors"
              onClick={() => resetForm()}
            >
              Generate Another
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              onClick={handleCopyCode}
            >
              Copy Code
            </button>
          </div>
        </div>
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
              disabled={isLoading}
            >
              <option value="">Select Supervisor</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.name}>
                  {supervisor.name}
                </option>
              ))}
            </select>
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

export default AccessCodeGenerator;
