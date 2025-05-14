import React from 'react';

const TrueFalseForm = ({ correctAnswer, onChange, disabled, isDark }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Select Correct Answer</h3>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              className={`h-4 w-4 text-teal-600 ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`}
              checked={correctAnswer === true}
              onChange={() => onChange(true)}
              disabled={disabled}
              required
            />
            <span className={`ml-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>True</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              className={`h-4 w-4 text-teal-600 ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`}
              checked={correctAnswer === false}
              onChange={() => onChange(false)}
              disabled={disabled}
              required
            />
            <span className={`ml-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>False</span>
          </label>
        </div>
      </div>

      {correctAnswer === undefined && (
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          Please select the correct answer
        </p>
      )}
    </div>
  );
};

export default TrueFalseForm;
