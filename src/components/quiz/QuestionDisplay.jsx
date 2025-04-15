import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const QuestionDisplay = ({ 
  question,
  selectedAnswer,
  onSelectAnswer,
  isPractice,
  showFeedback = false,
  isCorrect = false,
  disabled = false
}) => {
  // Handle selecting an answer
  const handleSelect = (answer) => {
    if (disabled) return;
    onSelectAnswer(answer);
  };

  // Render multiple choice question
  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        
        return (
          <button
            key={index}
            className={classNames(
              "w-full px-4 py-3 text-left border rounded-lg transition-colors",
              {
                'border-teal-600 bg-teal-50': isSelected && !showFeedback,
                'border-green-500 bg-green-50': showFeedback && isSelected && isCorrect,
                'border-red-500 bg-red-50': showFeedback && isSelected && !isCorrect,
                'hover:border-teal-600 hover:bg-teal-50': !disabled,
                'border-slate-200': !isSelected && !showFeedback,
                'cursor-pointer': !disabled,
                'cursor-not-allowed opacity-60': disabled
              }
            )}
            onClick={() => handleSelect(index)}
            disabled={disabled}
          >
            {option}
          </button>
        );
      })}
    </div>
  );

  // Render check all that apply question
  const renderCheckAllThatApply = () => (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(index);
        
        return (
          <label
            key={index}
            className={classNames(
              "flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-colors",
              {
                'border-teal-600 bg-teal-50': isSelected && !showFeedback,
                'border-green-500 bg-green-50': showFeedback && isSelected && isCorrect,
                'border-red-500 bg-red-50': showFeedback && isSelected && !isCorrect,
                'hover:border-teal-600 hover:bg-teal-50': !disabled,
                'border-slate-200': !isSelected && !showFeedback,
                'cursor-pointer': !disabled,
                'cursor-not-allowed opacity-60': disabled
              }
            )}
          >
            <input
              type="checkbox"
              className="h-5 w-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              checked={isSelected}
              onChange={() => {
                if (disabled) return;
                
                const newSelection = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
                if (isSelected) {
                  const idx = newSelection.indexOf(index);
                  if (idx !== -1) newSelection.splice(idx, 1);
                } else {
                  newSelection.push(index);
                }
                handleSelect(newSelection);
              }}
              disabled={disabled}
            />
            <span className="ml-3">{option}</span>
          </label>
        );
      })}
    </div>
  );

  // Render true/false question
  const renderTrueFalse = () => (
    <div className="grid grid-cols-2 gap-4">
      <button
        className={classNames(
          "px-4 py-3 border rounded-lg text-center font-medium transition-colors",
          {
            'border-teal-600 bg-teal-50': selectedAnswer === true && !showFeedback,
            'border-green-500 bg-green-50': showFeedback && selectedAnswer === true && isCorrect,
            'border-red-500 bg-red-50': showFeedback && selectedAnswer === true && !isCorrect,
            'hover:border-teal-600 hover:bg-teal-50': !disabled,
            'border-slate-200': selectedAnswer !== true && !showFeedback,
            'cursor-pointer': !disabled,
            'cursor-not-allowed opacity-60': disabled
          }
        )}
        onClick={() => handleSelect(true)}
        disabled={disabled}
      >
        True
      </button>
      <button
        className={classNames(
          "px-4 py-3 border rounded-lg text-center font-medium transition-colors",
          {
            'border-teal-600 bg-teal-50': selectedAnswer === false && !showFeedback,
            'border-green-500 bg-green-50': showFeedback && selectedAnswer === false && isCorrect,
            'border-red-500 bg-red-50': showFeedback && selectedAnswer === false && !isCorrect,
            'hover:border-teal-600 hover:bg-teal-50': !disabled,
            'border-slate-200': selectedAnswer !== false && !showFeedback,
            'cursor-pointer': !disabled,
            'cursor-not-allowed opacity-60': disabled
          }
        )}
        onClick={() => handleSelect(false)}
        disabled={disabled}
      >
        False
      </button>
    </div>
  );

  // Render feedback for practice mode
  const renderFeedback = () => {
    if (!isPractice || !showFeedback) return null;

    return (
      <div className={classNames(
        'mt-6 p-4 rounded-lg border',
        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      )}>
        <h4 className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </h4>

        {!isCorrect && question.explanation && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="font-medium">Explanation:</p>
            <p className="mt-1 text-red-700">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  if (!question) {
    return <div className="p-4 text-slate-500">No question available</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium text-slate-900">
        {question.question_text}
      </p>

      {/* Render question based on type */}
      <div>
        {question.question_type === 'multiple_choice' && renderMultipleChoice()}
        {question.question_type === 'check_all_that_apply' && renderCheckAllThatApply()}
        {question.question_type === 'true_false' && renderTrueFalse()}
      </div>

      {renderFeedback()}
    </div>
  );
};

QuestionDisplay.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question_text: PropTypes.string.isRequired,
    question_type: PropTypes.oneOf(['multiple_choice', 'check_all_that_apply', 'true_false']).isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    correct_answer: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.bool
    ]).isRequired,
    explanation: PropTypes.string
  }),
  selectedAnswer: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.bool
  ]),
  onSelectAnswer: PropTypes.func.isRequired,
  isPractice: PropTypes.bool,
  showFeedback: PropTypes.bool,
  isCorrect: PropTypes.bool,
  disabled: PropTypes.bool
};

// Removed defaultProps, defaults are now in the function signature

export default QuestionDisplay;
