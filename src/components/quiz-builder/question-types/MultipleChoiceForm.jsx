import React from 'react';

const MultipleChoiceForm = ({ options, correctAnswer, onChange, disabled, isDark }) => {
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
        <h3 className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Answer Options</h3>
        <button
          type="button"
          className="bg-teal-700 text-white px-3 py-1 rounded text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddOption}
          disabled={disabled || options.length >= 6}
        >
          Add Option
        </button>
      </div>

      {options.map((option, index) => (
        <div key={index} className="mb-2">
          <div className="flex items-start" style={{ position: 'relative' }}>
            <div className="pt-2 pr-3">
              <input
                type="radio"
                name="correct-answer"
                className={`text-teal-600 ${isDark ? 'border-slate-500 bg-slate-700' : 'border-slate-300'}`}
                checked={correctAnswer === index}
                onChange={() => handleCorrectAnswerChange(index)}
                disabled={disabled}
                required={index === 0}
              />
            </div>
            <div className="flex-1" style={{ paddingRight: '90px' }}>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`w-full py-2 px-3 border ${
                  isDark
                    ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                } rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500`}
                placeholder={`Option ${index + 1}`}
                required
                disabled={disabled}
                style={{ height: '38px' }}
              />
            </div>
            <div style={{ position: 'absolute', right: 0, top: 0 }}>
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                disabled={options.length <= 2 || disabled}
                className={`${
                  isDark ? 'text-red-400 hover:text-red-300 border-red-400' : 'text-red-500 hover:text-red-700 border-red-500'
                } border rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  marginTop: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Remove
              </button>
            </div>
          </div>
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
    </div>
  );
};

export default MultipleChoiceForm;
