import { useState } from 'react';
import { useContentVisibility } from '../../hooks/useContentVisibility';
import { approvalsService } from '../../services/api/approvals';
import { useToast } from './ToastContainer';

/**
 * Button component for requesting nationwide approval for regional content
 * @param {object} content - Content item to request approval for
 * @param {string} contentType - Type of content ('study_guide', 'quiz', 'section', 'category')
 * @param {function} onRequestSuccess - Callback after successful approval request
 */
const RequestApprovalButton = ({ content, contentType, onRequestSuccess }) => {
  const { canRequestNationwideApproval } = useContentVisibility();
  const { showToast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  // Don't render if user can't request approval for this content
  if (!canRequestNationwideApproval(content)) {
    return null;
  }

  const handleRequestApproval = async () => {
    if (!confirm(`Request approval to make "${content.title || content.name}" available nationwide?`)) {
      return;
    }

    setIsRequesting(true);
    try {
      const { error } = await approvalsService.createApprovalRequest(contentType, content.id);

      if (error) {
        throw error;
      }

      showToast('Approval request submitted successfully', 'success');
      if (onRequestSuccess) {
        onRequestSuccess();
      }
    } catch (error) {
      console.error('Error requesting approval:', error);
      showToast('Failed to submit approval request', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <button
      onClick={handleRequestApproval}
      disabled={isRequesting}
      className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Request approval to make this content available nationwide"
    >
      {isRequesting ? (
        <>
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Requesting...
        </>
      ) : (
        <>
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Request Nationwide
        </>
      )}
    </button>
  );
};

export default RequestApprovalButton;
