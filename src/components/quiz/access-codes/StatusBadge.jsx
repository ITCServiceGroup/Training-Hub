import { memo } from 'react';
import PropTypes from 'prop-types';

const StatusBadge = memo(({ code }) => {
  const now = new Date();
  const isExpired = code.expires_at && new Date(code.expires_at) < now;

  if (code.is_used) {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary rounded-full">
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
});

StatusBadge.displayName = 'StatusBadge';

StatusBadge.propTypes = {
  code: PropTypes.shape({
    is_used: PropTypes.bool.isRequired,
    expires_at: PropTypes.string
  }).isRequired
};

export default StatusBadge;