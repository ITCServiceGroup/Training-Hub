import React from 'react';

const CheckAllThatApplyForm = ({ options, correctAnswers, onChange, disabled }) => {
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
        <h3 className="text-lg font-medium">Answer Options (Select all correct answers)</h3>
        <button
          type="button"
          className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddOption}
          disabled={disabled || options.length >= 6}
        >
          Add Option
        </button>
      </div>

      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-teal-600 border-slate-300 rounded"
            checked={correctAnswers.includes(index)}
            onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
            disabled={disabled}
          />
          <input
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="flex-1 py-2 px-3 border border-slate-300 rounded-md"
            placeholder={`Option ${index + 1}`}
            required
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => handleRemoveOption(index)}
            disabled={options.length <= 2 || disabled}
            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      ))}

      {options.length >= 6 && (
        <p className="text-sm text-slate-500">
          Maximum of 6 options allowed
        </p>
      )}

      {options.length < 2 && (
        <p className="text-sm text-red-500">
          At least 2 options are required
        </p>
      )}

      {correctAnswers.length === 0 && (
        <p className="text-sm text-red-500">
          Select at least one correct answer
        </p>
      )}

      {correctAnswers.length === options.length && options.length > 0 && (
        <p className="text-sm text-amber-500">
          Warning: All options are marked as correct
        </p>
      )}
    </div>
  );
};

export default CheckAllThatApplyForm;
