import React from 'react';

const MultipleChoiceForm = ({ options, correctAnswer, onChange, disabled }) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions, correctAnswer);
  };

  const handleAddOption = () => {
    onChange([...options, ''], correctAnswer);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    const newCorrectAnswer = correctAnswer === index
      ? 0
      : correctAnswer > index
        ? correctAnswer - 1
        : correctAnswer;
    onChange(newOptions, newCorrectAnswer);
  };

  const handleCorrectAnswerChange = (index) => {
    onChange(options, index);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Answer Options</h3>
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
            type="radio"
            name="correct-answer"
            className="h-4 w-4 text-teal-600 border-slate-300"
            checked={correctAnswer === index}
            onChange={() => handleCorrectAnswerChange(index)}
            disabled={disabled}
            required={index === 0} // Require at least one selection
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
    </div>
  );
};

export default MultipleChoiceForm;
