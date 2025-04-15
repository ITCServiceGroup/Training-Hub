import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { accessCodesService } from '../../../services/api/accessCodes';

const AccessCodeGenerator = ({ quizId, onGenerated }) => {
  const [testTakerInfo, setTestTakerInfo] = useState({
    ldap: '',
    email: '',
    supervisor: '',
    market: ''
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setTestTakerInfo({
      ldap: '',
      email: '',
      supervisor: '',
      market: ''
    });
    setGeneratedCode(null);
    setError(null);
  };

  const handleChange = (field, value) => {
    setTestTakerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode.code);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Generate Access Code</h3>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {generatedCode ? (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h4 className="text-lg font-bold text-green-800 mb-4">Access Code Generated</h4>
          <div className="text-3xl font-mono font-bold text-center p-4 bg-white rounded border border-green-300 mb-4">
            {generatedCode.code}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">LDAP Username</p>
              <p className="font-medium">{generatedCode.ldap}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{generatedCode.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Supervisor</p>
              <p className="font-medium">{generatedCode.supervisor}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Market</p>
              <p className="font-medium">{generatedCode.market}</p>
            </div>
          </div>
          <div className="flex gap-4">
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" // Already has text-white, no change needed here
          disabled={isLoading || !ldap || !supervisor || !market}
        >
          {isLoading ? 'Generating...' : 'Generate Code'}
        </button>
            <button
              type="button"
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
              onClick={handleCopyCode}
            >
              Copy Code
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerateCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ldap">
              LDAP Username
            </label>
            <input
              id="ldap"
              type="text"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2",
                error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-teal-500"
              )}
              value={testTakerInfo.ldap}
              onChange={(e) => handleChange('ldap', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2",
                error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-teal-500"
              )}
              value={testTakerInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="supervisor">
              Supervisor
            </label>
            <input
              id="supervisor"
              type="text"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2",
                error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-teal-500"
              )}
              value={testTakerInfo.supervisor}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="market">
              Market
            </label>
            <input
              id="market"
              type="text"
              className={classNames(
                "w-full p-2 border rounded-lg focus:outline-none focus:ring-2",
                error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-teal-500"
              )}
              value={testTakerInfo.market}
              onChange={(e) => handleChange('market', e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            disabled={isGenerating}
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
