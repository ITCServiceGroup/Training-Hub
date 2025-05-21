import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { accessCodesService } from '../../../services/api/accessCodes';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import { useToast } from '../../common/ToastContainer';

const AccessCodeList = ({ quizId }) => {
  const { showToast } = useToast();
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'used', 'unused', 'expired'
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, codeId: null });

  useEffect(() => {
    loadAccessCodes();
  }, [quizId]);

  const loadAccessCodes = async () => {
    try {
      const data = await accessCodesService.getByQuizId(quizId);
      setCodes(data);
    } catch (error) {
      setError('Failed to load access codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
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
  };

  const openDeleteConfirmation = (codeId) => {
    setDeleteConfirmation({ isOpen: true, codeId });
  };

  const handleDelete = async (codeId) => {

    try {
      await accessCodesService.delete(codeId);
      await loadAccessCodes();
    } catch (error) {
      setError('Failed to delete access code');
    }
  };

  const filteredCodes = codes.filter(code => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.ldap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.market.toLowerCase().includes(searchTerm.toLowerCase());

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

  const getStatusBadge = (code) => {
    const now = new Date();
    const isExpired = code.expires_at && new Date(code.expires_at) < now;

    if (code.is_used) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
          Used
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
          Expired
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
        Active
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8 dark:text-slate-300">Loading access codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search codes, users, or markets..."
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-200"
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

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
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
                  No access codes found
                </td>
              </tr>
            ) : (
              filteredCodes.map(code => (
                <tr key={code.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-mono dark:text-slate-200">{code.code}</td>
                  <td className="px-4 py-3 dark:text-slate-200">{code.ldap}</td>
                  <td className="px-4 py-3 dark:text-slate-200">{code.supervisor}</td>
                  <td className="px-4 py-3 dark:text-slate-200">{code.market}</td>
                  <td className="px-4 py-3">{getStatusBadge(code)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-medium rounded-lg transition-colors"
                        onClick={() => handleCopyCode(code.code)}
                        title="Copy code"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-600 dark:border-red-500 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white font-medium rounded-lg transition-colors"
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

export default AccessCodeList;
