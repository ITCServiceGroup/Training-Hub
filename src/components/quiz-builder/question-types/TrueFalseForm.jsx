import React from 'react';

const TrueFalseForm = ({ correctAnswer, onChange, disabled }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Correct Answer</h3>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-teal-600 border-slate-300"
              checked={correctAnswer === true}
              onChange={() => onChange(true)}
              disabled={disabled}
              required
            />
            <span className="ml-2 text-slate-700">True</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-teal-600 border-slate-300"
              checked={correctAnswer === false}
              onChange={() => onChange(false)}
              disabled={disabled}
              required
            />
            <span className="ml-2 text-slate-700">False</span>
          </label>
        </div>
      </div>

      {correctAnswer === undefined && (
        <p className="text-sm text-red-500">
          Please select the correct answer
        </p>
      )}
    </div>
  );
};

export default TrueFalseForm;
