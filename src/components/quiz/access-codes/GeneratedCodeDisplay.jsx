import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../../common/ToastContainer';

const GeneratedCodeDisplay = memo(({ generatedCode, onGenerateAnother }) => {
  const { showToast } = useToast();

  const handleCopyCode = useCallback(async () => {
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
  }, [generatedCode.code, showToast]);

  return (
    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
      <h4 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4">
        Access Code Generated
      </h4>
      
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
          onClick={onGenerateAnother}
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
  );
});

GeneratedCodeDisplay.displayName = 'GeneratedCodeDisplay';

GeneratedCodeDisplay.propTypes = {
  generatedCode: PropTypes.shape({
    code: PropTypes.string.isRequired,
    ldap: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    supervisor: PropTypes.string.isRequired,
    market: PropTypes.string.isRequired
  }).isRequired,
  onGenerateAnother: PropTypes.func.isRequired
};

export default GeneratedCodeDisplay;