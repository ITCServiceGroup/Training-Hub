import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const QuestionDisplay = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  isPractice,
  showFeedback = false,
  isCorrect = false,
  disabled: parentDisabled = false // Renamed to avoid conflict with internal disabled logic
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Local state for check-all-that-apply before submission in practice mode
  const [localCheckAllAnswer, setLocalCheckAllAnswer] = useState([]);

  // Determine if inputs should be disabled based on parent, practice mode, and feedback state
  const isDisabled = parentDisabled || (isPractice && showFeedback);

  // Initialize/Reset local check-all state when question or initial selectedAnswer changes
  useEffect(() => {
    if (question?.question_type === 'check_all_that_apply') {
      setLocalCheckAllAnswer(Array.isArray(selectedAnswer) ? selectedAnswer : []);
    } else {
      setLocalCheckAllAnswer([]); // Clear for non-check-all questions
    }
    // We only want this effect to run when the question itself changes,
    // or potentially if the initial selectedAnswer prop changes (less likely scenario).
  }, [question, selectedAnswer]);


  // Handle selecting an answer
  const handleSelect = (answer) => {
    // Prevent action if disabled (covers parentDisabled and practice feedback shown)
    if (isDisabled && question.question_type !== 'check_all_that_apply') return;

    if (isPractice && question.question_type === 'check_all_that_apply') {
       // In practice mode for check-all, only update local state
       // Actual submission happens via button
       if (isDisabled) return; // Don't allow changes after feedback shown

       const newSelection = [...localCheckAllAnswer];
       const index = answer; // In this context, 'answer' is the index being toggled

       if (newSelection.includes(index)) {
         const idx = newSelection.indexOf(index);
         if (idx !== -1) newSelection.splice(idx, 1);
       } else {
         newSelection.push(index);
       }
       setLocalCheckAllAnswer(newSelection);

    } else {
      // For non-practice or non-check-all, call parent immediately
      onSelectAnswer(answer);
    }
  };

  // Handle submitting check-all-that-apply in practice mode
  const handleCheckAllSubmit = () => {
    if (isDisabled) return; // Should not be possible if button isn't rendered, but safe check
    onSelectAnswer(localCheckAllAnswer); // Submit the locally tracked answers
  };

  // Render multiple choice question
  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrectAnswer = index === question.correct_answer;

        return (
          <button
            key={index}
            className={classNames(
              "w-full px-4 py-3 text-left border rounded-lg transition-colors flex justify-between items-center",
              // Base interaction styles
              {
                'hover:border-primary hover:bg-primary/10': !isDisabled && !isDark,
                'hover:border-primary hover:bg-primary/20': !isDisabled && isDark,
                'cursor-not-allowed opacity-60': isDisabled,
                'cursor-pointer': !isDisabled,
              },
              // Conditional styles based on state
              isPractice && showFeedback
                ? { // Practice Feedback State
                    'bg-green-50 border-green-500': isCorrectAnswer && !isDark, // Correct answer (light)
                    'bg-green-900/30 border-green-700': isCorrectAnswer && isDark, // Correct answer (dark)
                    'bg-red-50 border-red-500': isSelected && !isCorrectAnswer && !isDark, // Selected incorrect answer (light)
                    'bg-red-900/30 border-red-700': isSelected && !isCorrectAnswer && isDark, // Selected incorrect answer (dark)
                    'border-slate-200 bg-white': !isSelected && !isCorrectAnswer && !isDark, // Unselected incorrect answer (light)
                    'border-slate-700 bg-slate-800': !isSelected && !isCorrectAnswer && isDark, // Unselected incorrect answer (dark)
                  }
                : { // Default State (Not Practice Feedback)
                    'border-primary bg-primary/10': isSelected && !isDark, // Selected (light)
                    'border-primary bg-primary/20': isSelected && isDark, // Selected (dark)
                    'border-slate-200 bg-white': !isSelected && !isDark, // Unselected (light)
                    'border-slate-700 bg-slate-800': !isSelected && isDark, // Unselected (dark)
                  }
            )}
            onClick={() => handleSelect(index)}
            disabled={isDisabled} // Use combined disabled state
          >
            <span className={isDark ? 'text-white' : ''}>{option}</span>
            {/* Add checkmark for correct answer OR X for incorrect selection during practice feedback */}
            {isPractice && showFeedback && isCorrectAnswer && <span className="ml-2 text-green-500 font-bold">✓</span>}
            {isPractice && showFeedback && isSelected && !isCorrectAnswer && <span className="ml-2 text-red-500 font-bold">✗</span>}
          </button>
        );
      })}
    </div>
  );

  // Render check all that apply question
  const renderCheckAllThatApply = () => {
    // Use local state for checked status in practice mode before submission
    const getIsSelected = (index) => {
      return isPractice
        ? localCheckAllAnswer.includes(index)
        : (Array.isArray(selectedAnswer) && selectedAnswer.includes(index));
    };

    return (
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = getIsSelected(index);

        return (
          <label
            key={index}
              className={classNames(
                "flex items-center px-4 py-3 border rounded-lg transition-colors",
                {
                  'border-primary bg-primary/10': isSelected && (!isPractice || !showFeedback) && !isDark, // Selected style (light)
                  'border-primary bg-primary/20': isSelected && (!isPractice || !showFeedback) && isDark, // Selected style (dark)
                  'border-green-500 bg-green-50': isPractice && showFeedback && question.correct_answer?.includes(index) && !isDark, // Correct answer style (light)
                  'border-green-700 bg-green-900/30': isPractice && showFeedback && question.correct_answer?.includes(index) && isDark, // Correct answer style (dark)
                  'border-red-500 bg-red-50': isPractice && showFeedback && isSelected && !question.correct_answer?.includes(index) && !isDark, // Incorrect selection style (light)
                  'border-red-700 bg-red-900/30': isPractice && showFeedback && isSelected && !question.correct_answer?.includes(index) && isDark, // Incorrect selection style (dark)
                  'hover:border-primary hover:bg-primary/10': !isDisabled && !isDark, // Hover (light)
                  'hover:border-primary hover:bg-primary/20': !isDisabled && isDark, // Hover (dark)
                  'border-slate-200': !isSelected && (!isPractice || !showFeedback) && !isDark, // Default border (light)
                  'border-slate-700': !isSelected && (!isPractice || !showFeedback) && isDark, // Default border (dark)
                  'cursor-pointer': !isDisabled,
                  'cursor-not-allowed opacity-60': isDisabled
                }
              )}
          >
            <input
              type="checkbox"
              className="h-5 w-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 flex-shrink-0 my-auto"
              checked={isSelected}
              onChange={() => handleSelect(index)} // Pass index to handleSelect
              disabled={isDisabled} // Use combined disabled state
            />
            <span className={`ml-3 flex items-center ${isDark ? 'text-white' : ''}`}>
              {option}
              {isPractice && showFeedback && question.correct_answer?.includes(index) && <span className="ml-2 text-green-500">✓</span>}
              {isPractice && showFeedback && isSelected && !question.correct_answer?.includes(index) && <span className="ml-2 text-red-500">✗</span>}
            </span>
          </label>
        );
      })}

      {/* Add Check Answer button for practice mode check-all */}
      {isPractice && !showFeedback && (
        <div className="mt-4">
          <button
            className={`px-5 py-2 ${isDark ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-600 hover:bg-teal-700'} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleCheckAllSubmit}
            disabled={isDisabled || localCheckAllAnswer.length === 0}
          >
            Check Answer
          </button>
        </div>
      )}
    </div>
    );
  };

  // Render true/false question
  const renderTrueFalse = () => {
    const trueIsCorrect = question.correct_answer === true;
    const falseIsCorrect = question.correct_answer === false;
    const trueSelected = selectedAnswer === true;
    const falseSelected = selectedAnswer === false;

    return (
      <div className="grid grid-cols-2 gap-4">
        <button
          className={classNames(
            "px-4 py-3 border rounded-lg text-center font-medium transition-colors flex justify-center items-center",
            // Interaction
            {
              'hover:border-primary hover:bg-primary/10': !isDisabled && !isDark,
              'hover:border-primary hover:bg-primary/20': !isDisabled && isDark,
              'cursor-not-allowed opacity-60': isDisabled,
              'cursor-pointer': !isDisabled,
            },
            // State styles
            isPractice && showFeedback
              ? { // Practice Feedback
                  'bg-green-50 border-green-500': trueIsCorrect && !isDark, // Correct (light)
                  'bg-green-900/30 border-green-700': trueIsCorrect && isDark, // Correct (dark)
                  'bg-red-50 border-red-500': trueSelected && !trueIsCorrect && !isDark, // Incorrect (light)
                  'bg-red-900/30 border-red-700': trueSelected && !trueIsCorrect && isDark, // Incorrect (dark)
                  'border-slate-200 bg-white': !trueSelected && !trueIsCorrect && !isDark, // Unselected (light)
                  'border-slate-700 bg-slate-800': !trueSelected && !trueIsCorrect && isDark, // Unselected (dark)
                }
              : { // Default State
                  'border-primary bg-primary/10': trueSelected && !isDark, // Selected (light)
                  'border-primary bg-primary/20': trueSelected && isDark, // Selected (dark)
                  'border-slate-200 bg-white': !trueSelected && !isDark, // Unselected (light)
                  'border-slate-700 bg-slate-800': !trueSelected && isDark, // Unselected (dark)
                }
          )}
          onClick={() => handleSelect(true)}
          disabled={isDisabled} // Use combined disabled state
        >
          <span className={isDark ? 'text-white' : ''}>True</span>
          {isPractice && showFeedback && trueIsCorrect && <span className="ml-2 text-green-500 font-bold">✓</span>}
          {isPractice && showFeedback && trueSelected && !trueIsCorrect && <span className="ml-2 text-red-500 font-bold">✗</span>}
        </button>
        <button
          className={classNames(
            "px-4 py-3 border rounded-lg text-center font-medium transition-colors flex justify-center items-center",
            // Interaction
            {
              'hover:border-primary hover:bg-primary/10': !isDisabled && !isDark,
              'hover:border-primary hover:bg-primary/20': !isDisabled && isDark,
              'cursor-not-allowed opacity-60': isDisabled,
              'cursor-pointer': !isDisabled,
            },
            // State styles
            isPractice && showFeedback
              ? { // Practice Feedback
                  'bg-green-50 border-green-500': falseIsCorrect && !isDark, // Correct (light)
                  'bg-green-900/30 border-green-700': falseIsCorrect && isDark, // Correct (dark)
                  'bg-red-50 border-red-500': falseSelected && !falseIsCorrect && !isDark, // Incorrect (light)
                  'bg-red-900/30 border-red-700': falseSelected && !falseIsCorrect && isDark, // Incorrect (dark)
                  'border-slate-200 bg-white': !falseSelected && !falseIsCorrect && !isDark, // Unselected (light)
                  'border-slate-700 bg-slate-800': !falseSelected && !falseIsCorrect && isDark, // Unselected (dark)
                }
              : { // Default State
                  'border-primary bg-primary/10': falseSelected && !isDark, // Selected (light)
                  'border-primary bg-primary/20': falseSelected && isDark, // Selected (dark)
                  'border-slate-200 bg-white': !falseSelected && !isDark, // Unselected (light)
                  'border-slate-700 bg-slate-800': !falseSelected && isDark, // Unselected (dark)
                }
          )}
          onClick={() => handleSelect(false)}
          disabled={isDisabled} // Use combined disabled state
        >
          <span className={isDark ? 'text-white' : ''}>False</span>
          {isPractice && showFeedback && falseIsCorrect && <span className="ml-2 text-green-500 font-bold">✓</span>}
          {isPractice && showFeedback && falseSelected && !falseIsCorrect && <span className="ml-2 text-red-500 font-bold">✗</span>}
        </button>
      </div>
    );
  };
  // Removed extraneous closing div here

  // Render feedback for practice mode
  const renderFeedback = () => {
    if (!isPractice || !showFeedback) return null;

    return (
      <div className={classNames(
        'mt-6 p-4 rounded-lg border',
        isCorrect
          ? isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
          : isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
      )}>
        <h4 className={`font-bold ${isCorrect
          ? isDark ? 'text-green-400' : 'text-green-700'
          : isDark ? 'text-red-400' : 'text-red-700'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </h4>

        {/* Show explanation if it exists, regardless of correctness */}
        {question.explanation && (
          <div className={classNames(
            "mt-3 pt-3 border-t",
            isCorrect
              ? isDark ? 'border-green-800' : 'border-green-200'
              : isDark ? 'border-red-800' : 'border-red-200'
          )}>
            <p className={`font-medium ${isDark ? 'text-white' : ''}`}>Explanation:</p>
            <p className={classNames(
              "mt-1",
              isCorrect
                ? isDark ? 'text-green-400' : 'text-green-700'
                : isDark ? 'text-red-400' : 'text-red-700'
            )}>
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!question) {
    return <div className={`p-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>No question available</div>;
  }

  return (
    <div className="space-y-6">
      <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
  disabled: PropTypes.bool // Renamed prop
};

export default QuestionDisplay;
