import { useContentVisibility } from '../../hooks/useContentVisibility';

/**
 * VisibilityBadge Component
 * Displays a badge showing whether content is nationwide or regional
 *
 * @param {object} content - Content item with is_nationwide and market_id
 * @param {string} size - Badge size: 'sm', 'md', 'lg' (default: 'md')
 */
const VisibilityBadge = ({ content, size = 'md' }) => {
  const { getVisibilityBadge } = useContentVisibility();

  if (!content) return null;

  const badge = getVisibilityBadge(content);
  if (!badge) return null;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${sizeClasses[size]} ${colorClasses[badge.color]}`}
      title={badge.is_nationwide ? 'Visible to all markets' : `Visible only in ${badge.label}`}
    >
      <span className="mr-1">{badge.icon}</span>
      {badge.label}
    </span>
  );
};

export default VisibilityBadge;
