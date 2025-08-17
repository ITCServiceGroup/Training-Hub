import { memo } from 'react';
import PropTypes from 'prop-types';
import { getFormStyles } from '../../../utils/questionFormUtils';

const ValidationMessage = memo(({ type = 'error', message, isDark = false }) => {
  const styles = getFormStyles(isDark);
  
  const getTypeClass = () => {
    switch (type) {
      case 'warning':
        return styles.text.warning;
      case 'info':
        return styles.text.info;
      case 'error':
      default:
        return styles.text.error;
    }
  };

  if (!message) return null;

  return (
    <p className={getTypeClass()}>
      {message}
    </p>
  );
});

ValidationMessage.displayName = 'ValidationMessage';

ValidationMessage.propTypes = {
  type: PropTypes.oneOf(['error', 'warning', 'info']),
  message: PropTypes.string,
  isDark: PropTypes.bool
};

export default ValidationMessage;