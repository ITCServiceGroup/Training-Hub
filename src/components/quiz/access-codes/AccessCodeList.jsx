import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { accessCodesService } from '../../../services/api/accessCodes';

const AccessCodeList = ({ quizId }) => {
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'used', 'unused', 'expired'

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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const handleDelete = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this access code?')) {
      return;
    }

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
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
          Used
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          Expired
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        Active
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading access codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search codes, users, or markets..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">LDAP</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Supervisor</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Market</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCodes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  No access codes found
                </td>
              </tr>
            ) : (
              filteredCodes.map(code => (
                <tr key={code.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono">{code.code}</td>
                  <td className="px-4 py-3">{code.ldap}</td>
                  <td className="px-4 py-3">{code.supervisor}</td>
                  <td className="px-4 py-3">{code.market}</td>
                  <td className="px-4 py-3">{getStatusBadge(code)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      className="text-slate-600 hover:text-slate-900"
                      onClick={() => handleCopyCode(code.code)}
                      title="Copy code"
                    >
                      Copy
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(code.id)}
                      title="Delete code"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AccessCodeList.propTypes = {
  quizId: PropTypes.string.isRequired
};

export default AccessCodeList;
