import { memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';

const QuizTimer = ({ timeLeft, formatTime, isWarning = false }) => { // Added default parameter
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        isWarning
          ? isDark ? 'text-red-400 border-red-800 bg-red-900/30' : 'text-red-600 border-red-200 bg-red-50'
          : isDark ? 'text-gray-300 border-slate-700 bg-slate-800' : 'text-slate-600 border-slate-200 bg-slate-50'
      }`}
    >
      <span role="img" aria-label="timer">⏱️</span>
      <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
    </div>
  );
};

QuizTimer.propTypes = {
  timeLeft: PropTypes.number.isRequired,
  formatTime: PropTypes.func.isRequired,
  isWarning: PropTypes.bool
};

export default memo(QuizTimer);
