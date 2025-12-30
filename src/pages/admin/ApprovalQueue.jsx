import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRBAC } from '../../contexts/RBACContext';
import { approvalsService } from '../../services/api/approvals';
import { studyGuidesService } from '../../services/api/studyGuides';
import { quizzesService } from '../../services/api/quizzes';
import { sectionsService } from '../../services/api/sections';
import { categoriesService } from '../../services/api/categories';
import { useToast } from '../../components/common/ToastContainer';

const ApprovalQueue = () => {
  const { isAdmin, getRoleDisplayName } = useRBAC();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [reviewNotes, setReviewNotes] = useState({});

  useEffect(() => {
    loadApprovals();
  }, [filterStatus]);

  const loadApprovals = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = filterStatus === 'pending'
        ? await approvalsService.getPendingApprovals()
        : await approvalsService.getAllApprovals({ status: filterStatus === 'all' ? null : filterStatus });

      if (error) throw error;

      // Enrich with content details
      const enrichedData = await Promise.all(
        (data || []).map(async (approval) => {
          let contentDetails = null;
          try {
            switch (approval.content_type) {
              case 'study_guide':
                contentDetails = await studyGuidesService.getById(approval.content_id);
                break;
              case 'quiz':
                contentDetails = await quizzesService.getById(approval.content_id);
                break;
              case 'section':
                contentDetails = await sectionsService.getById(approval.content_id);
                break;
              case 'category':
                contentDetails = await categoriesService.getById(approval.content_id);
                break;
            }
          } catch (err) {
            console.error(`Error loading ${approval.content_type} details:`, err);
          }
          return { ...approval, contentDetails };
        })
      );

      setApprovals(enrichedData);
    } catch (err) {
      console.error('Error loading approvals:', err);
      setError('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval) => {
    if (!confirm(`Approve request to make "${approval.contentDetails?.title || approval.contentDetails?.name}" nationwide?`)) {
      return;
    }

    setProcessingId(approval.id);
    try {
      // Approve the request
      const { error: approveError } = await approvalsService.approveRequest(
        approval.id,
        reviewNotes[approval.id] || null
      );

      if (approveError) throw approveError;

      // Update the content to be nationwide
      const updateData = {
        is_nationwide: true,
        market_id: null
      };

      let updateError = null;
      switch (approval.content_type) {
        case 'study_guide':
          ({ error: updateError } = await studyGuidesService.update(approval.content_id, updateData));
          break;
        case 'quiz':
          ({ error: updateError } = await quizzesService.update(approval.content_id, updateData));
          break;
        case 'section':
          ({ error: updateError } = await sectionsService.update(approval.content_id, updateData));
          break;
        case 'category':
          ({ error: updateError } = await categoriesService.updateBasicInfo(approval.content_id, updateData));
          break;
      }

      if (updateError) throw updateError;

      showToast('Request approved successfully', 'success');
      loadApprovals();
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('Failed to approve request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (approval) => {
    const notes = reviewNotes[approval.id];
    if (!notes || notes.trim() === '') {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    if (!confirm(`Reject request to make "${approval.contentDetails?.title || approval.contentDetails?.name}" nationwide?`)) {
      return;
    }

    setProcessingId(approval.id);
    try {
      const { error } = await approvalsService.rejectRequest(approval.id, notes);

      if (error) throw error;

      showToast('Request rejected', 'success');
      loadApprovals();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('Failed to reject request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewContent = (approval) => {
    // Navigate to the appropriate editor based on content type
    switch (approval.content_type) {
      case 'study_guide':
        navigate(`/admin/study-guides?contentId=${approval.content_id}`);
        break;
      case 'quiz':
        navigate(`/admin/quizzes?quizId=${approval.content_id}`);
        break;
      default:
        showToast('Viewing this content type is not yet supported', 'info');
    }
  };

  const getContentTypeLabel = (type) => {
    const labels = {
      study_guide: 'Study Guide',
      quiz: 'Quiz',
      section: 'Section',
      category: 'Category'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400', label: 'Pending' },
      approved: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400', label: 'Approved' },
      rejected: { color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400', label: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (!isAdmin()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p>Access Denied. Only administrators can view approval requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review regional content requests for nationwide availability</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${filterStatus === status
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {status}
              {status === 'pending' && approvals.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs">
                  {approvals.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading approval requests...</p>
          </div>
        </div>
      )}

      {/* Approvals List */}
      {!loading && approvals.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No {filterStatus} approval requests</p>
        </div>
      )}

      {!loading && approvals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-lg border dark:border-slate-700">
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {approvals.map((approval) => (
              <li key={approval.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {approval.contentDetails?.title || approval.contentDetails?.name || 'Content Not Found'}
                        </h3>
                        {getStatusBadge(approval.status)}
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {getContentTypeLabel(approval.content_type)}
                        </span>
                      </div>
                      {approval.contentDetails?.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{approval.contentDetails.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Requester Info */}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>
                        Requested by <strong>{approval.requester?.display_name}</strong>
                        {' '}({getRoleDisplayName(approval.requester?.role)})
                      </span>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{approval.requester?.markets?.name || 'No Market'}</span>
                    <span className="mx-2">•</span>
                    <span>{approval.requested_at ? new Date(approval.requested_at).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  {/* Requester Notes */}
                  {approval.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-400">Requester Notes:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{approval.notes}</p>
                    </div>
                  )}

                  {/* Review Info (for approved/rejected) */}
                  {approval.status !== 'pending' && approval.reviewer && (
                    <div className={`border rounded-md p-3 ${
                      approval.status === 'approved'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <p className={`text-sm font-medium ${
                        approval.status === 'approved' ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
                      }`}>
                        {approval.status === 'approved' ? 'Approved' : 'Rejected'} by {approval.reviewer.display_name}
                        {approval.reviewed_at && <>{' '}on {new Date(approval.reviewed_at).toLocaleDateString()}</>}
                      </p>
                      {approval.review_notes && (
                        <p className={`text-sm mt-1 ${
                          approval.status === 'approved' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                        }`}>
                          {approval.review_notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons (only for pending) */}
                  {approval.status === 'pending' && (
                    <div className="space-y-3">
                      {/* View Content Button */}
                      <button
                        onClick={() => handleViewContent(approval)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View & Edit Content
                      </button>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Review Notes {approval.status === 'pending' && '(required for rejection)'}
                        </label>
                        <textarea
                          value={reviewNotes[approval.id] || ''}
                          onChange={(e) => setReviewNotes({ ...reviewNotes, [approval.id]: e.target.value })}
                          placeholder="Add notes about your decision..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(approval)}
                          disabled={processingId === approval.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === approval.id ? 'Processing...' : 'Approve & Make Nationwide'}
                        </button>
                        <button
                          onClick={() => handleReject(approval)}
                          disabled={processingId === approval.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === approval.id ? 'Processing...' : 'Reject Request'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
