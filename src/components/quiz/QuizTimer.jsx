import React from 'react';
import PropTypes from 'prop-types';

const QuizTimer = ({ timeLeft, formatTime, isWarning = false }) => { // Added default parameter
  return (
    <div 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        isWarning 
          ? 'text-red-600 border-red-200 bg-red-50' 
          : 'text-slate-600 border-slate-200 bg-slate-50'
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

export default QuizTimer;
