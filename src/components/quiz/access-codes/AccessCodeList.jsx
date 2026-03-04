import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { accessCodesService } from '../../../services/api/accessCodes';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useToast } from '../../common/ToastContainer';
import { useDebounce } from '../../../hooks/useDebounce';
import StatusBadge from './StatusBadge';

const AccessCodeList = ({ quizId }) => {
  const { showToast } = useToast();
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'used', 'unused', 'expired'
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, codeId: null });

  useEffect(() => {
    loadAccessCodes();
  }, [quizId]);

  const loadAccessCodes = useCallback(async () => {
    try {
      const data = await accessCodesService.getByQuizId(quizId);
      setCodes(data);
    } catch (error) {
      setError('Failed to load access codes');
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  const handleCopyCode = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      console.log('Copying code and showing toast:', code);
      // Add a small delay to ensure the clipboard operation completes
      setTimeout(() => {
        showToast('Access Code copied to clipboard', 'success', 3000);
      }, 100);
    } catch (error) {
      console.error('Failed to copy code:', error);
      showToast('Failed to copy code', 'error', 3000);
    }
  }, [showToast]);

  const openDeleteConfirmation = useCallback((codeId) => {
    setDeleteConfirmation({ isOpen: true, codeId });
  }, []);

  const handleDelete = useCallback(async (codeId) => {
    try {
      await accessCodesService.delete(codeId);
      await loadAccessCodes();
    } catch (error) {
      setError('Failed to delete access code');
    }
  }, [loadAccessCodes]);

  const filteredCodes = useMemo(() => {
    return codes.filter(code => {
      const matchesSearch =
        code.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        code.ldap.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        code.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        code.supervisor.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        code.market.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      if (!matchesSearch) return false;

      const now = new Date();
      const isExpired = code.expires_at && new Date(code.expires_at) < now;

      switch (filter) {
        case 'used':
          return code.is_used;
        case 'unused':
          return !code.is_used && !isExpired;
        case 'expired':
          return isExpired;
        default:
          return true;
      }
    });
  }, [codes, debouncedSearchTerm, filter]);

  const statusCounts = useMemo(() => {
    const now = new Date();
    return codes.reduce((acc, code) => {
      const isExpired = code.expires_at && new Date(code.expires_at) < now;
      if (isExpired) {
        acc.expired += 1;
      } else if (code.is_used) {
        acc.used += 1;
      } else {
        acc.unused += 1;
      }
      return acc;
    }, { used: 0, unused: 0, expired: 0 });
  }, [codes]);


  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading access codes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Search Access Codes
          </label>
          <input
            type="text"
            placeholder="Code, LDAP, email, supervisor, or market..."
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status Filter
          </label>
          <select
            className="w-full min-w-48 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-200"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Codes</option>
            <option value="used">Used</option>
            <option value="unused">Unused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          Total: {codes.length}
        </span>
        <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200">
          Used: {statusCounts.used}
        </span>
        <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          Unused: {statusCounts.unused}
        </span>
        <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
          Expired: {statusCounts.expired}
        </span>
        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          Showing: {filteredCodes.length}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">LDAP</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Supervisor</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Market</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredCodes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No access codes found for the current search/filter.
                </td>
              </tr>
            ) : (
              filteredCodes.map(code => (
                <tr key={code.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-mono dark:text-slate-200">{code.code}</td>
                  <td className="px-4 py-3 dark:text-slate-200">{code.ldap}</td>
                  <td className="px-4 py-3 dark:text-slate-200">{code.supervisor}</td>
                  <td className="px-4 py-3 dark:text-slate-200">{code.market}</td>
                  <td className="px-4 py-3"><StatusBadge code={code} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 text-sm bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white font-medium rounded-lg transition-colors"
                        onClick={() => handleCopyCode(code.code)}
                        title="Copy code"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-red-600 dark:border-red-500 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white font-medium rounded-lg transition-colors"
                        onClick={() => openDeleteConfirmation(code.id)}
                        title="Delete code"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, codeId: null })}
        onConfirm={() => {
          handleDelete(deleteConfirmation.codeId);
          setDeleteConfirmation({ isOpen: false, codeId: null });
        }}
        title="Delete Access Code"
        description="Are you sure you want to delete this access code? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

AccessCodeList.propTypes = {
  quizId: PropTypes.string.isRequired
};

export default memo(AccessCodeList);
