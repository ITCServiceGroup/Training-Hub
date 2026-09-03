import { memo } from 'react';
import PropTypes from 'prop-types';
import { getAccessCodeStatus } from './accessCodeStatus';

const StatusBadge = memo(({ code }) => {
  const status = getAccessCodeStatus(code);

  if (status === 'revoked') {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full">
        Revoked
      </span>
    );
  }

  if (status === 'used') {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary rounded-full">
        Used
      </span>
    );
  }
  
  if (status === 'expired') {
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
    expires_at: PropTypes.string,
    revoked_at: PropTypes.string
  }).isRequired
};

export default StatusBadge;
