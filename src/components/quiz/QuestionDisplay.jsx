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
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Get current theme's primary color
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(15, 118, 110, ${alpha})`; // fallback to default teal

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
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
    if (isDisabled) return;

    if (question.question_type === 'check_all_that_apply') {
      if (isPractice) {
        // In practice mode for check-all, only update local state
        // Actual submission happens via button
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
        // In non-practice mode (access code quizzes), handle multiple selections directly
        const currentSelection = Array.isArray(selectedAnswer) ? selectedAnswer : [];
        const index = answer;

        let newSelection;
        if (currentSelection.includes(index)) {
          newSelection = currentSelection.filter(i => i !== index);
        } else {
          newSelection = [...currentSelection, index];
        }
        onSelectAnswer(newSelection);
      }
    } else {
      // For multiple choice and true/false, call parent immediately
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
              "w-full px-4 py-3 text-left border rounded-lg transition-colors flex items-center",
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
                    'border-green-500': isCorrectAnswer, // Correct answer border
                    'border-red-500': isSelected && !isCorrectAnswer, // Selected incorrect answer border
                    'border-slate-200': !isSelected && !isCorrectAnswer && !isDark, // Unselected incorrect answer (light)
                    'border-slate-700': !isSelected && !isCorrectAnswer && isDark, // Unselected incorrect answer (dark)
                  }
                : { // Default State (Not Practice Feedback)
                    'border-primary': isSelected, // Selected border
                    'border-slate-200': !isSelected && !isDark, // Unselected (light)
                    'border-slate-700': !isSelected && isDark, // Unselected (dark)
                  }
            )}
            style={{
              backgroundColor: isPractice && showFeedback
                ? isCorrectAnswer
                  ? isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)' // Correct answer
                  : isSelected && !isCorrectAnswer
                    ? isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)' // Incorrect selection
                    : isDark ? '#1e293b' : '#ffffff' // Default
                : isSelected
                  ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15) // Selected with theme color
                  : isDark ? '#1e293b' : '#ffffff' // Unselected
            }}
            onClick={() => handleSelect(index)}
            disabled={isDisabled} // Use combined disabled state
          >
            <div className="flex items-center">
              {/* Radio button visual indicator */}
              <div className={classNames(
                "w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-3",
                {
                  'border-slate-400': isDark && !isSelected,
                  'border-slate-300': !isDark && !isSelected,
                  'bg-primary border-primary': isSelected,
                  'bg-transparent': !isSelected
                }
              )}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className={isDark ? 'text-white' : ''}>{option}</span>
            </div>
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
                "flex items-center px-4 py-3 border rounded-lg transition-colors cursor-pointer",
                {
                  'border-primary': isSelected && (!isPractice || !showFeedback), // Selected border
                  'border-green-500': isPractice && showFeedback && question.correct_answer?.includes(index), // Correct answer border
                  'border-red-500': isPractice && showFeedback && isSelected && !question.correct_answer?.includes(index), // Incorrect selection border
                  'border-slate-200': !isSelected && (!isPractice || !showFeedback) && !isDark, // Default border (light)
                  'border-slate-700': !isSelected && (!isPractice || !showFeedback) && isDark, // Default border (dark)
                  'hover:border-primary hover:bg-primary/10': !isDisabled && !isDark, // Hover (light)
                  'hover:border-primary hover:bg-primary/20': !isDisabled && isDark, // Hover (dark)
                  'cursor-not-allowed opacity-60': isDisabled
                }
              )}
              style={{
                backgroundColor: isSelected && (!isPractice || !showFeedback)
                  ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15)
                  : isPractice && showFeedback && question.correct_answer?.includes(index)
                    ? isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)'
                    : isPractice && showFeedback && isSelected && !question.correct_answer?.includes(index)
                      ? isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)'
                      : isDark ? '#1e293b' : '#ffffff'
              }}
              onClick={(e) => {
                e.preventDefault();
                if (!isDisabled) handleSelect(index);
              }}
          >
            <input
              type="checkbox"
              className="h-5 w-5 text-primary rounded border-slate-300 focus:ring-primary flex-shrink-0 my-auto pointer-events-none"
              checked={isSelected}
              readOnly
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
            className={`px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  'border-green-500': trueIsCorrect, // Correct border
                  'border-red-500': trueSelected && !trueIsCorrect, // Incorrect border
                  'border-slate-200': !trueSelected && !trueIsCorrect && !isDark, // Unselected (light)
                  'border-slate-700': !trueSelected && !trueIsCorrect && isDark, // Unselected (dark)
                }
              : { // Default State
                  'border-primary': trueSelected, // Selected border
                  'border-slate-200': !trueSelected && !isDark, // Unselected (light)
                  'border-slate-700': !trueSelected && isDark, // Unselected (dark)
                }
          )}
          style={{
            backgroundColor: isPractice && showFeedback
              ? trueIsCorrect
                ? isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)' // Correct
                : trueSelected && !trueIsCorrect
                  ? isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)' // Incorrect
                  : isDark ? '#1e293b' : '#ffffff' // Default
              : trueSelected
                ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15) // Selected with theme color
                : isDark ? '#1e293b' : '#ffffff' // Unselected
          }}
          onClick={() => handleSelect(true)}
          disabled={isDisabled} // Use combined disabled state
        >
          <div className="flex items-center">
            {/* Radio button visual indicator */}
            <div className={classNames(
              "w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-2",
              {
                'border-slate-400': isDark && !trueSelected,
                'border-slate-300': !isDark && !trueSelected,
                'bg-primary border-primary': trueSelected,
                'bg-transparent': !trueSelected
              }
            )}>
              {trueSelected && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className={isDark ? 'text-white' : ''}>True</span>
          </div>
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
                  'border-green-500': falseIsCorrect, // Correct border
                  'border-red-500': falseSelected && !falseIsCorrect, // Incorrect border
                  'border-slate-200': !falseSelected && !falseIsCorrect && !isDark, // Unselected (light)
                  'border-slate-700': !falseSelected && !falseIsCorrect && isDark, // Unselected (dark)
                }
              : { // Default State
                  'border-primary': falseSelected, // Selected border
                  'border-slate-200': !falseSelected && !isDark, // Unselected (light)
                  'border-slate-700': !falseSelected && isDark, // Unselected (dark)
                }
          )}
          style={{
            backgroundColor: isPractice && showFeedback
              ? falseIsCorrect
                ? isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)' // Correct
                : falseSelected && !falseIsCorrect
                  ? isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)' // Incorrect
                  : isDark ? '#1e293b' : '#ffffff' // Default
              : falseSelected
                ? hexToRgba(currentPrimaryColor, isDark ? 0.2 : 0.15) // Selected with theme color
                : isDark ? '#1e293b' : '#ffffff' // Unselected
          }}
          onClick={() => handleSelect(false)}
          disabled={isDisabled} // Use combined disabled state
        >
          <div className="flex items-center">
            {/* Radio button visual indicator */}
            <div className={classNames(
              "w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-2",
              {
                'border-slate-400': isDark && !falseSelected,
                'border-slate-300': !isDark && !falseSelected,
                'bg-primary border-primary': falseSelected,
                'bg-transparent': !falseSelected
              }
            )}>
              {falseSelected && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className={isDark ? 'text-white' : ''}>False</span>
          </div>
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
