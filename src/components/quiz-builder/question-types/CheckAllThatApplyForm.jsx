import React from 'react';

const CheckAllThatApplyForm = ({ options, correctAnswers, onChange, disabled, isDark }) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions, correctAnswers);
  };

  const handleAddOption = () => {
    onChange([...options, ''], correctAnswers);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    // Update correct answers to remove the removed option and adjust indices
    const newCorrectAnswers = correctAnswers
      .filter(answerIndex => answerIndex !== index)
      .map(answerIndex => answerIndex > index ? answerIndex - 1 : answerIndex);
    onChange(newOptions, newCorrectAnswers);
  };

  const handleCorrectAnswerChange = (index, isChecked) => {
    const newCorrectAnswers = isChecked
      ? [...correctAnswers, index].sort((a, b) => a - b)
      : correctAnswers.filter(i => i !== index);
    onChange(options, newCorrectAnswers);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Answer Options (Select all correct answers)</h3>
        <button
          type="button"
          className="bg-primary-dark text-white px-3 py-1 rounded text-sm hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddOption}
          disabled={disabled || options.length >= 6}
        >
          Add Option
        </button>
      </div>

      {options.map((option, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            className={`text-teal-600 rounded ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`}
            checked={correctAnswers.includes(index)}
            onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
            disabled={disabled}
          />
          <input
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className={`py-2 px-3 border ${
              isDark
                ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
            } rounded-md focus:ring-1 focus:ring-primary focus:border-primary`}
            placeholder={`Option ${index + 1}`}
            required
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => handleRemoveOption(index)}
            disabled={options.length <= 2 || disabled}
            className={`${
              isDark ? 'text-red-400 hover:text-red-300 border-red-400' : 'text-red-500 hover:text-red-700 border-red-500'
            } border rounded disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              padding: '0.5rem 0.75rem',
              lineHeight: '1',
              height: '38px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Remove
          </button>
        </div>
      ))}

      {options.length >= 6 && (
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Maximum of 6 options allowed
        </p>
      )}

      {options.length < 2 && (
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          At least 2 options are required
        </p>
      )}

      {correctAnswers.length === 0 && (
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          Select at least one correct answer
        </p>
      )}

      {correctAnswers.length === options.length && options.length > 0 && (
        <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
          Warning: All options are marked as correct
        </p>
      )}
    </div>
  );
};

export default CheckAllThatApplyForm;
