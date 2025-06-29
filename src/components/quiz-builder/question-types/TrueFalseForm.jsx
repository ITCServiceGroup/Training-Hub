import React from 'react';

const TrueFalseForm = ({ correctAnswer, onChange, disabled, isDark }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Select Correct Answer</h3>
        <div className="flex gap-6">
          <div className="flex items-start">
            <div className="pt-0.5 pr-2">
              <input
                type="radio"
                name="true-false-answer"
                className={`h-4 w-4 text-primary ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`}
                checked={correctAnswer === true}
                onChange={() => onChange(true)}
                disabled={disabled}
                required
              />
            </div>
            <label
              className={`cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
              onClick={() => onChange(true)}
            >
              True
            </label>
          </div>

          <div className="flex items-start">
            <div className="pt-0.5 pr-2">
              <input
                type="radio"
                name="true-false-answer"
                className={`h-4 w-4 text-primary ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`}
                checked={correctAnswer === false}
                onChange={() => onChange(false)}
                disabled={disabled}
                required
              />
            </div>
            <label
              className={`cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
              onClick={() => onChange(false)}
            >
              False
            </label>
          </div>
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
